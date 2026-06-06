import { Download, Printer, Mail } from 'lucide-react';

export const Invoices = () => {
  const invoiceData = {
    poNumber: 'PO-2025-0068',
    poDate: '21 may, 2025',
    invoiceDate: '22 may 2025',
    dueDate: '21 june 2025',
    billTo: {
      name: 'your Organization Name',
      address: '123 business park, ahmedabad',
      gstin: '25383438AFB'
    },
    vendor: {
      name: 'Infra supplies pvt ltd',
      address: '456, industrial estate, surat',
      gstin: '343434DB4523'
    },
    items: [
      { id: 1, name: 'Ergonomic chair', qty: 25, price: 3500, total: 87500 },
      { id: 2, name: 'Tech Core LTD', qty: 10, price: 8200, total: 82000 }
    ],
    subtotal: 169500,
    cgst: 15255,
    sgst: 15255,
    grandTotal: 200010,
    status: 'Pending Payment'
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN').format(amount);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Purchase Order & Invoice</h1>
          <p className="text-foreground/80 text-lg">
            PO-2024-auto-generated after approval
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-card border-2 border-border text-foreground rounded-lg font-semibold hover:bg-foreground/5 transition-colors shadow-sm">
            <Download size={18} />
            Download PDF
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-card border-2 border-border text-foreground rounded-lg font-semibold hover:bg-foreground/5 transition-colors shadow-sm">
            <Printer size={18} />
            Print
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-card border-2 border-border text-foreground rounded-lg font-semibold hover:bg-foreground/5 transition-colors shadow-sm">
            <Mail size={18} />
            Email invoice
          </button>
        </div>
      </div>

      {/* Billing Information Box */}
      <div className="bg-card border-2 border-border rounded-xl p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Bill To */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider mb-2">Bill to:</h3>
              <div className="text-foreground font-medium leading-relaxed">
                <p>{invoiceData.billTo.name}</p>
                <p>{invoiceData.billTo.address}</p>
                <p>GSTIN: {invoiceData.billTo.gstin}</p>
              </div>
            </div>
            <div className="h-0.5 w-full bg-border/50"></div>
            <div className="space-y-2 text-foreground font-medium">
              <p><span className="text-foreground/70">PO Number:</span> {invoiceData.poNumber}</p>
              <p><span className="text-foreground/70">PO date:</span> {invoiceData.poDate}</p>
            </div>
          </div>

          {/* Vendor */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider mb-2">Vendor</h3>
              <div className="text-foreground font-medium leading-relaxed">
                <p>{invoiceData.vendor.name}</p>
                <p>{invoiceData.vendor.address}</p>
                <p>GSTIN: {invoiceData.vendor.gstin}</p>
              </div>
            </div>
            <div className="h-0.5 w-full bg-border/50"></div>
            <div className="space-y-2 text-foreground font-medium">
              <p><span className="text-foreground/70">invoice date:</span> {invoiceData.invoiceDate}</p>
              <p><span className="text-foreground/70">Due date:</span> {invoiceData.dueDate}</p>
            </div>
          </div>

        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-card border-2 border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-foreground/5 text-foreground border-b-2 border-border">
                <th className="px-8 py-4 font-semibold border-r border-border/50 w-2/5">Item</th>
                <th className="px-8 py-4 font-semibold border-r border-border/50 text-center">Qty</th>
                <th className="px-8 py-4 font-semibold border-r border-border/50 text-center">Unit price</th>
                <th className="px-8 py-4 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {invoiceData.items.map((item) => (
                <tr key={item.id} className="hover:bg-foreground/5 transition-colors">
                  <td className="px-8 py-5 text-foreground font-medium border-r border-border/50">{item.name}</td>
                  <td className="px-8 py-5 text-foreground text-center border-r border-border/50">{item.qty}</td>
                  <td className="px-8 py-5 text-foreground text-center border-r border-border/50">{formatCurrency(item.price)}</td>
                  <td className="px-8 py-5 text-foreground font-mono text-right">{formatCurrency(item.total)}</td>
                </tr>
              ))}
              
              {/* Summary Rows */}
              <tr className="bg-foreground/5">
                <td colSpan={3} className="px-8 py-3 text-right font-semibold text-foreground/80 border-r border-border/50 border-t-2 border-border">Subtotal</td>
                <td className="px-8 py-3 text-right font-mono font-medium text-foreground border-t-2 border-border">{formatCurrency(invoiceData.subtotal)}</td>
              </tr>
              <tr className="bg-foreground/5">
                <td colSpan={3} className="px-8 py-3 text-right font-semibold text-foreground/80 border-r border-border/50">CGST(9%)</td>
                <td className="px-8 py-3 text-right font-mono font-medium text-foreground">{formatCurrency(invoiceData.cgst)}</td>
              </tr>
              <tr className="bg-foreground/5">
                <td colSpan={3} className="px-8 py-3 text-right font-semibold text-foreground/80 border-r border-border/50">SGST(9%)</td>
                <td className="px-8 py-3 text-right font-mono font-medium text-foreground">{formatCurrency(invoiceData.sgst)}</td>
              </tr>
              <tr className="bg-foreground/5">
                <td colSpan={3} className="px-8 py-4 text-right font-bold text-foreground border-r border-border/50 border-t-2 border-border text-base">Grand total</td>
                <td className="px-8 py-4 text-right font-mono font-bold text-foreground border-t-2 border-border text-base">{formatCurrency(invoiceData.grandTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Status */}
      <div className="flex items-center gap-4 pt-2">
        <span className="text-foreground/80 font-medium">status:</span>
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-md font-semibold text-sm dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800">
          {invoiceData.status}
        </span>
        <button className="text-blue-600 dark:text-blue-400 font-semibold text-sm hover:underline ml-2">
          Mark as Paid
        </button>
      </div>

    </div>
  );
};
