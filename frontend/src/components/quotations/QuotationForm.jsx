import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Send, Loader2 } from 'lucide-react';
import { getRFQById } from '../../api/rfqApi';
import { getQuotationById, submitQuotation, updateQuotation } from '../../api/quotationApi';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { useAuth } from '../../hooks/useAuth';

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN').format(amount);

const QuotationForm = () => {
  const { rfqId, id } = useParams(); // If id exists, it's an edit. If rfqId exists, it's a new submission
  const navigate = useNavigate();
  const { user } = useAuth();
  const isVendor = user?.role === 'vendor';

  const [rfq, setRfq] = useState(null);
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [items, setItems] = useState([]);
  const [deliveryDays, setDeliveryDays] = useState(15);
  const [validityDays, setValidityDays] = useState(30);
  const [notes, setNotes] = useState('');
  const [taxRate, setTaxRate] = useState(18);

  const isEdit = !!id;

  useEffect(() => {
    if (!isVendor) {
      setError('Only vendors can submit quotations.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        if (isEdit) {
          const qRes = await getQuotationById(id);
          if (qRes.success) {
            const q = qRes.data;
            setQuotation(q);
            setDeliveryDays(q.delivery_days);
            setValidityDays(q.validity_days);
            setNotes(q.notes || '');

            const rfqRes = await getRFQById(q.rfq_id);
            if (rfqRes.success) {
              setRfq(rfqRes.data);
              // Map existing quote items
              const initialItems = q.items.map(qi => ({
                rfq_item_id: qi.rfq_item_id,
                product_name: qi.product_name,
                unit: qi.unit,
                rfq_qty: Number(qi.rfq_quantity),
                qty: Number(qi.quantity),
                unitPrice: Number(qi.unit_price),
                delivery: qi.delivery_days || q.delivery_days,
                notes: qi.notes || ''
              }));
              setItems(initialItems);
            }
          }
        } else if (rfqId) {
          const rfqRes = await getRFQById(rfqId);
          if (rfqRes.success) {
            setRfq(rfqRes.data);
            const initialItems = rfqRes.data.items.map(ri => ({
              rfq_item_id: ri.id,
              product_name: ri.product_name,
              unit: ri.unit,
              rfq_qty: Number(ri.quantity),
              qty: Number(ri.quantity),
              unitPrice: 0,
              delivery: 15,
              notes: ''
            }));
            setItems(initialItems);
          }
        }
      } catch (e) {
        setError(e.response?.data?.detail || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, rfqId, isEdit, isVendor]);

  const handlePriceChange = (rfqItemId, newPrice) => {
    setItems(items.map(i => i.rfq_item_id === rfqItemId ? { ...i, unitPrice: Number(newPrice) } : i));
  };

  const handleQtyChange = (rfqItemId, newQty) => {
    setItems(items.map(i => i.rfq_item_id === rfqItemId ? { ...i, qty: Number(newQty) } : i));
  };

  const handleDeliveryChange = (rfqItemId, newDelivery) => {
    setItems(items.map(i => i.rfq_item_id === rfqItemId ? { ...i, delivery: Number(newDelivery) } : i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      rfq_id: isEdit ? quotation.rfq_id : rfqId,
      delivery_days: Number(deliveryDays),
      validity_days: Number(validityDays),
      notes: notes,
      items: items.map(i => ({
        rfq_item_id: i.rfq_item_id,
        unit_price: i.unitPrice,
        quantity: i.qty,
        delivery_days: i.delivery,
        notes: i.notes
      }))
    };

    try {
      if (isEdit) {
        await updateQuotation(id, payload);
      } else {
        await submitQuotation(payload);
      }
      navigate('/quotations');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit quotation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center"><Spinner /></div>;
  if (error && !rfq) return <div className="p-10 text-center text-red-500">{error}</div>;

  const subtotal = items.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);
  const gstAmount = (subtotal * taxRate) / 100;
  const grandTotal = subtotal + gstAmount;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEdit ? 'Edit Quotation' : 'Submit Quotation'}
          </h1>
          <p className="text-slate-500 text-sm">
            RFQ: <span className="font-semibold text-[#6322ef]">{rfq?.rfq_number}</span> - {rfq?.title}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
          {typeof error === 'string' ? error : JSON.stringify(error)}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Your Quotation Table */}
        <div className="space-y-3 mb-8">
          <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider ml-1">Line Items</label>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <th className="px-6 py-4 font-semibold border-r border-slate-200">Product</th>
                    <th className="px-6 py-4 font-semibold border-r border-slate-200 w-32 text-center">Req. Qty</th>
                    <th className="px-6 py-4 font-semibold border-r border-slate-200 w-32 text-center">Quote Qty</th>
                    <th className="px-6 py-4 font-semibold border-r border-slate-200 w-40 text-right">Unit Price (₹)</th>
                    <th className="px-6 py-4 font-semibold border-r border-slate-200 w-40 text-right">Total</th>
                    <th className="px-6 py-4 font-semibold w-40 text-center">Delivery (Days)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.rfq_item_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-800 font-medium border-r border-slate-200">{item.product_name}</td>
                      <td className="px-6 py-4 text-slate-500 text-center border-r border-slate-200">{item.rfq_qty} {item.unit}</td>
                      <td className="px-6 py-4 border-r border-slate-200">
                        <input
                          type="number"
                          min="0"
                          max={item.rfq_qty}
                          step="any"
                          required
                          value={item.qty}
                          onChange={(e) => handleQtyChange(item.rfq_item_id, e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-center outline-none focus:border-[#6322ef] focus:ring-1 focus:ring-[#6322ef]/30 transition-colors"
                        />
                      </td>
                      <td className="px-6 py-4 border-r border-slate-200">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          required
                          value={item.unitPrice || ''}
                          onChange={(e) => handlePriceChange(item.rfq_item_id, e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-right outline-none focus:border-[#6322ef] focus:ring-1 focus:ring-[#6322ef]/30 transition-colors"
                        />
                      </td>
                      <td className="px-6 py-4 text-slate-800 font-bold text-right border-r border-slate-200">
                        {formatCurrency(item.qty * item.unitPrice)}
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.delivery}
                          onChange={(e) => handleDeliveryChange(item.rfq_item_id, e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-center outline-none focus:border-[#6322ef] focus:ring-1 focus:ring-[#6322ef]/30 transition-colors"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-6 border-t border-slate-200">
          {/* Left: General Info */}
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Overall Delivery (Days) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={deliveryDays}
                  onChange={(e) => setDeliveryDays(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6322ef]/20 focus:border-[#6322ef] transition-all shadow-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Validity (Days) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={validityDays}
                  onChange={(e) => setValidityDays(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6322ef]/20 focus:border-[#6322ef] transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Est. Tax / GST %</label>
              <div className="relative w-1/2">
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6322ef]/20 focus:border-[#6322ef] transition-all shadow-sm"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
              </div>
              <p className="text-xs text-slate-400">For display estimation only</p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Notes / Terms</label>
              <textarea
                rows={3}
                placeholder="Payment terms, special conditions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6322ef]/20 focus:border-[#6322ef] transition-all shadow-sm resize-none"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <Button type="submit" disabled={submitting}>
                {submitting ? <><Loader2 size={16} className="animate-spin mr-2" /> Saving...</> : <><Send size={16} className="mr-2" /> {isEdit ? 'Update Quotation' : 'Submit Quotation'}</>}
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </div>

          {/* Right: Summary Calculation */}
          <div className="flex justify-end items-start">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 w-full max-w-md shadow-sm space-y-4">
              <h3 className="font-semibold text-slate-500 uppercase text-xs tracking-wider mb-2">Quote Summary</h3>
              <div className="flex justify-between items-center text-slate-600 font-medium">
                <span>Subtotal</span>
                <span className="font-mono">₹{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 font-medium">
                <span>Est. Tax ({taxRate}%)</span>
                <span className="font-mono">₹{formatCurrency(gstAmount)}</span>
              </div>
              <div className="h-px w-full bg-slate-200 my-4"></div>
              <div className="flex justify-between items-center text-xl font-bold text-slate-900">
                <span>Grand Total</span>
                <span className="font-mono">₹{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default QuotationForm;
