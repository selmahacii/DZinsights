import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '90');
  
  const history = [];
  let stock = 150;
  const now = new Date();
  
  for (let i = days; i > 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dailySales = 5 + Math.floor(Math.random() * 15);
    
    stock -= dailySales;
    
    const restockEvent = stock < 50;
    const restockQty = restockEvent ? Math.floor(Math.random() * 150) + 100 : 0;
    
    if (restockEvent) {
      stock += restockQty;
    }
    
    const stockout = stock <= 0;
    if (stockout) stock = 0;
    
    history.push({
      date: date.toISOString().split('T')[0],
      stock_level: stock,
      units_sold: dailySales,
      restock_event: restockEvent,
      restock_qty: restockQty,
      stockout_flag: stockout,
      holding_cost: Math.round(stock * 0.5 * 0.001 * 100) / 100
    });
  }
  
  return NextResponse.json({
    product_id: 'PRD-00001',
    days,
    history,
    summary: {
      avg_stock_level: Math.round(history.reduce((s, h) => s + h.stock_level, 0) / history.length * 10) / 10,
      total_units_sold: history.reduce((s, h) => s + h.units_sold, 0),
      restock_events: history.filter(h => h.restock_event).length,
      stockout_days: history.filter(h => h.stockout_flag).length,
      avg_daily_sales: Math.round(history.reduce((s, h) => s + h.units_sold, 0) / days * 10) / 10
    }
  });
}
