import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Save, Loader2 } from 'lucide-react';
import { createRFQ, updateRFQ, getRFQById } from '../../api/rfqApi';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';

const emptyItem = (item_no) => ({
  item_no,
  product_name: '',
  description: '',
  quantity: '',
  unit: 'units',
  estimated_unit_price: '',
});

const RFQForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    title: '',
    description: '',
    deadline: '',
    terms: '',
  });
  const [items, setItems] = useState([emptyItem(1)]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await getRFQById(id);
        if (res.success) {
          const d = res.data;
          setForm({
            title: d.title || '',
            description: d.description || '',
            deadline: d.deadline ? new Date(d.deadline).toISOString().slice(0, 16) : '',
            terms: d.terms || '',
          });
          if (d.items && d.items.length > 0) {
            setItems(d.items.map(i => ({
              item_no: i.item_no,
              product_name: i.product_name,
              description: i.description || '',
              quantity: String(i.quantity),
              unit: i.unit,
              estimated_unit_price: i.estimated_unit_price != null ? String(i.estimated_unit_price) : '',
            })));
          }
        }
      } catch {
        setError('Failed to load RFQ');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (idx, field, value) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const addItem = () => {
    const nextNo = Math.max(...items.map(i => i.item_no), 0) + 1;
    setItems(prev => [...prev, emptyItem(nextNo)]);
  };

  const removeItem = (idx) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload = {
      ...form,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
      items: items.map(item => ({
        item_no: Number(item.item_no),
        product_name: item.product_name,
        description: item.description || undefined,
        quantity: Number(item.quantity),
        unit: item.unit,
        estimated_unit_price: item.estimated_unit_price ? Number(item.estimated_unit_price) : undefined,
      })),
    };

    try {
      if (isEdit) {
        // For edit, only update header fields (items are managed separately)
        const { items: _items, ...headerPayload } = payload;
        await updateRFQ(id, headerPayload);
      } else {
        await createRFQ(payload);
      }
      navigate('/rfqs');
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(Array.isArray(detail)
        ? detail.map(d => d.msg || d.message).join('; ')
        : (detail || 'Failed to save RFQ'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center"><Spinner /></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/rfqs')}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEdit ? 'Edit RFQ' : 'New Request for Quotation'}
          </h1>
          <p className="text-slate-500 text-sm">Fill in the details and add line items</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* RFQ Details Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">RFQ Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
              <input
                name="title"
                required
                minLength={2}
                maxLength={255}
                placeholder="e.g. Office Furniture Procurement Q2"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6322ef]/20 focus:border-[#6322ef]"
                value={form.title}
                onChange={handleFormChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Deadline *</label>
              <input
                name="deadline"
                type="datetime-local"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6322ef]/20 focus:border-[#6322ef]"
                value={form.deadline}
                onChange={handleFormChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Terms &amp; Conditions</label>
              <input
                name="terms"
                placeholder="e.g. Net 30, FOB destination..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6322ef]/20 focus:border-[#6322ef]"
                value={form.terms}
                onChange={handleFormChange}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                name="description"
                rows={3}
                placeholder="Detailed description of requirements..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#6322ef]/20 focus:border-[#6322ef]"
                value={form.description}
                onChange={handleFormChange}
              />
            </div>
          </div>
        </div>

        {/* Line Items Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Line Items <span className="text-[#6322ef] font-bold">{items.length}</span>
            </h2>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1.5 text-sm text-[#6322ef] font-semibold hover:bg-[#6322ef]/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus size={15} /> Add Item
            </button>
          </div>

          <div className="space-y-3">
            {/* Header row */}
            <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-slate-500 uppercase px-1">
              <div className="col-span-1">#</div>
              <div className="col-span-3">Product Name *</div>
              <div className="col-span-3">Description</div>
              <div className="col-span-1">Qty *</div>
              <div className="col-span-2">Unit</div>
              <div className="col-span-2">Est. Price</div>
            </div>

            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-start bg-slate-50 rounded-lg p-2">
                <div className="col-span-1 flex items-center pt-2">
                  <span className="text-xs font-bold text-slate-400">{item.item_no}</span>
                </div>
                <div className="col-span-3">
                  <input
                    required
                    placeholder="Product name"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#6322ef]/30 focus:border-[#6322ef] bg-white"
                    value={item.product_name}
                    onChange={e => handleItemChange(idx, 'product_name', e.target.value)}
                  />
                </div>
                <div className="col-span-3">
                  <input
                    placeholder="Optional description"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#6322ef]/30 focus:border-[#6322ef] bg-white"
                    value={item.description}
                    onChange={e => handleItemChange(idx, 'description', e.target.value)}
                  />
                </div>
                <div className="col-span-1">
                  <input
                    required
                    type="number"
                    min="0.001"
                    step="any"
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#6322ef]/30 focus:border-[#6322ef] bg-white"
                    value={item.quantity}
                    onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <input
                    required
                    placeholder="units"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#6322ef]/30 focus:border-[#6322ef] bg-white"
                    value={item.unit}
                    onChange={e => handleItemChange(idx, 'unit', e.target.value)}
                  />
                </div>
                <div className="col-span-2 flex gap-1">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="₹ 0.00"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#6322ef]/30 focus:border-[#6322ef] bg-white"
                    value={item.estimated_unit_price}
                    onChange={e => handleItemChange(idx, 'estimated_unit_price', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    disabled={items.length === 1}
                    className="p-1.5 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={() => navigate('/rfqs')}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? <><Loader2 size={15} className="animate-spin mr-1.5" /> Saving...</> : <><Save size={15} className="mr-1.5" /> {isEdit ? 'Update RFQ' : 'Create RFQ'}</>}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RFQForm;
