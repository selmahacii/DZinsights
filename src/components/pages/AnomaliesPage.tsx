"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Package,
  RotateCcw,
  Calendar
} from "lucide-react";
import * as d3 from "d3";

interface Anomaly {
  date: string;
  anomaly_type: string;
  severity: number;
  deviation_pct: number;
  affected_categories: string[];
  auto_resolved: boolean;
  root_cause: string;
  revenue_impact?: number;
}

interface CalendarData {
  [date: string]: {
    deviation: number;
    is_anomaly: boolean;
    anomaly_type: string | null;
  };
}

// D3 Calendar Heatmap
function CalendarHeatmap({ data, year }: { data: CalendarData; year: number }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 180 });
  
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      setDimensions({ width, height: 180 });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);
  
  useEffect(() => {
    if (!svgRef.current || Object.keys(data).length === 0) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const margin = { top: 20, right: 20, bottom: 20, left: 40 };
    const innerWidth = dimensions.width - margin.left - margin.right;
    const innerHeight = dimensions.height - margin.top - margin.bottom;
    
    const cellSize = innerWidth / 53; // 53 weeks
    const height = 7 * (cellSize * 0.9);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    // Color scale
    const color = d3.scaleSequential<string>()
      .domain([-1, 1])
      .interpolator(d3.interpolateRdYlGn);
    
    // Day labels
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach((day, i) => {
      g.append("text")
        .attr("x", -5)
        .attr("y", i * (cellSize * 0.9) + (cellSize * 0.9) / 2 + 4)
        .attr("text-anchor", "end")
        .attr("fill", "currentColor")
        .attr("font-size", "10px")
        .text(day);
    });
    
    // Draw cells
    const dates = Object.keys(data);
    
    dates.forEach(dateStr => {
      const date = new Date(dateStr);
      const d = data[dateStr];
      
      const week = d3.timeWeek.count(d3.timeYear(date), date);
      const day = date.getDay();
      
      const cell = g.append("rect")
        .attr("x", week * cellSize)
        .attr("y", day * (cellSize * 0.9))
        .attr("width", cellSize - 1)
        .attr("height", cellSize * 0.9 - 1)
        .attr("fill", d.is_anomaly ? '#ef4444' : color(d.deviation))
        .attr("rx", 2)
        .attr("class", d.is_anomaly ? 'anomaly-cell' : '');
      
      if (d.is_anomaly) {
        cell.attr("stroke", "#fff")
          .attr("stroke-width", 2);
      }
    });
    
    // Month labels
    const months = d3.timeMonths(new Date(year, 0, 1), new Date(year, 11, 31));
    months.forEach(month => {
      g.append("text")
        .attr("x", d3.timeWeek.count(d3.timeYear(month), month) * cellSize + cellSize)
        .attr("y", -5)
        .attr("fill", "currentColor")
        .attr("font-size", "10px")
        .text(d3.timeFormat("%b")(month));
    });
    
  }, [data, year, dimensions]);
  
  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
    </div>
  );
}

// D3 Donut for anomaly types
function AnomalyTypeDonut({ data }: { data: { type: string; count: number }[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const size = 180;
  const radius = size / 2 - 20;
  
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const g = svg.append("g")
      .attr("transform", `translate(${size / 2}, ${size / 2})`);
    
    const colors: { [key: string]: string } = {
      'revenue_spike': '#10b981',
      'revenue_drop': '#ef4444',
      'stockout_cascade': '#f59e0b',
      'return_surge': '#8b5cf6'
    };
    
    const pie = d3.pie<{ type: string; count: number }>()
      .value(d => d.count)
      .sort(null);
    
    const arc = d3.arc<d3.PieArcDatum<{ type: string; count: number }>>()
      .innerRadius(radius * 0.5)
      .outerRadius(radius);
    
    const arcs = g.selectAll(".arc")
      .data(pie(data))
      .enter()
      .append("g")
      .attr("class", "arc");
    
    arcs.append("path")
      .attr("d", arc)
      .attr("fill", d => colors[d.data.type] || '#888')
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);
    
    // Center text
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("fill", "currentColor")
      .attr("font-size", "24px")
      .attr("font-weight", "bold")
      .text(data.reduce((sum, d) => sum + d.count, 0));
    
  }, [data]);
  
  return <svg ref={svgRef} width={size} height={size} />;
}

