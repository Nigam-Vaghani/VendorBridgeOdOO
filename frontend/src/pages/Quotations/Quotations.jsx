import { useState } from 'react';
import { Send, Save } from 'lucide-react';

export const Quotations = () => {
  const [quotationItems, setQuotationItems] = useState([
    { id: 1, item: 'Ergonomic chair', qty: 25, unitPrice: 3500, total: 87500, delivery: 7 },
    { id: 2, item: 'Standing desk', qty: 10, unitPrice: 8200, total: 82000, delivery: 14 },
  ]);

  const [taxRate, setTaxRate] = useState(18);

  // Calculate totals
  const subtotal = quotationItems.reduce((acc, item) => acc + item.total, 0);
  const gstAmount = (subtotal * taxRate) / 100;
  const grandTotal = subtotal + gstAmount;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN').format(amount);
  };

  const handlePriceChange = (id, newPrice) => {
    setQuotationItems(items => items.map(item =>
      item.id === id ? { ...item, unitPrice: Number(newPrice), total: item.qty * Number(newPrice) } : item
    ));
  };

  const handleDeliveryChange = (id, newDelivery) => {
    setQuotationItems(items => items.map(item =>
      item.id === id ? { ...item, delivery: Number(newDelivery) } : item
    ));
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Submit Quotations</h1>
        <p className="text-foreground/80 text-lg">
          RFQ: office furniture procurement q2 - deadline 15 june 2025
        </p>
      </div>

      {/* RFQ Summary Box */}
      <div className="bg-card border-2 border-border rounded-xl p-5 shadow-sm">
        <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-2 block">RFQ Summary</label>
        <p className="text-foreground font-medium">
          Ergonomic chair * 25, standing desk *10 - category furniture
        </p>
      </div>

      {/* Your Quotation Table */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-foreground uppercase tracking-wider ml-1">Your Quotation</label>
        <div className="bg-card border-2 border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-foreground/5 text-foreground border-b-2 border-border">
                  <th className="px-6 py-4 font-semibold border-r border-border/50">Item</th>
                  <th className="px-6 py-4 font-semibold border-r border-border/50 w-24 text-center">Qty</th>
                  <th className="px-6 py-4 font-semibold border-r border-border/50 w-40 text-right">Unit price</th>
                  <th className="px-6 py-4 font-semibold border-r border-border/50 w-40 text-right">Total</th>
                  <th className="px-6 py-4 font-semibold w-40 text-center">Delivery (days)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {quotationItems.map((item) => (
                  <tr key={item.id} className="hover:bg-foreground/5 transition-colors">
                    <td className="px-6 py-4 text-foreground font-medium border-r border-border/50">{item.item}</td>
                    <td className="px-6 py-4 text-foreground text-center border-r border-border/50">{item.qty}</td>
                    <td className="px-6 py-4 border-r border-border/50">
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handlePriceChange(item.id, e.target.value)}
                        className="w-full bg-transparent text-right outline-none focus:border-b-2 focus:border-primary transition-colors py-1"
                      />
                    </td>
                    <td className="px-6 py-4 text-foreground font-mono text-right border-r border-border/50">
                      {formatCurrency(item.total)}
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={item.delivery}
                        onChange={(e) => handleDeliveryChange(item.id, e.target.value)}
                        className="w-full bg-transparent text-center outline-none focus:border-b-2 focus:border-primary transition-colors py-1"
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-6">

        {/* Left: Tax, Terms & Actions */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">tax / GST %</label>
            <div className="relative w-48">
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full px-4 py-3 bg-card border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/50 font-bold">%</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Note / terms</label>
            <textarea
              rows={4}
              defaultValue="Payment terms: 20 days net..."
              className="w-full px-4 py-3 bg-card border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-sm flex-1">
              <Send size={18} />
              Submit Quotation
            </button>
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-card border-2 border-border text-foreground rounded-lg font-semibold hover:bg-foreground/5 transition-colors shadow-sm flex-1">
              <Save size={18} />
              Save Draft
            </button>
          </div>
        </div>

        {/* Right: Summary Calculation */}
        <div className="flex justify-end items-start pt-6 lg:pt-0">
          <div className="bg-card border-2 border-border rounded-xl p-8 w-full max-w-md shadow-sm space-y-4">
            <div className="flex justify-between items-center text-foreground/80 font-medium">
              <span>Subtotal</span>
              <span className="font-mono">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-foreground/80 font-medium">
              <span>GST ({taxRate}%)</span>
              <span className="font-mono">{formatCurrency(gstAmount)}</span>
            </div>
            <div className="h-0.5 w-full bg-border/50 my-2"></div>
            <div className="flex justify-between items-center text-xl font-bold text-foreground">
              <span>Grand total</span>
              <span className="font-mono">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
