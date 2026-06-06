import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createVendor, updateVendor, getVendorById } from '../../api/vendorApi';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';

const VendorForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    gst_number: '',
    pan_number: '',
    contact_person: '',
    email: '',
    phone: '',
    website: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    status: 'active'
  });

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEdit) {
      const fetchVendor = async () => {
        try {
          const res = await getVendorById(id);
          if (res.success) {
            // Only pick the editable form fields
            const d = res.data;
            setFormData({
              name: d.name || '',
              category: d.category || '',
              gst_number: d.gst_number || '',
              pan_number: d.pan_number || '',
              contact_person: d.contact_person || '',
              email: d.email || '',
              phone: d.phone || '',
              website: d.website || '',
              address_line1: d.address_line1 || '',
              address_line2: d.address_line2 || '',
              city: d.city || '',
              state: d.state || '',
              pincode: d.pincode || '',
              country: d.country || 'India',
              status: d.status || 'active',
            });
          }
        } catch (err) {
          setError('Failed to load vendor data');
        } finally {
          setLoading(false);
        }
      };
      fetchVendor();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Filter out empty strings for optional fields in GST/PAN to avoid regex mismatch if provided empty
    const submissionData = { ...formData };
    if (!submissionData.gst_number) delete submissionData.gst_number;
    if (!submissionData.pan_number) delete submissionData.pan_number;

    try {
      if (isEdit) {
        await updateVendor(id, submissionData);
      } else {
        await createVendor(submissionData);
      }
      navigate('/vendors');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save vendor');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center"><Spinner /></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">
        {isEdit ? 'Edit Vendor' : 'Add New Vendor'}
      </h1>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded">
            {typeof error === 'string' ? error : JSON.stringify(error)}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-700 border-b pb-2">Business Details</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#6322ef]/20"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                <input
                  type="text"
                  name="category"
                  required
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#6322ef]/20"
                  value={formData.category}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">GST Number</label>
                <input
                  type="text"
                  name="gst_number"
                  placeholder="e.g. 27AABCU9603R1ZM"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#6322ef]/20"
                  value={formData.gst_number || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">PAN Number</label>
                <input
                  type="text"
                  name="pan_number"
                  placeholder="e.g. AABCU9603R"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#6322ef]/20"
                  value={formData.pan_number || ''}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-slate-700 border-b pb-2">Contact Details</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person *</label>
                <input
                  type="text"
                  name="contact_person"
                  required
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#6322ef]/20"
                  value={formData.contact_person}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Business Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#6322ef]/20"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="text"
                  name="phone"
                  required
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#6322ef]/20"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
                <input
                  type="text"
                  name="website"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#6322ef]/20"
                  value={formData.website || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-slate-700 border-b pb-2">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <input
                  type="text"
                  name="address_line1"
                  placeholder="Address Line 1"
                  className="w-full p-2 border border-slate-300 rounded"
                  value={formData.address_line1 || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="md:col-span-2">
                <input
                  type="text"
                  name="address_line2"
                  placeholder="Address Line 2"
                  className="w-full p-2 border border-slate-300 rounded"
                  value={formData.address_line2 || ''}
                  onChange={handleChange}
                />
              </div>
              <input
                type="text"
                name="city"
                placeholder="City"
                className="p-2 border border-slate-300 rounded"
                value={formData.city || ''}
                onChange={handleChange}
              />
              <input
                type="text"
                name="state"
                placeholder="State"
                className="p-2 border border-slate-300 rounded"
                value={formData.state || ''}
                onChange={handleChange}
              />
              <input
                type="text"
                name="pincode"
                placeholder="Pincode"
                className="p-2 border border-slate-300 rounded"
                value={formData.pincode || ''}
                onChange={handleChange}
              />
              <input
                type="text"
                name="country"
                placeholder="Country"
                className="p-2 border border-slate-300 rounded"
                value={formData.country}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" type="button" onClick={() => navigate('/vendors')}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Spinner size="sm" /> : (isEdit ? 'Update Vendor' : 'Create Vendor')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorForm;
