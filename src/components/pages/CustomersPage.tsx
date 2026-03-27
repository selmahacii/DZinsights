"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Target, 
  TrendingDown,
  AlertCircle,
  Award
} from "lucide-react";
import * as d3 from "d3";

interface Segment {
  cluster_id: number;
  label: string;
  customer_count: number;
  avg_ltv: number;
  avg_churn_score: number;
  revenue_share_pct: number;
  centroid_x: number;
  centroid_y: number;
  description: string;
  color: string;
}

interface ScatterPoint {
  x: number;
  y: number;
  cluster_id: number;
  label: string;
  ltv: number;
}

interface ChurnDistribution {
  bin_start: number;
  bin_end: number;
  count: number;
}

// D3 Scatter Plot for RFM Segmentation
function ScatterPlot({ segments, data }: { segments: Segment[]; data: ScatterPoint[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 400 });
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      setDimensions({ width, height: 400 });
    });
    
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);
  
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const margin = { top: 20, right: 20, bottom: 50, left: 50 };
    const innerWidth = dimensions.width - margin.left - margin.right;
    const innerHeight = dimensions.height - margin.top - margin.bottom;
    
    const x = d3.scaleLinear()
      .domain([0, 1])
      .range([margin.left, innerWidth + margin.left]);
    
    const y = d3.scaleLinear()
      .domain([0, 1])
      .range([innerHeight + margin.top, margin.top]);
    
    const colorScale = d3.scaleOrdinal<string>()
      .domain(segments.map(s => s.label))
      .range(segments.map(s => s.color));
    
    const g = svg.append("g");
    
    // Grid
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight + margin.top})`)
      .call(d3.axisBottom(x).ticks(5).tickSize(-innerHeight).tickFormat(() => ""))
      .call(g => g.selectAll(".tick line").attr("stroke", "currentColor").attr("stroke-opacity", 0.1));
    
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickSize(-innerWidth).tickFormat(() => ""))
      .call(g => g.selectAll(".tick line").attr("stroke", "currentColor").attr("stroke-opacity", 0.1));
    
    // Points
    g.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.x))
      .attr("cy", d => y(d.y))
      .attr("r", d => Math.max(3, Math.sqrt(d.ltv / 500)))
      .attr("fill", d => colorScale(d.label) || "#888")
      .attr("fill-opacity", 0.6)
      .attr("stroke", d => colorScale(d.label) || "#888")
      .attr("stroke-width", 0.5)
      .on("mouseenter", function(event, d) {
        d3.select(this)
          .attr("fill-opacity", 1)
          .attr("r", Math.max(5, Math.sqrt(d.ltv / 300)));
      })
      .on("mouseleave", function(event, d) {
        d3.select(this)
          .attr("fill-opacity", 0.6)
          .attr("r", Math.max(3, Math.sqrt(d.ltv / 500)));
      });
    
    // Centroids
    segments.forEach(segment => {
      g.append("circle")
        .attr("cx", x(segment.centroid_x))
        .attr("cy", y(segment.centroid_y))
        .attr("r", 8)
        .attr("fill", segment.color)
        .attr("stroke", "#fff")
        .attr("stroke-width", 2);
      
      g.append("text")
        .attr("x", x(segment.centroid_x))
        .attr("y", y(segment.centroid_y) + 20)
        .attr("text-anchor", "middle")
        .attr("fill", "currentColor")
        .attr("font-size", "11px")
        .text(segment.label);
    });
    
    // Axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight + margin.top})`)
      .call(d3.axisBottom(x).ticks(5))
      .append("text")
      .attr("fill", "currentColor")
      .attr("text-anchor", "middle")
      .attr("x", innerWidth / 2 + margin.left)
      .attr("y", 35)
      .text("Recency → Frequency");
    
    g.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5))
      .append("text")
      .attr("fill", "currentColor")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2 - margin.top)
      .attr("y", -35)
      .text("Monetary → Value");
    
  }, [data, segments, dimensions]);
  
  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
    </div>
  );
}

