import { useState } from 'react';
import { forgotPassword } from '../../api/authApi';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await forgotPassword(email);
      setMessage(data.message);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send reset link');
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-blue-600 mb-1">🔗 VendorBridge</h1>
        <p className="text-sm text-slate-500 mb-7">Reset Password</p>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{message}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit">Send Reset Link</Button>
        </form>
        
        <div className="flex justify-center mt-4 text-sm text-blue-600">
          <Link to="/login">&larr; Back to login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
