import { useState, useEffect } from 'react';
import { Check, Scale } from 'lucide-react';
import { getProcurementRFQs, getQuotationsByRFQ, initiateApproval } from '../../api/procurementApi';
import { useNavigate } from 'react-router-dom';

export const QuotationComparison = () => {
  const navigate = useNavigate();
  const [rfqs, setRfqs] = useState([]);
  const [selectedRfqId, setSelectedRfqId] = useState('');
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProcurementRFQs().then(data => {
      setRfqs(data);
      if (data.length > 0) {
        setSelectedRfqId(data[0].id);
      } else {
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedRfqId) {
      setLoading(true);
      getQuotationsByRFQ(selectedRfqId).then(data => {
        setQuotations(data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [selectedRfqId]);

  if (loading) return <div className="p-8 text-center">Loading comparison...</div>;
  if (rfqs.length === 0) return <div className="p-8 text-center">No RFQs available for comparison.</div>;

  const lowestQuotation = quotations.length > 0 
    ? quotations.reduce((prev, curr) => (prev.total_amount < curr.total_amount ? prev : curr)) 
    : null;

  const criteria = ['Grand Total', 'Delivery (days)', 'Status'];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
          <Scale size={36} className="text-primary" />
          Quotation Comparison
        </h1>
        <div className="mt-4 mb-2 flex items-center gap-4">
          <label className="text-sm font-semibold">Select RFQ:</label>
          <select 
            value={selectedRfqId} 
            onChange={e => setSelectedRfqId(e.target.value)}
            className="px-4 py-2 bg-card border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {rfqs.map(rfq => (
              <option key={rfq.id} value={rfq.id}>{rfq.rfq_number} - {rfq.title}</option>
            ))}
          </select>
        </div>
      </div>

      {quotations.length === 0 ? (
        <div className="bg-card border-2 border-border rounded-xl p-8 text-center shadow-sm mt-8">
          No quotations received for this RFQ yet.
        </div>
      ) : (
        <div className="bg-card border-2 border-border rounded-xl overflow-hidden shadow-sm mt-8">
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse table-fixed min-w-[800px]">
              <thead>
                <tr>
                  <th className="px-6 py-5 font-semibold text-left border-b-2 border-border w-1/4 bg-foreground/5 text-foreground/70 uppercase tracking-wider text-sm">
                    Criteria
                  </th>
                  {quotations.map((q) => {
                    const isLowest = lowestQuotation && q.id === lowestQuotation.id;
                    return (
                      <th
                        key={q.id}
                        className={`px-6 py-5 font-bold border-b-2 border-border text-lg ${isLowest
                          ? 'bg-green-600 text-white border-green-700'
                          : 'bg-card text-foreground'
                          }`}
                      >
                        {q.vendor_name} {isLowest && <span className="text-sm font-normal opacity-90 ml-1">(Lowest!)</span>}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {criteria.map((criterion, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-foreground/5 transition-colors group">
                    <td className="px-6 py-4 font-medium text-left border-r border-border/50 text-foreground">
                      {criterion}
                    </td>
                    {quotations.map((q) => {
                      const isLowest = lowestQuotation && q.id === lowestQuotation.id;
                      let value = '';
                      if (criterion === 'Grand Total') value = new Intl.NumberFormat('en-IN').format(q.total_amount);
                      if (criterion === 'Delivery (days)') value = q.delivery_days;
                      if (criterion === 'Status') value = q.status;

                      return (
                        <td
                          key={q.id}
                          className={`px-6 py-4 border-r border-border/50 font-mono ${isLowest
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 font-semibold border-l-2 border-r-2 border-green-500/30'
                            : 'text-foreground/80'
                            }`}
                        >
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Action Row */}
                <tr>
                  <td className="px-6 py-6 border-r border-border/50 bg-foreground/5"></td>
                  {quotations.map((q) => {
                    const isLowest = lowestQuotation && q.id === lowestQuotation.id;
                    return (
                      <td
                        key={q.id}
                        className={`px-6 py-6 border-r border-border/50 ${isLowest
                          ? 'bg-green-50 dark:bg-green-900/20 border-l-2 border-r-2 border-b-2 border-green-500/30 rounded-b-lg'
                          : ''
                          }`}
                      >
                        {isLowest ? (
                          <button 
                            onClick={async () => {
                              try {
                                await initiateApproval(q.id);
                                alert("Approval workflow initiated!");
                                navigate('/approvals');
                              } catch(e) {
                                console.error(e);
                                alert("Failed to initiate approval");
                              }
                            }}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-sm"
                          >
                            <Check size={18} strokeWidth={3} />
                            Select & Approve
                          </button>
                        ) : (
                          <button 
                            onClick={async () => {
                              try {
                                await initiateApproval(q.id);
                                alert("Approval workflow initiated!");
                                navigate('/approvals');
                              } catch(e) {
                                console.error(e);
                                alert("Failed to initiate approval");
                              }
                            }}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-transparent border-2 border-border text-foreground rounded-lg font-semibold hover:bg-foreground/5 transition-colors"
                          >
                            Select
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {quotations.length > 0 && (
        <p className="text-sm text-foreground/60 italic px-2 pt-2">
          <span className="text-green-600 font-semibold dark:text-green-500">Green</span> = lowest price, selecting vendor initiates the approval workflow.
        </p>
      )}

    </div>
  );
};
