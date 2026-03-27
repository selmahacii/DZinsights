import { NextResponse } from 'next/server';

export async function GET() {
  const features = [
    { feature: 'recency_days', importance: 0.23, direction: 'positive' },
    { feature: 'frequency_30d', importance: 0.19, direction: 'negative' },
    { feature: 'monetary_90d', importance: 0.16, direction: 'negative' },
    { feature: 'avg_review_score', importance: 0.12, direction: 'negative' },
    { feature: 'support_tickets_count', importance: 0.10, direction: 'positive' },
    { feature: 'discount_dependency_ratio', importance: 0.08, direction: 'positive' },
    { feature: 'days_since_last_purchase', importance: 0.07, direction: 'positive' },
    { feature: 'category_diversity_score', importance: 0.05, direction: 'negative' }
  ];
  
  const explanation: Record<string, string> = {
    recency_days: 'Higher recency (days since last purchase) strongly correlates with churn',
    frequency_30d: 'Customers with higher purchase frequency are less likely to churn',
    monetary_90d: 'Higher spending customers show lower churn probability',
    support_tickets_count: 'More support interactions may indicate problems leading to churn'
  };
  
  return NextResponse.json({ model: 'Churn RandomForest', features, explanation });
}
