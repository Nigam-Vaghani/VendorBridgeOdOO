import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';

export const Sidebar = () => {
  const { user } = useAuth();
  
  const allLinks = [
    { name: 'Dashboard', path: '/dashboard', roles: [ROLES.ADMIN, ROLES.OFFICER] },
    { name: 'Vendors', path: '/vendors', roles: [ROLES.ADMIN, ROLES.OFFICER] },
    { name: 'RFQs', path: '/rfqs', roles: [ROLES.ADMIN, ROLES.OFFICER, ROLES.VENDOR] },
    { name: 'Quotations', path: '/quotations', roles: [ROLES.OFFICER, ROLES.VENDOR] },
    { name: 'Approvals', path: '/approvals', roles: [ROLES.MANAGER] },
    { name: 'Purchase Orders', path: '/purchase-orders', roles: [ROLES.ADMIN, ROLES.OFFICER, ROLES.VENDOR] },
    { name: 'Invoices', path: '/invoices', roles: [ROLES.ADMIN, ROLES.OFFICER, ROLES.VENDOR] },
    { name: 'Analytics', path: '/analytics', roles: [ROLES.ADMIN, ROLES.OFFICER, ROLES.MANAGER] },
    { name: 'Activity Logs', path: '/logs', roles: [ROLES.ADMIN, ROLES.OFFICER, ROLES.MANAGER] },
  ];

  const visibleLinks = allLinks.filter(link => user && link.roles.includes(user.role));

  return (
    <div className="w-64 bg-primary text-primary-foreground flex-shrink-0 py-5 flex flex-col">
      <div className="text-primary-foreground font-bold text-lg px-6 pb-5 border-b border-background mb-4">
        🔗 VendorBridge
      </div>
      <nav className="flex-1 px-2 space-y-1">
        {visibleLinks.map(link => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) => 
              `block px-4 py-2 rounded-md transition-colors font-medium ${
                isActive 
                  ? 'bg-background text-foreground' 
                  : 'text-primary-foreground hover:bg-background hover:text-foreground'
              }`
            }
          >
            {link.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
