//app/(backend)/action/warranty/claim-action.ts

'use server';

import { db } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateClaimStatus(formData: FormData) {
  const id = formData.get('id') as string;
  const status = formData.get('status') as any;
  if (!id || !status) return;

  try {
    await db.warrantyClaim.update({ where: { id }, data: { status } });
    revalidatePath(`/admin/warranty-claims`);
  } catch (error) {
    console.error('Update failed:', error);
  }
}

export async function bulkUpdateClaimStatus(ids: string[], status: any) {
  if (!ids.length || !status) return { success: false };
  try {
    await db.warrantyClaim.updateMany({ where: { id: { in: ids } }, data: { status } });
    revalidatePath(`/admin/warranty-claims`);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function deleteClaimPermanently(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) return;
  try {
    await db.warrantyClaim.delete({ where: { id } });
    revalidatePath(`/admin/warranty-claims`);
  } catch (error) {
    console.error('Delete failed:', error);
  }
}

export async function bulkDeleteClaimsPermanently(ids: string[]) {
  if (!ids.length) return { success: false };
  try {
    await db.warrantyClaim.deleteMany({ where: { id: { in: ids } } });
    revalidatePath(`/admin/warranty-claims`);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}