import { NextResponse } from 'next/server';

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Beauty', 'Books', 'Toys', 'Grocery'];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50');
  
  const alerts = [];
  
  for (let i = 0; i < limit; i++) {
    const urgencyIndex = i < 10 ? 0 : i < 25 ? 1 : 2;
    const urgencyLevels = ['CRITICAL', 'MEDIUM', 'LOW'] as const;
    const urgency = urgencyLevels[urgencyIndex];
    
    const stock = urgency === 'CRITICAL' ? Math.floor(Math.random() * 30) + 5 :
                  urgency === 'MEDIUM' ? Math.floor(Math.random() * 50) + 30 :
                  Math.floor(Math.random() * 100) + 80;
    
    const daysToStockout = urgency === 'CRITICAL' ? Math.floor(Math.random() * 3) + 1 :
                          urgency === 'MEDIUM' ? Math.floor(Math.random() * 4) + 4 :
                          Math.floor(Math.random() * 7) + 8;
    
    const price = 20 + Math.random() * 480;
    
    alerts.push({
      product_id: `PRD-${String(i + 1).padStart(5, '0')}`,
      product_name: `Product ${i + 1} - ${CATEGORIES[i % CATEGORIES.length]}`,
      category: CATEGORIES[i % CATEGORIES.length],
      current_stock: stock,
      restock_threshold: 50,
      days_to_stockout: daysToStockout,
      recommended_restock_qty: Math.floor(125 + Math.random() * 75),
      urgency_level: urgency,
      holding_cost_daily: Math.round(stock * price * 0.6 * 0.001 * 100) / 100,
      stockout_revenue_risk_eur: Math.round(price * daysToStockout * 5 * 100) / 100,
      ml_confidence: Math.round((0.85 + Math.random() * 0.13) * 100) / 100
    });
  }
  
  // Sort by urgency
  const urgencyOrder = { CRITICAL: 0, MEDIUM: 1, LOW: 2 };
  alerts.sort((a, b) => urgencyOrder[a.urgency_level] - urgencyOrder[b.urgency_level]);
  
  return NextResponse.json({
    total_alerts: alerts.length,
    critical_count: alerts.filter(a => a.urgency_level === 'CRITICAL').length,
    medium_count: alerts.filter(a => a.urgency_level === 'MEDIUM').length,
    low_count: alerts.filter(a => a.urgency_level === 'LOW').length,
    alerts
  });
}
