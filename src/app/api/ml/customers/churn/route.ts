import { NextResponse } from 'next/server';

export async function GET() {
  const distribution = [];
  
  for (let i = 0; i < 20; i++) {
    const binStart = i * 0.05;
    const center = 0.45;
    const count = Math.floor(30000 * Math.exp(-Math.pow(binStart - center, 2) / 0.1));
    
    distribution.push({
      bin_start: Math.round(binStart * 100) / 100,
      bin_end: Math.round((binStart + 0.05) * 100) / 100,
      count: Math.max(100, count + Math.floor(Math.random() * 1000 - 500))
    });
  }
  
  const highRiskCount = distribution.slice(14).reduce((s, d) => s + d.count, 0);
  
  const topAtRisk = [];
  for (let i = 0; i < 20; i++) {
    topAtRisk.push({
      customer_id: `CUS-${'*'.repeat(6)}${String(i + 1).padStart(2, '0')}`,
      churn_score: Math.round((0.92 - i * 0.01 + (Math.random() - 0.5) * 0.02) * 1000) / 1000,
      lifetime_value: Math.round((500 + Math.random() * 4500) * 100) / 100,
      segment: ['Gold', 'Silver', 'Bronze'][i % 3],
      days_since_purchase: 45 + Math.floor(Math.random() * 75),
      support_tickets: 3 + Math.floor(Math.random() * 7)
    });
  }
  
  return NextResponse.json({
    distribution,
    high_risk_count: highRiskCount,
    revenue_at_risk_eur: Math.round(highRiskCount * 850 * 100) / 100,
    top_20_at_risk_customers: topAtRisk,
    threshold: 0.7,
    model_metrics: {
      auc_roc: 0.89,
      precision: 0.84,
      recall: 0.81,
      f1: 0.82
    }
  });
}
