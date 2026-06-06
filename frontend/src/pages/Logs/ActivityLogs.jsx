import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { CheckCircle2, Clock, FileText, Users, ShoppingCart, Receipt } from 'lucide-react';

// Mock data to display if API fails
const MOCK_LOGS = [
  {
    id: 1,
    entity_type: 'Quotations',
    action: 'Quotation selected',
    details: 'Infra supplies pvt ltd selected for office furniture Q2',
    timestamp: '2025-05-23T21:15:00Z',
    icon: CheckCircle2
  },
  {
    id: 2,
    entity_type: 'Approvals',
    action: 'Approval pending',
    details: 'PO-2024 awaiting L2 approval by priya shah',
    timestamp: '2025-05-22T09:15:00Z',
    icon: Clock
  },
  {
    id: 3,
    entity_type: 'RFQ',
    action: 'RFQ published',
    details: 'office furniture Q2 sent to 3 vendors',
    timestamp: '2025-05-19T10:00:00Z',
    icon: FileText
  },
  {
    id: 4,
    entity_type: 'Vendors',
    action: 'Vendor added',
    details: 'FastLog transport registered and pending verifications',
    timestamp: '2025-05-18T15:20:00Z',
    icon: Users
  }
];

const getIconForType = (type, action) => {
  if (action.toLowerCase().includes('select')) return CheckCircle2;
  if (action.toLowerCase().includes('pending') || action.toLowerCase().includes('wait')) return Clock;
  switch (type.toLowerCase()) {
    case 'rfq': return FileText;
    case 'vendors': return Users;
    case 'approvals': return CheckCircle2;
    case 'quotations': return FileText;
    case 'purchase orders': return ShoppingCart;
    case 'invoices': return Receipt;
    default: return FileText;
  }
};

export const ActivityLogs = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [logs, setLogs] = useState([]);

  const tabs = ['All', 'RFQ', 'Approvals', 'Invoices', 'Vendors'];

  useEffect(() => {
    // Try to fetch from API
    const fetchLogs = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/logs${activeTab !== 'All' ? `?entity_type=${activeTab}` : ''}`);
        if (!response.ok) throw new Error("Network error");
        const data = await response.json();
        if (data && data.length > 0) {
          setLogs(data);
        } else {
          setLogs(MOCK_LOGS.filter(log => activeTab === 'All' || log.entity_type.toLowerCase() === activeTab.toLowerCase()));
        }
      } catch (error) {
        console.error("Failed to fetch logs, using mock data", error);
        setLogs(MOCK_LOGS.filter(log => activeTab === 'All' || log.entity_type.toLowerCase() === activeTab.toLowerCase()));
      }
    };
    fetchLogs();
  }, [activeTab]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' }).toLowerCase();
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    // Check if time is needed (some logs might just be date)
    if (dateString.includes('T00:00:00') || date.getHours() === 0 && date.getMinutes() === 0 && dateString.length <= 10) {
      return `${day} ${month} ${year}`;
    }
    return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
  };

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-sans tracking-tight">Activity & Logs</h1>
        <p className="text-lg opacity-80 mt-2 font-medium">Procurement audit trail</p>
      </div>

      <div className="flex flex-wrap gap-4 mb-10">
        {tabs.map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "outline"}
            onClick={() => setActiveTab(tab)}
            className={`rounded-[10px] px-8 h-10 border ${activeTab === tab
              ? 'border-transparent bg-input text-background hover:bg-input/90'
              : 'border-border bg-transparent text-foreground hover:bg-foreground/5'
              }`}
          >
            {tab}
          </Button>
        ))}
      </div>

      <div className="space-y-0">
        {logs.map((log) => {
          const Icon = log.icon || getIconForType(log.entity_type, log.action);
          return (
            <div key={log.id} className="flex gap-4 py-5 border-b border-border/20 last:border-0">
              <div className="mt-0.5 flex-shrink-0">
                <div className="w-10 h-10 rounded-full border border-border/40 flex items-center justify-center bg-transparent">
                  <Icon size={18} className="text-foreground" strokeWidth={1.5} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 justify-center">
                <p className="text-base text-foreground leading-snug">
                  <span className="font-semibold">{log.action}</span> - <span className="opacity-90">{log.details}</span>
                </p>
                <p className="text-[13px] opacity-70 tracking-wide">
                  {formatDate(log.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
