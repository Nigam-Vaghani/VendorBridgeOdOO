import { useState, useRef, useEffect } from 'react';
import {
  Bell, Check, FileText, CheckCircle, ShoppingCart,
  Receipt, Users, CheckSquare, ChevronRight
} from 'lucide-react';
import { Button } from '../ui/Button';

// Mock Notifications Data
const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'Quotation', title: 'New Vendor Quotation Submitted', description: 'Vendor Dell India submitted a quotation for RFQ-2026-001.', timestamp: '10 mins ago', isRead: false },
  { id: 2, type: 'Approval', title: 'Approval Required', description: 'RFQ-2026-008 requires your approval to be published.', timestamp: '1 hour ago', isRead: false },
  { id: 3, type: 'RFQ', title: 'RFQ Deadline Approaching', description: 'The submission deadline for RFQ-2026-005 is tomorrow.', timestamp: '3 hours ago', isRead: false },
  { id: 4, type: 'PO', title: 'PO Sent to Vendor', description: 'Purchase Order PO-2026-001 was successfully sent to Global Tech.', timestamp: '1 day ago', isRead: true },
  { id: 5, type: 'Invoice', title: 'Payment Received', description: 'Payment for Invoice INV-992 has been confirmed.', timestamp: '2 days ago', isRead: true },
  { id: 6, type: 'Vendor', title: 'New Vendor Registered', description: 'FastLog Transport completed their registration profile.', timestamp: '3 days ago', isRead: true },
  { id: 7, type: 'Approval', title: 'Purchase Order Approved', description: 'PO-2026-004 was approved by L2 Manager.', timestamp: '4 days ago', isRead: true },
];

const getNotificationIcon = (type) => {
  switch (type) {
    case 'RFQ': return <FileText size={18} className="text-blue-500" />;
    case 'Quotation': return <CheckSquare size={18} className="text-indigo-500" />;
    case 'Approval': return <CheckCircle size={18} className="text-amber-500" />;
    case 'PO': return <ShoppingCart size={18} className="text-emerald-500" />;
    case 'Invoice': return <Receipt size={18} className="text-purple-500" />;
    case 'Vendor': return <Users size={18} className="text-rose-500" />;
    default: return <Bell size={18} className="text-slate-500" />;
  }
};

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-foreground hover:bg-muted transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 bg-primary text-primary-foreground text-[10px] rounded-full min-w-[16px] h-4 flex items-center justify-center font-bold px-1 ring-2 ring-background shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-background border border-border rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">

          {/* Header */}
          <div className="px-4 py-3 border-b border-border bg-card flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
              >
                <Check size={14} /> Mark all as read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-foreground opacity-60 text-sm">
                No notifications to display.
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-border/40">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`p-4 flex gap-3 transition-colors hover:bg-muted/50 cursor-pointer ${!notification.isRead ? 'bg-primary/5' : 'bg-transparent'}`}
                  >
                    <div className="mt-1 flex-shrink-0">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center bg-background border border-border/50 shadow-sm`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <p className={`text-sm truncate pr-2 ${!notification.isRead ? 'font-semibold text-foreground' : 'font-medium text-foreground opacity-80'}`}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5 shadow-sm shadow-primary/30"></span>
                        )}
                      </div>
                      <p className="text-xs text-foreground opacity-70 mb-1.5 line-clamp-2 leading-relaxed">
                        {notification.description}
                      </p>
                      <p className="text-[11px] font-medium text-foreground opacity-50">
                        {notification.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-border bg-card">
            <Button variant="ghost" className="w-full text-sm font-medium h-9 text-primary hover:text-primary hover:bg-primary/10 rounded-lg group">
              View All Notifications
              <ChevronRight size={16} className="ml-1 opacity-50 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

        </div>
      )}
    </div>
  );
};
