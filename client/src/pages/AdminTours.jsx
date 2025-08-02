import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { X, Plus } from "lucide-react";

export default function AdminTours() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingTour, setEditingTour] = useState(null);
  
  const { currentUser } = useSelector((state) => state.user);
  
  const [form, setForm] = useState({
    title: "",
    description: "",
    itinerary: "",
    price: "",
    location: "",
    duration_days: "",
    is_featured: false,
    created_by: currentUser?._id
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [message, setMessage] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const formRef = useRef();

  // Fetch tours from API
  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/tours", {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setTours(data.data);
      } else {
        console.error("Failed to fetch tours:", data.message);
      }
    } catch (error) {
      console.error("Error fetching tours:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleThumbnail = (e) => {
    setThumbnail(e.target.files[0]);
  };

  const handleGallery = (e) => {
    setGallery(Array.from(e.target.files));
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      itinerary: "",
      price: "",
      location: "",
      duration_days: "",
      is_featured: false,
      created_by: currentUser?._id
    });
    setThumbnail(null);
    setGallery([]);
    setMessage("");
    setEditingTour(null);
    if (formRef.current) {
      formRef.current.reset();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setFormLoading(true);

    const formData = new FormData();
    
    // Add form fields
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        formData.append(key, value);
      }
    });

    // Add current user ID if not already set
    if (!form.created_by && currentUser) {
      formData.append('created_by', currentUser._id || currentUser.id);
    }

    // Add thumbnail
    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }

    // Add gallery images
    if (gallery.length > 0) {
      gallery.forEach((file) => {
        formData.append("gallery", file);
      });
    }

    try {
      console.log('Submitting tour creation...');
      console.log('Current user:', currentUser);
      console.log('Form data entries:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const headers = {
        // Don't set Content-Type for FormData, let browser set it with boundary
      };

      // Add authorization header if user has token
      if (currentUser?.token) {
        headers.Authorization = `Bearer ${currentUser.token}`;
      }

      const res = await fetch("/api/tours", {
        method: "POST",
        credentials: 'include',
        headers: headers,
        body: formData,
      });
      
      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);
      
      if (data.success) {
        setMessage("✅ Tour created successfully!");
        resetForm();
        fetchTours(); // Refresh the tours list
        setTimeout(() => {
          setShowCreateForm(false);
          setMessage("");
        }, 2000);
      } else {
        setMessage("❌ Error: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error('Submit error:', err);
      setMessage("❌ Error: " + err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTour = async (tourId) => {
    if (!window.confirm("Are you sure you want to delete this tour?")) {
      return;
    }

    try {
      const response = await fetch(`/api/tours/${tourId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        fetchTours(); // Refresh the tours list
      } else {
        alert("Error deleting tour: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      alert("Error deleting tour: " + error.message);
    }
  };

  const handleEditTour = (tour) => {
    setEditingTour(tour);
    setForm({
      title: tour.title,
      description: tour.description,
      itinerary: tour.itinerary || "",
      price: tour.price.toString(),
      location: tour.location,
      duration_days: tour.duration_days.toString(),
      is_featured: tour.is_featured,
      created_by: tour.created_by
    });
    setThumbnail(null);
    setGallery([]);
    setMessage("");
    setShowEditForm(true);
  };

  const handleUpdateTour = async (e) => {
    e.preventDefault();
    setMessage("");
    setFormLoading(true);

    const formData = new FormData();
    
    // Add form fields
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        formData.append(key, value);
      }
    });

    // Add thumbnail if selected
    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }

    // Add gallery images if selected
    if (gallery.length > 0) {
      gallery.forEach((file) => {
        formData.append("gallery", file);
      });
    }

    try {
      console.log('Updating tour...');
      
      const headers = {};
      if (currentUser?.token) {
        headers.Authorization = `Bearer ${currentUser.token}`;
      }

      const res = await fetch(`/api/tours/${editingTour._id}`, {
        method: "PUT",
        credentials: 'include',
        headers: headers,
        body: formData,
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMessage("✅ Tour updated successfully!");
        fetchTours(); // Refresh the tours list
        setTimeout(() => {
          setShowEditForm(false);
          setEditingTour(null);
          resetForm();
          setMessage("");
        }, 2000);
      } else {
        setMessage("❌ Error: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error('Update error:', err);
      setMessage("❌ Error: " + err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const closeEditForm = () => {
    setShowEditForm(false);
    setEditingTour(null);
    resetForm();
    setMessage("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B47]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Manage Tours</h1>
        <p className="text-[#64748B] text-sm">
          Create, edit, and manage your tour offerings
        </p>
      </div>

      {/* Tours Table */}
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[#E8EEF7] overflow-hidden hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-300">
        <div className="px-6 py-4 border-b border-[#F1F5F9] bg-[#F8FAFC]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#0F172A]">
              All Tours ({tours.length})
            </h2>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-[#FF6B47] to-[#FF8B73] hover:from-[#E5533A] hover:to-[#FF6B47] text-white px-6 py-3 rounded-lg font-semibold shadow-[0_4px_16px_rgba(255,107,71,0.3)] hover:shadow-[0_6px_20px_rgba(255,107,71,0.4)] hover:-translate-y-0.5 transition-all duration-300 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Tour</span>
            </button>
          </div>
        </div>

        {tours.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tours yet</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first tour.</p>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-[#FF6B47] to-[#FF8B73] hover:from-[#E5533A] hover:to-[#FF6B47] text-white px-6 py-2 rounded-lg font-medium transition-all duration-300"
            >
              Create Your First Tour
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#F1F5F9]">
              <thead className="bg-[#F8FAFC]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                    Tour
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#F1F5F9]">
                {tours.map((tour) => (
                  <tr
                    key={tour._id || tour.id}
                    className="hover:bg-[#F8FAFC] transition-colors duration-200"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-[#0F172A]">
                            {tour.title}
                          </div>
                          {tour.is_featured && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#64748B]">
                        {tour.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-[#0F172A]">
                        ${tour.price}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#64748B]">
                        {tour.duration_days} days
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-[rgba(16,185,129,0.1)] text-[#10B981] border border-[rgba(16,185,129,0.2)]">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleEditTour(tour)}
                        className="text-[#FF6B47] hover:text-[#E5533A] font-medium transition-colors duration-200 mr-4"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteTour(tour._id || tour.id)}
                        className="text-red-600 hover:text-red-800 font-medium transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Tour Form Modal/Section */}
      {showCreateForm && (
        <div className="bg-white rounded-2xl shadow-lg border border-[#E8EEF7] p-6 mb-8 relative">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#0F172A]">Create New Tour</h2>
            <button
              onClick={() => {
                setShowCreateForm(false);
                resetForm();
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input 
                  name="title" 
                  type="text" 
                  value={form.title} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6B47] focus:border-transparent" 
                  required 
                  placeholder="Enter tour title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input 
                  name="location" 
                  type="text" 
                  value={form.location} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6B47] focus:border-transparent" 
                  required 
                  placeholder="Enter location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price ($) *
                </label>
                <input 
                  name="price" 
                  type="number" 
                  value={form.price} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6B47] focus:border-transparent" 
                  required 
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (days) *
                </label>
                <input 
                  name="duration_days" 
                  type="number" 
                  value={form.duration_days} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6B47] focus:border-transparent" 
                  required 
                  min="1"
                  placeholder="1"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea 
                name="description" 
                value={form.description} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6B47] focus:border-transparent" 
                required 
                rows="3"
                placeholder="Enter tour description"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Itinerary
              </label>
              <textarea 
                name="itinerary" 
                value={form.itinerary} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6B47] focus:border-transparent" 
                rows="4"
                placeholder="Day 1: Arrival&#10;Day 2: Activities&#10;Day 3: Departure"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input 
                  name="is_featured" 
                  type="checkbox" 
                  checked={form.is_featured} 
                  onChange={handleChange}
                  className="rounded border-gray-300 text-[#FF6B47] focus:ring-[#FF6B47]"
                />
                <span className="text-sm font-medium text-gray-700">Featured Tour</span>
              </label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail Image *
                </label>
                <input 
                  name="thumbnail" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleThumbnail} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6B47] focus:border-transparent" 
                  required 
                />
                <p className="text-xs text-gray-500 mt-1">Upload a main image for the tour</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gallery Images
                </label>
                <input 
                  name="gallery" 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleGallery} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6B47] focus:border-transparent" 
                />
                <p className="text-xs text-gray-500 mt-1">Upload additional images (optional)</p>
              </div>
            </div>
            
            <div className="flex space-x-4 pt-4">
              <button 
                type="submit" 
                disabled={formLoading}
                className="bg-gradient-to-r from-[#FF6B47] to-[#FF8B73] hover:from-[#E5533A] hover:to-[#FF6B47] text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formLoading ? "Creating..." : "Create Tour"}
              </button>
              <button 
                type="button" 
                onClick={resetForm}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Reset Form
              </button>
            </div>
          </form>
          
          {message && (
            <div className={`mt-4 p-3 rounded-lg text-center text-sm ${
              message.includes('✅') 
                ? 'bg-green-100 text-green-700 border border-green-300' 
                : 'bg-red-100 text-red-700 border border-red-300'
            }`}>
              {message}
            </div>
          )}
        </div>
      )}

      {/* Edit Tour Form Modal */}
      {showEditForm && (
        <div className="bg-white rounded-2xl shadow-lg border border-[#E8EEF7] p-6 mb-8 relative">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#0F172A]">Edit Tour</h2>
            <button
              onClick={closeEditForm}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <form ref={formRef} onSubmit={handleUpdateTour} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input 
                  name="title" 
                  type="text" 
                  value={form.title} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6B47] focus:border-transparent" 
                  required 
                  placeholder="Enter tour title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input 
                  name="location" 
                  type="text" 
                  value={form.location} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6B47] focus:border-transparent" 
                  required 
                  placeholder="Enter location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price ($) *
                </label>
                <input 
                  name="price" 
                  type="number" 
                  value={form.price} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6B47] focus:border-transparent" 
                  required 
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (days) *
                </label>
                <input 
                  name="duration_days" 
                  type="number" 
                  value={form.duration_days} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6B47] focus:border-transparent" 
                  required 
                  min="1"
                  placeholder="1"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea 
                name="description" 
                value={form.description} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6B47] focus:border-transparent" 
                required 
                rows="3"
                placeholder="Enter tour description"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Itinerary
              </label>
              <textarea 
                name="itinerary" 
                value={form.itinerary} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6B47] focus:border-transparent" 
                rows="4"
                placeholder="Day 1: Arrival&#10;Day 2: Activities&#10;Day 3: Departure"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input 
                  name="is_featured" 
                  type="checkbox" 
                  checked={form.is_featured} 
                  onChange={handleChange}
                  className="rounded border-gray-300 text-[#FF6B47] focus:ring-[#FF6B47]"
                />
                <span className="text-sm font-medium text-gray-700">Featured Tour</span>
              </label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail Image
                </label>
                <input 
                  name="thumbnail" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleThumbnail} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6B47] focus:border-transparent" 
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to keep current image</p>
                {editingTour?.thumbnail_url && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Current thumbnail:</p>
                    <img
                      src={editingTour.thumbnail_url}
                      alt="Current thumbnail"
                      className="w-20 h-20 object-cover rounded"
                    />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gallery Images
                </label>
                <input 
                  name="gallery" 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleGallery} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6B47] focus:border-transparent" 
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to keep current images</p>
                {editingTour?.gallery_urls && editingTour.gallery_urls.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Current gallery images:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {editingTour.gallery_urls.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Gallery ${index + 1}`}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex space-x-4 pt-4">
              <button 
                type="submit" 
                disabled={formLoading}
                className="bg-gradient-to-r from-[#FF6B47] to-[#FF8B73] hover:from-[#E5533A] hover:to-[#FF6B47] text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formLoading ? "Updating..." : "Update Tour"}
              </button>
              <button 
                type="button" 
                onClick={closeEditForm}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
          
          {message && (
            <div className={`mt-4 p-3 rounded-lg text-center text-sm ${
              message.includes('✅') 
                ? 'bg-green-100 text-green-700 border border-green-300' 
                : 'bg-red-100 text-red-700 border border-red-300'
            }`}>
              {message}
            </div>
          )}
        </div>
      )}

    </div>
  );
}