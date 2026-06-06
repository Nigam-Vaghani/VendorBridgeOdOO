import { useState, useEffect } from 'react';
import { Plus, Search, Eye } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';
import { getProcurementRFQs } from '../../api/procurementApi';
import { getRFQs as getVendorRFQs } from '../../api/vendorApi';
import { CreateRFQ } from './CreateRFQ';
import { useNavigate } from 'react-router-dom';

export const RFQs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetchRFQs = async () => {
    try {
      setLoading(true);
      const data = user.role === ROLES.VENDOR ? await getVendorRFQs() : await getProcurementRFQs();
      setRfqs(data);
    } catch (error) {
      console.error("Error fetching RFQs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRFQs();
  }, [user.role]);

  if (showCreate) {
    return (
      <CreateRFQ 
        onCancel={() => setShowCreate(false)} 
        onCreated={() => {
          setShowCreate(false);
          fetchRFQs();
        }} 
      />
    );
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'sent':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'awarded':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">RFQs</h1>
          <p className="text-foreground/80 text-lg">
            {user.role === ROLES.VENDOR ? "View and respond to Requests for Quotations" : "Manage Requests for Quotations"}
          </p>
        </div>
        {user.role !== ROLES.VENDOR && (
          <button 
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-6 py-3 bg-card border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus size={20} />
            Create RFQ
          </button>
        )}
      </div>

      <div className="bg-card border-2 border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-foreground/5 text-foreground text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold border-b border-border">RFQ Number</th>
                <th className="px-6 py-4 font-semibold border-b border-border">Title</th>
                <th className="px-6 py-4 font-semibold border-b border-border">Deadline</th>
                <th className="px-6 py-4 font-semibold border-b border-border">Status</th>
                <th className="px-6 py-4 font-semibold border-b border-border text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-foreground/50">Loading RFQs...</td>
                </tr>
              ) : rfqs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-foreground/50">No RFQs found.</td>
                </tr>
              ) : (
                rfqs.map((rfq) => (
                  <tr key={rfq.id} className="hover:bg-foreground/5 transition-colors">
                    <td className="px-6 py-4 text-foreground font-medium font-mono">{rfq.rfq_number}</td>
                    <td className="px-6 py-4 text-foreground/80">{rfq.title}</td>
                    <td className="px-6 py-4 text-foreground/80">{new Date(rfq.deadline).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(rfq.status)}`}>
                        {rfq.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => {
                          if (user.role === ROLES.VENDOR) {
                            navigate('/quotations');
                          } else {
                            navigate('/compare-quotes');
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-card border-2 border-primary text-primary rounded-lg text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
