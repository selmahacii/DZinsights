import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '90');
  
  const weeks = Math.floor(days / 7);
  const trend = [];
  const now = new Date();
  
  for (let i = weeks; i > 0; i--) {
    const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const total = 800 + Math.floor(Math.random() * 400);
    const positivePct = 0.65 + (weeks - i) * 0.002;
    
    trend.push({
      week: `W${String(weeks - i + 1).padStart(2, '0')}`,
      date: weekStart.toISOString().split('T')[0],
      positive: Math.floor(total * positivePct),
      neutral: Math.floor(total * 0.20),
      negative: Math.floor(total * (1 - positivePct - 0.20)),
      total,
      sentiment_ratio: Math.round(positivePct * 1000) / 1000,
      avg_rating: Math.round((3.8 + (weeks - i) * 0.005 + (Math.random() - 0.5) * 0.2) * 10) / 10
    });
  }
  
  return NextResponse.json({ days, weeks: trend.length, trend, overall_trend: 'improving' });
}
