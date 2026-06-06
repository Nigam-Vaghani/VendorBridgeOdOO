import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
      <div className="font-semibold text-lg text-slate-800">
        VendorBridge ERP
      </div>
      <div className="flex items-center gap-4">
        <div className="relative cursor-pointer">
          <span>🔔</span>
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 font-bold">
            0
          </span>
        </div>
        <div className="flex items-center gap-3 ml-4 border-l border-slate-200 pl-4">
          <div className="text-right">
            <div className="text-sm font-semibold text-slate-800">{user?.name}</div>
            <div className="text-xs text-slate-500 capitalize">{user?.role?.replace('_', ' ')}</div>
          </div>
          <button 
            onClick={handleLogout}
            className="text-sm font-semibold text-red-600 hover:text-red-700 ml-2"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
