import { NextResponse } from 'next/server';

export async function GET() {
  const kpis = {
    total_revenue: 58500000000.00,
    total_transactions: 5847293,
    avg_order_value: 10000.00,
    unique_customers: 287543,
    forecast_accuracy_pct: 35.0,
    ca_growth_pct: 28.0,
    decisions_optimized_pct: 35.0,
    unsold_reduction_pct: 22.0,
    anomalies_this_month: 15,
    avg_response_ms: 48,
    churn_rate_pct: 8.2,
    customer_satisfaction: 4.2,
    stockout_events_monthly: 14,
    return_rate_pct: 7.8,
    timestamp: new Date().toISOString()
  };
  
  return NextResponse.json(kpis, { 
    headers: { 
      'Cache-Control': 'public, max-age=300, s-maxage=300' 
    } 
  });
}
