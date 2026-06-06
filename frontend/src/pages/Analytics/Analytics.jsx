import { useState, useEffect } from 'react';
import { 
  Users, FileText, CheckCircle, DollarSign, Clock, Receipt, 
  Download, ArrowUpRight, ArrowDownRight, Award, PieChart as PieChartIcon,
  TrendingUp, Activity
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Button } from '../../components/ui/Button';

// Mock Data for Analytics
const MOCK_KPIS = [
  { id: 1, title: 'Total Vendors', value: '142', trend: '+12%', isPositive: true, prevMonth: '128', icon: Users },
  { id: 2, title: 'Active RFQs', value: '38', trend: '+5%', isPositive: true, prevMonth: '36', icon: FileText },
  { id: 3, title: 'Approved POs', value: '412', trend: '-2%', isPositive: false, prevMonth: '420', icon: CheckCircle },
  { id: 4, title: 'Procurement Spend', value: '$1.2M', trend: '+15%', isPositive: false, prevMonth: '$1.05M', icon: DollarSign },
  { id: 5, title: 'Pending Approvals', value: '14', trend: '-8%', isPositive: true, prevMonth: '22', icon: Clock },
  { id: 6, title: 'Generated Invoices', value: '385', trend: '+4%', isPositive: true, prevMonth: '370', icon: Receipt },
];

const SPEND_DATA = [
  { name: 'Jan', spend: 85000 }, { name: 'Feb', spend: 92000 },
  { name: 'Mar', spend: 78000 }, { name: 'Apr', spend: 105000 },
  { name: 'May', spend: 120000 }, { name: 'Jun', spend: 115000 },
  { name: 'Jul', spend: 135000 }, { name: 'Aug', spend: 140000 },
  { name: 'Sep', spend: 130000 }, { name: 'Oct', spend: 155000 },
  { name: 'Nov', spend: 165000 }, { name: 'Dec', spend: 180000 },
];

const COLORS = ['#004643', '#f9bc60', '#e16162', '#3da9fc', '#90b4ce'];

// Reusable Components
const MetricCard = ({ title, value, trend, isPositive, prevMonth, icon: Icon }) => (
  <div className="bg-card border border-border/40 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
        <Icon size={20} />
      </div>
      <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
        {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {trend}
      </div>
    </div>
    <h3 className="text-sm font-medium text-foreground opacity-70 mb-1">{title}</h3>
    <p className="text-3xl font-bold text-foreground mb-2">{value}</p>
    <p className="text-xs text-foreground opacity-60">vs {prevMonth} last month</p>
  </div>
);

const ExportButton = ({ label }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <Button 
        variant="outline" 
        className="gap-2 w-full justify-start text-sm border-border/50 text-foreground bg-card hover:bg-muted"
        onClick={() => setOpen(!open)}
      >
        <Download size={16} /> {label}
      </Button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-full bg-background border border-border rounded-lg shadow-lg z-10 py-1 flex flex-col">
          <button 
            className="text-left px-4 py-2 text-sm hover:bg-muted" 
            onClick={() => {
              setOpen(false);
              window.print();
            }}
          >
            Export as PDF
          </button>
          <button 
            className="text-left px-4 py-2 text-sm hover:bg-muted" 
            onClick={() => {
              setOpen(false);
              alert('Exporting as Excel... (Mock)');
            }}
          >
            Export as Excel
          </button>
          <button 
            className="text-left px-4 py-2 text-sm hover:bg-muted" 
            onClick={() => {
              setOpen(false);
              alert('Exporting as CSV... (Mock)');
            }}
          >
            Export as CSV
          </button>
        </div>
      )}
    </div>
  );
};

const InsightCard = ({ title, value, subtitle, icon: Icon, colorClass }) => (
  <div className="bg-card border border-border/40 rounded-xl p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClass}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm text-foreground opacity-70 mb-0.5">{title}</p>
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-foreground opacity-60 mt-0.5">{subtitle}</p>
    </div>
  </div>
);

