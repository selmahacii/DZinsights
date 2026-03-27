import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    positive: { count: 54400, percentage: 68.0 },
    neutral: { count: 16000, percentage: 20.0 },
    negative: { count: 9600, percentage: 12.0 },
    total_reviews: 80000,
    avg_rating: 3.92,
    avg_sentiment_score: 0.42,
    response_rate: 0.15
  });
}
