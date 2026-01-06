'use client';
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    ArrowLeft, Edit2, Save, Mail, Phone, Briefcase, MapPin, Globe,
    AlertCircle, CheckCircle, Loader, Building
} from 'lucide-react';

export default function UserDetailsEdit() {
    const { id } = useParams();
    const [formData, setFormData] = useState(null);
    const [originalData, setOriginalData] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const [saveStatus, setSaveStatus] = useState('');
    const [isValidatingEmail, setIsValidatingEmail] = useState(false);
    const [emailValidationResult, setEmailValidationResult] = useState('');

    // ---------- fetch user ----------
    const fetchUserData = async (userId) => {
        try {
            const res = await fetch(`http://localhost:5000/users/${userId}`);
            if (!res.ok) throw new Error('Failed to fetch user');
            return await res.json();
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    useEffect(() => {
        const loadUser = async () => {
            setIsLoading(true);
            try {
                const data = await fetchUserData(id);
                setFormData(data);
                setOriginalData(data);
            } catch (err) {
                setSaveStatus('Failed to load user data');
            } finally {
                setIsLoading(false);
            }
        };
        if (id) loadUser();
    }, [id]);

    // ---------- handlers ----------
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setIsDirty(true);
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            address: { ...prev.address, [name]: value }
        }));
        setIsDirty(true);
        if (name === 'city' && errors.addressCity) setErrors(prev => ({ ...prev, addressCity: '' }));
    };

    const handleGeoChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            address: { ...prev.address, geo: { ...prev.address.geo, [field]: value } }
        }));
        setIsDirty(true);
    };

    const handleCompanyChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            company: { ...prev.company, [field]: value }
        }));
        setIsDirty(true);
    };

    const validateEmailAsync = async (email) => {
        if (email === originalData.email) {
            setEmailValidationResult('success');
            return;
        }
        setIsValidatingEmail(true);
        setEmailValidationResult('');
        await new Promise(resolve => setTimeout(resolve, 1000));
        const existingEmails = ['admin@example.com', 'test@example.com'];
        if (existingEmails.includes(email.toLowerCase())) {
            setEmailValidationResult('error');
            setErrors(prev => ({ ...prev, email: 'This email is already registered' }));
        } else {
            setEmailValidationResult('success');
        }
        setIsValidatingEmail(false);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name?.trim()) newErrors.name = 'Name is required';
        if (!formData.username?.trim()) newErrors.username = 'Username is required';
        if (!formData.email?.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.phone?.trim()) newErrors.phone = 'Phone is required';
        if (!formData.address?.city?.trim()) newErrors.addressCity = 'City is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            setSaveStatus('Please fix all errors');
            setTimeout(() => setSaveStatus(''), 3000);
            return;
        }
        if (emailValidationResult === 'error') {
            setSaveStatus('Fix email validation errors');
            setTimeout(() => setSaveStatus(''), 3000);
            return;
        }
        setIsSaving(true);
        try {
            const res = await fetch(`http://localhost:5000/users/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (!res.ok) throw new Error('Failed to save changes');
            setOriginalData(formData);
            setIsDirty(false);
            setIsEditMode(false);
            setSaveStatus('Changes saved successfully!');
            setTimeout(() => setSaveStatus(''), 3000);
        } catch (err) {
            console.error(err);
            setSaveStatus('Failed to save changes');
            setTimeout(() => setSaveStatus(''), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        if (isDirty && !window.confirm('You have unsaved changes. Cancel anyway?')) return;
        setFormData(originalData);
        setIsEditMode(false);
        setIsDirty(false);
        setErrors({});
        setEmailValidationResult('');
    };

    const handleEditClick = () => setIsEditMode(true);

    // ---------- loaders ----------
    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader className="animate-spin text-blue-600" size={48} />
        </div>
    );

    if (!formData) return (
        <div className="min-h-screen flex items-center justify-center text-red-600">
            <AlertCircle size={48} />
            <p>User not found</p>
        </div>
    );

    // ---------- jsx ----------
    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 pb-12">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to={"/"} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <ArrowLeft size={20} className="text-slate-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{isEditMode ? 'Edit User' : 'User Details'}</h1>
                            <p className="text-sm text-slate-600">{isEditMode ? 'Update user information' : 'View user information'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {isDirty && isEditMode && (
                            <span className="text-xs text-amber-600 flex items-center gap-1">
                                <AlertCircle size={14} /> Unsaved changes
                            </span>
                        )}
                        {!isEditMode && (
                            <button onClick={handleEditClick} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
                                <Edit2 size={18} /> Edit User
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Status Message */}
            {saveStatus && (
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                    <div className={`p-3 rounded-lg flex items-center gap-2 ${saveStatus.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        <CheckCircle size={16} /> {saveStatus}
                    </div>
                </div>
            )}

            {/* Profile & Form */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                {/* Profile Header */}
                {!isEditMode && (
                    <div className="bg-linear-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 mb-6 text-white">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-xl border-4 border-white/30">
                                {formData.avatar || formData.name[0]}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-3xl font-bold mb-2">{formData.name}</h2>
                                <p className="text-lg text-white/90 mb-3">@{formData.username}</p>
                                <div className="flex flex-wrap items-center gap-4 text-white/90">
                                    <div className="flex items-center gap-2"><Mail size={16} /> {formData.email}</div>
                                    <div className="flex items-center gap-2"><Phone size={16} /> {formData.phone}</div>
                                    <div className="flex items-center gap-2"><Globe size={16} /> {formData.website}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Basic Info */}
                <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 mb-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2"><Briefcase size={20} className="text-blue-600" /> Basic Information</h3>
                    <div className={!isEditMode ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
                        {isEditMode ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Name <span className="text-red-500">*</span></label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-slate-300'}`} />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Username <span className="text-red-500">*</span></label>
                                    <input type="text" name="username" value={formData.username} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.username ? 'border-red-500' : 'border-slate-300'}`} />
                                    {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Email <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} onBlur={(e) => { if (e.target.value && /\S+@\S+\.\S+/.test(e.target.value)) validateEmailAsync(e.target.value) }} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-slate-300'}`} />
                                        {isValidatingEmail && <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin text-blue-500" size={18} />}
                                        {!isValidatingEmail && emailValidationResult === 'success' && <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" size={18} />}
                                        {!isValidatingEmail && emailValidationResult === 'error' && <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500" size={18} />}
                                    </div>
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Phone <span className="text-red-500">*</span></label>
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-500' : 'border-slate-300'}`} />
                                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Website</label>
                                    <input type="text" name="website" value={formData.website || ''} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </>
                        ) : (
                            <>
                                <div><label className="text-sm font-medium text-slate-500">Name</label><p className="text-lg text-slate-900 font-medium">{formData.name}</p></div>
                                <div><label className="text-sm font-medium text-slate-500">Username</label><p className="text-lg text-slate-900 font-medium">{formData.username}</p></div>
                                <div><label className="text-sm font-medium text-slate-500">Email</label><p className="text-lg text-slate-900">{formData.email}</p></div>
                                <div><label className="text-sm font-medium text-slate-500">Phone</label><p className="text-lg text-slate-900">{formData.phone}</p></div>
                                <div className="md:col-span-2"><label className="text-sm font-medium text-slate-500">Website</label><p className="text-lg text-slate-900">{formData.website || 'Not provided'}</p></div>
                            </>
                        )}
                    </div>
                </div>

                {/* Address Information */}
                <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 mb-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2"><MapPin size={20} className="text-green-600" /> Address Information</h3>
                    {!isEditMode ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2"><label className="text-sm font-medium text-slate-500">Street Address</label><p className="text-lg text-slate-900">{formData.address.street || 'Not provided'}</p></div>
                            <div className="md:col-span-2"><label className="text-sm font-medium text-slate-500">Suite/Apt</label><p className="text-lg text-slate-900">{formData.address.suite || 'Not provided'}</p></div>
                            <div><label className="text-sm font-medium text-slate-500">City</label><p className="text-lg text-slate-900">{formData.address.city}</p></div>
                            <div><label className="text-sm font-medium text-slate-500">Zipcode</label><p className="text-lg text-slate-900">{formData.address.zipcode || 'Not provided'}</p></div>
                            <div><label className="text-sm font-medium text-slate-500">Latitude</label><p className="text-lg text-slate-900">{formData.address.geo?.lat || 'Not provided'}</p></div>
                            <div><label className="text-sm font-medium text-slate-500">Longitude</label><p className="text-lg text-slate-900">{formData.address.geo?.lng || 'Not provided'}</p></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-700 mb-2">Street</label><input type="text" name="street" value={formData.address.street} onChange={handleAddressChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                            <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-700 mb-2">Suite/Apt</label><input type="text" name="suite" value={formData.address.suite || ''} onChange={handleAddressChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                            <div><label className="block text-sm font-medium text-slate-700 mb-2">City <span className="text-red-500">*</span></label><input type="text" name="city" value={formData.address.city} onChange={handleAddressChange} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.addressCity ? 'border-red-500' : 'border-slate-300'}`} />{errors.addressCity && <p className="text-red-500 text-xs mt-1">{errors.addressCity}</p>}</div>
                            <div><label className="block text-sm font-medium text-slate-700 mb-2">Zipcode</label><input type="text" name="zipcode" value={formData.address.zipcode || ''} onChange={handleAddressChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                            <div className="md:col-span-2"><div className="p-4 bg-slate-50 rounded-lg border border-slate-200"><h4 className="text-sm font-semibold text-slate-700 mb-3">Geo Coordinates</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-xs font-medium text-slate-600 mb-1">Latitude</label><input type="number" step="any" value={formData.address.geo?.lat || ''} onChange={(e) => handleGeoChange('lat', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" /></div><div><label className="block text-xs font-medium text-slate-600 mb-1">Longitude</label><input type="number" step="any" value={formData.address.geo?.lng || ''} onChange={(e) => handleGeoChange('lng', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" /></div></div></div></div>
                        </div>
                    )}
                </div>

                {/* Company Information */}
                <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 mb-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2"><Building size={20} className="text-purple-600" /> Company Information</h3>
                    {!isEditMode ? (
                        <div className="grid grid-cols-1 gap-6">
                            <div><label className="text-sm font-medium text-slate-500">Company Name</label><p className="text-lg text-slate-900 font-medium">{formData.company.name || 'Not provided'}</p></div>
                            <div><label className="text-sm font-medium text-slate-500">Catch Phrase</label><p className="text-lg text-slate-900">{formData.company.catchPhrase || 'Not provided'}</p></div>
                            <div><label className="text-sm font-medium text-slate-500">Business Strategy</label><p className="text-lg text-slate-900">{formData.company.bs || 'Not provided'}</p></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            <div><label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label><input type="text" value={formData.company.name} onChange={(e) => handleCompanyChange('name', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                            <div><label className="block text-sm font-medium text-slate-700 mb-2">Catch Phrase</label><input type="text" value={formData.company.catchPhrase} onChange={(e) => handleCompanyChange('catchPhrase', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                            <div><label className="block text-sm font-medium text-slate-700 mb-2">Business Strategy</label><input type="text" value={formData.company.bs} onChange={(e) => handleCompanyChange('bs', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                {isEditMode && (
                    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4 sticky bottom-4">
                        <div className="flex gap-4 justify-end">
                            <button type="button" onClick={handleCancelEdit} className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium">Cancel</button>
                            <button type="button" onClick={handleSave} disabled={isSaving} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                {isSaving ? <><Loader className="animate-spin" size={18} /> Saving...</> : <><Save size={18} /> Save Changes</>}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}