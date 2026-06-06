import React from 'react';

export const ActivityLogs = () => {
  const logs = [
    { id: 1, user: 'Admin', action: 'Created RFQ #123', timestamp: '2023-10-27 10:30' },
    { id: 2, user: 'Vendor A', action: 'Submitted Quotation for RFQ #123', timestamp: '2023-10-27 11:15' },
    { id: 3, user: 'Procurement Officer', action: 'Approved Quotation for RFQ #123', timestamp: '2023-10-27 14:00' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-foreground">Activity Logs</h1>
      <div className="bg-card border-2 border-border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b-2 border-border">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">User</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Action</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 text-sm text-foreground">{log.user}</td>
                <td className="px-6 py-4 text-sm text-foreground">{log.action}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{log.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
