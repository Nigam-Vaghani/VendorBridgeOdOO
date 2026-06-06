import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { login } from '../../api/authApi';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { ROLES } from '../../utils/constants';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(email, password);
      loginUser(data);
      if (data.user.role === ROLES.VENDOR) {
        navigate('/rfqs');
      } else if (data.user.role === ROLES.MANAGER) {
        navigate('/approvals');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-bold text-blue-600 mb-1 text-center">Login Screen</h1>
        <p className="text-sm text-slate-500 mb-6 text-center">Welcome back</p>
        
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center overflow-hidden">
            <span className="text-sm text-slate-500 font-medium">Photo</span>
          </div>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          <div className="mb-4 w-full">
            <input 
              type="email" 
              className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:border-blue-500"
              placeholder="Username / Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6 w-full">
            <input 
              type="password" 
              className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:border-blue-500"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="px-8 py-2 w-auto">Login Button</Button>
        </form>
        
        <div className="flex flex-col items-center mt-6 text-sm text-blue-600 space-y-2">
          <Link to="/forgot-password">Forgot password?</Link>
          <Link to="/signup">Create account &rarr;</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
