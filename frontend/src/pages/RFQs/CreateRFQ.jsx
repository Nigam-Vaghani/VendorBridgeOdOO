import { useState, useEffect } from 'react';
import { Plus, X, UploadCloud, Save, Send } from 'lucide-react';
import { createRFQ, getVendors } from '../../api/procurementApi';

export const CreateRFQ = ({ onCancel, onCreated }) => {
  const [title, setTitle] = useState("Office Furniture procurement Q2");
  const [description, setDescription] = useState("Ergonomic chairs and standing desks for 3rd floor");
  const [deadline, setDeadline] = useState("2025-06-15T00:00:00Z");

  const [lineItems, setLineItems] = useState([
    { id: 1, item_no: 1, product_name: 'Ergonomic chair', qty: 25, unit: 'NOS' },
    { id: 2, item_no: 2, product_name: 'Standing desks', qty: 10, unit: 'NOS' },
  ]);

  const [vendors, setVendors] = useState([]);
  const [availableVendors, setAvailableVendors] = useState([]);

  useEffect(() => {
    getVendors()
      .then(data => {
        if (Array.isArray(data)) setAvailableVendors(data);
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async () => {
    const payload = {
      title,
      description,
      deadline,
      items: lineItems.map(li => ({ item_no: li.item_no, product_name: li.product_name, quantity: li.qty, unit: li.unit })),
      vendor_ids: vendors.map(v => v.id)
    };
    try {
      await createRFQ(payload);
      if (onCreated) onCreated();
    } catch(err) {
      console.error(err);
    }
  };

  const removeLineItem = (id) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const removeVendor = (id) => {
    setVendors(vendors.filter(v => v.id !== id));
  };

  const addVendor = (e) => {
    const vId = e.target.value;
    if (!vId) return;
    const vendor = availableVendors.find(v => v.id === vId);
    if (vendor && !vendors.find(v => v.id === vendor.id)) {
      setVendors([...vendors, vendor]);
    }
    e.target.value = "";
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Create RFQ</h1>
          <p className="text-foreground/80 text-lg">Create new request for quotation</p>
        </div>
        <button onClick={onCancel} className="px-4 py-2 border-2 border-border rounded-lg hover:bg-foreground/5 transition-colors">
          Cancel
        </button>
      </div>

      {/* Stepper */}
      <div className="flex items-center w-full py-4">
        <div className="flex items-center text-primary font-bold">
          <div className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center bg-primary/10">1</div>
        </div>
        <div className="flex-1 h-0.5 bg-border mx-4"></div>
        <div className="flex items-center text-foreground/50 font-bold">
          <div className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center">2</div>
        </div>
        <div className="flex-1 h-0.5 bg-border mx-4"></div>
        <div className="flex items-center text-foreground/50 font-bold">
          <div className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center">3</div>
        </div>
      </div>

      {/* Main Form Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* Left Column: Input Fields */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">RFQ's title*</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-card border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Category</label>
            <input
              type="text"
              defaultValue="Furniture"
              className="w-full px-4 py-3 bg-card border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Deadline*</label>
            <input
              type="text"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-4 py-3 bg-card border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-card border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm resize-none"
            />
          </div>
        </div>

        {/* Right Column: Line Items & Vendors */}
        <div className="space-y-10">

          {/* Line Items */}
          <div className="space-y-4">
            <label className="text-sm font-semibold text-foreground uppercase tracking-wider">Line items</label>
            <div className="bg-card border-2 border-border rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-border bg-foreground/5">
                    <th className="px-4 py-3 font-semibold">item</th>
                    <th className="px-4 py-3 font-semibold w-20">qty</th>
                    <th className="px-4 py-3 font-semibold w-20">Unit</th>
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {lineItems.map(item => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-foreground/80">
                        <input className="w-full bg-transparent border-b border-border/50 focus:outline-none" value={item.product_name} onChange={(e) => {
                          setLineItems(lineItems.map(li => li.id === item.id ? {...li, product_name: e.target.value} : li));
                        }} />
                      </td>
                      <td className="px-4 py-3 text-foreground/80">
                        <input type="number" className="w-full bg-transparent border-b border-border/50 focus:outline-none" value={item.qty} onChange={(e) => {
                          setLineItems(lineItems.map(li => li.id === item.id ? {...li, qty: parseInt(e.target.value)} : li));
                        }} />
                      </td>
                      <td className="px-4 py-3 text-foreground/80">
                        <input className="w-full bg-transparent border-b border-border/50 focus:outline-none" value={item.unit} onChange={(e) => {
                          setLineItems(lineItems.map(li => li.id === item.id ? {...li, unit: e.target.value} : li));
                        }} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => removeLineItem(item.id)} className="text-foreground/50 hover:text-red-500 transition-colors">
                          <X size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button 
              onClick={() => {
                const newItem = { id: Date.now(), item_no: lineItems.length + 1, product_name: 'New Item', qty: 1, unit: 'NOS' };
                setLineItems([...lineItems, newItem]);
              }}
              className="flex items-center gap-2 px-4 py-2 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/10 transition-colors text-sm"
            >
              <Plus size={16} />
              add line item
            </button>
          </div>

          {/* Assign Vendors */}
          <div className="space-y-4">
            <label className="text-sm font-semibold text-foreground uppercase tracking-wider">Assign Vendors</label>
            <div className="bg-card border-2 border-border rounded-xl overflow-hidden shadow-sm">
              <div className="divide-y divide-border/50">
                {vendors.map(vendor => (
                  <div key={vendor.id} className="flex items-center justify-between px-4 py-3 bg-foreground/5">
                    <span className="text-foreground/80 text-sm">{vendor.name}</span>
                    <button onClick={() => removeVendor(vendor.id)} className="text-foreground/50 hover:text-red-500 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <select 
              onChange={addVendor}
              className="w-full px-4 py-2 border-2 border-primary text-primary bg-card rounded-lg font-semibold hover:bg-primary/10 transition-colors text-sm focus:outline-none"
            >
              <option value="">+ select vendor to add</option>
              {availableVendors.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Bottom Section */}
      <div className="pt-8 border-t-2 border-border mt-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button onClick={handleSubmit} className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-sm">
            <Send size={18} />
            Save & Send to Vendors
          </button>
          <button onClick={onCancel} className="flex items-center justify-center gap-2 px-6 py-3 bg-card border-2 border-border text-foreground rounded-lg font-semibold hover:bg-foreground/5 transition-colors shadow-sm">
            <X size={18} />
            Cancel
          </button>
        </div>

        {/* Attachments */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Attachments</label>
          <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-foreground/5 transition-colors cursor-pointer group">
            <UploadCloud size={32} className="text-foreground/40 mb-3 group-hover:text-primary transition-colors" />
            <p className="text-foreground/70 text-sm font-medium">Drag & drop files or click to upload</p>
          </div>
        </div>

      </div>

    </div>
  );
};
