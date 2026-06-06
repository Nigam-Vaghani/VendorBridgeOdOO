import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';
import {
  LayoutDashboard,
  Users,
  FileText,
  FileSignature,
  CheckSquare,
  ShoppingCart,
  Receipt,
  PieChart,
  Activity,
  GitCompare
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();

  const allLinks = [
    { name: 'Dashboard', path: '/dashboard', roles: [ROLES.ADMIN, ROLES.OFFICER, ROLES.MANAGER, ROLES.VENDOR], icon: LayoutDashboard },
    { name: 'Vendors', path: '/vendors', roles: [ROLES.ADMIN, ROLES.OFFICER, ROLES.MANAGER, ROLES.VENDOR], icon: Users },
    { name: 'RFQs', path: '/rfqs', roles: [ROLES.ADMIN, ROLES.OFFICER, ROLES.MANAGER, ROLES.VENDOR], icon: FileText },
    { name: 'Quotations', path: '/quotations', roles: [ROLES.ADMIN, ROLES.OFFICER, ROLES.VENDOR], icon: FileSignature },
    { name: 'Compare Quotes', path: '/compare-quotes', roles: [ROLES.ADMIN, ROLES.OFFICER, ROLES.MANAGER], icon: GitCompare },
    { name: 'Approvals', path: '/approvals', roles: [ROLES.ADMIN, ROLES.OFFICER, ROLES.MANAGER], icon: CheckSquare },
    { name: 'Purchase Orders', path: '/purchase-orders', roles: [ROLES.ADMIN, ROLES.OFFICER, ROLES.MANAGER, ROLES.VENDOR], icon: ShoppingCart },
    { name: 'Invoices', path: '/invoices', roles: [ROLES.ADMIN, ROLES.OFFICER, ROLES.MANAGER, ROLES.VENDOR], icon: Receipt },
    { name: 'Analytics', path: '/analytics', roles: [ROLES.ADMIN, ROLES.OFFICER, ROLES.MANAGER], icon: PieChart },
    { name: 'Activity Logs', path: '/logs', roles: [ROLES.ADMIN, ROLES.OFFICER, ROLES.MANAGER], icon: Activity },
  ];

  const visibleLinks = allLinks.filter(link => user && link.roles.includes(user.role));

  return (
    <div className="w-64 h-full min-h-screen bg-primary/80 backdrop-blur-md text-primary-foreground flex-shrink-0 py-5 flex flex-col shadow-xl border-r border-white/10">
      <div className="text-primary-foreground font-bold text-lg px-6 pb-5 border-b border-background mb-4">
        VendorBridge
      </div>
      <nav className="flex-1 px-2 space-y-1">
        {visibleLinks.map(link => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-md transition-colors font-medium ${isActive
                  ? 'bg-background text-foreground'
                  : 'text-primary-foreground hover:bg-background/90 hover:text-foreground'
                }`
              }
            >
              <Icon size={18} />
              {link.name}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
