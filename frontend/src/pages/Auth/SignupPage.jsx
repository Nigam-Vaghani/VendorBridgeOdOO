import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { signup } from '../../api/authApi';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { ROLES } from '../../utils/constants';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(ROLES.VENDOR);
  const [error, setError] = useState('');
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await signup(name, email, password, role);
      loginUser(data);
      if (data.user.role === ROLES.VENDOR) {
        navigate('/rfqs');
      } else if (data.user.role === ROLES.MANAGER) {
        navigate('/approvals');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 py-10">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-blue-600 mb-1">🔗 VendorBridge</h1>
        <p className="text-sm text-slate-500 mb-7">Create your account</p>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input 
              type="text" 
              className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:border-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
            <select 
              className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:border-blue-500"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value={ROLES.VENDOR}>Vendor</option>
              <option value={ROLES.OFFICER}>Procurement Officer</option>
              <option value={ROLES.MANAGER}>Manager</option>
              <option value={ROLES.ADMIN}>Admin</option>
            </select>
          </div>
          <Button type="submit">Sign Up</Button>
        </form>
        
        <div className="flex justify-center mt-4 text-sm text-slate-600">
          <span>Already have an account? <Link to="/login" className="text-blue-600">Log In</Link></span>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
