import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, FileText, ArrowLeft, X, Plus, Trash2, AlertCircle, CheckCircle, Loader } from 'lucide-react';

export default function UserCreationForm() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    website: '',
    address: {
      street: '',
      suite: '',
      city: '',
      zipcode: '',
      geo: { lat: '', lng: '' }
    },
    company: {
      name: '',
      catchPhrase: '',
      bs: ''
    }
  });

  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);
  const [emailValidationResult, setEmailValidationResult] = useState('');
  const [lastSaved, setLastSaved] = useState(null);

  /* ---------- autosave ---------- */
  useEffect(() => {
    if (!isDirty) return;
    const t = setTimeout(() => handleSaveDraft(), 3000);
    return () => clearTimeout(t);
  }, [formData, isDirty]);

  /* ---------- default dataset ---------- */
  const loadDefaultDataset = () => {
    setFormData({
      name: 'Leanne Graham',
      username: 'Bret',
      email: 'Sincere@april.biz',
      phone: '1-770-736-8031 x56442',
      website: 'hildegard.org',
      address: {
        street: 'Kulas Light',
        suite: 'Apt. 556',
        city: 'Gwenborough',
        zipcode: '92998-3874',
        geo: { lat: '-37.3159', lng: '81.1496' }
      },
      company: {
        name: 'Romaguera-Crona',
        catchPhrase: 'Multi-layered client-server neural-net',
        bs: 'harness real-time e-markets'
      }
    });
    setIsDirty(true);
    setSaveStatus('Default dataset loaded');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  /* ---------- change handlers ---------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setIsDirty(true);
    if (errors[name]) setErrors((x) => ({ ...x, [name]: '' }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, address: { ...p.address, [name]: value } }));
    setIsDirty(true);
  };

  const handleGeoChange = (field, value) => {
    setFormData((p) => ({
      ...p,
      address: { ...p.address, geo: { ...p.address.geo, [field]: value } }
    }));
    setIsDirty(true);
  };

  const handleCompanyChange = (field, value) => {
    setFormData((p) => ({
      ...p,
      company: { ...p.company, [field]: value }
    }));
    setIsDirty(true);
  };

  /* ---------- async email ---------- */
  const validateEmailAsync = async (email) => {
    setIsValidatingEmail(true);
    setEmailValidationResult('');
    await new Promise((r) => setTimeout(r, 1500));
    const exist = ['admin@example.com', 'test@example.com'];
    if (exist.includes(email.toLowerCase())) {
      setEmailValidationResult('error');
      setErrors((x) => ({ ...x, email: 'This email is already registered' }));
    } else {
      setEmailValidationResult('success');
    }
    setIsValidatingEmail(false);
  };

  /* ---------- validation ---------- */
  const validateForm = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Required';
    if (!formData.username.trim()) e.username = 'Required';
    if (!formData.email.trim()) e.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Invalid email';
    if (!formData.phone.trim()) e.phone = 'Required';
    if (!formData.address.city.trim()) e.addressCity = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ---------- actions ---------- */
  const handleSaveDraft = () => {
    console.log('Draft saved', formData);
    setLastSaved(new Date().toLocaleTimeString());
    setSaveStatus('Draft saved');
    setIsDirty(false);
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleReset = () => {
    if (!window.confirm('Reset? Unsaved changes will be lost.')) return;
    setFormData({
      name: '',
      username: '',
      email: '',
      phone: '',
      website: '',
      address: { street: '', suite: '', city: '', zipcode: '', geo: { lat: '', lng: '' } },
      company: { name: '', catchPhrase: '', bs: '' }
    });
    setErrors({});
    setIsDirty(false);
    setEmailValidationResult('');
    setSaveStatus('Form reset');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setSaveStatus('Please fix all errors');
      setTimeout(() => setSaveStatus(''), 3000);
      return;
    }
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 2000));
    console.log('Submitted', formData);
    setSaveStatus('User created successfully!');
    setIsSaving(false);
    setIsDirty(false);
    setTimeout(() => {
      alert('User created! Redirecting to list...');
    }, 1000);
  };

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 pb-12">
      {/* header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <ArrowLeft size={20} className="text-slate-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Create New User</h1>
                <p className="text-sm text-slate-600">Fill in the details to add a new user</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isDirty && (
                <span className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  Unsaved changes
                </span>
              )}
              {lastSaved && <span className="text-xs text-slate-500">Last saved: {lastSaved}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* status bar */}
      {saveStatus && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div
            className={`p-3 rounded-lg flex items-center gap-2 ${saveStatus.includes('success') || saveStatus.includes('saved') || saveStatus.includes('loaded')
                ? 'bg-green-50 text-green-700 border border-green-200'
                : saveStatus.includes('error') || saveStatus.includes('fix')
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
          >
            <CheckCircle size={16} />
            {saveStatus}
          </div>
        </div>
      )}

      {/* action buttons */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={loadDefaultDataset}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            Load Default Dataset
          </button>
          <button
            onClick={handleSaveDraft}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <FileText size={16} />
            Save Draft
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Reset Form
          </button>
        </div>
      </div>

      {/* form */}
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* basic info */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-slate-300'
                  }`}
                placeholder="Enter full name"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* username */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.username ? 'border-red-500' : 'border-slate-300'
                  }`}
                placeholder="Enter username"
              />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>

            {/* email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={(e) => {
                    if (e.target.value && /\S+@\S+\.\S+/.test(e.target.value)) validateEmailAsync(e.target.value);
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-slate-300'
                    }`}
                  placeholder="Enter email address"
                />
                {isValidatingEmail && <Loader className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-blue-500" size={18} />}
                {!isValidatingEmail && emailValidationResult === 'success' && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" size={18} />
                )}
                {!isValidatingEmail && emailValidationResult === 'error' && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" size={18} />
                )}
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              {isValidatingEmail && <p className="text-blue-500 text-xs mt-1">Checking email availability...</p>}
            </div>

            {/* phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-500' : 'border-slate-300'
                  }`}
                placeholder="1-770-736-8031 x56442"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* website */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Website</label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="hildegard.org"
              />
            </div>


          </div>
        </div>

        {/* address with geo deep nested */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Address Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* street */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Street</label>
              <input
                type="text"
                name="street"
                value={formData.address.street}
                onChange={handleAddressChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Kulas Light"
              />
            </div>

            {/* suite */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Suite / Apt.</label>
              <input
                type="text"
                name="suite"
                value={formData.address.suite || ''}
                onChange={handleAddressChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Apt. 556"
              />
            </div>

            {/* city */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.address.city}
                onChange={handleAddressChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.addressCity ? 'border-red-500' : 'border-slate-300'
                  }`}
                placeholder="Gwenborough"
              />
              {errors.addressCity && <p className="text-red-500 text-xs mt-1">{errors.addressCity}</p>}
            </div>

            {/* zipcode */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">ZIP / Postcode</label>
              <input
                type="text"
                name="zipcode"
                value={formData.address.zipcode || ''}
                onChange={handleAddressChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="92998-3874"
              />
            </div>

            {/* geo deep nested */}
            <div className="md:col-span-2">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Geo Coordinates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.address.geo?.lat || ''}
                      onChange={(e) => handleGeoChange('lat', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="-37.3159"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.address.geo?.lng || ''}
                      onChange={(e) => handleGeoChange('lng', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="81.1496"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* company info */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Company Information</h2>
          <div className="grid grid-cols-1 gap-4">
            {/* company name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
              <input
                type="text"
                value={formData.company.name}
                onChange={(e) => handleCompanyChange('name', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Romaguera-Crona"
              />
            </div>

            {/* catchPhrase */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Catch Phrase</label>
              <input
                type="text"
                value={formData.company.catchPhrase}
                onChange={(e) => handleCompanyChange('catchPhrase', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Multi-layered client-server neural-net"
              />
            </div>

            {/* bs */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Business Strategy</label>
              <input
                type="text"
                value={formData.company.bs}
                onChange={(e) => handleCompanyChange('bs', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="harness real-time e-markets"
              />
            </div>
          </div>
        </div>

        {/* submit */}
        <div className="flex gap-4 justify-end sticky bottom-0 bg-white p-4 rounded-xl shadow-lg border border-slate-200">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving && <Loader className="animate-spin" size={16} />}
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}