import { useState, useEffect } from 'react';
import { Download, Printer, Mail, ArrowLeft } from 'lucide-react';
import { getInvoices } from '../../api/procurementApi';

export const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = () => {
    setLoading(true);
    getInvoices().then(data => {
      setInvoices(data);
      // Update selected invoice if it's open
      if (selectedInvoice) {
        const updated = data.find(i => i.id === selectedInvoice.id);
        if (updated) setSelectedInvoice(updated);
      }
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  if (loading) return <div className="p-8 text-center">Loading invoices...</div>;

  if (!selectedInvoice) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
        <h1 className="text-4xl font-bold text-foreground mb-2">Invoices</h1>
        <div className="bg-card border-2 border-border rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-foreground/5 text-foreground border-b-2 border-border">
                <th className="px-6 py-4 font-semibold">Invoice #</th>
                <th className="px-6 py-4 font-semibold">PO Ref</th>
                <th className="px-6 py-4 font-semibold">Vendor</th>
                <th className="px-6 py-4 font-semibold">Due Date</th>
                <th className="px-6 py-4 font-semibold text-right">Total</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {invoices.length === 0 ? (
                <tr><td colSpan="7" className="p-6 text-center text-foreground/50">No invoices found.</td></tr>
              ) : invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-foreground/5 transition-colors">
                  <td className="px-6 py-4 font-medium">{inv.invoice_number}</td>
                  <td className="px-6 py-4">{inv.po_number}</td>
                  <td className="px-6 py-4">{inv.vendor_name}</td>
                  <td className="px-6 py-4">{new Date(inv.due_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right font-mono">{formatCurrency(inv.total)}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-yellow-100 text-yellow-800 border-yellow-300">
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => setSelectedInvoice(inv)}
                      className="px-4 py-1.5 bg-card border-2 border-primary text-primary rounded-lg text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <button 
        onClick={() => setSelectedInvoice(null)}
        className="flex items-center gap-2 text-foreground/60 hover:text-foreground font-medium transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Invoices
      </button>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Invoice Details</h1>
          <p className="text-foreground/80 text-lg">
            {selectedInvoice.invoice_number}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 bg-card border-2 border-border text-foreground rounded-lg font-semibold hover:bg-foreground/5 transition-colors shadow-sm"
          >
            <Download size={18} />
            Download PDF
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary border-2 border-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            <Printer size={18} />
            Print Invoice
          </button>
          <button 
            onClick={() => alert(`Invoice ${selectedInvoice.invoice_number} has been emailed to the vendor.`)}
            className="flex items-center gap-2 px-5 py-2.5 bg-card border-2 border-border text-foreground rounded-lg font-semibold hover:bg-foreground/5 transition-colors shadow-sm"
          >
            <Mail size={18} />
            Email Vendor
          </button>
        </div>
      </div>

      {/* Printable Invoice Document */}
      <div className="bg-card border-2 border-border rounded-xl p-10 shadow-sm mt-8 max-w-5xl mx-auto">
        
        {/* Invoice Header */}
        <div className="flex justify-between items-start border-b-2 border-border/50 pb-8 mb-8">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-primary uppercase">VendorBridge</h2>
            <p className="text-foreground/60 mt-1 font-medium">Enterprise Procurement System</p>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-bold text-foreground/20 uppercase tracking-widest mb-2">Invoice</h2>
            <p className="text-lg font-mono font-semibold text-foreground">{selectedInvoice.invoice_number}</p>
          </div>
        </div>

        {/* Invoice Info Grid */}
        <div className="grid grid-cols-2 gap-12 mb-10">
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-foreground/50 uppercase tracking-wider mb-2">Billed To</h3>
              <div className="text-foreground font-semibold leading-relaxed">
                <p className="text-lg">VendorBridge Corp.</p>
                <p className="text-foreground/80 font-medium">123 Innovation Drive, Tech Park</p>
                <p className="text-foreground/80 font-medium">Silicon Valley, CA 94043</p>
                <p className="text-foreground/80 font-medium mt-1">GSTIN: <span className="font-mono">25383438AFB</span></p>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-foreground/50 uppercase tracking-wider mb-2">Vendor Information</h3>
              <div className="text-foreground font-semibold leading-relaxed">
                <p className="text-lg">{selectedInvoice.vendor_name}</p>
                <p className="text-foreground/80 font-medium">Registered Supplier</p>
                <p className="text-foreground/80 font-medium mt-1">PO Ref: <span className="font-mono">{selectedInvoice.po_number}</span></p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-lg border border-border/50">
              <div>
                <p className="text-xs font-bold text-foreground/50 uppercase">Issue Date</p>
                <p className="font-semibold">{new Date(selectedInvoice.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-foreground/50 uppercase">Due Date</p>
                <p className="font-semibold text-rose-600 dark:text-rose-400">{new Date(selectedInvoice.due_date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Table */}
        <div className="border-2 border-border/50 rounded-xl overflow-hidden mb-8">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-muted/30 text-foreground border-b-2 border-border/50">
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs border-r border-border/50">Description</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right w-48">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              <tr className="hover:bg-muted/10 transition-colors">
                <td className="px-6 py-6 text-foreground font-semibold border-r border-border/50">
                  Procurement Items as per PO <span className="font-mono bg-muted/50 px-2 py-0.5 rounded">{selectedInvoice.po_number}</span>
                </td>
                <td className="px-6 py-6 text-foreground font-mono font-medium text-right">
                  {formatCurrency(selectedInvoice.total - (selectedInvoice.total * 0.18))}
                </td>
              </tr>
            </tbody>
          </table>
          
          {/* Totals Section */}
          <div className="flex justify-end bg-muted/10 border-t-2 border-border/50">
            <div className="w-1/2">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-border/30">
                  <tr>
                    <td className="px-6 py-3 text-right font-bold text-foreground/70 border-r border-border/50">Subtotal</td>
                    <td className="px-6 py-3 text-right font-mono font-semibold text-foreground">{formatCurrency(selectedInvoice.total - (selectedInvoice.total * 0.18))}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3 text-right font-bold text-foreground/70 border-r border-border/50">GST (18%)</td>
                    <td className="px-6 py-3 text-right font-mono font-semibold text-foreground">{formatCurrency(selectedInvoice.total * 0.18)}</td>
                  </tr>
                  <tr className="bg-primary/5">
                    <td className="px-6 py-4 text-right font-black text-foreground uppercase tracking-wider border-r border-border/50 text-base">Grand Total</td>
                    <td className="px-6 py-4 text-right font-mono font-black text-primary text-lg">{formatCurrency(selectedInvoice.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer / Signatures */}
        <div className="flex justify-between items-end mt-16 pt-8 border-t-2 border-border/50">
          <div className="space-y-1">
            <h4 className="font-bold text-foreground">Payment Instructions</h4>
            <p className="text-sm text-foreground/70 font-medium">Please include invoice number on your check.</p>
            <p className="text-sm text-foreground/70 font-medium">Make all checks payable to VendorBridge Corp.</p>
          </div>
          <div className="text-center w-64">
            <div className="border-b-2 border-border/50 h-12 mb-2"></div>
            <p className="font-bold text-sm text-foreground/70 uppercase tracking-wider">Authorized Signature</p>
          </div>
        </div>
      </div>

      {/* Footer Status Wrapper */}
      <div className="flex items-center justify-between mt-6 bg-card border-2 border-border p-4 rounded-xl shadow-sm max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <span className="text-foreground/80 font-bold uppercase tracking-wider text-sm">Status:</span>
          <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${selectedInvoice.status.toLowerCase() === 'paid' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-yellow-100 text-yellow-800 border-yellow-300'}`}>
            {selectedInvoice.status}
          </span>
        </div>
        {selectedInvoice.status.toLowerCase() !== 'paid' && (
          <button 
            onClick={async () => {
              try {
                const { markInvoicePaid } = await import('../../api/procurementApi');
                await markInvoicePaid(selectedInvoice.id);
                alert('Invoice successfully marked as Paid!');
                fetchInvoices();
              } catch(e) {
                console.error(e);
                alert('Failed to mark invoice as paid. Make sure you have Manager or Admin permissions.');
              }
            }} 
            className="px-6 py-2 bg-foreground text-background font-bold rounded-lg hover:opacity-90 transition-opacity shadow-sm"
          >
            Mark as Paid
          </button>
        )}
      </div>

    </div>
  );
};
