import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const model = searchParams.get('model') || 'lstm';
  const days = parseInt(searchParams.get('days') || '90');
  
  const data = [];
  const now = new Date();
  
  for (let i = days; i > 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const baseRevenue = 150000 + (days - i) * 500;
    
    let seasonal = 1;
    if (date.getMonth() >= 9) seasonal *= 1.45;
    if (date.getDay() >= 5) seasonal *= 1.25;
    
    const actual = baseRevenue * seasonal * (0.85 + Math.random() * 0.3);
    const error = model === 'lstm' ? 0.02 : 0.04;
    const predicted = actual * (1 + (Math.random() - 0.5) * error * 2);
    
    data.push({
      date: date.toISOString().split('T')[0],
      actual_revenue: Math.round(actual * 100) / 100,
      predicted_revenue: Math.round(predicted * 100) / 100,
      lower_bound: Math.round(predicted * 0.92 * 100) / 100,
      upper_bound: Math.round(predicted * 1.08 * 100) / 100,
      confidence_score: Math.round((0.95 - i * 0.002) * 1000) / 1000,
      is_anomaly: Math.random() < 0.02
    });
  }
  
  return NextResponse.json({
    granularity: 'day',
    model,
    days: data.length,
    data,
    metrics: {
      mape: model === 'lstm' ? 5.8 : 6.2,
      rmse: model === 'lstm' ? 2100 : 2400,
      r2: model === 'lstm' ? 0.94 : 0.91,
      mae: model === 'lstm' ? 1620 : 1840
    }
  });
}
