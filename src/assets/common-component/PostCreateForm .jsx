'use client';

import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, FileText, ArrowLeft, AlertCircle, CheckCircle, Loader, Image } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import apiService from '../service/ApiService';
import { ENDPOINTS } from '../service/Endpoints';

export default function PostCreateForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        userName: 'Enamul Hoque',
        date: new Date().toISOString().split('T')[0],
        photo: '',
        title: '',
        body: ''
    });

    const [errors, setErrors] = useState({});
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState('');
    const [lastSaved, setLastSaved] = useState(null);

    // ---------- Load post data for edit mode ----------
    useEffect(() => {
        if (isEditMode) fetchPost();
    }, [id]);

    const fetchPost = async () => {
        setIsLoading(true);
        try {
            const response = await apiService.getById(ENDPOINTS.POSTS, id);
            setFormData({
                userName: response.data.userName || 'Enamul Hoque',
                date: response.data.date || new Date().toISOString().split('T')[0],
                photo: response.data.photo || '',
                title: response.data.title || '',
                body: response.data.body || ''
            });
        } catch (error) {
            console.error('Error fetching post:', error);
            setSaveStatus('Error loading post data');
            setTimeout(() => setSaveStatus(''), 3000);
        } finally {
            setIsLoading(false);
        }
    };

    // ---------- Auto-save ----------
    useEffect(() => {
        if (!isDirty || isEditMode) return;
        const t = setTimeout(() => handleSaveDraft(), 3000);
        return () => clearTimeout(t);
    }, [formData, isDirty]);

    // ---------- Load default dataset ----------
    const loadDefaultDataset = () => {
        setFormData({
            userName: 'Enamul Hoque',
            date: new Date().toISOString().split('T')[0],
            photo: 'https://picsum.photos/800/400',
            title: 'Amazing React Component Design',
            body: 'This is a comprehensive guide to building modern React applications with beautiful UI components. Learn how to create scalable and maintainable code that follows best practices and industry standards.'
        });
        setIsDirty(true);
        setSaveStatus('Default dataset loaded');
        setTimeout(() => setSaveStatus(''), 3000);
    };

    // ---------- Change handlers ----------
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((p) => ({ ...p, [name]: value }));
        setIsDirty(true);
        if (errors[name]) setErrors((x) => ({ ...x, [name]: '' }));
    };

    // ---------- Validation ----------
    const validateForm = () => {
        const e = {};
        if (!formData.title.trim()) e.title = 'Title is required';
        if (!formData.body.trim()) e.body = 'Body content is required';
        if (!formData.userName.trim()) e.userName = 'User name is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    // ---------- Actions ----------
    const handleSaveDraft = () => {
        console.log('Draft saved', formData);
        setLastSaved(new Date().toLocaleTimeString());
        setSaveStatus('Draft saved');
        setIsDirty(false);
        setTimeout(() => setSaveStatus(''), 1000);
    };

    const handleReset = () => {
        if (!window.confirm('Reset? Unsaved changes will be lost.')) return;
        setFormData({
            userName: 'Enamul Hoque',
            date: new Date().toISOString().split('T')[0],
            photo: '',
            title: '',
            body: ''
        });
        setErrors({});
        setIsDirty(false);
        setSaveStatus('Form reset');
        setTimeout(() => setSaveStatus(''), 3000);
    };

    // ---------- Submit ----------
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            setSaveStatus('Please fix all errors');
            setTimeout(() => setSaveStatus(''), 3000);
            return;
        }

        setIsSaving(true);

        try {
            if (isEditMode) {
                const response = apiService.update(ENDPOINTS.POSTS, id, formData);
                console.log('Post Updated:', response.data);
                setSaveStatus('Post updated successfully!');
                setIsDirty(false);
                navigate(`/post-details/${id}`); // 🔹 Navigate to Post Details after update
            } else {
                const response = apiService.create(ENDPOINTS.POSTS, formData);

                console.log('Post Created:', response.data);
                setSaveStatus('Post created successfully!');
                setIsDirty(false);
                navigate('/posts'); // 🔹 Navigate to Post List after create
            }
        } catch (err) {
            console.error('Failed to save post', err);
            setSaveStatus(isEditMode ? 'Error updating post!' : 'Error creating post!');
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveStatus(''), 3000);
        }
    };

    // ---------- Loading state ----------
    if (isLoading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
                    <p className="text-slate-600 font-medium">Loading post data...</p>
                </div>
            </div>
        );
    }

    // ---------- UI ----------
    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 pb-12">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/posts" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <ArrowLeft size={20} className="text-slate-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                {isEditMode ? 'Edit Post' : 'Create New Post'}
                            </h1>
                            <p className="text-sm text-slate-600">
                                {isEditMode ? 'Update your existing post' : 'Fill in the details to add a new post'}
                            </p>
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

            {/* Status */}
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

            {/* Action buttons */}
            {!isEditMode && (
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex flex-wrap gap-3">
                    <button onClick={loadDefaultDataset} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                        Load Default Dataset
                    </button>
                    <button onClick={handleSaveDraft} className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium flex items-center gap-2">
                        <FileText size={16} /> Save Draft
                    </button>
                    <button onClick={handleReset} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2">
                        <RefreshCw size={16} /> Reset Form
                    </button>
                </div>
            )}

            {/* Form */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                {/* Post Info */}
                <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 mb-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Post Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                User Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="userName"
                                value={formData.userName}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.userName ? 'border-red-500' : 'border-slate-300'}`}
                                placeholder="Enter author name"
                            />
                            {errors.userName && <p className="text-red-500 text-xs mt-1">{errors.userName}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Photo URL</label>
                            <div className="relative">
                                <input
                                    type="url"
                                    name="photo"
                                    value={formData.photo}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://example.com/image.jpg"
                                />
                                <Image className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            </div>
                        </div>

                        {formData.photo && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Photo Preview</label>
                                <div className="border border-slate-200 rounded-lg overflow-hidden">
                                    <img
                                        src={formData.photo}
                                        alt="Preview"
                                        className="w-full h-64 object-cover"
                                        onError={(e) => (e.target.style.display = 'none')}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Post Content */}
                <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 mb-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Post Content</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Post Title <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-500' : 'border-slate-300'}`}
                                placeholder="Enter an engaging post title"
                            />
                            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Post Body <span className="text-red-500">*</span></label>
                            <textarea
                                name="body"
                                value={formData.body}
                                onChange={handleChange}
                                rows="10"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.body ? 'border-red-500' : 'border-slate-300'}`}
                                placeholder="Write your post content here..."
                            ></textarea>
                            {errors.body && <p className="text-red-500 text-xs mt-1">{errors.body}</p>}
                            <p className="text-sm text-slate-500 mt-2">{formData.body.length} characters</p>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex gap-4 justify-end sticky bottom-0 bg-white p-4 rounded-xl shadow-lg border border-slate-200">
                    <button
                        type="button"
                        onClick={() => {
                            if (isEditMode) {
                                navigate(`/post-details/${id}`); // edit mode → post details
                            } else {
                                navigate('/posts'); // create mode → posts list
                            }
                        }}
                        className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSaving && <Loader className="animate-spin" size={16} />}
                        {isEditMode ? 'Update Post' : 'Create Post'}
                    </button>
                </div>

            </div>
        </div>
    );
}
