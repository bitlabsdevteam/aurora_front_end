import { NextResponse } from 'next/server';

// Type definition for the sales data schema
interface SalesDataSchema {
  _id: string;
  Transaction_ID: string;
  Date: string;
  SKU_ID: string;
  Store_ID: string;
  Store_Name: string;
  Teller_ID: string;
  Teller_Name: string;
  Original_Cost: number;
  Sold_Cost: number;
  Quantity_Sold: number;
  Payment_Method: string;
}

export async function GET() {
  try {
    // Use host.docker.internal for container-to-container communication
    const endpoint = 'http://host.docker.internal:3001/api/pos/sales/fetch';
    
    console.log('Server-side API proxy fetching from:', endpoint);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Updated body structure as specified
      body: JSON.stringify({
        "additionalProp1": {}
      }),
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      const errorBody = await response.text();
      console.error('Error Response:', errorBody);
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    const rawData = await response.json();
    console.log('Successfully fetched data from API');
    
    // Simply pass through the data since the API already returns in the correct format
    // No transformation needed as the backend already returns the data in the required format
    
    // Return the data with correct CORS headers
    return NextResponse.json(rawData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in sales-data API route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 