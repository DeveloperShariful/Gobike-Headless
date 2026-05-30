//app/actions/backend/action/users/user-actions.ts

'use server';

import { db } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Role } from '@prisma/client';
import { sendNotification } from '@/app/api/email/send-notification';

// ============================================================================
// 1. CREATE NEW USER
// ============================================================================
export async function createUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const role = formData.get('role') as Role;
  const password = formData.get('password') as string; // Optional at this stage

  if (!email) {
    return { success: false, message: 'Email is required.' };
  }

  try {
    // চেক করা হচ্ছে যে এই ইমেইল দিয়ে আগেই কোনো ইউজার আছে কি না
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return { success: false, message: 'A user with this email already exists.' };
    }

    // নতুন ইউজার তৈরি করা হচ্ছে
    await db.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        role: role || 'CUSTOMER',
        // সাধারণত পাসওয়ার্ড ഹാশ (hash) করে রাখতে হয় (যেমন: bcrypt ব্যবহার করে)। 
        // আপনি যদি NextAuth ব্যবহার করেন, তবে এখানে bcrypt.hashSync(password, 10) করতে পারেন।
        password: password ? password : null, 
        isActive: true
      }
    });
    
    revalidatePath('/admin/users');
    return { success: true, message: 'New user added successfully.' };
  } catch (error: any) {
    console.error('Create user failed:', error);
    return { success: false, message: 'Failed to create user. Please try again.' };
  }
}

// ============================================================================
// 2. UPDATE EXISTING USER
// ============================================================================
export async function updateUser(formData: FormData) {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const role = formData.get('role') as Role;
  const password = formData.get('password') as string;

  if (!id || !email) {
    return { success: false, message: 'User ID and Email are required.' };
  }

  try {
    // চেক করা হচ্ছে যে আপডেট করার সময় ইমেইলটি অন্য কারো ডাটাবেসে আছে কি না
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser && existingUser.id !== id) {
      return { success: false, message: 'Another user is already using this email.' };
    }

    // ডেটা আপডেট করা হচ্ছে
    const updateData: any = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: role
    };

    // যদি ফর্মে নতুন পাসওয়ার্ড দেওয়া হয়, তবেই পাসওয়ার্ড আপডেট হবে
    if (password && password.trim() !== '') {
      updateData.password = password; // এখানেও bcrypt.hashSync ব্যবহার করা উচিত
    }

    await db.user.update({
      where: { id },
      data: updateData
    });
    
    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${id}`);
    
    return { success: true, message: 'User profile updated successfully.' };
  } catch (error: any) {
    console.error('Update user failed:', error);
    return { success: false, message: 'Failed to update user profile.' };
  }
}

// ============================================================================
// 3. DELETE SINGLE USER
// ============================================================================
export async function deleteUser(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) return { success: false, message: 'User ID is missing' };

  try {
    // Soft Delete (Security Best Practice)
    await db.user.update({
      where: { id },
      data: { 
        isActive: false, 
        deletedAt: new Date() 
      }
    });
    
    revalidatePath('/admin/users');
    return { success: true, message: 'User moved to trash successfully.' };
  } catch (error: any) {
    console.error('User deletion failed:', error);
    return { success: false, message: 'Failed to delete user.' };
  }
}

// ============================================================================
// 4. BULK ACTIONS: DELETE USERS
// ============================================================================
export async function bulkDeleteUsers(ids: string[]) {
  if (!ids || ids.length === 0) return { success: false, message: 'No users selected.' };

  try {
    await db.user.updateMany({
      where: { id: { in: ids } },
      data: { 
        isActive: false, 
        deletedAt: new Date() 
      }
    });

    revalidatePath('/admin/users');
    return { success: true, message: `${ids.length} users deleted successfully.` };
  } catch (error: any) {
    console.error('Bulk delete failed:', error);
    return { success: false, message: 'Failed to delete selected users.' };
  }
}

// ============================================================================
// 5. BULK ACTIONS: CHANGE USER ROLE
// ============================================================================
export async function bulkChangeRole(ids: string[], newRole: Role) {
  if (!ids || ids.length === 0) return { success: false, message: 'No users selected.' };
  if (!newRole) return { success: false, message: 'Role is missing.' };

  try {
    await db.user.updateMany({
      where: { id: { in: ids } },
      data: { role: newRole }
    });

    revalidatePath('/admin/users');
    return { success: true, message: `Changed role to ${newRole} for ${ids.length} users.` };
  } catch (error: any) {
    console.error('Bulk role change failed:', error);
    return { success: false, message: 'Failed to change roles.' };
  }
}

// ============================================================================
// 6. SEND PASSWORD RESET EMAIL
// ============================================================================
export async function sendPasswordReset(formData: FormData) {
  const email = formData.get('email') as string;
  if (!email) return { success: false, message: 'Email is missing.' };

  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    // 🛑 1. টোকেন জেনারেট করা হচ্ছে (যা পাসওয়ার্ড রিসেট লিংকে থাকবে)
    const resetToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}&email=${email}`;

    // 🛑 2. Database এ টোকেনটি সেভ করা হচ্ছে (Validation এর জন্য)
    await db.verificationToken.create({
      data: {
        identifier: email,
        token: resetToken,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24) // 24 ঘণ্টা ভ্যালিডিটি
      }
    });

    // 🛑 3. Notification Queue এর মাধ্যমে ইমেইল পাঠানো হচ্ছে
    await sendNotification({
      trigger: "PASSWORD_RESET", // এই নামের টেমপ্লেটটি আমরা পরে বানাবো
      recipient: email,
      data: { 
        customer_name: user.name || "Customer",
        reset_link: resetLink 
      }
    });

    return { success: true, message: `Password reset link sent to ${email}` };
  } catch (error: any) {
    console.error('Password reset failed:', error);
    return { success: false, message: 'Failed to send reset link.' };
  }
}