import { NextResponse } from 'next/server';

export async function GET() {
  const fpr = [0.0, 0.02, 0.05, 0.08, 0.12, 0.18, 0.25, 0.35, 0.48, 0.65, 0.85, 1.0];
  const tpr = [0.0, 0.15, 0.35, 0.52, 0.65, 0.76, 0.84, 0.90, 0.94, 0.97, 0.99, 1.0];
  const thresholds = [1.0, 0.95, 0.88, 0.80, 0.72, 0.60, 0.50, 0.40, 0.30, 0.20, 0.10, 0.0];
  
  return NextResponse.json({
    model: 'Churn RandomForest',
    auc: 0.89,
    fpr,
    tpr,
    thresholds,
    optimal_threshold: 0.50,
    confusion_matrix: {
      tn: 45000,
      fp: 3200,
      fn: 2800,
      tp: 14000
    }
  });
}
