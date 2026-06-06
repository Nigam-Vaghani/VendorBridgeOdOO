import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import {
  Search, Filter, Calendar, Download, Plus, MoreVertical,
  TrendingUp, TrendingDown, ShoppingCart, Clock, CheckCircle, XCircle,
  Eye, FileText, Printer, Mail, FileCheck, Truck, X,
  ChevronRight, Circle
} from 'lucide-react';


const MOCK_PO_DETAILS = {
  orderInfo: {
    poNumber: 'PO-2026-001', rfqNumber: 'RFQ-2026-042', vendorName: 'Global Tech Supplies',
    createdDate: '01 Jun 2026', approvedBy: 'Alex Manager', approvalDate: '02 Jun 2026'
  },
  items: [
    { id: 1, name: 'ThinkPad T14 Gen 4', quantity: 20, unitPrice: '$1,500.00', tax: '10%', lineTotal: '$30,000.00' },
    { id: 2, name: 'Dell UltraSharp 27" Monitor', quantity: 40, unitPrice: '$350.00', tax: '10%', lineTotal: '$14,000.00' }
  ],
  financials: {
    subtotal: '$44,000.00', gst: '$4,400.00', shipping: '$600.00', grandTotal: '$49,000.00'
  },
  delivery: {
    address: '123 Tech Park, Innovation Blvd, Silicon Valley, CA 94043',
    expectedDate: '15 Jun 2026', terms: 'FOB Destination. Net 30 Days.'
  },
  approval: {
    approverName: 'Alex Manager', remarks: 'Approved within Q2 IT Budget allocation.', timestamp: '02 Jun 2026, 09:30 AM'
  },
  timeline: [
    { event: 'RFQ Created', date: '25 May 2026, 10:00 AM', completed: true },
    { event: 'Vendor Submitted Quotation', date: '28 May 2026, 02:15 PM', completed: true },
    { event: 'Quotation Approved', date: '30 May 2026, 11:45 AM', completed: true },
    { event: 'Purchase Order Generated', date: '01 Jun 2026, 09:00 AM', completed: true },
    { event: 'PO Sent To Vendor', date: '02 Jun 2026, 10:00 AM', completed: true },
    { event: 'Vendor Accepted', date: '03 Jun 2026, 03:30 PM', completed: true },
    { event: 'Goods Delivered', date: '-', completed: false },
  ]
};

const StatusBadge = ({ status }) => {
  let colorClass = '';
  switch (status) {
    case 'Draft': colorClass = 'bg-gray-100 text-gray-700 border-gray-200'; break;
    case 'Sent': colorClass = 'bg-blue-50 text-blue-700 border-blue-200'; break;
    case 'Accepted': colorClass = 'bg-indigo-50 text-indigo-700 border-indigo-200'; break;
    case 'In Progress': colorClass = 'bg-amber-50 text-amber-700 border-amber-200'; break;
    case 'Delivered': colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200'; break;
    case 'Cancelled': colorClass = 'bg-rose-50 text-rose-700 border-rose-200'; break;
    default: colorClass = 'bg-slate-50 text-slate-700 border-slate-200';
  }
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
      {status}
    </span>
  );
};

