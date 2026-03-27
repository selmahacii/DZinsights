import { NextResponse } from 'next/server';

export async function GET() {
  const models = [
    {
      model_id: 'MDL-001',
      model_name: 'ARIMA Revenue Forecast',
      version: '2.3.1',
      trained_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      accuracy_metric: 'MAPE',
      metric_value: 6.2,
      is_active: true,
      metrics: { mape: 6.2, mae: 1840, order: [2, 1, 2], aic: 28450.3 },
      status: 'production',
      training_time_sec: 45
    },
    {
      model_id: 'MDL-002',
      model_name: 'LSTM Revenue Forecast',
      version: '3.1.0',
      trained_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      accuracy_metric: 'RMSE',
      metric_value: 2100,
      is_active: true,
      metrics: { rmse: 2100, r2: 0.94, mape: 5.8, epochs: 150, window: 60, hidden_units: 64 },
      status: 'production',
      training_time_sec: 1842
    },
    {
      model_id: 'MDL-003',
      model_name: 'Churn RandomForest',
      version: '1.5.2',
      trained_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      accuracy_metric: 'AUC-ROC',
      metric_value: 0.89,
      is_active: true,
      metrics: { auc_roc: 0.89, precision: 0.84, recall: 0.81, f1: 0.82, n_estimators: 300, max_depth: 10 },
      status: 'production',
      training_time_sec: 125
    },
    {
      model_id: 'MDL-004',
      model_name: 'Customer Segmentation KMeans',
      version: '1.2.0',
      trained_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      accuracy_metric: 'Silhouette',
      metric_value: 0.71,
      is_active: true,
      metrics: { silhouette_score: 0.71, n_clusters: 5, inertia: 2845600.0 },
      status: 'production',
      training_time_sec: 28
    },
    {
      model_id: 'MDL-005',
      model_name: 'Anomaly IsolationForest',
      version: '2.0.1',
      trained_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      accuracy_metric: 'Detection Rate',
      metric_value: 0.92,
      is_active: true,
      metrics: { detection_rate: 0.92, false_positive_rate: 0.08, contamination: 0.05, n_estimators: 100 },
      status: 'production',
      training_time_sec: 12
    },
    {
      model_id: 'MDL-006',
      model_name: 'Sentiment VADER',
      version: '1.0.0',
      trained_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      accuracy_metric: 'Accuracy',
      metric_value: 0.87,
      is_active: true,
      metrics: { accuracy: 0.87, precision: 0.85, recall: 0.88, f1: 0.86 },
      status: 'production',
      training_time_sec: 2
    }
  ];
  
  return NextResponse.json({
    total_models: models.length,
    active_models: models.filter(m => m.is_active).length,
    models,
    last_updated: new Date().toISOString()
  });
}
