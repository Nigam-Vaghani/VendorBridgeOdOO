import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

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
        <div className="relative cursor-pointer text-foreground">
          <span>🔔</span>
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] rounded-full px-1.5 py-0.5 font-bold">
            0
          </span>
        </div>
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
