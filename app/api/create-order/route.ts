// File: app/api/create-order/route.ts

import { NextResponse } from 'next/server';
import { wooCommerceRequest } from '@/lib/woocommerce';

interface OrderResponse {
  id: number;
  order_key: string;
  status: string;
  [key: string]: any;
}

export async function POST(request: Request) {
  try {
    const orderData = await request.json();
    const newOrder = await wooCommerceRequest<OrderResponse>(
      "orders", 
      "POST", 
      orderData
    );
    return NextResponse.json(newOrder);

  } catch (error: unknown) {
      
    let errorMessage = "Failed to create order.";

    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    console.error("Create Order API Error:", error);
    
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}