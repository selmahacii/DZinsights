"use client";

import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Package, 
  Users, 
  MessageSquare, 
  AlertTriangle, 
  Brain,
  ChevronLeft,
  ChevronRight,
  Activity,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

export type PageType = 
  | 'overview' 
  | 'revenue' 
  | 'stock' 
  | 'customers' 
  | 'sentiment' 
  | 'anomalies' 
  | 'models';

interface NavItem {
  id: PageType; 
  label: string; 
  icon: React.ReactNode;
  description: string;
  badge?: string;
}

const NAVIGATION_ITEMS: NavItem[] = [
  { 
    id: 'overview', 
    label: 'Vue d\'Ensemble', 
    icon: <LayoutDashboard className="h-5 w-5" />,
    description: 'KPIs & Métriques Business',
    badge: 'Live'
  },
  { 
    id: 'revenue', 
    label: 'Prévision Revenus', 
    icon: <TrendingUp className="h-5 w-5" />,
    description: 'Prédictions ARIMA & LSTM',
    badge: '+28%'
  },
  { 
    id: 'stock', 
    label: 'Intelligence Stock', 
    icon: <Package className="h-5 w-5" />,
    description: 'Optimisation Inventaire',
    badge: '12'
  },
  { 
    id: 'customers', 
    label: 'Intelligence Clients', 
    icon: <Users className="h-5 w-5" />,
    description: 'Analyse RFM & Churn',
    badge: '300K'
  },
  { 
    id: 'sentiment', 
    label: 'Analyse Sentiment', 
    icon: <MessageSquare className="h-5 w-5" />,
    description: 'Insights Avis Clients',
    badge: '87%'
  },
  { 
    id: 'anomalies', 
    label: 'Centre Anomalies', 
    icon: <AlertTriangle className="h-5 w-5" />,
    description: 'Détection & Alertes',
    badge: '15'
  },
  { 
    id: 'models', 
    label: 'Performance Modèles', 
    icon: <Brain className="h-5 w-5" />,
    description: 'Registre ML & Métriques',
    badge: '6'
  },
];

interface SidebarProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ currentPage, onPageChange, isCollapsed, onToggle }: SidebarProps) {
  const analyticsItems = NAVIGATION_ITEMS.slice(0, 4);
  const intelligenceItems = NAVIGATION_ITEMS.slice(4);

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-slate-900 border-r border-slate-700/50 transition-all duration-300 flex flex-col",
          isCollapsed ? "w-16" : "w-72"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700/50">
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="DZinsights Logo" className="h-8 w-auto object-contain" />
              <div>
                <span className="font-bold text-lg text-white tracking-tight">DZinsights</span>
                <p className="text-[10px] text-slate-400 font-medium">Business Intelligence</p>
              </div>
            </div>
          ) : (
            <div className="mx-auto">
              <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain" />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn(
              "h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700/50",
              isCollapsed && "mx-auto mt-2"
            )}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-2">
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 mb-3">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Analytics
                </span>
              </div>
            )}
            
            {analyticsItems.map((item) => (
              <SidebarNavItem 
                key={item.id} 
                item={item} 
                isActive={currentPage === item.id} 
                isCollapsed={isCollapsed} 
                onClick={() => onPageChange(item.id)} 
              />
            ))}
            
            {!isCollapsed && (
              <div className="px-3 mt-6 mb-3">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Intelligence
                </span>
              </div>
            )}
            
            {isCollapsed && <div className="h-4" />}
            
            {intelligenceItems.map((item) => (
              <SidebarNavItem 
                key={item.id} 
                item={item} 
                isActive={currentPage === item.id} 
                isCollapsed={isCollapsed} 
                onClick={() => onPageChange(item.id)} 
              />
            ))}
          </div>
        </nav>

        {!isCollapsed ? (
          <div className="p-4 border-t border-slate-700/50">
            <div className="bg-slate-800/50 rounded-xl p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">System Status</span>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-emerald-400 font-medium">Active</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Latency</span>
                <span className="text-emerald-400 font-mono font-medium">48ms</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-slate-500">Cache Hit</span>
                <span className="text-blue-400 font-mono font-medium">94.2%</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-800/30 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-white">6</div>
                <div className="text-[9px] text-slate-500 uppercase">Models</div>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-emerald-400">89%</div>
                <div className="text-[9px] text-slate-500 uppercase">Acc.</div>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-amber-400">127</div>
                <div className="text-[9px] text-slate-500 uppercase">Signals</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-2 border-t border-slate-700/50">
            <div className="flex justify-center">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}

function SidebarNavItem({ 
  item, 
  isActive, 
  isCollapsed, 
  onClick 
}: { 
  item: NavItem; 
  isActive: boolean; 
  isCollapsed: boolean; 
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
            isActive
              ? "bg-emerald-500/10 text-emerald-400 font-medium"
              : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
          )}
        >
          <div className={cn(
            "p-1.5 rounded-lg transition-colors",
            isActive 
              ? "bg-emerald-500/20 text-emerald-400" 
              : "bg-slate-800/50 text-slate-400 group-hover:bg-slate-700/50 group-hover:text-slate-300"
          )}>
            {item.icon}
          </div>
          
          {!isCollapsed && (
            <>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-[10px] text-slate-500 truncate">{item.description}</div>
              </div>
              {item.badge && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-[10px] px-1.5 py-0 h-5 border-0 font-medium",
                    isActive 
                      ? "bg-emerald-500/20 text-emerald-400" 
                      : "bg-slate-800 text-slate-400"
                  )}
                >
                  {item.badge}
                </Badge>
              )}
            </>
          )}
        </button>
      </TooltipTrigger>
      {isCollapsed && (
        <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
          <p className="font-medium">{item.label}</p>
          <p className="text-xs text-slate-400">{item.description}</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
}
