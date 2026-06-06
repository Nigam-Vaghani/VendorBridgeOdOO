import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit2, X, CheckCircle2, Package,
  Clock, Loader2, AlertCircle
} from 'lucide-react';
import { getQuotationById, withdrawQuotation, shortlistQuotation, rejectQuotation, acceptQuotation } from '../../api/quotationApi';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { useAuth } from '../../hooks/useAuth';

const STATUS_CONFIG = {
  submitted:    { label: 'Submitted',    cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  under_review: { label: 'Under Review', cls: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  shortlisted:  { label: 'Shortlisted',  cls: 'bg-purple-100 text-purple-700 border-purple-200' },
  rejected:     { label: 'Rejected',     cls: 'bg-red-100 text-red-600 border-red-200' },
  accepted:     { label: 'Accepted',     cls: 'bg-green-100 text-green-700 border-green-200' },
  withdrawn:    { label: 'Withdrawn',    cls: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const fmtDateShort = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const QuotationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isVendor = user?.role === 'vendor';
  const canApprove = ['admin', 'manager', 'procurement_officer'].includes(user?.role);

  const [q, setQ] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchQuotation = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getQuotationById(id);
      if (res.success) setQ(res.data);
    } catch {
      setError('Failed to load quotation details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchQuotation(); }, [fetchQuotation]);

  const doAction = async (label, fn) => {
    setActionLoading(label);
    try {
      await fn();
      await fetchQuotation();
    } catch (e) {
      alert(e.response?.data?.detail || `Failed: ${label}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleWithdraw = () => {
    if (!window.confirm('Withdraw this quotation? This cannot be undone.')) return;
    doAction('withdraw', () => withdrawQuotation(id));
  };
  const handleShortlist = () => {
    doAction('shortlist', () => shortlistQuotation(id, { notes: '' }));
  };
  const handleReject = () => {
    const reason = window.prompt('Reason for rejection:');
    if (!reason) return;
    doAction('reject', () => rejectQuotation(id, { reason }));
  };
  const handleAccept = () => {
    if (!window.confirm('Accept this quotation? This will reject all other quotes for this RFQ and start an approval workflow.')) return;
    doAction('accept', () => acceptQuotation(id, { notes: 'Accepted by ' + user.first_name }));
  };

  if (loading) return <div className="p-10 text-center"><Spinner /></div>;
  if (error || !q) return <div className="p-10 text-center text-red-500">{error || 'Quotation not found'}</div>;

  const cfg = STATUS_CONFIG[q.status] || STATUS_CONFIG.submitted;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Top nav */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/quotations')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} /> Back to Quotations
        </button>

        <div className="flex items-center gap-2">
          {/* Vendor Actions */}
          {isVendor && q.status === 'submitted' && (
            <>
              <Button variant="secondary" onClick={() => navigate(`/quotations/${id}/edit`)}>
                <Edit2 size={14} className="mr-1.5" /> Edit
              </Button>
              <Button variant="destructive" onClick={handleWithdraw} disabled={actionLoading === 'withdraw'}>
                {actionLoading === 'withdraw' ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <X size={14} className="mr-1.5" />}
                Withdraw
              </Button>
            </>
          )}

          {/* Procurement/Manager Actions */}
          {canApprove && (q.status === 'submitted' || q.status === 'under_review') && (
            <>
              <Button variant="secondary" onClick={() => navigate(`/rfqs/${q.rfq_id}/compare`)}>
                Compare Quotes
              </Button>
              <Button onClick={handleShortlist} disabled={actionLoading === 'shortlist'}>
                {actionLoading === 'shortlist' ? <Loader2 size={14} className="animate-spin mr-1.5" /> : null}
                Shortlist
              </Button>
              <Button variant="destructive" onClick={handleReject} disabled={actionLoading === 'reject'}>
                Reject
              </Button>
            </>
          )}

          {canApprove && q.status === 'shortlisted' && (
            <>
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleAccept} disabled={actionLoading === 'accept'}>
                {actionLoading === 'accept' ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <CheckCircle2 size={14} className="mr-1.5" />}
                Accept Quotation
              </Button>
              <Button variant="destructive" onClick={handleReject} disabled={actionLoading === 'reject'}>
                Reject
              </Button>
            </>
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
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${cfg.cls}`}>
                    {cfg.label}
                  </span>
                  <span className="text-sm font-semibold text-slate-500">
                    Quote for: <span className="text-[#6322ef]">{q.rfq_number}</span> - {q.rfq_title}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-1">₹{formatCurrency(q.total_amount)}</h1>
                {!isVendor && <p className="text-slate-600 font-medium text-sm">Vendor: {q.vendor_name}</p>}
                {q.notes && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-700">
                    <span className="font-semibold block mb-1">Notes / Terms:</span>
                    {q.notes}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
              <div>
                <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Overall Delivery</div>
                <div className="font-semibold text-slate-800">{q.delivery_days} Days</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Validity</div>
                <div className="font-medium text-slate-700">{q.validity_days} Days</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Submitted By</div>
                <div className="font-medium text-slate-700">{q.submitted_by_name || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Submitted At</div>
                <div className="text-sm text-slate-600">{fmtDateShort(q.submitted_at)}</div>
              </div>
            </div>
          </div>

          {/* Items Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Package size={18} className="text-[#6322ef]" />
                Line Items
                <span className="text-sm font-normal text-slate-400">({q.items?.length || 0})</span>
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase">
                    <th className="px-4 py-2.5 text-left">Product</th>
                    <th className="px-4 py-2.5 text-center">Qty</th>
                    <th className="px-4 py-2.5 text-right">Unit Price</th>
                    <th className="px-4 py-2.5 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {q.items?.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{item.product_name}</div>
                        {item.delivery_days && <div className="text-[10px] text-slate-400 mt-0.5">Delivery: {item.delivery_days} days</div>}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-700">
                        {Number(item.quantity).toLocaleString()} <span className="text-xs text-slate-400">{item.unit}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-slate-700">₹{formatCurrency(item.unit_price)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-slate-900">₹{formatCurrency(item.line_total)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="font-bold text-slate-800 mb-4 text-sm">Status Timeline</h2>
            <div className="space-y-4 text-xs relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:to-transparent">
              {[
                { label: 'Submitted', time: q.submitted_at, done: true, icon: CheckCircle2, color: 'text-blue-500' },
                { label: 'Shortlisted', time: q.shortlisted_at, done: !!q.shortlisted_at, icon: Clock, color: 'text-purple-500' },
                { label: 'Accepted', time: q.status === 'accepted' ? q.updated_at : null, done: q.status === 'accepted', icon: CheckCircle2, color: 'text-green-500' },
              ].map(({ label, time, done, icon: Icon, color }, idx) => (
                <div key={label} className="relative flex items-start gap-4">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${done ? 'bg-white border-2 ' + color.replace('text', 'border') : 'bg-slate-100 border-2 border-slate-200 text-slate-400'}`}>
                    <Icon size={12} className={done ? color : ''} />
                  </div>
                  <div className="pt-1">
                    <div className={`font-medium ${done ? 'text-slate-800' : 'text-slate-400'}`}>{label}</div>
                    {time && <div className="text-slate-400 text-[10px] mt-0.5">{fmtDate(time)}</div>}
                  </div>
                </div>
              ))}
              {q.status === 'rejected' && (
                <div className="relative flex items-start gap-4 mt-4">
                  <div className="w-6 h-6 rounded-full bg-white border-2 border-red-500 flex items-center justify-center flex-shrink-0 z-10">
                    <X size={12} className="text-red-500" />
                  </div>
                  <div className="pt-1">
                    <div className="font-medium text-red-600">Rejected</div>
                    <div className="text-slate-400 text-[10px] mt-0.5">{fmtDate(q.updated_at)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationDetail;
