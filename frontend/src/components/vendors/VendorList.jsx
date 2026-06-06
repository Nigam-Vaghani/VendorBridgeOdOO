import React, { useState, useEffect, useRef } from 'react';
import { getVendors, deleteVendor } from '../../api/vendorApi';
import { Edit, Trash2, Eye, Plus, Search, Filter, X, ChevronDown } from 'lucide-react';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { useNavigate } from 'react-router-dom';

const STATUS_OPTIONS = ['all', 'active', 'inactive', 'pending', 'blacklisted'];

const VendorList = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const filterRef = useRef(null);
  const navigate = useNavigate();

  const fetchVendors = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit: 10,
        ...(searchTerm && { q: searchTerm }),
        ...(statusFilter && statusFilter !== 'all' && { status: statusFilter }),
        ...(categoryFilter && { category: categoryFilter }),
      };
      const res = await getVendors(params);
      if (res.success) {
        setVendors(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      setError('Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, categoryFilter]);

  // Close filter panel on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilterPanel(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this vendor?')) {
      try {
        await deleteVendor(id);
        fetchVendors(pagination.page);
      } catch (err) {
        alert('Failed to delete vendor');
      }
    }
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setCategoryFilter('');
    setSearchTerm('');
  };

  const hasActiveFilters = statusFilter !== 'all' || categoryFilter || searchTerm;

  const getStatusStyle = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border border-green-200';
      case 'inactive': return 'bg-red-100 text-red-700 border border-red-200';
      case 'blacklisted': return 'bg-gray-800 text-gray-100 border border-gray-700';
      default: return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
    }
  };

  if (loading && vendors.length === 0) return <div className="p-10 text-center"><Spinner /></div>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Vendors</h1>
          {pagination.total > 0 && (
            <p className="text-sm text-slate-500 mt-0.5">{pagination.total} vendors total</p>
          )}
        </div>
        <Button onClick={() => navigate('/vendors/new')}>
          <Plus size={16} className="mr-1.5" /> Add Vendor
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-visible">
        {/* Search + Filter Bar */}
        <div className="p-4 border-b border-slate-200 flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              id="vendor-search"
              placeholder="Search by name, email, contact, GST..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#6322ef]/20 focus:border-[#6322ef]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter button with dropdown */}
          <div className="relative" ref={filterRef}>
            <Button
              variant={hasActiveFilters ? 'default' : 'secondary'}
              onClick={() => setShowFilterPanel((v) => !v)}
            >
              <Filter size={15} className="mr-1.5" />
              Filter
              {hasActiveFilters && (
                <span className="ml-1.5 bg-white/30 rounded-full text-[10px] font-bold px-1.5 py-0.5">
                  ON
                </span>
              )}
              <ChevronDown size={13} className={`ml-1 transition-transform ${showFilterPanel ? 'rotate-180' : ''}`} />
            </Button>

            {showFilterPanel && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-700">Filter Vendors</span>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Status filter */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase mb-1.5">Status</label>
                  <div className="flex flex-wrap gap-1.5">
                    {STATUS_OPTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all capitalize ${
                          statusFilter === s
                            ? 'bg-[#6322ef] text-white border-[#6322ef]'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-[#6322ef]/50'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category filter */}
                <div>
                  <label htmlFor="category-filter" className="block text-xs font-medium text-slate-500 uppercase mb-1.5">
                    Category
                  </label>
                  <input
                    id="category-filter"
                    type="text"
                    placeholder="e.g. IT, Logistics..."
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#6322ef]/20 focus:border-[#6322ef]"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  />
                </div>

                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => setShowFilterPanel(false)}
                >
                  Apply Filters
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-3">Vendor Name</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Rating</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Spinner />
                  </td>
                </tr>
              ) : vendors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Filter size={32} className="opacity-30" />
                      <p className="text-sm font-medium">No vendors found</p>
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="text-xs text-[#6322ef] hover:underline"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                vendors.map((vendor) => (
                  <tr
                    key={vendor.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{vendor.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{vendor.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{vendor.category}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="font-medium">{vendor.contact_person}</div>
                      <div className="text-xs text-slate-400">{vendor.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusStyle(vendor.status)}`}>
                        {vendor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                      ⭐ {parseFloat(vendor.rating || 0).toFixed(1)}
                      <span className="font-normal text-slate-400"> / 5.0</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end items-center gap-1">
                        <button
                          id={`view-vendor-${vendor.id}`}
                          title="View details"
                          onClick={() => navigate(`/vendors/${vendor.id}`)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-[#6322ef] hover:bg-[#6322ef]/10 transition-all"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          id={`edit-vendor-${vendor.id}`}
                          title="Edit vendor"
                          onClick={() => navigate(`/vendors/${vendor.id}/edit`)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          id={`delete-vendor-${vendor.id}`}
                          title="Deactivate vendor"
                          onClick={() => handleDelete(vendor.id)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-slate-200 flex justify-between items-center text-sm">
            <div className="text-slate-500">
              Page {pagination.page} of {pagination.pages} ({pagination.total} total)
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => fetchVendors(pagination.page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page === pagination.pages}
                onClick={() => fetchVendors(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorList;
