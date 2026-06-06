import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';

export const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div className="h-16 bg-background border-b border-primary flex items-center justify-between px-6 shadow-sm transition-colors duration-200">
      <div className="font-semibold text-lg text-foreground">
        VendorBridge ERP
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-foreground hover:opacity-70 transition-opacity focus:outline-none"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <NotificationDropdown />
        <div className="flex items-center gap-3 ml-4 border-l border-primary pl-4">
          <div className="text-right">
            <div className="text-sm font-semibold text-foreground">{user?.name}</div>
            <div className="text-xs text-foreground capitalize">{user?.role?.replace('_', ' ')}</div>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm font-semibold text-primary hover:opacity-80 ml-2"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
