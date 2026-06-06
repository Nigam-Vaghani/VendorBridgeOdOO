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
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-blue-600 mb-1 text-center">Registration Screen</h1>
        <p className="text-sm text-slate-500 mb-6 text-center">Create your new account</p>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-slate-200 transition">
            <span className="text-sm text-slate-500 font-medium">Photo</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
              <input 
                type="text" 
                name="firstName"
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:border-blue-500"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
              <input 
                type="text" 
                name="lastName"
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:border-blue-500"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input 
                type="email" 
                name="email"
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:border-blue-500"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input 
                type="text" 
                name="phoneNumber"
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:border-blue-500"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                name="password"
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:border-blue-500"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Role (Admin, Staff...)</label>
              <select 
                name="role"
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:border-blue-500"
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
            <input 
              type="text" 
              name="country"
              className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:border-blue-500"
              value={formData.country}
              onChange={handleChange}
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Additional Information ....</label>
            <textarea 
              name="additionalInfo"
              rows="3"
              className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:border-blue-500"
              value={formData.additionalInfo}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="flex justify-center">
            <Button type="submit" className="w-1/2">Register</Button>
          </div>
        </form>
        
        <div className="flex justify-center mt-6 text-sm text-slate-600">
          <span>Already have an account? <Link to="/login" className="text-blue-600">Log In</Link></span>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
