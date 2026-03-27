import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const model = searchParams.get('model') || 'lstm';
  const days = parseInt(searchParams.get('days') || '30');
  
  const forecasts = [];
  const now = new Date();
  
  for (let i = 1; i <= days; i++) {
    const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const baseRevenue = 180000 + i * 300;
    
    forecasts.push({
      date: date.toISOString().split('T')[0],
      predicted_revenue: Math.round(baseRevenue * 100) / 100,
      lower_bound: Math.round(baseRevenue * (0.95 - i * 0.005) * 100) / 100,
      upper_bound: Math.round(baseRevenue * (1.05 + i * 0.005) * 100) / 100,
      confidence_score: Math.round(Math.max(0.5, 0.95 - i * 0.01) * 1000) / 1000
    });
  }
  
  return NextResponse.json({ model, forecast_days: days, forecasts });
}
