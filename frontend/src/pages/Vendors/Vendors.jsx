import { useState, useEffect } from 'react';
import { Search, Plus, Eye, Filter } from 'lucide-react';
import { getVendors } from '../../api/procurementApi';

export const Vendors = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [vendorsData, setVendorsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const data = await getVendors();
        setVendorsData(data);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  const tabs = [
    { name: 'All', count: vendorsData.length },
    { name: 'Active', count: vendorsData.filter(v => v.status.toLowerCase() === 'active').length },
    { name: 'Pending', count: vendorsData.filter(v => v.status.toLowerCase() === 'pending').length },
    { name: 'Blocked', count: vendorsData.filter(v => v.status.toLowerCase() === 'blocked').length },
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      case 'blocked':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Vendors</h1>
          <p className="text-foreground/80 text-lg">
            Manage your vendors and registrations
          </p>
        </div>
        <button 
          onClick={() => alert("Vendors must self-register via the vendor portal or registration page.")}
          className="flex items-center gap-2 px-6 py-3 bg-card border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm whitespace-nowrap"
        >
          <Plus size={20} />
          Add Vendor
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-foreground/50" />
        </div>
        <input
          type="text"
          placeholder="Search bar ...... search by name, gst number, category..."
          className="w-full pl-11 pr-4 py-4 bg-card border-2 border-border rounded-xl text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
        />
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        
        {/* Tabs */}
        <div className="flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                activeTab === tab.name
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'bg-card border-border text-foreground hover:bg-foreground/5'
              }`}
            >
              {tab.name} <span className="opacity-80">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-card border-2 border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-foreground/5 text-foreground text-sm uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold border-b border-border">Vendor Name</th>
                  <th className="px-6 py-4 font-semibold border-b border-border">Category</th>
                  <th className="px-6 py-4 font-semibold border-b border-border">GST no.</th>
                  <th className="px-6 py-4 font-semibold border-b border-border">Contact no.</th>
                  <th className="px-6 py-4 font-semibold border-b border-border">Status</th>
                  <th className="px-6 py-4 font-semibold border-b border-border text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {vendorsData.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-foreground/5 transition-colors">
                    <td className="px-6 py-4 text-foreground font-medium">{vendor.name}</td>
                    <td className="px-6 py-4 text-foreground/80">{vendor.category}</td>
                    <td className="px-6 py-4 text-foreground/80 font-mono">{vendor.gst_number || '-'}</td>
                    <td className="px-6 py-4 text-foreground/80 font-mono">{vendor.phone}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(vendor.status)}`}>
                        {vendor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-card border-2 border-primary text-primary rounded-lg text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-colors">
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
