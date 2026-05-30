// app/actions/backend/media-action.ts

'use server';

import { db } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { del } from '@vercel/blob';
import { Media, MediaType } from '@prisma/client'; // NEW: Original Database Types imported!

// 1. Save uploaded file info
export async function saveMediaRecord(data: {
  url: string;
  pathname: string;
  filename: string;
  mimeType: string;
  size: number;
  source?: string;
}): Promise<{ success: boolean; media?: Media; message?: string }> {
  try {
    let type: MediaType = MediaType.OTHER;
    if (data.mimeType.startsWith('image/')) type = MediaType.IMAGE;
    else if (data.mimeType.startsWith('video/')) type = MediaType.VIDEO;
    else if (data.mimeType.includes('pdf') || data.mimeType.includes('document')) type = MediaType.DOCUMENT;

    const newMedia = await db.media.create({
      data: {
        url: data.url,
        pathname: data.pathname,
        filename: data.filename,
        originalName: data.filename,
        mimeType: data.mimeType,
        size: data.size,
        type: type,
        source: data.source || 'GENERAL',
      }
    });

    revalidatePath('/admin/media');
    return { success: true, media: newMedia };
  } catch (error: any) {
    console.error("Failed to save media record:", error);
    return { success: false, message: error.message };
  }
}

// 2. Fetch all media (Returns strongly typed Media Array)
export async function getAllMedia(): Promise<Media[]> {
  try {
    return await db.media.findMany({
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    return [];
  }
}

// 3. Single Delete
export async function deleteMedia(id: string, pathname: string): Promise<{ success: boolean; message?: string }> {
  try {
    if (pathname) await del(pathname);
    await db.media.delete({ where: { id } });
    revalidatePath('/admin/media');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// 4. BULK DELETE
export async function bulkDeleteMedia(items: { id: string, pathname: string }[]): Promise<{ success: boolean; message?: string }> {
  try {
    const pathnames = items.map(item => item.pathname).filter(Boolean);
    const ids = items.map(item => item.id);

    if (pathnames.length > 0) await del(pathnames);
    await db.media.deleteMany({ where: { id: { in: ids } } });

    revalidatePath('/admin/media');
    return { success: true };
  } catch (error: any) {
    console.error("Bulk delete failed:", error);
    return { success: false, message: error.message };
  }
}

// 5. Auto-save Media Details
export async function updateMediaDetails(id: string, data: {
  altText?: string;
  originalName?: string;
  caption?: string;
  description?: string;
}): Promise<{ success: boolean; media?: Media; message?: string }> {
  try {
    const updatedMedia = await db.media.update({
      where: { id },
      data: {
        altText: data.altText,
        originalName: data.originalName, 
        caption: data.caption,
        description: data.description,
      }
    });
    revalidatePath('/admin/media');
    return { success: true, media: updatedMedia };
  } catch (error: any) {
    return { success: false, message: "Failed to update media details" };
  }
}

// 6. SYNC OLD WARRANTY MEDIA (Syntax Error Fixed!)
export async function syncOldWarrantyMedia(): Promise<{ success: boolean; count?: number; message?: string }> {
  try {
    // FIX: Removed double "not", handling empty strings in the loop instead
    const claims = await db.warrantyClaim.findMany({
      where: { mediaUrl: { not: null } } 
    });

    const existingMedia = await db.media.findMany({ select: { url: true } });
    const existingUrls = new Set(existingMedia.map(m => m.url));

    let addedCount = 0;
    const newMediaData = [];

    for (const claim of claims) {
      if (!claim.mediaUrl || claim.mediaUrl.trim() === '') continue; // FIX: Handling empty strings here
      
      const urls = claim.mediaUrl.split(',').map(u => u.trim()).filter(Boolean);
      
      for (const url of urls) {
        if (!existingUrls.has(url)) {
          const urlParts = url.split('/');
          const rawFilename = urlParts[urlParts.length - 1] || 'Warranty-File';
          
          const lowerName = rawFilename.toLowerCase();
          let type: MediaType = MediaType.OTHER;
          let mimeType = 'application/octet-stream';
          
          if (lowerName.match(/\.(jpeg|jpg|gif|png|webp)$/)) {
            type = MediaType.IMAGE; mimeType = 'image/jpeg';
          } else if (lowerName.match(/\.(mp4|mov|webm)$/)) {
            type = MediaType.VIDEO; mimeType = 'video/mp4';
          }

          newMediaData.push({
            url: url,
            pathname: url,
            filename: rawFilename,
            originalName: rawFilename,
            mimeType: mimeType,
            size: 0, 
            type: type,
            source: 'WARRANTY' 
          });
          
          existingUrls.add(url);
          addedCount++;
        }
      }
    }

    if (newMediaData.length > 0) {
      await db.media.createMany({ data: newMediaData });
    }

    revalidatePath('/admin/media');
    return { success: true, count: addedCount };
  } catch (error: any) {
    console.error("Sync failed:", error);
    return { success: false, message: error.message };
  }
}