// PODetailsModal Component
const PODetailsModal = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-4xl h-full bg-background shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-card">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              Purchase Order Details
              <StatusBadge status="Accepted" />
            </h2>
            <p className="text-sm opacity-70 mt-1">{data.orderInfo.poNumber} • {data.orderInfo.vendorName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors text-foreground opacity-70 hover:opacity-100">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-background">

          {/* Section 1 & 4: Order & Delivery Info */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileText size={16} className="opacity-70" /> Order Information
              </h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                <div><p className="opacity-60 text-xs mb-1">PO Number</p><p className="font-medium text-foreground">{data.orderInfo.poNumber}</p></div>
                <div><p className="opacity-60 text-xs mb-1">RFQ Number</p><p className="font-medium text-foreground">{data.orderInfo.rfqNumber}</p></div>
                <div><p className="opacity-60 text-xs mb-1">Created Date</p><p className="font-medium text-foreground">{data.orderInfo.createdDate}</p></div>
                <div><p className="opacity-60 text-xs mb-1">Approved By</p><p className="font-medium text-foreground">{data.orderInfo.approvedBy}</p></div>
              </div>
            </div>

            <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <Truck size={16} className="opacity-70" /> Delivery Information
              </h3>
              <div className="space-y-4 text-sm">
                <div><p className="opacity-60 text-xs mb-1">Expected Delivery</p><p className="font-medium text-foreground">{data.delivery.expectedDate}</p></div>
                <div><p className="opacity-60 text-xs mb-1">Delivery Terms</p><p className="font-medium text-foreground">{data.delivery.terms}</p></div>
                <div><p className="opacity-60 text-xs mb-1">Delivery Address</p><p className="font-medium text-foreground">{data.delivery.address}</p></div>
              </div>
            </div>
          </div>

          {/* Section 2: Items Table */}
          <div className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border/50 bg-muted/20">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                <ShoppingCart size={16} className="opacity-70" /> Ordered Items
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/30 text-foreground opacity-80 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-5 py-3">Item Name</th>
                    <th className="px-5 py-3 text-center">Quantity</th>
                    <th className="px-5 py-3 text-right">Unit Price</th>
                    <th className="px-5 py-3 text-right">Tax</th>
                    <th className="px-5 py-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {data.items.map(item => (
                    <tr key={item.id} className="hover:bg-muted/10">
                      <td className="px-5 py-3 font-medium text-foreground">{item.name}</td>
                      <td className="px-5 py-3 text-center text-foreground">{item.quantity}</td>
                      <td className="px-5 py-3 text-right text-foreground">{item.unitPrice}</td>
                      <td className="px-5 py-3 text-right text-foreground">{item.tax}</td>
                      <td className="px-5 py-3 text-right font-medium text-foreground">{item.lineTotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Financial Summary */}
          <div className="flex justify-end">
            <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm w-72">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="opacity-70">Subtotal</span><span className="font-medium text-foreground">{data.financials.subtotal}</span></div>
                <div className="flex justify-between"><span className="opacity-70">GST</span><span className="font-medium text-foreground">{data.financials.gst}</span></div>
                <div className="flex justify-between"><span className="opacity-70">Shipping</span><span className="font-medium text-foreground">{data.financials.shipping}</span></div>
                <div className="pt-3 border-t border-border/50 flex justify-between items-center">
                  <span className="font-bold text-foreground">Grand Total</span>
                  <span className="text-lg font-bold text-foreground">{data.financials.grandTotal}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Approval Information */}
          <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileCheck size={16} className="opacity-70" /> Approval Information
            </h3>
            <div className="grid grid-cols-3 gap-4 text-sm bg-muted/10 p-4 rounded-lg">
              <div><p className="opacity-60 text-xs mb-1">Approver Name</p><p className="font-medium text-foreground">{data.approval.approverName}</p></div>
              <div><p className="opacity-60 text-xs mb-1">Approval Timestamp</p><p className="font-medium text-foreground">{data.approval.timestamp}</p></div>
              <div><p className="opacity-60 text-xs mb-1">Remarks</p><p className="font-medium text-foreground italic">"{data.approval.remarks}"</p></div>
            </div>
          </div>

          {/* Section 6: Activity Timeline */}
          <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
              <Clock size={16} className="opacity-70" /> Activity Timeline
            </h3>
            <div className="relative border-l-2 border-border/50 ml-3 space-y-6">
              {data.timeline.map((step, idx) => (
                <div key={idx} className="relative pl-6">
                  <span className={`absolute -left-[9px] top-1 rounded-full border-2 bg-background ${step.completed ? 'border-primary text-primary' : 'border-border text-transparent'}`}>
                    <Circle size={14} className={step.completed ? "fill-primary" : ""} />
                  </span>
                  <div className="flex justify-between items-start">
                    <p className={`text-sm font-medium ${step.completed ? 'text-foreground' : 'text-foreground opacity-50'}`}>{step.event}</p>
                    <p className="text-xs text-foreground opacity-60">{step.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border/50 bg-card flex justify-between items-center">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}><Download size={14} /> PDF</Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}><Printer size={14} /> Print</Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => alert('PO emailed to vendor successfully!')}><Mail size={14} /> Email Vendor</Button>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={async () => {
                try {
                  const { generateInvoice } = await import('../../api/procurementApi');
                  await generateInvoice(data.id);
                  alert("Invoice generated successfully!");
                  onClose();
                } catch(e) {
                  console.error(e);
                  alert("Failed to generate invoice");
                }
              }}
            >
              <FileText size={14} /> Generate Invoice
            </Button>
            <Button 
              size="sm" 
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => alert("PO Marked as Delivered! (Inventory module pending)")}
            >
              <CheckCircle size={14} /> Mark Delivered
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

const SummaryCard = ({ title, count, trend, isPositive, icon: Icon }) => (
  <div className="bg-card p-6 rounded-xl border border-border/40 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
    <div>
      <p className="text-sm font-medium text-foreground opacity-70 mb-1">{title}</p>
      <div className="flex items-end gap-3">
        <h3 className="text-3xl font-bold text-foreground">{count}</h3>
        <div className={`flex items-center text-xs font-medium mb-1 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
          {isPositive ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
          {trend}
        </div>
      </div>
    </div>
    <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary">
      <Icon size={24} />
    </div>
  </div>
);

export const PurchaseOrders = () => {
  const [selectedPO, setSelectedPO] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('../../api/procurementApi').then(({ getPurchaseOrders }) => {
      getPurchaseOrders().then(data => {
        setPos(data);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    });
  }, []);

  const totalCount = pos.length;
  const pendingCount = pos.filter(po => po.status === 'draft' || po.status === 'sent').length;
  const deliveredCount = pos.filter(po => po.status === 'delivered').length;
  const cancelledCount = pos.filter(po => po.status === 'cancelled').length;

  return (
    <div className="p-8 h-full overflow-y-auto bg-background">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-sans tracking-tight text-foreground">Purchase Orders</h1>
          <p className="text-base text-foreground opacity-70 mt-1">Manage and track your procurement orders.</p>
        </div>
        <Button className="gap-2 shadow-sm rounded-lg h-10 px-5">
          <Plus size={18} />
          Create Purchase Order
        </Button>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard title="Total Orders" count={totalCount} trend="+0%" isPositive={true} icon={ShoppingCart} />
        <SummaryCard title="Pending Delivery" count={pendingCount} trend="+0%" isPositive={true} icon={Clock} />
        <SummaryCard title="Delivered Orders" count={deliveredCount} trend="+0%" isPositive={true} icon={CheckCircle} />
        <SummaryCard title="Cancelled Orders" count={cancelledCount} trend="+0%" isPositive={false} icon={XCircle} />
      </div>

      {/* Main Content Area */}
      <div className="bg-card rounded-xl border border-border/40 shadow-sm flex flex-col">

        {/* Top Action Bar */}
        <div className="p-5 border-b border-border/40 flex flex-wrap gap-4 items-center justify-between bg-muted/5 rounded-t-xl">
          <div className="flex items-center gap-3 flex-1 min-w-[300px]">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground opacity-50" size={18} />
              <input
                type="text"
                placeholder="Search PO Number, Vendor..."
                className="w-full pl-10 pr-4 py-2 bg-background border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground placeholder:opacity-50"
              />
            </div>
            <Button variant="outline" className="gap-2 text-foreground border-border/50 hover:bg-muted/50 h-10 rounded-lg">
              <Filter size={16} /> Status
            </Button>
            <Button variant="outline" className="gap-2 text-foreground border-border/50 hover:bg-muted/50 h-10 rounded-lg">
              <Calendar size={16} /> Date Range
            </Button>
          </div>
          <Button onClick={() => window.print()} variant="outline" className="gap-2 text-foreground border-border/50 hover:bg-muted/50 h-10 rounded-lg">
            <Download size={16} /> Export
          </Button>
        </div>

        {/* PO Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/10 text-foreground opacity-80 text-xs uppercase font-semibold border-b border-border/40">
              <tr>
                <th className="px-6 py-4">PO Number</th>
                <th className="px-6 py-4">Vendor Name</th>
                <th className="px-6 py-4">RFQ Ref</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {loading ? (
                <tr><td colSpan="7" className="p-4 text-center">Loading...</td></tr>
              ) : pos.length === 0 ? (
                <tr><td colSpan="7" className="p-4 text-center">No Purchase Orders found.</td></tr>
              ) : pos.map((po) => (
                <tr
                  key={po.id}
                  className="hover:bg-muted/10 transition-colors cursor-pointer group"
                  onClick={() => {
                    const dynamicPO = {
                      id: po.id,
                      orderInfo: {
                        poNumber: po.po_number, rfqNumber: po.rfq_number, vendorName: po.vendor_name,
                        createdDate: new Date(po.created_at).toLocaleDateString(), approvedBy: 'System Admin', approvalDate: new Date(po.created_at).toLocaleDateString()
                      },
                      items: [
                        { id: 1, name: 'Procured Items (Summary)', quantity: 1, unitPrice: po.total_amount, tax: '0%', lineTotal: po.total_amount }
                      ],
                      financials: {
                        subtotal: po.total_amount, gst: '0.00', shipping: '0.00', grandTotal: po.total_amount
                      },
                      delivery: {
                        address: 'Main Warehouse',
                        expectedDate: 'TBD', terms: 'Standard Terms'
                      },
                      approval: {
                        approverName: 'Admin', remarks: 'Approved dynamically.', timestamp: new Date(po.created_at).toLocaleDateString()
                      },
                      timeline: [
                        { event: 'Purchase Order Generated', date: new Date(po.created_at).toLocaleDateString(), completed: true }
                      ]
                    };
                    setSelectedPO(dynamicPO);
                  }}
                >
                  <td className="px-6 py-4 font-medium text-foreground">{po.po_number}</td>
                  <td className="px-6 py-4 text-foreground">{po.vendor_name}</td>
                  <td className="px-6 py-4 text-foreground opacity-80">{po.rfq_number}</td>
                  <td className="px-6 py-4 font-medium text-foreground">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(po.total_amount)}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={po.status.charAt(0).toUpperCase() + po.status.slice(1)} />
                  </td>
                  <td className="px-6 py-4 text-foreground opacity-80">{new Date(po.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-center relative" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="p-1.5 rounded-md hover:bg-muted transition-colors text-foreground opacity-60 hover:opacity-100 focus:outline-none"
                      onClick={() => setActiveDropdown(activeDropdown === po.id ? null : po.id)}
                    >
                      <MoreVertical size={18} />
                    </button>

                    {/* Inline Actions Dropdown Simulation */}
                    {activeDropdown === po.id && (
                      <div className="absolute right-8 top-10 w-48 bg-background border border-border/50 rounded-lg shadow-lg z-10 py-1 text-sm flex flex-col text-left">
                        <button className="px-4 py-2 hover:bg-muted w-full text-left flex items-center gap-2" onClick={() => { 
                          const dynamicPO = {
                            id: po.id,
                            orderInfo: {
                              poNumber: po.po_number, rfqNumber: po.rfq_number, vendorName: po.vendor_name,
                              createdDate: new Date(po.created_at).toLocaleDateString(), approvedBy: 'System Admin', approvalDate: new Date(po.created_at).toLocaleDateString()
                            },
                            items: [
                              { id: 1, name: 'Procured Items (Summary)', quantity: 1, unitPrice: po.total_amount, tax: '0%', lineTotal: po.total_amount }
                            ],
                            financials: {
                              subtotal: po.total_amount, gst: '0.00', shipping: '0.00', grandTotal: po.total_amount
                            },
                            delivery: {
                              address: 'Main Warehouse',
                              expectedDate: 'TBD', terms: 'Standard Terms'
                            },
                            approval: {
                              approverName: 'Admin', remarks: 'Approved dynamically.', timestamp: new Date(po.created_at).toLocaleDateString()
                            },
                            timeline: [
                              { event: 'Purchase Order Generated', date: new Date(po.created_at).toLocaleDateString(), completed: true }
                            ]
                          };
                          setSelectedPO(dynamicPO); 
                          setActiveDropdown(null); 
                        }}><Eye size={14} /> View Details</button>
                        <button className="px-4 py-2 hover:bg-muted w-full text-left flex items-center gap-2"><Download size={14} /> Download PDF</button>
                        <button className="px-4 py-2 hover:bg-muted w-full text-left flex items-center gap-2"><Mail size={14} /> Email Vendor</button>
                        <div className="my-1 border-b border-border/20"></div>
                        <button 
                          className="px-4 py-2 hover:bg-muted w-full text-left flex items-center gap-2"
                          onClick={async () => {
                            try {
                              const { generateInvoice } = await import('../../api/procurementApi');
                              await generateInvoice(po.id);
                              alert("Invoice generated successfully!");
                              setActiveDropdown(null);
                            } catch(e) {
                              console.error(e);
                              alert("Failed to generate invoice");
                            }
                          }}
                        >
                          <FileText size={14} /> Generate Invoice
                        </button>
                        <button className="px-4 py-2 hover:bg-muted w-full text-left flex items-center gap-2"><CheckCircle size={14} /> Mark Delivered</button>
                        <button className="px-4 py-2 hover:bg-rose-50 text-rose-600 w-full text-left flex items-center gap-2"><XCircle size={14} /> Cancel Order</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination placeholder */}
        <div className="p-4 border-t border-border/40 flex items-center justify-between text-sm text-foreground opacity-70 bg-muted/5 rounded-b-xl">
          <div>Showing {pos.length} entries</div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-border/50 disabled:opacity-50" disabled>&lt;</Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-primary text-primary-foreground">1</Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-border/50 disabled:opacity-50" disabled>&gt;</Button>
          </div>
        </div>

      </div>

      {/* PO Details Modal */}
      <PODetailsModal
        isOpen={!!selectedPO}
        onClose={() => setSelectedPO(null)}
        data={selectedPO}
      />

    </div>
  );
};
