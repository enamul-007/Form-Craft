'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, ChevronRight, Mail, Users, Phone, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Pagination from '../common-component/Pagination';

export default function UserManagementList() {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // ✅ Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    const navigate = useNavigate();

    // Fetch users
    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get('http://localhost:5000/users');
                setUsers(response.data);
            } catch (err) {
                console.error('Failed to fetch users', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // 🔍 Search filter
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.website?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 🔁 Reset page on search
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // 📄 Pagination calculation
    const totalItems = filteredUsers.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const indexOfLastUser = currentPage * itemsPerPage;
    const indexOfFirstUser = indexOfLastUser - itemsPerPage;

    const paginatedUsers = filteredUsers.slice(
        indexOfFirstUser,
        indexOfLastUser
    );

    const handleUserClick = (userId) => {
        navigate(`/user-details/${userId}`);
    };

    const handleCreateUser = () => {
        navigate('/create/new-user');
    };

    return (
        <div className=" ">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
                        <p className="mt-1 text-sm text-slate-600">Manage your team members</p>
                    </div>

                    <button
                        onClick={handleCreateUser}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <Plus size={20} />
                        Create New User
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search */}
                <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, email or username..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* User List */}
                <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                    {isLoading ? (
                        <div className="text-center py-16 text-slate-600">Loading users...</div>
                    ) : paginatedUsers.length === 0 ? (
                        <div className="text-center py-16">
                            <Users className="mx-auto text-slate-300 mb-4" size={64} />
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">No users found</h3>
                            <p className="text-slate-600">Try adjusting your search</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-200">
                            {paginatedUsers.map(user => (
                                <div
                                    key={user.id}
                                    onClick={() => handleUserClick(user.id)}
                                    className="flex items-center gap-4 p-6 hover:bg-slate-50 cursor-pointer group"
                                >
                                    <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        {user.name.slice(0, 2).toUpperCase()}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-semibold text-slate-900 truncate">{user.name}</h3>
                                            <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                                                @{user.username}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                                            <span className="flex items-center gap-1"><Mail size={14} />{user.email}</span>
                                            <span className="flex items-center gap-1"><Phone size={14} />{user.phone}</span>
                                            {user.website && (
                                                <span className="flex items-center gap-1"><Globe size={14} />{user.website}</span>
                                            )}
                                        </div>

                                        <div className="mt-1 text-xs text-slate-500">
                                            {user.company?.name} • {user.address?.city}
                                        </div>
                                    </div>

                                    <ChevronRight size={24} className="text-slate-400 group-hover:text-blue-600" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Summary */}
                <div className="mt-4 text-center text-sm text-slate-600">
                    Showing {indexOfFirstUser + 1}–
                    {Math.min(indexOfLastUser, totalItems)} of {totalItems} users
                </div>

                {/* Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
}
