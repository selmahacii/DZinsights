import { NextResponse } from 'next/server';

export async function GET() {
  const keywords = [
    { keyword: 'quality', count: 2340, pct_of_negative: 24.4 },
    { keyword: 'delivery', count: 1890, pct_of_negative: 19.7 },
    { keyword: 'return', count: 1560, pct_of_negative: 16.3 },
    { keyword: 'damaged', count: 1230, pct_of_negative: 12.8 },
    { keyword: 'slow', count: 980, pct_of_negative: 10.2 },
    { keyword: 'expensive', count: 870, pct_of_negative: 9.1 },
    { keyword: 'wrong', count: 650, pct_of_negative: 6.8 },
    { keyword: 'defective', count: 540, pct_of_negative: 5.6 },
    { keyword: 'disappointed', count: 420, pct_of_negative: 4.4 },
    { keyword: 'service', count: 380, pct_of_negative: 4.0 }
  ];
  
  return NextResponse.json({ total_negative_reviews: 9600, keywords, word_cloud_data: Object.fromEntries(keywords.map(k => [k.keyword, k.count])) });
}
