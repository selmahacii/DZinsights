"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  MessageSquare,
  Activity,
  BarChart3
} from "lucide-react";
import * as d3 from "d3";

interface Model {
  model_id: string;
  model_name: string;
  version: string;
  trained_at: string;
  accuracy_metric: string;
  metric_value: number;
  is_active: boolean;
  metrics: { [key: string]: number | string | number[] };
  status: string;
  training_time_sec: number;
}

interface FeatureImportance {
  feature: string;
  importance: number;
  direction: string;
}

// D3 Horizontal Bar Chart for SHAP
function SHAPChart({ data }: { data: FeatureImportance[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 250 });
  
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      setDimensions({ width, height: 250 });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);
  
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const margin = { top: 10, right: 60, bottom: 10, left: 140 };
    const innerWidth = dimensions.width - margin.left - margin.right;
    const innerHeight = dimensions.height - margin.top - margin.bottom;
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.importance) || 0])
      .range([0, innerWidth]);
    
    const y = d3.scaleBand()
      .domain(data.map(d => d.feature))
      .range([0, innerHeight])
      .padding(0.2);
    
    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", d => y(d.feature) || 0)
      .attr("width", d => x(d.importance))
      .attr("height", y.bandwidth())
      .attr("fill", d => d.direction === 'positive' ? '#ef4444' : '#10b981')
      .attr("fill-opacity", 0.8)
      .attr("rx", 3);
    
    g.selectAll(".value")
      .data(data)
      .enter()
      .append("text")
      .attr("x", d => x(d.importance) + 5)
      .attr("y", d => (y(d.feature) || 0) + y.bandwidth() / 2 + 4)
      .attr("fill", "currentColor")
      .attr("font-size", "11px")
      .text(d => `${(d.importance * 100).toFixed(0)}%`);
    
    g.append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .attr("font-size", "11px");
    
  }, [data, dimensions]);
  
  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
    </div>
  );
}

// D3 ROC Curve
function ROCCurve({ data }: { data: { fpr: number[]; tpr: number[]; auc: number } }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const size = 300;
  const margin = 40;
  const innerSize = size - 2 * margin;
  
  useEffect(() => {
    if (!svgRef.current || data.fpr.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const x = d3.scaleLinear()
      .domain([0, 1])
      .range([margin, size - margin]);
    
    const y = d3.scaleLinear()
      .domain([0, 1])
      .range([size - margin, margin]);
    
    const g = svg.append("g");
    
    // Diagonal line
    g.append("line")
      .attr("x1", margin)
      .attr("y1", size - margin)
      .attr("x2", size - margin)
      .attr("y2", margin)
      .attr("stroke", "currentColor")
      .attr("stroke-opacity", 0.2)
      .attr("stroke-dasharray", "5,5");
    
    // ROC curve
    const line = d3.line<number>()
      .x((_, i) => x(data.fpr[i]))
      .y((_, i) => y(data.tpr[i]))
      .curve(d3.curveMonotoneX);
    
    // Area under curve
    const area = d3.area<number>()
      .x((_, i) => x(data.fpr[i]))
      .y0(size - margin)
      .y1((_, i) => y(data.tpr[i]))
      .curve(d3.curveMonotoneX);
    
    g.append("path")
      .datum(data.fpr)
      .attr("fill", "#3b82f6")
      .attr("fill-opacity", 0.2)
      .attr("d", area);
    
    g.append("path")
      .datum(data.fpr)
      .attr("fill", "none")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2)
      .attr("d", line);
    
    // Axes
    g.append("g")
      .attr("transform", `translate(0,${size - margin})`)
      .call(d3.axisBottom(x).ticks(5, ".0%"));
    
    g.append("g")
      .attr("transform", `translate(${margin},0)`)
      .call(d3.axisLeft(y).ticks(5, ".0%"));
    
    // Labels
    g.append("text")
      .attr("x", size / 2)
      .attr("y", size - 5)
      .attr("text-anchor", "middle")
      .attr("fill", "currentColor")
      .attr("font-size", "12px")
      .text("False Positive Rate");
    
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -size / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("fill", "currentColor")
      .attr("font-size", "12px")
      .text("True Positive Rate");
    
    // AUC annotation
    g.append("text")
      .attr("x", size - margin - 50)
      .attr("y", margin + 30)
      .attr("fill", "#3b82f6")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .text(`AUC = ${data.auc}`);
    
  }, [data]);
  
  return <svg ref={svgRef} width={size} height={size} />;
}

