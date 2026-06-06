import { Check, Scale } from 'lucide-react';

export const QuotationComparison = () => {
  const comparisonData = {
    criteria: ['Grand Total', 'GST %', 'Delivery (days)', 'Vendor rating', 'Payment terms'],
    vendors: [
      {
        name: 'Infra Supplies',
        isLowest: true,
        data: ['1,85,000', '18', '10', '4.5/5', '30 days']
      },
      {
        name: 'TechCore LTD',
        isLowest: false,
        data: ['2,00,010', '18', '14', '4.2/5', '30 days']
      },
      {
        name: 'Office Need Co.',
        isLowest: false,
        data: ['2,14,800', '18', '7', '3.8/5', '15 days']
      }
    ]
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
          <Scale size={36} className="text-primary" />
          Quotation Comparison
        </h1>
        <p className="text-foreground/80 text-lg">
          RFQ: office furniture procurement q2 - 3 quotations received
        </p>
      </div>

      {/* Comparison Table */}
      <div className="bg-card border-2 border-border rounded-xl overflow-hidden shadow-sm mt-8">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse table-fixed min-w-[800px]">
            <thead>
              <tr>
                <th className="px-6 py-5 font-semibold text-left border-b-2 border-border w-1/4 bg-foreground/5 text-foreground/70 uppercase tracking-wider text-sm">
                  Criteria
                </th>
                {comparisonData.vendors.map((vendor, idx) => (
                  <th
                    key={idx}
                    className={`px-6 py-5 font-bold border-b-2 border-border text-lg ${vendor.isLowest
                      ? 'bg-green-600 text-white border-green-700'
                      : 'bg-card text-foreground'
                      }`}
                  >
                    {vendor.name} {vendor.isLowest && <span className="text-sm font-normal opacity-90 ml-1">(Lowest!)</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {comparisonData.criteria.map((criterion, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-foreground/5 transition-colors group">
                  <td className="px-6 py-4 font-medium text-left border-r border-border/50 text-foreground">
                    {criterion}
                  </td>
                  {comparisonData.vendors.map((vendor, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-6 py-4 border-r border-border/50 font-mono ${vendor.isLowest
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 font-semibold border-l-2 border-r-2 border-green-500/30'
                        : 'text-foreground/80'
                        }`}
                    >
                      {vendor.data[rowIndex]}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Action Row */}
              <tr>
                <td className="px-6 py-6 border-r border-border/50 bg-foreground/5"></td>
                {comparisonData.vendors.map((vendor, idx) => (
                  <td
                    key={idx}
                    className={`px-6 py-6 border-r border-border/50 ${vendor.isLowest
                      ? 'bg-green-50 dark:bg-green-900/20 border-l-2 border-r-2 border-b-2 border-green-500/30 rounded-b-lg'
                      : ''
                      }`}
                  >
                    {vendor.isLowest ? (
                      <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-sm">
                        <Check size={18} strokeWidth={3} />
                        Select & Approve
                      </button>
                    ) : (
                      <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-transparent border-2 border-border text-foreground rounded-lg font-semibold hover:bg-foreground/5 transition-colors">
                        Select
                      </button>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-sm text-foreground/60 italic px-2 pt-2">
        <span className="text-green-600 font-semibold dark:text-green-500">Green</span> = lowest price, selecting vendor initiates the approval workflow.
      </p>

    </div>
  );
};
