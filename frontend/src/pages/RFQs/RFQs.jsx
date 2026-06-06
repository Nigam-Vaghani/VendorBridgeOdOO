import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Filter, Eye, Edit2, Trash2, Send, X,
  ChevronDown, FileText, Clock, CheckCircle2, XCircle,
  AlertCircle, Loader2, RefreshCw
} from 'lucide-react';
import { getRFQs, deleteRFQ } from '../../api/rfqApi';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

const STATUS_CONFIG = {
  draft:     { label: 'Draft',     cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  sent:      { label: 'Sent',      cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  closed:    { label: 'Closed',    cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  awarded:   { label: 'Awarded',   cls: 'bg-green-100 text-green-700 border-green-200' },
  cancelled: { label: 'Cancelled', cls: 'bg-red-100 text-red-600 border-red-200' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const isOverdue = (deadline, status) => {
  return status === 'sent' && new Date(deadline) < new Date();
};

export const RFQs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isVendor = user?.role === 'vendor';

  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  const fetchRFQs = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit: 20 };
      if (search) params.q = search;
      if (statusFilter) params.status = statusFilter;
      const res = await getRFQs(params);
      if (res.success) {
        setRfqs(res.data);
        setPagination(res.pagination);
      }
    } catch (e) {
      setError('Failed to load RFQs');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchRFQs(1); }, [fetchRFQs]);

  const handleDelete = async (id, rfq_number) => {
    if (!window.confirm(`Cancel RFQ ${rfq_number}? This cannot be undone.`)) return;
    try {
      await deleteRFQ(id);
      fetchRFQs(pagination.page);
    } catch (e) {
      alert(e.response?.data?.detail || 'Failed to cancel RFQ');
    }
  };

  const statSummary = {
    total: pagination.total,
    draft: rfqs.filter(r => r.status === 'draft').length,
    sent: rfqs.filter(r => r.status === 'sent').length,
    closed: rfqs.filter(r => r.status === 'closed').length,
  };

  return (
    <div className="p-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Request for Quotations</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {pagination.total} total RFQs
          </p>
        </div>
        {!isVendor && (
          <Button onClick={() => navigate('/rfqs/new')}>
            <Plus size={16} className="mr-1.5" /> New RFQ
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: pagination.total, icon: FileText, color: 'text-slate-600 bg-slate-50 border-slate-200' },
          { label: 'Draft', value: statSummary.draft, icon: Edit2, color: 'text-slate-500 bg-slate-50 border-slate-200' },
          { label: 'Active', value: statSummary.sent, icon: Send, color: 'text-blue-600 bg-blue-50 border-blue-200' },
          { label: 'Closed', value: statSummary.closed, icon: CheckCircle2, color: 'text-amber-600 bg-amber-50 border-amber-200' },
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
              placeholder="Search by title or RFQ number..."
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
              {statusFilter ? statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1) : 'Filter'}
              <ChevronDown size={12} className={`ml-1 transition-transform ${showFilter ? 'rotate-180' : ''}`} />
            </Button>
            {showFilter && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-3 space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase px-2 mb-2">Filter by Status</p>
                {['', 'draft', 'sent', 'closed', 'awarded', 'cancelled'].map(s => (
                  <button
                    key={s}
                    onClick={() => { setStatusFilter(s); setShowFilter(false); }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${statusFilter === s ? 'bg-[#6322ef] text-white' : 'hover:bg-slate-50 text-slate-700'}`}
                  >
                    {s || 'All Statuses'}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => fetchRFQs(pagination.page)} className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors" title="Refresh">
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold tracking-wider">
                <th className="px-6 py-3">RFQ #</th>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Deadline</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-center">Items</th>
                <th className="px-6 py-3 text-center">Vendors</th>
                <th className="px-6 py-3 text-center">Quotes</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="8" className="py-16 text-center"><Spinner /></td></tr>
              ) : error ? (
                <tr><td colSpan="8" className="py-12 text-center text-red-500 text-sm">{error}</td></tr>
              ) : rfqs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center">
                    <FileText size={40} className="mx-auto text-slate-200 mb-3" />
                    <p className="text-slate-400 font-medium">No RFQs found</p>
                    {!isVendor && (
                      <button onClick={() => navigate('/rfqs/new')} className="mt-3 text-[#6322ef] text-sm hover:underline">
                        Create your first RFQ
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                rfqs.map(rfq => (
                  <tr
                    key={rfq.id}
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/rfqs/${rfq.id}`)}
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-semibold text-[#6322ef] bg-[#6322ef]/10 px-2 py-0.5 rounded">
                        {rfq.rfq_number}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 max-w-xs truncate">{rfq.title}</div>
                      {rfq.created_by_name && (
                        <div className="text-xs text-slate-400">{rfq.created_by_name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm font-medium ${isOverdue(rfq.deadline, rfq.status) ? 'text-red-500' : 'text-slate-700'}`}>
                        {formatDate(rfq.deadline)}
                      </div>
                      {isOverdue(rfq.deadline, rfq.status) && (
                        <div className="text-xs text-red-400 flex items-center gap-1 mt-0.5">
                          <AlertCircle size={10} /> Overdue
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={rfq.status} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-slate-700 font-semibold">{rfq.total_items}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-slate-700 font-semibold">{rfq.total_vendors}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-semibold ${rfq.quotations_received > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                        {rfq.quotations_received}
                      </span>
                    </td>
                    <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-end items-center gap-1">
                        <button
                          onClick={() => navigate(`/rfqs/${rfq.id}`)}
                          className="p-1.5 rounded text-slate-400 hover:text-[#6322ef] hover:bg-[#6322ef]/10 transition-all"
                          title="View"
                        >
                          <Eye size={15} />
                        </button>
                        {!isVendor && rfq.status === 'draft' && (
                          <button
                            onClick={() => navigate(`/rfqs/${rfq.id}/edit`)}
                            className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                            title="Edit"
                          >
                            <Edit2 size={15} />
                          </button>
                        )}
                        {!isVendor && (rfq.status === 'draft' || rfq.status === 'sent') && (
                          <button
                            onClick={() => handleDelete(rfq.id, rfq.rfq_number)}
                            className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                            title="Cancel RFQ"
                          >
                            <Trash2 size={15} />
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

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
            <span>Page {pagination.page} of {pagination.pages} ({pagination.total} total)</span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={pagination.page <= 1} onClick={() => fetchRFQs(pagination.page - 1)}>
                Previous
              </Button>
              <Button variant="secondary" size="sm" disabled={pagination.page >= pagination.pages} onClick={() => fetchRFQs(pagination.page + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