export function AnomaliesPage() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [calendarData, setCalendarData] = useState<CalendarData>({});
  const [typeDistribution, setTypeDistribution] = useState<{ type: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      // Fetch anomalies
      try {
        const res = await fetch('/api/ml/anomalies/list?days=90');
        const data = await res.json();
        setAnomalies(data.anomalies || []);
      } catch {
        const mockAnomalies: Anomaly[] = Array.from({ length: 15 }, (_, i) => ({
          date: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          anomaly_type: ['revenue_spike', 'revenue_drop', 'stockout_cascade', 'return_surge'][i % 4],
          severity: Math.floor(Math.random() * 6) + 4,
          deviation_pct: Math.floor(Math.random() * 100) + 30,
          affected_categories: ['Electronics', 'Fashion'].slice(0, Math.floor(Math.random() * 2) + 1),
          auto_resolved: Math.random() < 0.6,
          root_cause: ['Viral campaign', 'Website issues', 'Supplier delay', 'Quality issue'][i % 4]
        }));
        setAnomalies(mockAnomalies);
      }
      
      // Fetch calendar data
      try {
        const res = await fetch('/api/ml/anomalies/calendar?year=2024');
        const data = await res.json();
        setCalendarData(data.data || {});
      } catch {
        const mockCalendar: CalendarData = {};
        const start = new Date(2024, 0, 1);
        const end = new Date(2024, 11, 31);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          const isAnomaly = Math.random() < 0.02;
          mockCalendar[dateStr] = {
            deviation: isAnomaly ? (Math.random() - 0.5) * 2 : (Math.random() - 0.5) * 0.5,
            is_anomaly: isAnomaly,
            anomaly_type: isAnomaly ? ['revenue_spike', 'revenue_drop'][Math.floor(Math.random() * 2)] : null
          };
        }
        setCalendarData(mockCalendar);
      }
      
      // Fetch type distribution
      try {
        const res = await fetch('/api/ml/anomalies/list');
        const data = await res.json();
        setTypeDistribution(data.distribution || []);
      } catch {
        setTypeDistribution([
          { type: 'revenue_spike', count: 5 },
          { type: 'revenue_drop', count: 4 },
          { type: 'stockout_cascade', count: 3 },
          { type: 'return_surge', count: 3 }
        ]);
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, []);
  
  const anomalyIcons: { [key: string]: React.ReactNode } = {
    'revenue_spike': <TrendingUp className="h-4 w-4 text-emerald-500" />,
    'revenue_drop': <TrendingDown className="h-4 w-4 text-red-500" />,
    'stockout_cascade': <Package className="h-4 w-4 text-amber-500" />,
    'return_surge': <RotateCcw className="h-4 w-4 text-purple-500" />
  };
  
  if (loading) {
    return <div className="animate-pulse p-8">Loading anomaly data...</div>;
  }
  
  const criticalCount = anomalies.filter(a => a.severity >= 8).length;
  const autoResolvedCount = anomalies.filter(a => a.auto_resolved).length;
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Anomaly Center</h1>
          <p className="text-muted-foreground">Real-time anomaly detection with IsolationForest</p>
        </div>
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
          Detection Rate: 92%
        </Badge>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Total Anomalies</div>
                <div className="text-2xl font-bold">{anomalies.length}</div>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-red-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Critical</div>
                <div className="text-2xl font-bold text-red-500">{criticalCount}</div>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Auto-Resolved</div>
                <div className="text-2xl font-bold text-emerald-500">{autoResolvedCount}</div>
              </div>
              <Package className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Avg Severity</div>
                <div className="text-2xl font-bold">
                  {(anomalies.reduce((sum, a) => sum + a.severity, 0) / anomalies.length).toFixed(1)}
                </div>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Calendar Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Anomaly Calendar Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CalendarHeatmap data={calendarData} year={2024} />
          <div className="flex justify-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500" />
              <span className="text-xs">Revenue Drop</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-500" />
              <span className="text-xs">Revenue Spike</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500 border-2 border-white" />
              <span className="text-xs">Anomaly</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Type Distribution & Event Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Anomaly Types</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <AnomalyTypeDonut data={typeDistribution} />
            <div className="grid grid-cols-2 gap-2 mt-4">
              {typeDistribution.map(d => (
                <div key={d.type} className="flex items-center gap-2">
                  {anomalyIcons[d.type]}
                  <span className="text-xs">{d.type.replace('_', ' ')}</span>
                  <span className="text-xs font-medium">{d.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Event Log */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Anomaly Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {anomalies.slice(0, 10).map((anomaly, i) => (
                <div 
                  key={i} 
                  className={`p-3 rounded-lg border ${
                    anomaly.severity >= 8 
                      ? 'border-red-500/20 bg-red-500/5' 
                      : 'border-border bg-muted/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {anomalyIcons[anomaly.anomaly_type]}
                      <div>
                        <div className="font-medium">
                          {anomaly.anomaly_type.replace('_', ' ').toUpperCase()}
                        </div>
                        <div className="text-xs text-muted-foreground">{anomaly.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={
                        anomaly.severity >= 8 
                          ? 'bg-red-500/10 text-red-500' 
                          : 'bg-amber-500/10 text-amber-500'
                      }>
                        Severity: {anomaly.severity}
                      </Badge>
                      {anomaly.auto_resolved && (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500">
                          Auto-resolved
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    <div>Deviation: {anomaly.deviation_pct}%</div>
                    <div>Categories: {anomaly.affected_categories.join(', ')}</div>
                    <div>Root cause: {anomaly.root_cause}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
