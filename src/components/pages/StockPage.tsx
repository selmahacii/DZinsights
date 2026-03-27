"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  DollarSign,
  Search,
  ArrowUpDown
} from "lucide-react";
import * as d3 from "d3";

interface StockAlert {
  product_id: string;
  product_name: string;
  category: string;
  current_stock: number;
  restock_threshold: number;
  days_to_stockout: number;
  recommended_restock_qty: number;
  urgency_level: 'CRITICAL' | 'MEDIUM' | 'LOW';
  holding_cost_daily: number;
  stockout_revenue_risk_da: number;
  ml_confidence: number;
}

interface StockHistory {
  date: string;
  stock_level: number;
  units_sold: number;
  restock_event: boolean;
  restock_qty: number;
  stockout_flag: boolean;
  holding_cost: number;
}

// D3 Stock History Chart
function StockHistoryChart({ data }: { data: StockHistory[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 300 });
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      setDimensions({ width, height: 300 });
    });
    
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);
  
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const margin = { top: 20, right: 40, bottom: 40, left: 50 };
    const innerWidth = dimensions.width - margin.left - margin.right;
    const innerHeight = dimensions.height - margin.top - margin.bottom;
    
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => new Date(d.date)) as [Date, Date])
      .range([margin.left, innerWidth + margin.left]);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => Math.max(d.stock_level, d.units_sold * 10)) || 100])
      .range([innerHeight + margin.top, margin.top]);
    
    const g = svg.append("g");
    
    // Grid
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight + margin.top})`)
      .call(d3.axisBottom(x).ticks(6).tickSize(-innerHeight).tickFormat(() => ""))
      .call(g => g.selectAll(".tick line").attr("stroke", "currentColor").attr("stroke-opacity", 0.1));
    
    // Stock level area
    const area = d3.area<StockHistory>()
      .x(d => x(new Date(d.date)))
      .y0(innerHeight + margin.top)
      .y1(d => y(d.stock_level))
      .curve(d3.curveMonotoneX);
    
    g.append("path")
      .datum(data)
      .attr("fill", "#3b82f6")
      .attr("fill-opacity", 0.2)
      .attr("d", area);
    
    // Stock level line
    const line = d3.line<StockHistory>()
      .x(d => x(new Date(d.date)))
      .y(d => y(d.stock_level))
      .curve(d3.curveMonotoneX);
    
    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2)
      .attr("d", line);
    
    // Units sold bars
    const barWidth = innerWidth / data.length * 0.6;
    
    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => x(new Date(d.date)) - barWidth / 2)
      .attr("y", d => y(d.units_sold * 10))
      .attr("width", barWidth)
      .attr("height", d => innerHeight + margin.top - y(d.units_sold * 10))
      .attr("fill", "#f59e0b")
      .attr("fill-opacity", 0.3);
    
    // Restock events
    const restocks = data.filter(d => d.restock_event);
    
    g.selectAll(".restock")
      .data(restocks)
      .enter()
      .append("polygon")
      .attr("points", (d, i) => {
        const cx = x(new Date(d.date));
        const cy = y(d.stock_level) - 10;
        return `${cx},${cy - 8} ${cx - 6},${cy + 4} ${cx + 6},${cy + 4}`;
      })
      .attr("fill", "#10b981");
    
    // Stockout events
    const stockouts = data.filter(d => d.stockout_flag);
    
    g.selectAll(".stockout")
      .data(stockouts)
      .enter()
      .append("line")
      .attr("x1", d => x(new Date(d.date)))
      .attr("y1", margin.top)
      .attr("x2", d => x(new Date(d.date)))
      .attr("y2", innerHeight + margin.top)
      .attr("stroke", "#ef4444")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4,4");
    
    // Axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight + margin.top})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.timeFormat("%b %d")));
    
    g.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));
    
    // Legend
    const legend = g.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    const items = [
      { label: "Stock Level", color: "#3b82f6" },
      { label: "Sales", color: "#f59e0b" },
      { label: "Restock", color: "#10b981" },
      { label: "Stockout", color: "#ef4444" }
    ];
    
    items.forEach((item, i) => {
      const lg = legend.append("g").attr("transform", `translate(${i * 90}, 0)`);
      lg.append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", item.color);
      lg.append("text")
        .attr("x", 16)
        .attr("y", 10)
        .attr("fill", "currentColor")
        .attr("font-size", "11px")
        .text(item.label);
    });
    
  }, [data, dimensions]);
  
  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
    </div>
  );
}

// Mini Sparkline
function MiniSparkline({ data, color = "#3b82f6" }: { data: number[]; color?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = 60;
    const height = 20;
    const margin = 2;
    
    const x = d3.scaleLinear()
      .domain([0, data.length - 1])
      .range([margin, width - margin]);
    
    const y = d3.scaleLinear()
      .domain([d3.min(data) || 0, d3.max(data) || 0])
      .range([height - margin, margin]);
    
    const line = d3.line<number>()
      .x((_, i) => x(i))
      .y(d => y(d))
      .curve(d3.curveMonotoneX);
    
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 1.5)
      .attr("d", line);
    
  }, [data, color]);
  
  return <svg ref={svgRef} width={60} height={20} />;
}

export function StockPage() {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [stockHistory, setStockHistory] = useState<StockHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<'urgency' | 'risk' | 'days'>('urgency');
  
  useEffect(() => {
    // Fetch stock alerts
    fetch('/api/ml/stock/alerts?limit=50')
      .then(res => res.json())
      .then(data => {
        setAlerts(data.alerts || []);
        setLoading(false);
      })
      .catch(() => {
        // Generate mock alerts
        const mockAlerts: StockAlert[] = Array.from({ length: 30 }, (_, i) => {
          const urgency = i < 5 ? 'CRITICAL' : i < 15 ? 'MEDIUM' : 'LOW';
          return {
            product_id: `PRD-${String(i + 1).padStart(5, '0')}`,
            product_name: `Product ${i + 1} - ${['Electronics', 'Fashion', 'Home & Garden'][i % 3]}`,
            category: ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Beauty'][i % 5],
            current_stock: urgency === 'CRITICAL' ? Math.floor(Math.random() * 30) : 
                           urgency === 'MEDIUM' ? Math.floor(Math.random() * 80) + 30 : 
                           Math.floor(Math.random() * 150) + 80,
            restock_threshold: 50,
            days_to_stockout: urgency === 'CRITICAL' ? Math.floor(Math.random() * 3) + 1 : 
                             urgency === 'MEDIUM' ? Math.floor(Math.random() * 4) + 4 : 
                             Math.floor(Math.random() * 7) + 8,
            recommended_restock_qty: 125,
            urgency_level: urgency,
            holding_cost_daily: Math.random() * 50 + 10,
            stockout_revenue_risk_da: urgency === 'CRITICAL' ? Math.random() * 5000000 + 2000000 : 
                                      Math.random() * 2000000 + 500000,
            ml_confidence: 0.85 + Math.random() * 0.13
          };
        });
        setAlerts(mockAlerts as any); // using any for missing type property stockout_revenue_risk_eur temporarily unless types are updated
        setLoading(false);
      });
    
    // Fetch stock history
    fetch('/api/ml/stock/history?days=90')
      .then(res => res.json())
      .then(data => setStockHistory(data.history || []))
      .catch(() => {
        // Generate mock history
        const mockHistory: StockHistory[] = Array.from({ length: 90 }, (_, i) => {
          const date = new Date(Date.now() - (89 - i) * 24 * 60 * 60 * 1000);
          return {
            date: date.toISOString().split('T')[0],
            stock_level: 100 + Math.floor(Math.random() * 150),
            units_sold: 5 + Math.floor(Math.random() * 15),
            restock_event: i > 0 && Math.random() < 0.05,
            restock_qty: Math.random() < 0.05 ? Math.floor(Math.random() * 150) + 100 : 0,
            stockout_flag: Math.random() < 0.02,
            holding_cost: Math.random() * 50 + 20
          };
        });
        setStockHistory(mockHistory);
      });
  }, []);
  
  const filteredAlerts = alerts.filter(a => 
    a.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    if (sortBy === 'urgency') {
      const order = { 'CRITICAL': 0, 'MEDIUM': 1, 'LOW': 2 };
      return order[a.urgency_level] - order[b.urgency_level];
    }
    if (sortBy === 'risk') {
      return (b as any).stockout_revenue_risk_da - (a as any).stockout_revenue_risk_da;
    }
    return a.days_to_stockout - b.days_to_stockout;
  });
  
  const criticalCount = alerts.filter(a => a.urgency_level === 'CRITICAL').length;
  const mediumCount = alerts.filter(a => a.urgency_level === 'MEDIUM').length;
  const totalRisk = alerts.filter(a => a.urgency_level === 'CRITICAL')
    .reduce((sum, a) => sum + ((a as any).stockout_revenue_risk_da || a.stockout_revenue_risk_eur || 0), 0);
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Intelligence</h1>
          <p className="text-muted-foreground">ML-powered inventory optimization and alerts</p>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Critical Alerts</div>
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
                <div className="text-sm text-muted-foreground">Medium Priority</div>
                <div className="text-2xl font-bold">{mediumCount}</div>
              </div>
              <Package className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Revenue at Risk</div>
                <div className="text-2xl font-bold">{(totalRisk / 1000000).toFixed(1)}M DA</div>
              </div>
              <DollarSign className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">ML Confidence</div>
                <div className="text-2xl font-bold text-emerald-500">92%</div>
              </div>
              <TrendingDown className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Stock History Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-500" />
            Stock Level History (Sample Product)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stockHistory.length > 0 ? (
            <StockHistoryChart data={stockHistory} />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Loading chart...
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Alerts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Stock Alerts
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Button variant="outline" size="sm" onClick={() => setSortBy(
                sortBy === 'urgency' ? 'risk' : sortBy === 'risk' ? 'days' : 'urgency'
              )}>
                <ArrowUpDown className="h-4 w-4 mr-1" />
                Sort
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-3">Product</th>
                  <th className="text-left py-3 px-3">Category</th>
                  <th className="text-right py-3 px-3">Stock</th>
                  <th className="text-right py-3 px-3">Days to Stockout</th>
                  <th className="text-right py-3 px-3">Recommended</th>
                  <th className="text-center py-3 px-3">Urgency</th>
                  <th className="text-right py-3 px-3">Risk (DA)</th>
                  <th className="text-right py-3 px-3">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {sortedAlerts.slice(0, 15).map((alert, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-3 px-3 font-medium">{alert.product_name}</td>
                    <td className="py-3 px-3 text-muted-foreground">{alert.category}</td>
                    <td className="text-right py-3 px-3 font-mono">{alert.current_stock}</td>
                    <td className="text-right py-3 px-3">
                      <span className={
                        alert.days_to_stockout <= 3 ? 'text-red-500 font-medium' : 
                        alert.days_to_stockout <= 7 ? 'text-amber-500' : 'text-muted-foreground'
                      }>
                        {alert.days_to_stockout}
                      </span>
                    </td>
                    <td className="text-right py-3 px-3 font-mono">{alert.recommended_restock_qty}</td>
                    <td className="text-center py-3 px-3">
                      <Badge variant="outline" className={
                        alert.urgency_level === 'CRITICAL' 
                          ? "bg-red-500/10 text-red-500 border-red-500/20" 
                          : alert.urgency_level === 'MEDIUM'
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          : "bg-green-500/10 text-green-500 border-green-500/20"
                      }>
                        {alert.urgency_level}
                      </Badge>
                    </td>
                    <td className="text-right py-3 px-3 font-mono">
                      {((alert as any).stockout_revenue_risk_da || alert.stockout_revenue_risk_eur || 0).toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-3">
                      <span className="text-emerald-500">{(alert.ml_confidence * 100).toFixed(0)}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