export function ModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [shapData, setShapData] = useState<FeatureImportance[]>([]);
  const [rocData, setRocData] = useState({ fpr: [] as number[], tpr: [] as number[], auc: 0 });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      // Fetch models
      try {
        const res = await fetch('/api/ml/models/performance');
        const data = await res.json();
        setModels(data.models || []);
      } catch {
        setModels([
          { model_id: 'MDL-001', model_name: 'ARIMA Revenue Forecast', version: '2.3.1', trained_at: '2024-01-15', accuracy_metric: 'MAPE', metric_value: 6.2, is_active: true, metrics: { mape: 6.2, mae: 1840, order: [2, 1, 2] }, status: 'production', training_time_sec: 45 },
          { model_id: 'MDL-002', model_name: 'LSTM Revenue Forecast', version: '3.1.0', trained_at: '2024-01-18', accuracy_metric: 'RMSE', metric_value: 2100, is_active: true, metrics: { rmse: 2100, r2: 0.94, mape: 5.8, epochs: 150 }, status: 'production', training_time_sec: 1842 },
          { model_id: 'MDL-003', model_name: 'Churn RandomForest', version: '1.5.2', trained_at: '2024-01-20', accuracy_metric: 'AUC-ROC', metric_value: 0.89, is_active: true, metrics: { auc_roc: 0.89, precision: 0.84, recall: 0.81, f1: 0.82 }, status: 'production', training_time_sec: 125 },
          { model_id: 'MDL-004', model_name: 'Customer Segmentation KMeans', version: '1.2.0', trained_at: '2024-01-10', accuracy_metric: 'Silhouette', metric_value: 0.71, is_active: true, metrics: { silhouette_score: 0.71, n_clusters: 5 }, status: 'production', training_time_sec: 28 },
          { model_id: 'MDL-005', model_name: 'Anomaly IsolationForest', version: '2.0.1', trained_at: '2024-01-21', accuracy_metric: 'Detection Rate', metric_value: 0.92, is_active: true, metrics: { detection_rate: 0.92, false_positive_rate: 0.08 }, status: 'production', training_time_sec: 12 },
          { model_id: 'MDL-006', model_name: 'Sentiment VADER', version: '1.0.0', trained_at: '2024-01-01', accuracy_metric: 'Accuracy', metric_value: 0.87, is_active: true, metrics: { accuracy: 0.87, precision: 0.85, recall: 0.88 }, status: 'production', training_time_sec: 2 }
        ]);
      }
      
      // Fetch SHAP data
      try {
        const res = await fetch('/api/ml/models/shap');
        const data = await res.json();
        setShapData(data.features || []);
      } catch {
        setShapData([
          { feature: 'recency_days', importance: 0.23, direction: 'positive' },
          { feature: 'frequency_30d', importance: 0.19, direction: 'negative' },
          { feature: 'monetary_90d', importance: 0.16, direction: 'negative' },
          { feature: 'avg_review_score', importance: 0.12, direction: 'negative' },
          { feature: 'support_tickets_count', importance: 0.10, direction: 'positive' },
          { feature: 'discount_dependency', importance: 0.08, direction: 'positive' },
          { feature: 'days_since_purchase', importance: 0.07, direction: 'positive' },
          { feature: 'category_diversity', importance: 0.05, direction: 'negative' }
        ]);
      }
      
      // Fetch ROC curve
      try {
        const res = await fetch('/api/ml/models/roc');
        const data = await res.json();
        setRocData({ fpr: data.fpr || [], tpr: data.tpr || [], auc: data.auc || 0 });
      } catch {
        setRocData({
          fpr: [0, 0.02, 0.05, 0.08, 0.12, 0.18, 0.25, 0.35, 0.48, 0.65, 0.85, 1],
          tpr: [0, 0.15, 0.35, 0.52, 0.65, 0.76, 0.84, 0.90, 0.94, 0.97, 0.99, 1],
          auc: 0.89
        });
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, []);
  
  const modelIcons: { [key: string]: React.ReactNode } = {
    'ARIMA': <TrendingUp className="h-5 w-5 text-amber-500" />,
    'LSTM': <Activity className="h-5 w-5 text-blue-500" />,
    'Churn': <Users className="h-5 w-5 text-red-500" />,
    'Segmentation': <BarChart3 className="h-5 w-5 text-purple-500" />,
    'Anomaly': <AlertTriangle className="h-5 w-5 text-orange-500" />,
    'Sentiment': <MessageSquare className="h-5 w-5 text-emerald-500" />
  };
  
  if (loading) {
    return <div className="animate-pulse p-8">Loading model performance...</div>;
  }
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Model Performance</h1>
          <p className="text-muted-foreground">ML model registry and performance metrics</p>
        </div>
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
          <Brain className="h-3 w-3 mr-1" />
          {models.length} Active Models
        </Badge>
      </div>
      
      {/* Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {models.map(model => {
          const iconKey = Object.keys(modelIcons).find(key => model.model_name.includes(key)) || 'ARIMA';
          return (
            <Card key={model.model_id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {modelIcons[iconKey]}
                    {model.model_name}
                  </CardTitle>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 text-xs">
                    {model.version}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{model.accuracy_metric}</span>
                    <span className="text-lg font-bold">
                      {typeof model.metric_value === 'number' && model.metric_value < 1 
                        ? model.metric_value.toFixed(2) 
                        : model.metric_value}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(model.metrics).slice(0, 4).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground">{key}:</span>
                        <span className="font-mono">
                          {typeof value === 'number' 
                            ? (value < 1 ? value.toFixed(2) : value.toLocaleString()) 
                            : JSON.stringify(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-muted-foreground">Trained: {model.trained_at.split('T')[0]}</span>
                    <span className="text-xs text-muted-foreground">{model.training_time_sec}s</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* SHAP & ROC */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SHAP Feature Importance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              SHAP Feature Importance (Churn Model)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SHAPChart data={shapData} />
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-red-500" />
                <span className="text-xs">Increases Churn</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-emerald-500" />
                <span className="text-xs">Decreases Churn</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* ROC Curve */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              ROC Curve (Churn Classifier)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ROCCurve data={rocData} />
          </CardContent>
        </Card>
      </div>
      
      {/* Model Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>ARIMA vs LSTM Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-muted-foreground mb-2">MAPE</div>
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">ARIMA</div>
                  <div className="text-lg font-bold text-amber-500">6.2%</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">LSTM</div>
                  <div className="text-lg font-bold text-blue-500">5.8%</div>
                </div>
              </div>
              <Progress value={100 - 5.8} className="h-2 mt-2" />
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground mb-2">RMSE</div>
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">ARIMA</div>
                  <div className="text-lg font-bold text-amber-500">2,400 DA</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">LSTM</div>
                  <div className="text-lg font-bold text-blue-500">2,100 DA</div>
                </div>
              </div>
              <Progress value={100 - 21} className="h-2 mt-2" />
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground mb-2">R² Score</div>
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">ARIMA</div>
                  <div className="text-lg font-bold text-amber-500">0.91</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">LSTM</div>
                  <div className="text-lg font-bold text-blue-500">0.94</div>
                </div>
              </div>
              <Progress value={94} className="h-2 mt-2" />
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground mb-2">Training Time</div>
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">ARIMA</div>
                  <div className="text-lg font-bold text-amber-500">45s</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">LSTM</div>
                  <div className="text-lg font-bold text-blue-500">1,842s</div>
                </div>
              </div>
              <Progress value={45/1842*100} className="h-2 mt-2" />
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <div className="font-medium text-blue-500">Recommendation</div>
            <div className="text-sm text-muted-foreground mt-1">
              Use LSTM for production forecasting (better accuracy), ARIMA for explainability and quick iterations.
              LSTM provides +6.5% MAPE improvement and +12.5% RMSE reduction over ARIMA baseline.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
