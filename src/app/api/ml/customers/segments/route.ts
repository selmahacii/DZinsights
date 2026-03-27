import { NextResponse } from 'next/server';

export async function GET() {
  const segments = [
    { cluster_id: 0, label: 'Champions', customer_count: 15000, avg_ltv: 8500.00, avg_churn_score: 0.12, revenue_share_pct: 35.0, centroid_x: 0.85, centroid_y: 0.92, description: 'High value, frequent buyers with low churn risk', color: '#10b981' },
    { cluster_id: 1, label: 'Loyal', customer_count: 45000, avg_ltv: 3200.00, avg_churn_score: 0.25, revenue_share_pct: 28.0, centroid_x: 0.65, centroid_y: 0.55, description: 'Regular buyers with moderate value', color: '#3b82f6' },
    { cluster_id: 2, label: 'At-Risk', customer_count: 75000, avg_ltv: 1800.00, avg_churn_score: 0.65, revenue_share_pct: 22.0, centroid_x: 0.35, centroid_y: 0.40, description: 'Declining engagement, need retention campaigns', color: '#f59e0b' },
    { cluster_id: 3, label: 'Hibernating', customer_count: 90000, avg_ltv: 450.00, avg_churn_score: 0.78, revenue_share_pct: 10.0, centroid_x: 0.15, centroid_y: 0.20, description: 'Low activity, re-engagement needed', color: '#ef4444' },
    { cluster_id: 4, label: 'Lost', customer_count: 75000, avg_ltv: 120.00, avg_churn_score: 0.92, revenue_share_pct: 5.0, centroid_x: 0.05, centroid_y: 0.08, description: 'Churned customers, win-back campaigns', color: '#6b7280' }
  ];
  
  // Generate scatter points
  const scatter_data = [];
  for (const segment of segments) {
    for (let i = 0; i < 100; i++) {
      scatter_data.push({
        x: Math.round((segment.centroid_x + (Math.random() - 0.5) * 0.2) * 1000) / 1000,
        y: Math.round((segment.centroid_y + (Math.random() - 0.5) * 0.2) * 1000) / 1000,
        cluster_id: segment.cluster_id,
        label: segment.label,
        ltv: Math.round(segment.avg_ltv * (0.5 + Math.random()) * 100) / 100
      });
    }
  }
  
  return NextResponse.json({
    total_customers: 300000,
    silhouette_score: 0.71,
    n_clusters: 5,
    segments,
    scatter_data
  });
}
