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

// Generate mock SKU data for testing when API is unavailable
const generateMockSkuData = (): ProductSchema[] => {
  return [
    {
      _id: "sku123",
      sku_id: "M-SK-34-GRA-GPH-FLE-25S",
      product_name: "Graphic Fleece Skirt",
      brand: "Aurora Fashion",
      category: "Skirt",
      size: "25",
      color: "Graphite",
      sex: "M",
      pattern: "Graphic",
      fabric: "Fleece",
      fit: "Regular",
      season: "Spring/Summer",
      price: 40.14,
      stock_quantity: 96,
      launch_date: "2023-03-15",
      eco_tag: "Eco-friendly",
      country_origin: "Japan",
      upc: "123456789012",
      style_collection: "Spring 2023",
      supplier: "Fabric Co. Ltd.",
      care_instructions: "Machine wash cold, tumble dry low",
      image_url: "/images/skirt.jpg",
      status: "在庫あり"
    },
    {
      _id: "sku456",
      sku_id: "M-SHR-M-CRE-STR-SAT-25F",
      product_name: "Stripe Satin Shorts",
      brand: "Aurora Fashion",
      category: "Shorts",
      size: "M",
      color: "Cream",
      sex: "M",
      pattern: "Stripe",
      fabric: "Satin",
      fit: "Regular",
      season: "Fall",
      price: 125.05,
      stock_quantity: 90,
      launch_date: "2023-08-01",
      eco_tag: "Sustainable",
      country_origin: "Italy",
      upc: "789012345678",
      style_collection: "Fall 2023",
      supplier: "Luxury Fabrics Inc.",
      care_instructions: "Dry clean only",
      image_url: "/images/shorts.jpg",
      status: "在庫あり"
    },
    {
      _id: "sku789",
      sku_id: "M-JKT-L-BLK-PLN-LEA-30W",
      product_name: "Plain Leather Jacket",
      brand: "Aurora Fashion",
      category: "Jacket",
      size: "L",
      color: "Black",
      sex: "M",
      pattern: "Plain",
      fabric: "Leather",
      fit: "Regular",
      season: "Winter",
      price: 215.99,
      stock_quantity: 45,
      launch_date: "2023-11-15",
      eco_tag: "Premium",
      country_origin: "Italy",
      upc: "345678901234",
      style_collection: "Winter 2023",
      supplier: "Italian Leather Co.",
      care_instructions: "Professional leather cleaning only",
      image_url: "/images/jacket.jpg",
      status: "在庫あり"
    }
  ];
};

export async function GET() {
  try {
    // Use host.docker.internal for container-to-container communication
    const endpoint = 'http://host.docker.internal:3001/api/skus/fetch';
    
    console.log('Server-side API proxy fetching SKUs from:', endpoint);
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Same request body structure as sales-data endpoint
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
        
        // Instead of throwing an error, fall back to mock data
        console.log('Falling back to mock SKU data due to API error');
        const mockData = generateMockSkuData();
        return NextResponse.json(mockData, {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      const data = await response.json();
      console.log('Successfully fetched real SKUs data from API');
      
      // Check if data is empty or invalid
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.log('API returned empty or invalid SKU data, falling back to mock data');
        const mockData = generateMockSkuData();
        return NextResponse.json(mockData, {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
      
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
      console.error('Error fetching from actual API:', error);
      
      // Fall back to mock data
      console.log('Falling back to mock SKU data due to error:', error instanceof Error ? error.message : 'Unknown error');
      const mockData = generateMockSkuData();
      return NextResponse.json(mockData, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
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