export const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    import('../../api/procurementApi').then(({ getFullAnalytics }) => {
      getFullAnalytics().then(res => setAnalyticsData(res)).catch(console.error);
    });
  }, []);

  if (!analyticsData) return <div className="p-8 text-center text-foreground">Loading Analytics...</div>;

  const dynamicKPIs = [
    { id: 1, title: 'Total Vendors', value: analyticsData.kpis.total_vendors.toString(), trend: '+0%', isPositive: true, prevMonth: '-', icon: Users },
    { id: 2, title: 'Active RFQs', value: analyticsData.kpis.active_rfqs.toString(), trend: '+0%', isPositive: true, prevMonth: '-', icon: FileText },
    { id: 3, title: 'Approved POs', value: analyticsData.kpis.approved_pos.toString(), trend: '-0%', isPositive: true, prevMonth: '-', icon: CheckCircle },
    { id: 4, title: 'Procurement Spend', value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(analyticsData.kpis.total_spend), trend: '+0%', isPositive: true, prevMonth: '-', icon: DollarSign },
    { id: 5, title: 'Pending Approvals', value: analyticsData.kpis.pending_approvals.toString(), trend: '-0%', isPositive: false, prevMonth: '-', icon: Clock },
    { id: 6, title: 'Generated Invoices', value: analyticsData.kpis.generated_invoices.toString(), trend: '+0%', isPositive: true, prevMonth: '-', icon: Receipt },
  ];

  return (
    <div className="p-8 h-full overflow-y-auto bg-background">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-sans tracking-tight text-foreground">Analytics & Reports</h1>
        <p className="text-base text-foreground opacity-70 mt-1">Comprehensive insights into procurement performance.</p>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {dynamicKPIs.map(kpi => <MetricCard key={kpi.id} {...kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        
        {/* Main Charts Area */}
        <div className="xl:col-span-2 flex flex-col gap-8">
          
          {/* Spend Trend Chart */}
          <div className="bg-card border border-border/40 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" /> Procurement Spend Trend (12 Months)
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData.spend_data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--foreground)', opacity: 0.7, fontSize: 12}} dy={10} />
                  <YAxis tickFormatter={(val) => `$${val/1000}k`} axisLine={false} tickLine={false} tick={{fill: 'var(--foreground)', opacity: 0.7, fontSize: 12}} dx={-10} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--foreground)' }}
                    itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Spend']}
                  />
                  <Line type="monotone" dataKey="spend" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Vendor Performance Table */}
          <div className="bg-card border border-border/40 rounded-xl shadow-sm overflow-hidden">
             <div className="p-6 border-b border-border/40 flex justify-between items-center">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Award size={20} className="text-primary" /> Vendor Performance Analytics
                </h3>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                  <thead className="bg-muted/20 text-foreground opacity-80 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-4">Vendor Name</th>
                      <th className="px-6 py-4 text-center">Total RFQs</th>
                      <th className="px-6 py-4 text-center">Won RFQs</th>
                      <th className="px-6 py-4 text-center">Success Rate</th>
                      <th className="px-6 py-4 text-center">Avg Delivery</th>
                      <th className="px-6 py-4 text-center">Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {analyticsData.vendor_performance.map(vendor => (
                      <tr key={vendor.id} className="hover:bg-muted/10">
                        <td className="px-6 py-4 font-medium text-foreground">{vendor.name}</td>
                        <td className="px-6 py-4 text-center text-foreground">{vendor.rfqs}</td>
                        <td className="px-6 py-4 text-center text-foreground">{vendor.won}</td>
                        <td className="px-6 py-4 text-center text-emerald-600 font-bold">{vendor.rate}</td>
                        <td className="px-6 py-4 text-center text-foreground opacity-80">{vendor.avgTime}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded font-bold text-xs">
                            ★ {vendor.rating}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
          </div>
        </div>

        {/* Side Panel Area */}
        <div className="flex flex-col gap-8">
          
          {/* Category Pie Chart */}
          <div className="bg-card border border-border/40 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <PieChartIcon size={20} className="text-primary" /> Category Analysis
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.category_data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {analyticsData.category_data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--foreground)' }}
                    itemStyle={{ color: 'var(--foreground)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', opacity: 0.8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Analytics Summary */}
          <div className="bg-card border border-border/40 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <Activity size={20} className="text-primary" /> Workflow Analytics
            </h3>
            
            <div className="space-y-6">
              {/* RFQ Lifecycle */}
              <div>
                <h4 className="text-sm font-semibold text-foreground opacity-70 uppercase tracking-wider mb-3">RFQ Lifecycle</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-muted/20 p-3 rounded-lg"><p className="opacity-70 mb-1">Created</p><p className="font-bold text-lg">128</p></div>
                  <div className="bg-muted/20 p-3 rounded-lg"><p className="opacity-70 mb-1">Received</p><p className="font-bold text-lg">450</p></div>
                  <div className="bg-emerald-50 p-3 rounded-lg"><p className="text-emerald-700 mb-1">Approved</p><p className="font-bold text-lg text-emerald-700">85</p></div>
                  <div className="bg-rose-50 p-3 rounded-lg"><p className="text-rose-700 mb-1">Rejected</p><p className="font-bold text-lg text-rose-700">22</p></div>
                </div>
              </div>

              {/* Approval & Invoice */}
              <div>
                <h4 className="text-sm font-semibold text-foreground opacity-70 uppercase tracking-wider mb-3">Approvals & Invoices</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-border/30">
                    <span className="opacity-80">Avg Approval Time</span>
                    <span className="font-bold text-foreground">4.2 Hours</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/30">
                    <span className="opacity-80">Paid Invoices</span>
                    <span className="font-bold text-emerald-600">312</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="opacity-80">Overdue Invoices</span>
                    <span className="font-bold text-rose-600">18</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reports Export Section */}
          <div className="bg-card border border-border/40 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Download size={20} className="text-primary" /> Generate Reports
            </h3>
            <div className="space-y-3">
              <ExportButton label="Export Vendor Report" />
              <ExportButton label="Export Procurement Report" />
              <ExportButton label="Export RFQ Report" />
              <ExportButton label="Export Purchase Order Report" />
              <ExportButton label="Export Invoice Report" />
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Section: Insights */}
      <h3 className="text-xl font-bold text-foreground mb-4">Recent Procurement Insights</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <InsightCard 
          title="Top Performing Vendor" value="Rapid Print Solutions" subtitle="90% success rate this quarter" 
          icon={Award} colorClass="bg-amber-100 text-amber-600"
        />
        <InsightCard 
          title="Highest Spending Category" value="Electronics" subtitle="$400k representing 33% of total" 
          icon={PieChartIcon} colorClass="bg-indigo-100 text-indigo-600"
        />
        <InsightCard 
          title="Avg Procurement Cycle" value="8.5 Days" subtitle="From RFQ creation to PO generation" 
          icon={Clock} colorClass="bg-blue-100 text-blue-600"
        />
        <InsightCard 
          title="Cost Savings This Month" value="$45,200" subtitle="12% reduction in hardware costs" 
          icon={DollarSign} colorClass="bg-emerald-100 text-emerald-600"
        />
      </div>

    </div>
  );
};
