import { useState, useEffect } from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { getApprovals, approveRequest } from '../../api/procurementApi';

export const Approvals = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const data = await getApprovals();
      setApprovals(data);
    } catch (e) {
      console.error("Failed to fetch approvals", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveRequest(id);
      alert("Quotation approved and PO generated successfully!");
      fetchApprovals();
    } catch (e) {
      console.error(e);
      alert("Failed to approve");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading approvals...</div>;
  if (approvals.length === 0) return <div className="p-8 text-center">No pending approvals.</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Pending Approvals</h1>
        <p className="text-foreground/80 text-lg">
          Review and approve selected vendor quotations
        </p>
      </div>

      <div className="space-y-12">
        {approvals.map((approval) => (
          <div key={approval.id} className="border-2 border-border/50 rounded-xl p-6 bg-card shadow-sm space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                RFQ: {approval.rfq_title || approval.rfq_number}
              </h2>
              <p className="text-foreground/80">Vendor: {approval.vendor_name}</p>
            </div>

            {/* Stepper */}
            <div className="flex items-center w-full py-4 max-w-4xl">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full border-2 border-foreground flex items-center justify-center text-foreground font-bold">1</div>
                <span className="text-xs text-foreground mt-2">Submitted</span>
              </div>
              <div className="flex-1 h-0.5 bg-foreground mx-2 mb-6"></div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full border-2 border-[#3b82f6] flex items-center justify-center text-[#3b82f6] font-bold bg-[#3b82f6]/10 shadow-[0_0_10px_rgba(59,130,246,0.3)]">2</div>
                <span className="text-xs text-[#3b82f6] mt-2 font-medium">Pending Approval</span>
              </div>
              <div className="flex-1 h-0.5 bg-border mx-2 mb-6"></div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center text-foreground/50 font-bold">3</div>
                <span className="text-xs text-foreground/50 mt-2">Generate PO</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 pt-4 border-t-2 border-border/50">
              
              {/* Left Column: Approval Chain */}
              <div className="space-y-10">
                <div className="space-y-6">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Approval Chain</h3>
                  <div className="relative border-l-2 border-border/50 ml-5 space-y-8 pb-4">
                    {/* Step 2: Awaiting */}
                    <div className="relative pl-8 mt-4">
                      <div className="absolute -left-3.5 top-0 bg-background rounded-full">
                        <Clock size={26} className="text-[#3b82f6] bg-background" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-foreground font-semibold">Management / Admin <span className="text-foreground/70 font-normal"></span></p>
                        <p className="text-sm text-foreground/70 italic">Awaiting Approval</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t-2 border-border/50">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Approval Remarks</h3>
                  <textarea 
                    rows={4}
                    placeholder="Add your comments or conditions...."
                    className="w-full px-4 py-3 bg-card border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm resize-none"
                  />
                </div>
              </div>

              {/* Right Column: Quotations Summary & Actions */}
              <div className="space-y-8 mt-6 lg:mt-0">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Quotations Summary</h3>
                  <div className="bg-card border-2 border-border rounded-xl p-6 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground/80 font-medium">Vendor:</span>
                      <span className="text-foreground font-semibold text-right">{approval.vendor_name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-foreground/80 font-medium">Total:</span>
                      <span className="text-foreground font-mono font-semibold">
                        {new Intl.NumberFormat('en-IN').format(approval.total_amount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-foreground/80 font-medium">Delivery:</span>
                      <span className="text-foreground font-semibold">{approval.delivery_days} days</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => handleApprove(approval.id)}
                    className="flex-1 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-sm"
                  >
                    Approve & Generate PO
                  </button>
                  <button 
                    onClick={async () => {
                      try {
                        const { rejectRequest } = await import('../../api/procurementApi');
                        await rejectRequest(approval.id);
                        alert("Quotation rejected!");
                        fetchApprovals();
                      } catch (e) {
                        console.error(e);
                        alert("Failed to reject");
                      }
                    }}
                    className="flex-1 py-3 bg-card border-2 border-border text-foreground rounded-lg font-semibold hover:bg-foreground/5 transition-colors shadow-sm"
                  >
                    Reject
                  </button>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
