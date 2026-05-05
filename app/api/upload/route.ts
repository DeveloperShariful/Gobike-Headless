//app/api/upload/route.ts

import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'video/mp4', 'video/quicktime', 'video/x-m4v', 'video/webm'],
          maximumSizeInBytes: 500 * 1024 * 1024, // 500MB
          addRandomSuffix: true, // ERROR FIXED: একই নামের ফাইল বারবার আপলোড করা যাবে
          tokenPayload: JSON.stringify({ uploader: 'customer' }),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('Upload completed:', blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 } 
    );
  }
}