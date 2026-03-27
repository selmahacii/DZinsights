import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));
  
  const data: Record<string, { deviation: number; is_anomaly: boolean; anomaly_type: string | null }> = {};
  
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const month = d.getMonth();
    const dayOfWeek = d.getDay();
    const dayOfMonth = d.getDate();
    
    let baseDeviation = (Math.random() - 0.5) * 0.3;
    
    // Q4 boost
    if (month >= 9) baseDeviation += Math.random() * 0.4;
    // Weekend
    if (dayOfWeek >= 5) baseDeviation += Math.random() * 0.2;
    // Holiday spikes
    if (month === 11 && [24, 25, 26, 31].includes(dayOfMonth)) {
      baseDeviation += 0.5 + Math.random() * 0.5;
    }
    
    const isAnomaly = Math.random() < 0.02;
    
    data[dateStr] = {
      deviation: Math.round((isAnomaly ? (Math.random() - 0.5) * 2 : baseDeviation) * 100) / 100,
      is_anomaly: isAnomaly,
      anomaly_type: isAnomaly ? ['revenue_spike', 'revenue_drop'][Math.floor(Math.random() * 2)] : null
    };
  }
  
  return NextResponse.json({
    year,
    data,
    total_anomalies: Object.values(data).filter(d => d.is_anomaly).length
  });
}
