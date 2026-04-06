//app/api/submit-review/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const endpoint = 'https://gobikes.au/wp-json/gobike/v1/submit-review';
        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData,
        });
        
        const data = await response.json().catch(() => ({}));

        if (response.ok && data.success) {
            return NextResponse.json({ 
                success: true, 
                message: data.message || 'Review submitted successfully and is awaiting approval.' 
            });
        } else {
            console.error("WordPress comment submission error:", data);
            throw new Error(data.message || `Failed to submit review. WordPress responded with status ${response.status}`);
        }

    } catch (error: unknown) {
        let errorMessage = 'An unexpected error occurred.';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        
        console.error("API Route /api/submit-review :", errorMessage);
        return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
    }
}