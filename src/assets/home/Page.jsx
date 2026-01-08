'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, ChevronRight, Users, FileText, Menu, X, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Pagination from '../common-component/Pagination';

export default function UserManagementList() {
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('activeTab') || 'users');
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const itemsPerPage = 3;
    const navigate = useNavigate();

    // Save activeTab to localStorage & reset page
    useEffect(() => {
        localStorage.setItem('activeTab', activeTab);
        setCurrentPage(1);
        setSearchTerm(''); // reset search on tab change
    }, [activeTab]);

    // Fetch users and posts together
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [usersRes, postsRes] = await Promise.all([
                    axios.get('http://localhost:5000/users'),
                    axios.get('http://localhost:5000/posts')
                ]);
                setUsers(usersRes.data);
                setPosts(postsRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Delete handlers
    const handleDeleteUser = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await axios.delete(`http://localhost:5000/users/${id}`);
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch { alert('Delete failed'); }
    };

    const handleDeletePost = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            await axios.delete(`http://localhost:5000/posts/${id}`);
            setPosts(prev => prev.filter(p => p.id !== id));
        } catch { alert('Delete failed'); }
    };

    // Filtered & paginated data
    const currentData = activeTab === 'users'
        ? users.filter(u =>
            (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.website || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
        : posts.filter(p =>
            (p.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.body || '').toLowerCase().includes(searchTerm.toLowerCase())
        );

    const totalItems = currentData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedData = currentData.slice(indexOfFirstItem, indexOfLastItem);

    // Navigation handlers
    const handleUserClick = id => navigate(`/user-details/${id}`);
    const handlePostClick = id => navigate(`/post-details/${id}`);
    const handleCreateUser = () => navigate('/create/new-user');
    const handleCreatePost = () => navigate('/create-post');

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation Bar */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">FC</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">FormCraft</span>
                        </div>

                        {/* Desktop Search */}
                        <div className="hidden md:block w-80">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder={`Search ${activeTab === 'users' ? 'users' : 'posts'}...`}
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    {/* Mobile Search */}
                    {mobileMenuOpen && (
                        <div className="md:hidden py-4 px-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder={`Search ${activeTab === 'users' ? 'users' : 'posts'}...`}
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Tab Buttons */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-2">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`flex-1 text-sm font-medium px-4 py-2 rounded-lg ${activeTab === 'users'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    Users
                </button>
                <button
                    onClick={() => setActiveTab('posts')}
                    className={`flex-1 text-sm font-medium px-4 py-2 rounded-lg ${activeTab === 'posts'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    Posts
                </button>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {activeTab === 'users' ? 'User Management' : 'Post Management'}
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            {totalItems} {activeTab === 'users' ? 'users available' : 'posts available'}
                        </p>
                    </div>
                    <button
                        onClick={activeTab === 'users' ? handleCreateUser : handleCreatePost}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={18} />
                        {activeTab === 'users' ? 'Add User' : 'Add Post'}
                    </button>
                </div>

                {/* Content List */}
                {isLoading ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
                        <p className="mt-4 text-sm text-gray-600">Loading {activeTab}...</p>
                    </div>
                ) : paginatedData.length === 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                        {activeTab === 'users' ? (
                            <Users className="mx-auto text-gray-300 mb-4" size={48} />
                        ) : (
                            <FileText className="mx-auto text-gray-300 mb-4" size={48} />
                        )}
                        <h3 className="text-base font-semibold text-gray-900 mb-1">No {activeTab} found</h3>
                        <p className="text-sm text-gray-600">Try adjusting your search or create new</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {activeTab === 'users'
                            ? paginatedData.map(user => (
                                <div
                                    key={user.id}
                                    onClick={() => handleUserClick(user.id)}
                                    className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer p-4 flex items-center gap-4"
                                >
                                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-semibold flex-shrink-0">
                                        {user.name.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-medium text-gray-900">{user.name}</h3>
                                        <p className="text-xs text-gray-500">{user.email} • {user.phone}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={e => handleDeleteUser(e, user.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash size={18} />
                                        </button>
                                        <ChevronRight size={20} className="text-gray-400" />
                                    </div>
                                </div>
                            ))
                            : paginatedData.map(post => (
                                <div
                                    key={post.id}
                                    onClick={() => handlePostClick(post.id)}
                                    className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer p-4 flex items-start gap-4"
                                >
                                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white font-semibold flex-shrink-0">
                                        {post.userName ? post.userName.slice(0, 2).toUpperCase() : 'PS'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-medium text-gray-900">{post.userName || 'Unknown User'}</h3>
                                        <h4 className="text-base font-semibold text-gray-900 line-clamp-1">{post.title}</h4>
                                        <p className="text-sm text-gray-600 line-clamp-2">{post.body}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={e => handleDeletePost(e, post.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash size={18} />
                                        </button>
                                        <ChevronRight size={20} className="text-gray-400" />
                                    </div>
                                </div>
                            ))}
                    </div>
                )}

                {/* Summary */}
                {!isLoading && paginatedData.length > 0 && (
                    <div className="mt-6 text-center text-sm text-gray-600 font-medium">
                        Showing {indexOfFirstItem + 1}–{Math.min(indexOfLastItem, totalItems)} of {totalItems} {activeTab}
                    </div>
                )}

                {/* Pagination */}
                {!isLoading && paginatedData.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>
        </div>
    );
}
