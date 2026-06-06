import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, Scale, ArrowLeft, Loader2, BarChart2, Download, CheckCircle2, TrendingUp, Table } from 'lucide-react';
import {
  getComparisonMatrix,
  getComparisonChart,
  getComparisonScoring,
  exportComparisonReport,
  acceptQuotation
} from '../../api/quotationApi';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, PieChart, Pie, Cell
} from 'recharts';

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount);

export const QuotationComparison = () => {
  const { rfqId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('matrix');
  const [data, setData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acceptingId, setAcceptingId] = useState(null);
  const [exporting, setExporting] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [matrixRes, chartRes, scoreRes] = await Promise.all([
          getComparisonMatrix(rfqId, { include_items: true }),
          getComparisonChart(rfqId, 'bar'),
          getComparisonScoring(rfqId)
        ]);

        if (matrixRes.success) setData(matrixRes.data);
        if (chartRes.success) setChartData(chartRes.data);
        if (scoreRes.success) setScoreData(scoreRes.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load comparison data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [rfqId]);

  const handleAccept = async (quotationId, vendorName) => {
    if (!window.confirm(`Are you sure you want to accept the quotation from ${vendorName}? This will reject all other quotes and initiate approval.`)) return;
    
    setAcceptingId(quotationId);
    try {
      await acceptQuotation(quotationId, { notes: 'Accepted via comparison dashboard' });
      navigate(`/quotations/${quotationId}`);
    } catch (e) {
      alert(e.response?.data?.detail || 'Failed to accept quotation');
      setAcceptingId(null);
    }
  };

  const handleExport = async (format) => {
    setExporting(format);
    try {
      const blob = await exportComparisonReport(rfqId, format);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${data.rfq_number}_Comparison.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (e) {
      alert('Export failed. Make sure WeasyPrint is installed for PDF generation.');
    } finally {
      setExporting(null);
    }
  };

  if (loading) return <div className="p-10 text-center"><Spinner /></div>;
  if (error || !data) return <div className="p-10 text-center text-red-500">{error || 'No data found'}</div>;

  const { rfq_number, rfq_title, total_quotations, item_comparison, vendors, summary } = data;

  if (total_quotations === 0) {
    return (
      <div className="p-10 text-center space-y-4">
        <Scale size={48} className="mx-auto text-slate-300" />
        <h2 className="text-xl font-bold text-slate-700">No Quotations Yet</h2>
        <p className="text-slate-500">There are no quotations to compare for this RFQ.</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[90rem] mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors mb-4"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Scale size={32} className="text-[#6322ef]" />
            Compare Quotations
          </h1>
          <p className="text-slate-500 text-lg">
            RFQ: <span className="font-semibold text-[#6322ef]">{rfq_number}</span> - {rfq_title} ({total_quotations} quotes)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => handleExport('csv')} disabled={exporting !== null}>
            {exporting === 'csv' ? <Loader2 size={16} className="animate-spin mr-2" /> : <Download size={16} className="mr-2" />} CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('pdf')} disabled={exporting !== null}>
            {exporting === 'pdf' ? <Loader2 size={16} className="animate-spin mr-2" /> : <Download size={16} className="mr-2" />} PDF Report
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100/50 p-1 rounded-lg w-max mb-6 border border-slate-200">
        {[
          { id: 'matrix', icon: Table, label: 'Comparison Matrix' },
          { id: 'score', icon: CheckCircle2, label: 'Scoring & AI Rec.' },
          { id: 'chart', icon: BarChart2, label: 'Visual Charts' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-white text-[#6322ef] shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content: Matrix */}
      {activeTab === 'matrix' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mt-8">
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse min-w-[800px]">
              <thead>
                <tr>
                  <th className="px-6 py-5 font-semibold text-left border-b border-slate-200 w-1/4 bg-slate-50 text-slate-500 uppercase tracking-wider text-xs align-bottom">
                    Criteria
                  </th>
                  {vendors.map((v) => (
                    <th
                      key={v.vendor_id}
                      className={`px-6 py-5 font-bold border-b border-slate-200 text-lg align-bottom ${v.is_lowest_total
                        ? 'bg-green-50 text-green-800 border-b-2 border-green-500'
                        : 'bg-white text-slate-800'
                        }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        {v.vendor_name}
                        {v.is_lowest_total && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-wider">
                            Lowest Total
                          </span>
                        )}
                        <span className="text-xs font-normal text-slate-400">Rating: {v.vendor_rating}/5</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                
                {/* Grand Total Row */}
                <tr className="bg-slate-50/50">
                  <td className="px-6 py-5 font-bold text-left border-r border-slate-100 text-slate-800 uppercase text-xs tracking-wider">
                    Grand Total
                  </td>
                  {vendors.map((v) => (
                    <td
                      key={v.vendor_id}
                      className={`px-6 py-5 border-r border-slate-100 font-mono text-lg font-bold ${v.is_lowest_total
                        ? 'bg-green-50/50 text-green-700 border-l-2 border-r-2 border-green-500/30'
                        : 'text-slate-800'
                        }`}
                    >
                      ₹{formatCurrency(v.total_amount)}
                    </td>
                  ))}
                </tr>

                {/* Delivery Row */}
                <tr>
                  <td className="px-6 py-4 font-semibold text-left border-r border-slate-100 text-slate-600 text-sm">
                    Overall Delivery
                  </td>
                  {vendors.map((v) => {
                    return (
                      <td
                        key={v.vendor_id}
                        className={`px-6 py-4 border-r border-slate-100 text-sm font-medium ${v.is_lowest_total ? 'bg-green-50/30 border-l-2 border-r-2 border-green-500/30' : ''} ${v.is_fastest_delivery ? 'text-blue-600 font-bold' : 'text-slate-600'}`}
                      >
                        {v.delivery_days} days {v.is_fastest_delivery && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded ml-1 font-semibold">Fastest</span>}
                      </td>
                    );
                  })}
                </tr>

                <tr className="bg-slate-100"><td colSpan={vendors.length + 1} className="py-1"></td></tr>

                {/* Items Breakdown */}
                {item_comparison?.map((item) => (
                  <tr key={item.rfq_item_id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 text-left border-r border-slate-100">
                      <div className="font-semibold text-slate-800 text-sm">{item.product_name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">Qty: {Number(item.rfq_quantity)} {item.unit}</div>
                    </td>
                    {vendors.map((v) => {
                      const quote = item.vendor_quotes.find(vq => vq.vendor_id === v.vendor_id);
                      if (!quote) return <td key={v.vendor_id} className={`px-6 py-4 border-r border-slate-100 text-slate-300 text-sm ${v.is_lowest_total ? 'bg-green-50/30 border-l-2 border-r-2 border-green-500/30' : ''}`}>No quote</td>;

                      return (
                        <td
                          key={v.vendor_id}
                          className={`px-6 py-4 border-r border-slate-100 font-mono text-sm ${v.is_lowest_total ? 'bg-green-50/30 border-l-2 border-r-2 border-green-500/30' : ''}`}
                        >
                          <div className={quote.is_lowest_price ? 'font-bold text-green-600' : 'text-slate-700'}>
                            ₹{formatCurrency(quote.unit_price)} <span className="text-[10px] text-slate-400 font-sans">/unit</span>
                          </div>
                          {quote.price_diff_pct > 0 && (
                            <div className="text-[10px] text-red-400 mt-0.5">+{quote.price_diff_pct}%</div>
                          )}
                          <div className="text-xs text-slate-400 mt-1">Total: ₹{formatCurrency(quote.line_total)}</div>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Action Row */}
                <tr>
                  <td className="px-6 py-6 border-r border-slate-100 bg-slate-50"></td>
                  {vendors.map((v) => (
                    <td
                      key={v.vendor_id}
                      className={`px-6 py-6 border-r border-slate-100 ${v.is_lowest_total
                        ? 'bg-green-50/50 border-l-2 border-r-2 border-b-2 border-green-500/30'
                        : ''
                        }`}
                    >
                      <Button
                        variant={v.is_lowest_total ? 'default' : 'secondary'}
                        className={v.is_lowest_total ? "w-full bg-green-600 hover:bg-green-700" : "w-full"}
                        onClick={() => handleAccept(v.quotation_id, v.vendor_name)}
                        disabled={acceptingId !== null}
                      >
                        {acceptingId === v.quotation_id ? (
                          <><Loader2 size={16} className="animate-spin mr-2" /> Accepting...</>
                        ) : (
                          <><Check size={16} strokeWidth={3} className="mr-2" /> Select & Accept</>
                        )}
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Scoring */}
      {activeTab === 'score' && scoreData && (
        <div className="space-y-6">
          {scoreData.recommendation && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-white rounded-full shadow-sm text-green-600">
                <TrendingUp size={24} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-green-800 uppercase tracking-wider mb-1">Algorithmic Recommendation</h3>
                <p className="text-xl font-medium text-slate-800 mb-1">
                  We recommend selecting <span className="font-bold text-green-700">{scoreData.recommendation.vendor_name}</span>.
                </p>
                <p className="text-slate-600 text-sm">{scoreData.recommendation.reason}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {scoreData.scores.map(score => (
              <div key={score.vendor_id} className={`bg-white rounded-xl border p-6 shadow-sm relative overflow-hidden ${score.rank === 1 ? 'border-green-400 ring-1 ring-green-400' : 'border-slate-200'}`}>
                {score.rank === 1 && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-wider rounded-bl-lg">
                    Rank #1
                  </div>
                )}
                <h3 className="text-xl font-bold text-slate-800 mb-4">{score.vendor_name}</h3>
                
                <div className="flex items-end gap-2 mb-6">
                  <span className="text-4xl font-black text-[#6322ef]">{score.total_score}</span>
                  <span className="text-slate-400 font-medium mb-1">/ 100</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                      <span>Price Score (Rank #{score.price_rank})</span>
                      <span>{score.price_score} / {scoreData.weights.price}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(score.price_score / scoreData.weights.price) * 100}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                      <span>Delivery Score (Rank #{score.delivery_rank})</span>
                      <span>{score.delivery_score} / {scoreData.weights.delivery}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${(score.delivery_score / scoreData.weights.delivery) * 100}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                      <span>Quality Score (Rank #{score.quality_rank})</span>
                      <span>{score.quality_score} / {scoreData.weights.quality}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(score.quality_score / scoreData.weights.quality) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Chart */}
      {activeTab === 'chart' && chartData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 mb-6">Total Amount Comparison</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.datasets[0].data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="vendor" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis tickFormatter={(val) => `₹${val / 1000}k`} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <RechartsTooltip cursor={{fill: '#f1f5f9'}} formatter={(value) => [`₹${formatCurrency(value)}`, 'Total Amount']} />
                  <Bar dataKey="value" fill="#6322ef" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 mb-6">Delivery Days Comparison</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.datasets[1].data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="vendor" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <RechartsTooltip cursor={{fill: '#f1f5f9'}} formatter={(value) => [`${value} Days`, 'Delivery Days']} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default QuotationComparison;
