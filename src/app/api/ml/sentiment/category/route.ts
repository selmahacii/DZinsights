import { NextResponse } from 'next/server';

export async function GET() {
  const categories = [
    { category: 'Electronics', positive: 12500, neutral: 3200, negative: 2300, total: 18000, avg_rating: 3.88 },
    { category: 'Fashion', positive: 14200, neutral: 3800, negative: 2000, total: 20000, avg_rating: 4.02 },
    { category: 'Home & Garden', positive: 8500, neutral: 2200, negative: 1300, total: 12000, avg_rating: 3.95 },
    { category: 'Sports', positive: 6800, neutral: 1800, negative: 1400, total: 10000, avg_rating: 3.85 },
    { category: 'Beauty', positive: 5800, neutral: 1500, negative: 1200, total: 8500, avg_rating: 3.92 },
    { category: 'Books', positive: 4500, neutral: 1800, negative: 700, total: 7000, avg_rating: 4.12 },
    { category: 'Toys', positive: 1800, neutral: 500, negative: 400, total: 2700, avg_rating: 3.78 },
    { category: 'Grocery', positive: 900, neutral: 200, negative: 300, total: 1400, avg_rating: 3.65 }
  ];
  
  for (const cat of categories) {
    cat.positive_pct = Math.round(cat.positive / cat.total * 1000) / 10;
    cat.neutral_pct = Math.round(cat.neutral / cat.total * 1000) / 10;
    cat.negative_pct = Math.round(cat.negative / cat.total * 1000) / 10;
  }
  
  return NextResponse.json({ categories, best_performing: 'Books', worst_performing: 'Grocery' });
}
