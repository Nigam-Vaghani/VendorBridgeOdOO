import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVendorById, uploadVendorDocument, deleteVendorDocument } from '../../api/vendorApi';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { FileText, Download, Trash2, Plus, ArrowLeft, ExternalLink, Edit } from 'lucide-react';

const VendorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVendor = async () => {
    try {
      setLoading(true);
      const res = await getVendorById(id);
      if (res.success) {
        setVendor(res.data);
      }
    } catch (err) {
      setError('Failed to load vendor details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendor();
  }, [id]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const docType = prompt('Enter document type (gst_certificate, pan_card, registration_certificate, other):', 'other');
    if (!docType) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_type', docType);

    try {
      setUploading(true);
      await uploadVendorDocument(id, formData);
      fetchVendor();
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (window.confirm('Delete this document?')) {
      try {
        await deleteVendorDocument(id, docId);
        fetchVendor();
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  if (loading) return <div className="p-10 text-center"><Spinner /></div>;
  if (error || !vendor) return <div className="p-10 text-center text-red-500">{error || 'Vendor not found'}</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/vendors')}
          className="flex items-center text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft size={18} className="mr-2" /> Back to Vendors
        </button>
        <Button onClick={() => navigate(`/vendors/${id}/edit`)}>
          <Edit size={15} className="mr-1.5" /> Edit Vendor
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{vendor.name}</h1>
                <p className="text-slate-500">{vendor.category} • {vendor.city}, {vendor.country}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#6322ef]">{parseFloat(vendor.rating || 0).toFixed(1)}</div>
                <div className="text-xs text-slate-400 uppercase font-semibold">Vendor Rating</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-6 border-y border-slate-100">
              <div>
                <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Status</div>
                <div className="capitalize font-medium">{vendor.status}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Total Orders</div>
                <div className="font-medium">{vendor.total_orders}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 uppercase font-semibold mb-1">On-Time Delivery</div>
                <div className="font-medium">{parseFloat(vendor.on_time_delivery_pct || 0).toFixed(1)}%</div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-3">Contact Information</h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <p><span className="font-medium text-slate-800">Person:</span> {vendor.contact_person}</p>
                  <p><span className="font-medium text-slate-800">Email:</span> {vendor.email}</p>
                  <p><span className="font-medium text-slate-800">Phone:</span> {vendor.phone}</p>
                  {vendor.website && (
                    <p>
                      <span className="font-medium text-slate-800">Website:</span> 
                      <a href={vendor.website} target="_blank" rel="noreferrer" className="ml-1 text-[#6322ef] hover:underline flex inline-flex items-center">
                        {vendor.website} <ExternalLink size={12} className="ml-1" />
                      </a>
                    </p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-3">Tax Information</h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <p><span className="font-medium text-slate-800">GST:</span> {vendor.gst_number || 'N/A'}</p>
                  <p><span className="font-medium text-slate-800">PAN:</span> {vendor.pan_number || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Summary (Placeholder) */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-lg font-bold text-slate-800">Recent Performance</h2>
               <Button variant="secondary" size="sm" onClick={() => navigate(`/vendors/${id}/performance`)}>
                 Full Report
               </Button>
             </div>
             <p className="text-slate-500 text-sm">Performance metrics and order history summary will appear here.</p>
          </div>
        </div>

        {/* Sidebar: Documents */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800">Documents</h2>
              <label className="cursor-pointer text-[#6322ef] hover:text-[#501cc3] transition">
                <Plus size={20} />
                <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
              </label>
            </div>

            <div className="space-y-3">
              {vendor.documents?.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                      <FileText size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900 truncate max-w-[150px]">{doc.file_name}</div>
                      <div className="text-[10px] text-slate-400 uppercase">{doc.doc_type.replace('_', ' ')}</div>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <a 
                      href={doc.file_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="p-1 text-slate-400 hover:text-blue-500"
                    >
                      <Download size={14} />
                    </a>
                    <button 
                      onClick={() => handleDeleteDoc(doc.id)}
                      className="p-1 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {(!vendor.documents || vendor.documents.length === 0) && (
                <div className="text-center py-6 text-slate-400 text-sm">No documents uploaded</div>
              )}
              {uploading && <div className="text-center py-2"><Spinner size="sm" /></div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDetail;
