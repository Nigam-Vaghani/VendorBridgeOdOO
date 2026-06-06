import { useAuth } from '../../hooks/useAuth';
import {
  FileText,
  Clock,
  DollarSign,
  AlertCircle,
  Plus,
  UserPlus,
  FilePlus,
  PieChart,
  BarChart3,
  TrendingUp
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();

  const statCards = [
    { title: "Active RFQ's", value: "12", icon: FileText },
    { title: "Pending Approvals", value: "5", icon: Clock },
    { title: "PO's this month", value: "$ 2.3L", icon: DollarSign },
    { title: "overdue invoices", value: "3", icon: AlertCircle },
  ];

  const recentPurchases = [
    { id: 'Po1', vendor: 'Infra', amount: '87000', status: 'Approved' },
    { id: 'Po2', vendor: 'Tech core', amount: '140000', status: 'Pending' },
    { id: 'Po3', vendor: 'OfficeNeed Co', amount: '34900', status: 'draft' },
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
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
            Welcome back, {user?.name || 'Procurement Officer'} - Today's Overview
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="bg-white/40 dark:bg-black/40 backdrop-blur-lg border border-white/20 dark:border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300"
              >
                <div className="text-4xl font-bold text-foreground mb-2">{card.value}</div>
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
                <h2 className="text-xl font-bold text-foreground">Recent Purchases</h2>
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
                    {recentPurchases.map((purchase) => (
                      <tr key={purchase.id} className="hover:bg-white/30 dark:hover:bg-black/30 transition-colors">
                        <td className="px-6 py-4 text-foreground font-medium">{purchase.id}</td>
                        <td className="px-6 py-4 text-foreground/80">{purchase.vendor}</td>
                        <td className="px-6 py-4 text-foreground/80 font-mono">{purchase.amount}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(purchase.status)}`}>
                            {purchase.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-4 pt-4 border-t border-white/20 dark:border-white/10">
              <button className="flex items-center gap-2 px-6 py-3 bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/30 dark:border-white/10 text-primary rounded-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-all shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:-translate-y-0.5">
                <Plus size={18} />
                new RFQ
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/30 dark:border-white/10 text-primary rounded-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-all shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:-translate-y-0.5">
                <UserPlus size={18} />
                Add Vendor
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/30 dark:border-white/10 text-primary rounded-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-all shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:-translate-y-0.5">
                <FilePlus size={18} />
                Create Invoices
              </button>
            </div>

          </div>

          {/* Right Column: Spending Trends */}
          <div className="bg-white/40 dark:bg-black/40 backdrop-blur-lg border border-white/20 dark:border-white/10 rounded-xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col">
            <h2 className="text-xl font-bold text-foreground mb-6">Spending Trends last 6 months</h2>

            {/* Static Chart Representation */}
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