// D3 Churn Histogram
function ChurnHistogram({ data, threshold }: { data: ChurnDistribution[]; threshold: number }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 300 });
  
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
    
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const innerWidth = dimensions.width - margin.left - margin.right;
    const innerHeight = dimensions.height - margin.top - margin.bottom;
    
    const x = d3.scaleLinear()
      .domain([0, 1])
      .range([margin.left, innerWidth + margin.left]);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count) || 0])
      .range([innerHeight + margin.top, margin.top]);
    
    const g = svg.append("g");
    
    // Bars
    const barWidth = innerWidth / data.length * 0.9;
    
    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => x(d.bin_start) + innerWidth / data.length * 0.05)
      .attr("y", d => y(d.count))
      .attr("width", barWidth)
      .attr("height", d => innerHeight + margin.top - y(d.count))
      .attr("fill", d => d.bin_start >= threshold ? "#ef4444" : "#3b82f6")
      .attr("fill-opacity", 0.7);
    
    // Threshold line
    g.append("line")
      .attr("x1", x(threshold))
      .attr("y1", margin.top)
      .attr("x2", x(threshold))
      .attr("y2", innerHeight + margin.top)
      .attr("stroke", "#ef4444")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");
    
    g.append("text")
      .attr("x", x(threshold) + 5)
      .attr("y", margin.top + 15)
      .attr("fill", "#ef4444")
      .attr("font-size", "11px")
      .text("Risk Threshold");
    
    // Axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight + margin.top})`)
      .call(d3.axisBottom(x).ticks(10, ".0%"))
      .append("text")
      .attr("fill", "currentColor")
      .attr("text-anchor", "middle")
      .attr("x", innerWidth / 2 + margin.left)
      .attr("y", 35)
      .text("Churn Score");
    
    g.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${Number(d) / 1000}K`));
    
  }, [data, threshold, dimensions]);
  
  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
    </div>
  );
}

export function CustomersPage() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [scatterData, setScatterData] = useState<ScatterPoint[]>([]);
  const [churnDistribution, setChurnDistribution] = useState<ChurnDistribution[]>([]);
  const [churnStats, setChurnStats] = useState({
    high_risk_count: 0,
    revenue_at_risk_eur: 0,
    threshold: 0.7
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch customer segments
    fetch('/api/ml/customers/segments')
      .then(res => res.json())
      .then(data => {
        setSegments(data.segments || []);
        setScatterData(data.scatter_data || []);
      })
      .catch(() => {
        // Mock data
        const mockSegments: Segment[] = [
          { cluster_id: 0, label: 'Champions', customer_count: 15000, avg_ltv: 8500, avg_churn_score: 0.12, revenue_share_pct: 35, centroid_x: 0.85, centroid_y: 0.92, description: 'High value, frequent buyers', color: '#10b981' },
          { cluster_id: 1, label: 'Loyal', customer_count: 45000, avg_ltv: 3200, avg_churn_score: 0.25, revenue_share_pct: 28, centroid_x: 0.65, centroid_y: 0.55, description: 'Regular buyers', color: '#3b82f6' },
          { cluster_id: 2, label: 'At-Risk', customer_count: 75000, avg_ltv: 1800, avg_churn_score: 0.65, revenue_share_pct: 22, centroid_x: 0.35, centroid_y: 0.40, description: 'Declining engagement', color: '#f59e0b' },
          { cluster_id: 3, label: 'Hibernating', customer_count: 90000, avg_ltv: 450, avg_churn_score: 0.78, revenue_share_pct: 10, centroid_x: 0.15, centroid_y: 0.20, description: 'Low activity', color: '#ef4444' },
          { cluster_id: 4, label: 'Lost', customer_count: 75000, avg_ltv: 120, avg_churn_score: 0.92, revenue_share_pct: 5, centroid_x: 0.05, centroid_y: 0.08, description: 'Churned customers', color: '#6b7280' }
        ];
        setSegments(mockSegments);
        
        // Generate scatter points
        const points: ScatterPoint[] = [];
        mockSegments.forEach(segment => {
          for (let i = 0; i < 100; i++) {
            points.push({
              x: segment.centroid_x + (Math.random() - 0.5) * 0.2,
              y: segment.centroid_y + (Math.random() - 0.5) * 0.2,
              cluster_id: segment.cluster_id,
              label: segment.label,
              ltv: segment.avg_ltv * (0.5 + Math.random())
            });
          }
        });
        setScatterData(points);
      });
    
    // Fetch churn analysis
    fetch('/api/ml/customers/churn')
      .then(res => res.json())
      .then(data => {
        setChurnDistribution(data.distribution || []);
        setChurnStats({
          high_risk_count: data.high_risk_count || 0,
          revenue_at_risk_eur: data.revenue_at_risk_eur || 0,
          threshold: data.threshold || 0.7
        });
        setLoading(false);
      })
      .catch(() => {
        // Mock data
        const mockDistribution: ChurnDistribution[] = Array.from({ length: 20 }, (_, i) => ({
          bin_start: i * 0.05,
          bin_end: (i + 1) * 0.05,
          count: Math.floor(30000 * Math.exp(-Math.pow((i * 0.05 - 0.45), 2) / 0.1))
        }));
        setChurnDistribution(mockDistribution);
        setChurnStats({
          high_risk_count: 42500,
          revenue_at_risk_eur: 36125000,
          threshold: 0.7
        });
        setLoading(false);
      });
  }, []);
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse w-48"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[400px] bg-muted rounded animate-pulse"></div>
          <div className="h-[400px] bg-muted rounded animate-pulse"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Intelligence</h1>
          <p className="text-muted-foreground">RFM segmentation and churn prediction</p>
        </div>
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
          <Award className="h-3 w-3 mr-1" />
          Silhouette: 0.71
        </Badge>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Total Customers</div>
                <div className="text-2xl font-bold">300K</div>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">At-Risk Customers</div>
                <div className="text-2xl font-bold text-amber-500">{(churnStats.high_risk_count / 1000).toFixed(0)}K</div>
              </div>
              <AlertCircle className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Revenue at Risk</div>
                <div className="text-2xl font-bold text-red-500">{(churnStats.revenue_at_risk_eur / 1000000).toFixed(1)}M DA</div>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Model AUC</div>
                <div className="text-2xl font-bold text-emerald-500">0.89</div>
              </div>
              <Target className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scatter Plot */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              RFM Segmentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScatterPlot segments={segments} data={scatterData} />
            
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4">
              {segments.map(segment => (
                <div key={segment.cluster_id} className="flex items-center gap-1.5">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="text-xs">{segment.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Churn Histogram */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Churn Risk Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChurnHistogram data={churnDistribution} threshold={churnStats.threshold} />
            
            <div className="mt-4 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-red-500">High Risk (score &gt; 0.7)</div>
                  <div className="text-xs text-muted-foreground">{churnStats.high_risk_count.toLocaleString()} customers</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-500">
                    {(churnStats.revenue_at_risk_eur / 1000000).toFixed(1)}M DA
                  </div>
                  <div className="text-xs text-muted-foreground">at risk</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Segment Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Segment Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-3">Segment</th>
                  <th className="text-right py-3 px-3">Count</th>
                  <th className="text-right py-3 px-3">Avg LTV</th>
                  <th className="text-right py-3 px-3">Revenue Share</th>
                  <th className="text-right py-3 px-3">Avg Churn</th>
                  <th className="text-left py-3 px-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {segments.map(segment => (
                  <tr key={segment.cluster_id} className="border-b border-border/50">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: segment.color }}
                        />
                        <span className="font-medium">{segment.label}</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-3">{segment.customer_count.toLocaleString()}</td>
                    <td className="text-right py-3 px-3">{segment.avg_ltv.toLocaleString()} DA</td>
                    <td className="text-right py-3 px-3">
                      <div className="flex items-center justify-end gap-2">
                        <Progress value={segment.revenue_share_pct} className="w-16 h-2" />
                        <span>{segment.revenue_share_pct}%</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-3">
                      <span className={
                        segment.avg_churn_score > 0.7 ? 'text-red-500' : 
                        segment.avg_churn_score > 0.4 ? 'text-amber-500' : 'text-emerald-500'
                      }>
                        {(segment.avg_churn_score * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-muted-foreground text-xs">
                      {segment.cluster_id === 0 && 'VIP programs, exclusive offers'}
                      {segment.cluster_id === 1 && 'Loyalty rewards, cross-selling'}
                      {segment.cluster_id === 2 && 'Retention campaigns, personalized discounts'}
                      {segment.cluster_id === 3 && 'Re-engagement emails'}
                      {segment.cluster_id === 4 && 'Win-back campaigns, surveys'}
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
