import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Send, X, CheckCircle2, AlertCircle,
  Plus, Trash2, Package, Users, ChevronRight, Loader2,
  Clock, Building2
} from 'lucide-react';
import {
  getRFQById, sendRFQ, closeRFQ, cancelRFQ,
  assignVendors, removeVendorFromRFQ,
  addRFQItem, deleteRFQItem
} from '../../api/rfqApi';
import { getVendors } from '../../api/vendorApi';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { useAuth } from '../../hooks/useAuth';

const STATUS_CONFIG = {
  draft:     { label: 'Draft',     cls: 'bg-slate-100 text-slate-700 border-slate-300' },
  sent:      { label: 'Sent',      cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  closed:    { label: 'Closed',    cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  awarded:   { label: 'Awarded',   cls: 'bg-green-100 text-green-700 border-green-200' },
  cancelled: { label: 'Cancelled', cls: 'bg-red-100 text-red-600 border-red-200' },
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const fmtDateShort = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const RFQDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isVendor = user?.role === 'vendor';
  const canWrite = !isVendor;

  const [rfq, setRfq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Vendor assignment
  const [showVendorPanel, setShowVendorPanel] = useState(false);
  const [vendorSearch, setVendorSearch] = useState('');
  const [availableVendors, setAvailableVendors] = useState([]);
  const [selectedVendorIds, setSelectedVendorIds] = useState([]);
  const [vendorLoading, setVendorLoading] = useState(false);

  const fetchRFQ = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getRFQById(id);
      if (res.success) setRfq(res.data);
    } catch {
      setError('Failed to load RFQ details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchRFQ(); }, [fetchRFQ]);

  useEffect(() => {
    if (!showVendorPanel) return;
    (async () => {
      setVendorLoading(true);
      try {
        const res = await getVendors({ status: 'active', q: vendorSearch, limit: 50 });
        if (res.success) {
          const assignedIds = new Set((rfq?.vendors || []).map(v => v.vendor_id));
          setAvailableVendors(res.data.filter(v => !assignedIds.has(v.id)));
        }
      } finally {
        setVendorLoading(false);
      }
    })();
  }, [showVendorPanel, vendorSearch, rfq]);

  const doAction = async (label, fn) => {
    setActionLoading(label);
    try {
      await fn();
      await fetchRFQ();
    } catch (e) {
      alert(e.response?.data?.detail || `Failed: ${label}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSend = () => doAction('send', () => sendRFQ(id));
  const handleClose = () => {
    if (!window.confirm('Close this RFQ? No new quotations will be accepted.')) return;
    doAction('close', () => closeRFQ(id));
  };
  const handleCancel = () => {
    const reason = window.prompt('Reason for cancellation (optional):');
    if (reason === null) return;
    doAction('cancel', () => cancelRFQ(id, reason));
  };
  const handleRemoveVendor = (vendorId, vendorName) => {
    if (!window.confirm(`Remove ${vendorName} from this RFQ?`)) return;
    doAction('removeVendor', () => removeVendorFromRFQ(id, vendorId));
  };
  const handleAssignVendors = async () => {
    if (selectedVendorIds.length === 0) return;
    await doAction('assign', () => assignVendors(id, selectedVendorIds));
    setSelectedVendorIds([]);
    setShowVendorPanel(false);
  };

  if (loading) return <div className="p-10 text-center"><Spinner /></div>;
  if (error || !rfq) return <div className="p-10 text-center text-red-500">{error || 'RFQ not found'}</div>;

  const cfg = STATUS_CONFIG[rfq.status] || STATUS_CONFIG.draft;
  const isDraft = rfq.status === 'draft';
  const isSent = rfq.status === 'sent';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Top nav */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/rfqs')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} /> Back to RFQs
        </button>

        <div className="flex items-center gap-2">
          {isVendor && isSent && (
            <Button className="bg-[#6322ef] hover:bg-[#6322ef]/90" onClick={() => navigate(`/quotations/new/${id}`)}>
              Submit Quotation
            </Button>
          )}

          {canWrite && isDraft && (
            <Button variant="secondary" onClick={() => navigate(`/rfqs/${id}/edit`)}>
              <Edit2 size={14} className="mr-1.5" /> Edit
            </Button>
          )}
          {canWrite && isDraft && rfq.vendors?.length > 0 && (
            <Button onClick={handleSend} disabled={actionLoading === 'send'}>
              {actionLoading === 'send' ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <Send size={14} className="mr-1.5" />}
              Send to Vendors
            </Button>
          )}
          {canWrite && isSent && (
            <Button variant="outline" onClick={handleClose} disabled={actionLoading === 'close'}>
              <CheckCircle2 size={14} className="mr-1.5" /> Close RFQ
            </Button>
          )}
          {canWrite && (isDraft || isSent) && (
            <Button variant="destructive" onClick={handleCancel} disabled={actionLoading === 'cancel'}>
              <X size={14} className="mr-1.5" /> Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Header Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-sm font-bold text-[#6322ef] bg-[#6322ef]/10 px-2.5 py-1 rounded-lg">
                    {rfq.rfq_number}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${cfg.cls}`}>
                    {cfg.label}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">{rfq.title}</h1>
                {rfq.description && (
                  <p className="text-slate-500 text-sm leading-relaxed">{rfq.description}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
              <div>
                <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Deadline</div>
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Clock size={14} className="text-slate-400" />
                  {fmtDateShort(rfq.deadline)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Created By</div>
                <div className="font-medium text-slate-700">{rfq.created_by_name || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Created At</div>
                <div className="text-sm text-slate-600">{fmtDateShort(rfq.created_at)}</div>
              </div>
              {rfq.sent_at && (
                <div>
                  <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Sent At</div>
                  <div className="text-sm text-slate-600">{fmtDate(rfq.sent_at)}</div>
                </div>
              )}
              {rfq.terms && (
                <div className="col-span-2">
                  <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Terms</div>
                  <div className="text-sm text-slate-600">{rfq.terms}</div>
                </div>
              )}
            </div>
          </div>

          {/* Items Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Package size={18} className="text-[#6322ef]" />
                Line Items
                <span className="text-sm font-normal text-slate-400">({rfq.items?.length || 0})</span>
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase">
                    <th className="px-4 py-2.5 text-left">#</th>
                    <th className="px-4 py-2.5 text-left">Product</th>
                    <th className="px-4 py-2.5 text-right">Qty</th>
                    <th className="px-4 py-2.5 text-left">Unit</th>
                    <th className="px-4 py-2.5 text-right">Est. Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rfq.items?.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-400 font-mono text-xs">{item.item_no}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{item.product_name}</div>
                        {item.description && <div className="text-xs text-slate-400">{item.description}</div>}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-800">{Number(item.quantity).toLocaleString()}</td>
                      <td className="px-4 py-3 text-slate-500">{item.unit}</td>
                      <td className="px-4 py-3 text-right">
                        {item.estimated_unit_price
                          ? <span className="font-semibold text-slate-800">₹{Number(item.estimated_unit_price).toLocaleString('en-IN')}</span>
                          : <span className="text-slate-300">—</span>}
                      </td>
                    </tr>
                  ))}
                  {(!rfq.items || rfq.items.length === 0) && (
                    <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-400 text-sm">No items</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Vendors Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Users size={17} className="text-[#6322ef]" />
                Vendors
                <span className="text-sm font-normal text-slate-400">({rfq.vendors?.length || 0})</span>
              </h2>
              {canWrite && isDraft && (
                <button
                  onClick={() => setShowVendorPanel(v => !v)}
                  className="text-xs font-semibold text-[#6322ef] hover:bg-[#6322ef]/10 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus size={13} /> Add
                </button>
              )}
            </div>

            {/* Vendor search panel */}
            {showVendorPanel && (
              <div className="mb-4 border border-slate-200 rounded-lg overflow-hidden">
                <div className="p-2 border-b border-slate-100">
                  <input
                    type="text"
                    placeholder="Search active vendors..."
                    className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#6322ef]/30"
                    value={vendorSearch}
                    onChange={e => setVendorSearch(e.target.value)}
                  />
                </div>
                <div className="max-h-48 overflow-y-auto divide-y divide-slate-50">
                  {vendorLoading ? (
                    <div className="py-4 text-center"><Spinner /></div>
                  ) : availableVendors.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400">No vendors available</div>
                  ) : (
                    availableVendors.map(v => (
                      <label key={v.id} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          className="accent-[#6322ef]"
                          checked={selectedVendorIds.includes(v.id)}
                          onChange={e => setSelectedVendorIds(prev =>
                            e.target.checked ? [...prev, v.id] : prev.filter(x => x !== v.id)
                          )}
                        />
                        <div>
                          <div className="text-xs font-medium text-slate-800">{v.name}</div>
                          <div className="text-[10px] text-slate-400">{v.category}</div>
                        </div>
                      </label>
                    ))
                  )}
                </div>
                {selectedVendorIds.length > 0 && (
                  <div className="p-2 border-t border-slate-100">
                    <Button size="sm" className="w-full" onClick={handleAssignVendors} disabled={actionLoading === 'assign'}>
                      {actionLoading === 'assign' ? <Loader2 size={12} className="animate-spin mr-1" /> : null}
                      Assign {selectedVendorIds.length} Vendor(s)
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Vendor list */}
            <div className="space-y-2">
              {rfq.vendors?.length === 0 && (
                <p className="text-center text-xs text-slate-400 py-4">No vendors assigned yet</p>
              )}
              {rfq.vendors?.map(v => (
                <div key={v.vendor_id} className="flex items-start justify-between p-3 bg-slate-50 rounded-lg group">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-[#6322ef]/10 text-[#6322ef] flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {v.vendor_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-800 truncate">{v.vendor_name}</div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {v.invite_sent
                          ? <span className="text-[10px] text-blue-600 font-medium">Invited</span>
                          : <span className="text-[10px] text-slate-400">Pending invite</span>}
                        {v.responded
                          ? <span className="text-[10px] text-green-600 font-semibold">✓ Responded</span>
                          : null}
                      </div>
                    </div>
                  </div>
                  {canWrite && isDraft && !v.responded && (
                    <button
                      onClick={() => handleRemoveVendor(v.vendor_id, v.vendor_name)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all flex-shrink-0"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="font-bold text-slate-800 mb-4 text-sm">Timeline</h2>
            <div className="space-y-3 text-xs">
              {[
                { label: 'Created', time: rfq.created_at, done: true },
                { label: 'Sent to vendors', time: rfq.sent_at, done: !!rfq.sent_at },
                { label: 'Closed / Deadline', time: rfq.closed_at || rfq.deadline, done: !!rfq.closed_at },
              ].map(({ label, time, done }) => (
                <div key={label} className="flex items-start gap-2">
                  <div className={`w-2 h-2 rounded-full mt-0.5 flex-shrink-0 ${done ? 'bg-[#6322ef]' : 'bg-slate-200'}`} />
                  <div>
                    <div className={`font-medium ${done ? 'text-slate-700' : 'text-slate-400'}`}>{label}</div>
                    <div className="text-slate-400">{time ? fmtDate(time) : '—'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RFQDetail;
