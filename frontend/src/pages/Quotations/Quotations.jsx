import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getQuotations } from '../../api/quotationApi';
import {
  Search, Filter, Eye, Edit2, Trash2,
  FileText, Clock, CheckCircle2,
  X, ChevronDown, Loader2, RefreshCw
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

const STATUS_CONFIG = {
  submitted:    { label: 'Submitted',    cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  under_review: { label: 'Under Review', cls: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  shortlisted:  { label: 'Shortlisted',  cls: 'bg-purple-100 text-purple-700 border-purple-200' },
  rejected:     { label: 'Rejected',     cls: 'bg-red-100 text-red-600 border-red-200' },
  accepted:     { label: 'Accepted',     cls: 'bg-green-100 text-green-700 border-green-200' },
  withdrawn:    { label: 'Withdrawn',    cls: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.submitted;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const Quotations = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isVendor = user?.role === 'vendor';

  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  const fetchQuotations = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      const res = await getQuotations(params);
      if (res.success) {
        let data = res.data;
        if (search) {
          const s = search.toLowerCase();
          data = data.filter(q => q.rfq_number.toLowerCase().includes(s) || q.rfq_title.toLowerCase().includes(s) || q.vendor_name.toLowerCase().includes(s));
        }
        setQuotations(data);
        setPagination({ ...res.pagination, total: data.length });
      }
    } catch (e) {
      setError('Failed to load quotations');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchQuotations(1); }, [fetchQuotations]);

  const statSummary = {
    total: quotations.length,
    submitted: quotations.filter(q => q.status === 'submitted' || q.status === 'under_review').length,
    shortlisted: quotations.filter(q => q.status === 'shortlisted').length,
    accepted: quotations.filter(q => q.status === 'accepted').length,
  };

  return (
    <div className="p-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quotations</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {statSummary.total} total quotations
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: statSummary.total, icon: FileText, color: 'text-slate-600 bg-slate-50 border-slate-200' },
          { label: 'Submitted', value: statSummary.submitted, icon: Clock, color: 'text-blue-600 bg-blue-50 border-blue-200' },
          { label: 'Shortlisted', value: statSummary.shortlisted, icon: CheckCircle2, color: 'text-purple-600 bg-purple-50 border-purple-200' },
          { label: 'Accepted', value: statSummary.accepted, icon: CheckCircle2, color: 'text-green-600 bg-green-50 border-green-200' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`flex items-center gap-3 p-4 rounded-xl border ${color}`}>
            <div className="p-2 rounded-lg bg-white/70 shadow-sm">
              <Icon size={18} />
            </div>
            <div>
              <div className="text-xl font-bold">{loading ? '—' : value}</div>
              <div className="text-xs font-medium opacity-70">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible">
        <div className="p-4 border-b border-slate-100 flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder={isVendor ? "Search by RFQ number or title..." : "Search by RFQ or Vendor name..."}
              className="w-full pl-9 pr-8 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6322ef]/20 focus:border-[#6322ef]"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="relative">
            <Button
              variant={statusFilter ? 'default' : 'secondary'}
              onClick={() => setShowFilter(v => !v)}
            >
              <Filter size={14} className="mr-1.5" />
              {statusFilter ? STATUS_CONFIG[statusFilter]?.label || statusFilter : 'Filter'}
              <ChevronDown size={12} className={`ml-1 transition-transform ${showFilter ? 'rotate-180' : ''}`} />
            </Button>
            {showFilter && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-3 space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase px-2 mb-2">Filter by Status</p>
                {['', ...Object.keys(STATUS_CONFIG)].map(s => (
                  <button
                    key={s}
                    onClick={() => { setStatusFilter(s); setShowFilter(false); }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${statusFilter === s ? 'bg-[#6322ef] text-white' : 'hover:bg-slate-50 text-slate-700'}`}
                  >
                    {s ? STATUS_CONFIG[s].label : 'All Statuses'}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => fetchQuotations(pagination.page)} className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors" title="Refresh">
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold tracking-wider">
                <th className="px-6 py-3">RFQ Details</th>
                {!isVendor && <th className="px-6 py-3">Vendor</th>}
                <th className="px-6 py-3 text-right">Total Amount</th>
                <th className="px-6 py-3 text-center">Delivery (Days)</th>
                <th className="px-6 py-3">Submitted</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={isVendor ? 6 : 7} className="py-16 text-center"><Spinner /></td></tr>
              ) : error ? (
                <tr><td colSpan={isVendor ? 6 : 7} className="py-12 text-center text-red-500 text-sm">{error}</td></tr>
              ) : quotations.length === 0 ? (
                <tr>
                  <td colSpan={isVendor ? 6 : 7} className="py-16 text-center">
                    <FileText size={40} className="mx-auto text-slate-200 mb-3" />
                    <p className="text-slate-400 font-medium">No quotations found</p>
                  </td>
                </tr>
              ) : (
                quotations.map(q => (
                  <tr
                    key={q.id}
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/quotations/${q.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#6322ef] mb-0.5">{q.rfq_number}</div>
                      <div className="font-medium text-slate-700 max-w-xs truncate">{q.rfq_title}</div>
                    </td>
                    {!isVendor && (
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{q.vendor_name}</div>
                      </td>
                    )}
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-slate-800">{formatCurrency(q.total_amount)}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-slate-700 font-medium">{q.delivery_days}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-700">{formatDate(q.submitted_at)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={q.status} />
                    </td>
                    <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-end items-center gap-1">
                        <button
                          onClick={() => navigate(`/quotations/${q.id}`)}
                          className="p-1.5 rounded text-slate-400 hover:text-[#6322ef] hover:bg-[#6322ef]/10 transition-all"
                          title="View"
                        >
                          <Eye size={15} />
                        </button>
                        {isVendor && q.status === 'submitted' && (
                          <button
                            onClick={() => navigate(`/quotations/${q.id}/edit`)}
                            className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                            title="Edit"
                          >
                            <Edit2 size={15} />
                          </button>
                        )}
                        {!isVendor && q.status === 'submitted' && (
                          <button
                            onClick={() => navigate(`/rfqs/${q.rfq_id}/compare`)}
                            className="p-1.5 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all text-xs font-semibold px-2"
                            title="Compare Quotes"
                          >
                            Compare
                          </button>
                        )}
                      </div>
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
