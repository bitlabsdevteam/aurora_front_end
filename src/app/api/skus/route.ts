import { NextResponse } from 'next/server';

// Define the product schema for type consistency
interface ProductSchema {
  _id: string;
  sku_id: string;
  product_name: string;
  brand: string;
  category: string;
  size: string;
  color: string;
  sex: string;
  pattern: string;
  fabric: string;
  fit: string;
  season: string;
  price: number;
  stock_quantity: number;
  launch_date: string;
  eco_tag: string;
  country_origin: string;
  upc: string;
  style_collection: string;
  supplier: string;
  care_instructions: string;
  image_url: string;
  status: string;
}

export async function GET() {
  try {
    // Use host.docker.internal for container-to-container communication
    const endpoint = 'http://host.docker.internal:3001/api/skus/fetch';
    
    console.log('Server-side API proxy fetching SKUs from:', endpoint);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Same request body structure as sales-data endpoint
      body: JSON.stringify({
        "additionalProp1": {}
      }),
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      const errorBody = await response.text();
      console.error('Error Response:', errorBody);
      throw new Error(`Failed to fetch SKUs data: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Successfully fetched SKUs data from API');
    
    // Transform the data to match our expected schema
    const transformedData = Array.isArray(data) ? data.map((item: any) => ({
      _id: item._id || item.id || '',
      sku_id: item.SKU || item.sku_id || '',
      product_name: item.Product_Name || item.product_name || '',
      brand: item.Brand || item.brand || '',
      category: item.Category || item.category || '',
      size: item.Size || item.size || '',
      color: item.Color || item.color || '',
      sex: item.Sex || item.sex || '',
      pattern: item.Pattern || item.pattern || '',
      fabric: item.Fabric || item.fabric || '',
      fit: item.Fit || item.fit || '',
      season: item.Season || item.season || '',
      price: typeof item.Price === 'number' ? item.Price : 
             (typeof item.price === 'number' ? item.price : 0),
      stock_quantity: typeof item.Stock === 'number' ? item.Stock : 
                     (typeof item.stock_quantity === 'number' ? item.stock_quantity : 0),
      launch_date: item.Launch_Date || item.launch_date || new Date().toISOString().split('T')[0],
      eco_tag: item.Eco_Tag || item.eco_tag || '',
      country_origin: item.Country_Origin || item.country_origin || '',
      upc: item.UPC || item.upc || '',
      style_collection: item.Style_Collection || item.style_collection || '',
      supplier: item.Supplier || item.supplier || '',
      care_instructions: item.Care_Instructions || item.care_instructions || '',
      image_url: item.Image_URL || item.image_url || '',
      status: getStockStatus(typeof item.Stock === 'number' ? item.Stock : 
                            (typeof item.stock_quantity === 'number' ? item.stock_quantity : 0))
    })) : [];
    
    // Return the transformed data with correct CORS headers
    return NextResponse.json(transformedData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in SKUs API route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Helper function to determine stock status
function getStockStatus(stockValue: number): string {
  if (stockValue <= 0) return '在庫切れ';
  if (stockValue <= 10) return '在庫僅少';
  return '在庫あり';
} 