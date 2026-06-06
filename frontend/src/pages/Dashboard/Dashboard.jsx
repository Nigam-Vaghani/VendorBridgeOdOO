import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getDashboardStats } from '../../api/dashboardApi';
import {
  FileText,
  Clock,
  DollarSign,
  AlertCircle,
  Plus,
  UserPlus,
  FilePlus,
  PieChart,
  TrendingUp,
  Loader2
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await getDashboardStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        setError('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: "Active RFQ's", value: loading ? '…' : (stats?.active_rfqs ?? 0), icon: FileText },
    { title: "Pending Approvals", value: loading ? '…' : (stats?.pending_approvals ?? 0), icon: Clock },
    { title: "PO's this month", value: loading ? '…' : (stats?.pos_this_month ?? '₹0'), icon: DollarSign },
    { title: "Overdue Invoices", value: loading ? '…' : (stats?.overdue_invoices ?? 0), icon: AlertCircle },
  ];

  const recentPurchases = stats?.recent_purchases ?? [];

  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'approved':
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'pending':
      case 'pending_approval':
      case 'sent':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      case 'draft':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 relative z-10">

        {/* Header Section */}
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-foreground/80 text-lg">
            Welcome back, {user?.name || user?.first_name || 'Procurement Officer'} — Today's Overview
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="bg-white/40 dark:bg-black/40 backdrop-blur-lg border border-white/20 dark:border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300"
              >
                {loading ? (
                  <Loader2 size={28} className="animate-spin text-primary/50 mb-2" />
                ) : (
                  <div className="text-4xl font-bold text-foreground mb-2">{card.value}</div>
                )}
                <div className="flex items-center gap-2 text-foreground/80 font-medium">
                  {card.title}
                  <Icon size={16} className="text-primary opacity-70" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Table and Actions */}
          <div className="lg:col-span-2 space-y-8">

            {/* Table */}
            <div className="bg-white/40 dark:bg-black/40 backdrop-blur-lg border border-white/20 dark:border-white/10 rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="px-6 py-4 border-b border-white/20 dark:border-white/10 bg-white/20 dark:bg-black/20">
                <h2 className="text-xl font-bold text-foreground">Recent Purchase Orders</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/30 dark:bg-black/30 text-foreground text-sm uppercase tracking-wider">
                      <th className="px-6 py-4 font-semibold border-b border-white/20 dark:border-white/10">PO#</th>
                      <th className="px-6 py-4 font-semibold border-b border-white/20 dark:border-white/10">Vendor</th>
                      <th className="px-6 py-4 font-semibold border-b border-white/20 dark:border-white/10">Amount</th>
                      <th className="px-6 py-4 font-semibold border-b border-white/20 dark:border-white/10">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/20 dark:divide-white/10">
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-10 text-center text-foreground/50">
                          <Loader2 size={24} className="animate-spin mx-auto" />
                        </td>
                      </tr>
                    ) : recentPurchases.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-10 text-center text-foreground/50">
                          No purchase orders yet
                        </td>
                      </tr>
                    ) : (
                      recentPurchases.map((purchase) => (
                        <tr key={purchase.id} className="hover:bg-white/30 dark:hover:bg-black/30 transition-colors">
                          <td className="px-6 py-4 text-foreground font-medium">{purchase.id}</td>
                          <td className="px-6 py-4 text-foreground/80">{purchase.vendor}</td>
                          <td className="px-6 py-4 text-foreground/80 font-mono">₹{Number(purchase.amount).toLocaleString('en-IN')}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(purchase.status)}`}>
                              {purchase.status.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-4 pt-4 border-t border-white/20 dark:border-white/10">
              <button
                onClick={() => navigate('/rfqs')}
                className="flex items-center gap-2 px-6 py-3 bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/30 dark:border-white/10 text-primary rounded-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-all shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:-translate-y-0.5"
              >
                <Plus size={18} />
                New RFQ
              </button>
              <button
                onClick={() => navigate('/vendors/new')}
                className="flex items-center gap-2 px-6 py-3 bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/30 dark:border-white/10 text-primary rounded-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-all shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:-translate-y-0.5"
              >
                <UserPlus size={18} />
                Add Vendor
              </button>
              <button
                onClick={() => navigate('/invoices')}
                className="flex items-center gap-2 px-6 py-3 bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/30 dark:border-white/10 text-primary rounded-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-all shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:-translate-y-0.5"
              >
                <FilePlus size={18} />
                Create Invoice
              </button>
            </div>

          </div>

          {/* Right Column: Spending Trends */}
          <div className="bg-white/40 dark:bg-black/40 backdrop-blur-lg border border-white/20 dark:border-white/10 rounded-xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col">
            <h2 className="text-xl font-bold text-foreground mb-6">Spending Trends — last 6 months</h2>

            {/* Chart Representation */}
            <div className="flex-1 flex flex-col gap-8 justify-center items-center py-8">
              <div className="w-full flex justify-between items-end h-32 px-4 gap-2">
                <div className="w-1/6 bg-primary/40 rounded-t-sm h-1/3 hover:bg-primary/60 transition-colors"></div>
                <div className="w-1/6 bg-primary/60 rounded-t-sm h-1/2 hover:bg-primary/80 transition-colors"></div>
                <div className="w-1/6 bg-primary/80 rounded-t-sm h-full hover:bg-primary transition-colors"></div>
                <div className="w-1/6 bg-primary/30 rounded-t-sm h-1/4 hover:bg-primary/50 transition-colors"></div>
                <div className="w-1/6 bg-primary/50 rounded-t-sm h-2/3 hover:bg-primary/70 transition-colors"></div>
                <div className="w-1/6 bg-primary/90 rounded-t-sm h-5/6 hover:bg-primary transition-colors"></div>
              </div>

              <div className="flex gap-6 text-foreground/60 w-full justify-center pt-4 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <PieChart size={20} />
                  <span className="text-sm font-medium">Distribution</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={20} />
                  <span className="text-sm font-medium">Growth</span>
                </div>
              </div>
            </div>
          </div>

      </div>
    </div>
  );
};