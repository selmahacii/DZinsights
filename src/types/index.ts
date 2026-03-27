export type PageType = 
  | 'overview' 
  | 'revenue' 
  | 'stock' 
  | 'customers' 
  | 'sentiment' 
  | 'anomalies' 
  | 'models';

export interface KPIData {
  total_revenue: number;
  total_transactions: number;
  avg_order_value: number;
  forecast_accuracy_pct: number;
  ca_growth_pct: number;
  unsold_reduction_pct: number;
  anomalies_this_month: number;
  avg_response_ms: number;
  churn_rate_pct?: number;
  customer_satisfaction?: number;
  stockout_events_monthly?: number;
  return_rate_pct?: number;
}
