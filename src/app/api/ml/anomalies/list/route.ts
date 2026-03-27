import { NextResponse } from 'next/server';

const ANOMALY_TYPES = ['revenue_spike', 'revenue_drop', 'stockout_cascade', 'return_surge'];
const CATEGORIES = ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Beauty'];
const ROOT_CAUSES: Record<string, string[]> = {
  revenue_spike: ['Viral social media campaign', 'Flash sale success', 'Influencer promotion'],
  revenue_drop: ['Website performance issues', 'Competitor major promotion', 'Payment gateway outage'],
  stockout_cascade: ['Supplier delay + demand surge', 'Forecast underestimation', 'Transportation issues'],
  return_surge: ['Product quality issue in batch', 'Incorrect descriptions', 'Packaging damage']
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '90');
  
  const anomalies = [];
  const now = new Date();
  
  for (let i = 0; i < 15; i++) {
    const daysAgo = Math.floor(Math.random() * days);
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const type = ANOMALY_TYPES[i % ANOMALY_TYPES.length];
    const severity = 4 + Math.floor(Math.random() * 6);
    const deviation = type.includes('spike') || type.includes('drop') 
      ? (35 + Math.random() * 115) * (type === 'revenue_drop' ? -1 : 1)
      : 25 + Math.random() * 75;
    
    anomalies.push({
      date: date.toISOString().split('T')[0],
      anomaly_type: type,
      severity,
      deviation_pct: Math.round(Math.abs(deviation) * 10) / 10,
      affected_categories: CATEGORIES.slice(0, 1 + Math.floor(Math.random() * 3)),
      auto_resolved: severity < 6 && Math.random() < 0.7,
      root_cause: ROOT_CAUSES[type][Math.floor(Math.random() * ROOT_CAUSES[type].length)],
      revenue_impact: Math.round(Math.abs(deviation) * 1500 * 100) / 100,
      response_time_min: severity >= 7 ? 15 + Math.floor(Math.random() * 105) : null
    });
  }
  
  anomalies.sort((a, b) => b.date.localeCompare(a.date));
  
  return NextResponse.json({
    total: anomalies.length,
    days_analyzed: days,
    anomalies,
    summary: {
      by_type: {
        revenue_spike: anomalies.filter(a => a.anomaly_type === 'revenue_spike').length,
        revenue_drop: anomalies.filter(a => a.anomaly_type === 'revenue_drop').length,
        stockout_cascade: anomalies.filter(a => a.anomaly_type === 'stockout_cascade').length,
        return_surge: anomalies.filter(a => a.anomaly_type === 'return_surge').length
      },
      by_severity: {
        critical: anomalies.filter(a => a.severity >= 8).length,
        high: anomalies.filter(a => a.severity >= 6 && a.severity < 8).length,
        medium: anomalies.filter(a => a.severity < 6).length
      },
      auto_resolved: anomalies.filter(a => a.auto_resolved).length
    }
  });
}
