import { NextResponse } from 'next/server';

// Interface for the API response
interface SkuIdResponse {
  sku_id: string;
}

export async function GET() {
  try {
    // Use host.docker.internal for container-to-container communication
    const endpoint = 'http://host.docker.internal:3001/api/skus/fetch';
    
    console.log('Server-side API proxy fetching SKU IDs from:', endpoint);
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "additionalProp1": {}
        }),
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

      const data = await response.json();
      console.log('Successfully fetched real SKUs data from API');
      
      // Check if data is empty or invalid
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.log('API returned empty or invalid SKU data');
        // Return empty array
        return NextResponse.json([], {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
      
      // Extract only the SKU IDs from the data
      const skuIds = Array.isArray(data) ? data.map((item: any) => ({
        sku_id: item.SKU || item.sku_id || ''
      })).filter((item: SkuIdResponse) => item.sku_id !== '') : [];
      
      // Return the SKU IDs with correct CORS headers
      return NextResponse.json(skuIds, {
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
    console.error('Error in SKU IDs API route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 