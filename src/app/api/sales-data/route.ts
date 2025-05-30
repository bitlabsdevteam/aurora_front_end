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
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Updated body structure as specified
        body: JSON.stringify({
          "additionalProp1": {}
        }),
        // Increase timeout to allow more time for the API to respond
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        console.error(`API Error: ${response.status} ${response.statusText}`);
        const errorBody = await response.text();
        console.error('Error Response:', errorBody);
        
        // Return an error response
        return NextResponse.json(
          { error: `API returned status ${response.status}` },
          { status: 500 }
        );
      }

      const rawData = await response.json();
      console.log('Successfully fetched real data from API');
      
      // Check if the data is empty or invalid
      if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
        console.log('API returned empty or invalid data');
        // Return empty array
        return NextResponse.json([], {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
      
      // Return the data with correct CORS headers
      return NextResponse.json(rawData, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Error fetching from actual API:', error);
      
      // Return an error response
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in sales-data API route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 