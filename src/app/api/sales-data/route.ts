import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Use Docker host.docker.internal for container-to-container communication
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

    const data = await response.json();
    console.log('Successfully fetched data from API');
    
    // Return the data with correct CORS headers
    return NextResponse.json(data, {
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