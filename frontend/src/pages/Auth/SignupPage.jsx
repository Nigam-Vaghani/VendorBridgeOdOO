import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { signup } from '../../api/authApi';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { ROLES } from '../../utils/constants';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: ROLES.VENDOR,
    country: '',
    additionalInfo: ''
  });
  const [error, setError] = useState('');
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const countries = [
    "United States", "United Kingdom", "India", "Canada", "Australia", 
    "Germany", "France", "United Arab Emirates", "Saudi Arabia", "Singapore", "Japan"
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await signup(formData);
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
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-xl">
        <h1 className="text-3xl font-extrabold text-[#6322ef] mb-1 text-center">Registration Screen</h1>
        <p className="text-sm text-slate-500 mb-8 text-center">Create your new account</p>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        
        <div className="flex justify-center mb-10">
          <div className="w-32 h-32 rounded-full bg-[#f1f5f9] border border-[#cbd5e1] flex items-center justify-center overflow-hidden cursor-pointer hover:bg-slate-200 transition">
            <span className="text-sm text-slate-400 font-medium">Photo</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-sm font-bold text-[#334155] mb-2">First Name</label>
              <input 
                type="text" 
                name="firstName"
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#334155] mb-2">Last Name</label>
              <input 
                type="text" 
                name="lastName"
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-sm font-bold text-[#334155] mb-2">Email Address</label>
              <input 
                type="email" 
                name="email"
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#334155] mb-2">Phone Number</label>
              <input 
                type="text" 
                name="phoneNumber"
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-sm font-bold text-[#334155] mb-2">Password</label>
              <input 
                type="password" 
                name="password"
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#334155] mb-2">Role (Admin, Staff...)</label>
              <select 
                name="role"
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                value={formData.role}
                onChange={handleChange}
              >
                <option value={ROLES.VENDOR}>Vendor</option>
                <option value={ROLES.OFFICER}>Procurement Officer</option>
                <option value={ROLES.MANAGER}>Manager</option>
                <option value={ROLES.ADMIN}>Admin</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold text-[#334155] mb-2">Country</label>
            <select 
              name="country"
              className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
              value={formData.country}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select your country</option>
              {countries.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-bold text-[#334155] mb-2">Additional Information ....</label>
            <textarea 
              name="additionalInfo"
              rows="4"
              className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
              value={formData.additionalInfo}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="flex justify-center">
            <button 
              type="submit" 
              className="w-full bg-[#004643] text-white py-3 rounded-lg font-bold text-lg hover:bg-[#003331] transition-colors shadow-md"
            >
              Register
            </button>
          </div>
        </form>
        
        <div className="flex justify-center mt-6 text-sm">
          <span className="text-slate-500">Already have an account? <Link to="/login" className="text-[#6322ef] font-semibold">Log In</Link></span>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
