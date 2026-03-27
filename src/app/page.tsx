"use client";

import { useState, useSyncExternalStore } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { OverviewPage } from "@/components/pages/OverviewPage";
import { RevenuePage } from "@/components/pages/RevenuePage";
import { StockPage } from "@/components/pages/StockPage";
import { CustomersPage } from "@/components/pages/CustomersPage";
import { SentimentPage } from "@/components/pages/SentimentPage";
import { AnomaliesPage } from "@/components/pages/AnomaliesPage";
import { ModelsPage } from "@/components/pages/ModelsPage";
import { Toaster } from "@/components/ui/sonner";

type PageType = 'overview' | 'revenue' | 'stock' | 'customers' | 'sentiment' | 'anomalies' | 'models';

// Safe client-side only check
const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function MLAnalyticsDashboard() {
  const [currentPage, setCurrentPage] = useState<PageType>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const mounted = useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto mb-4 bg-emerald-500 rounded-xl flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            ML Analytics Platform
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Loading ML models and data...
          </div>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'overview':
        return <OverviewPage />;
      case 'revenue':
        return <RevenuePage />;
      case 'stock':
        return <StockPage />;
      case 'customers':
        return <CustomersPage />;
      case 'sentiment':
        return <SentimentPage />;
      case 'anomalies':
        return <AnomaliesPage />;
      case 'models':
        return <ModelsPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main 
        className="transition-all duration-300 min-h-screen"
        style={{ marginLeft: isSidebarCollapsed ? '64px' : '288px' }}
      >
        <div className="p-6 lg:p-8">
          {renderPage()}
        </div>
      </main>
      <Toaster />
    </div>
  );
}
