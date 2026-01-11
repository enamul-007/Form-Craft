'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, ChevronRight, Users, FileText, Menu, X, Trash, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Pagination from '../common-component/Pagination';

export default function UserManagementList() {
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('activeTab') || 'users');
    const [taskSubTab, setTaskSubTab] = useState('ongoing');
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [todos, setTodos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [selectedTasks, setSelectedTasks] = useState([]);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', body: '' });

    const itemsPerPage = 3;
    const navigate = useNavigate();

    // Save activeTab to localStorage & reset page
    useEffect(() => {
        localStorage.setItem('activeTab', activeTab);
        setCurrentPage(1);
        setSearchTerm('');
        setSelectedTasks([]);
    }, [activeTab]);

    // Reset selected tasks when switching task subtabs
    useEffect(() => {
        setSelectedTasks([]);
    }, [taskSubTab]);

    // Fetch users, posts and todos together
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [usersRes, postsRes, todosRes] = await Promise.all([
                    axios.get('http://localhost:5000/users'),
                    axios.get('http://localhost:5000/posts'),
                    axios.get('http://localhost:5000/todos')
                ]);
                setUsers(usersRes.data);
                setPosts(postsRes.data);

                // Transform todos to include status
                const transformedTodos = todosRes.data.map(todo => ({
                    ...todo,
                    status: todo.deleted ? 'deleted' : (todo.completed ? 'completed' : 'ongoing')
                }));
                setTodos(transformedTodos);
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

    // Task handlers
    const handleSelectTask = (taskId) => {
        setSelectedTasks(prev =>
            prev.includes(taskId)
                ? prev.filter(id => id !== taskId)
                : [...prev, taskId]
        );
    };

    const handleCompleteTask = async (e, taskId) => {
        e.stopPropagation();
        try {
            await axios.patch(`http://localhost:5000/todos/${taskId}`, { completed: true });
            setTodos(prev => prev.map(task =>
                task.id === taskId ? { ...task, status: 'completed', completed: true } : task
            ));
        } catch (err) {
            console.error('Error completing task:', err);
            alert('Failed to complete task');
        }
    };

    const handleDeleteTask = async (e, taskId) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await axios.delete(`http://localhost:5000/todos/${taskId}`);
            setTodos(prev => prev.map(task =>
                task.id === taskId ? { ...task, status: 'deleted', deleted: true } : task
            ));
        } catch (err) {
            console.error('Error deleting task:', err);
            alert('Delete failed');
        }
    };

    const handleBulkStatusChange = async (newStatus) => {
        try {
            const updateData = newStatus === 'completed'
                ? { completed: true }
                : newStatus === 'ongoing'
                    ? { completed: false }
                    : { deleted: true };

            const updatePromises = selectedTasks.map(taskId =>
                axios.patch(`http://localhost:5000/todos/${taskId}`, updateData)
            );

            await Promise.all(updatePromises);

            setTodos(prev => prev.map(task =>
                selectedTasks.includes(task.id)
                    ? { ...task, status: newStatus, ...updateData }
                    : task
            ));
            setSelectedTasks([]);
        } catch (err) {
            console.error('Error updating tasks:', err);
            alert('Failed to update tasks');
        }
    };

    const handleCreateTask = async () => {
        if (!newTask.title.trim()) {
            alert('Please enter a task title');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/todos', {
                title: newTask.title,
                completed: false,
                userId: 1
            });

            setTodos(prev => [...prev, {
                ...response.data,
                status: 'ongoing',
                body: newTask.body
            }]);

            setNewTask({ title: '', body: '' });
            setShowTaskModal(false);
        } catch (err) {
            console.error('Error creating task:', err);
            alert('Failed to create task');
        }
    };

    // Get task groups
    const ongoingTasks = todos.filter(t => t.status === 'ongoing');
    const completedTasks = todos.filter(t => t.status === 'completed');
    const deletedTasks = todos.filter(t => t.status === 'deleted').slice(-5);

    // Get current task list based on subtab
    const getCurrentTaskList = () => {
        switch (taskSubTab) {
            case 'ongoing': return ongoingTasks;
            case 'completed': return completedTasks;
            case 'deleted': return deletedTasks;
            default: return ongoingTasks;
        }
    };

    // Filtered & paginated data
    const currentData = activeTab === 'users'
        ? users.filter(u =>
            (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.website || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
        : activeTab === 'posts'
            ? posts.filter(p =>
                (p.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.body || '').toLowerCase().includes(searchTerm.toLowerCase())
            )
            : getCurrentTaskList().filter(t =>
                (t.title || '').toLowerCase().includes(searchTerm.toLowerCase())
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
                                    placeholder={`Search ${activeTab === 'users' ? 'users' : activeTab === 'posts' ? 'posts' : 'tasks'}...`}
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
                                    placeholder={`Search ${activeTab === 'users' ? 'users' : activeTab === 'posts' ? 'posts' : 'tasks'}...`}
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
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
                    className={`flex-1 text-sm font-medium px-4 py-2.5 rounded-lg transition-all ${activeTab === 'users'
                        ? 'bg-violet-600 hover:bg-violet-70 text-white shadow-sm'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    Users
                </button>
                <button
                    onClick={() => setActiveTab('posts')}
                    className={`flex-1 text-sm font-medium px-4 py-2.5 rounded-lg transition-all ${activeTab === 'posts'
                        ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    Posts
                </button>
                <button
                    onClick={() => setActiveTab('tasks')}
                    className={`flex-1 text-sm font-medium px-4 py-2.5 rounded-lg transition-all ${activeTab === 'tasks'
                        ? 'bg-green-500 hover:bg-green-600 text-white shadow-sm'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    Tasks
                </button>
            </div>

            {/* Task Subtabs */}
            {activeTab === 'tasks' && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
                    <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200">
                        <button
                            onClick={() => setTaskSubTab('ongoing')}
                            className={`flex-1 text-sm font-medium px-4 py-2 rounded-md transition-all flex items-center justify-center gap-2 ${taskSubTab === 'ongoing'
                                ? 'bg-yellow-50 text-yellow-700  border-yellow-200'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <Clock size={16} />
                            Ongoing ({ongoingTasks.length})
                        </button>
                        <button
                            onClick={() => setTaskSubTab('completed')}
                            className={`flex-1 text-sm font-medium px-4 py-2 rounded-md transition-all flex items-center justify-center gap-2 ${taskSubTab === 'completed'
                                ? 'bg-green-50 text-green-700  border-green-200'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <CheckCircle size={16} />
                            Completed ({completedTasks.length})
                        </button>
                        <button
                            onClick={() => setTaskSubTab('deleted')}
                            className={`flex-1 text-sm font-medium px-4 py-2 rounded-md transition-all flex items-center justify-center gap-2 ${taskSubTab === 'deleted'
                                ? 'bg-red-50 text-red-700  border-red-200'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <Trash size={16} />
                            Deleted ({deletedTasks.length})
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                {/* Bulk Actions for Tasks */}
                {activeTab === 'tasks' && selectedTasks.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 shadow-sm">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                                    {selectedTasks.length}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {selectedTasks.length} task{selectedTasks.length > 1 ? 's' : ''} selected
                                    </p>
                                    <p className="text-xs text-gray-500">Choose an action to apply</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                {taskSubTab !== 'completed' && (
                                    <button
                                        onClick={() => handleBulkStatusChange('completed')}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2"
                                    >
                                        <CheckCircle size={16} />
                                        <span>Complete</span>
                                    </button>
                                )}
                                {taskSubTab !== 'ongoing' && (
                                    <button
                                        onClick={() => handleBulkStatusChange('ongoing')}
                                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2"
                                    >
                                        <Clock size={16} />
                                        <span>Reopen</span>
                                    </button>
                                )}
                                {taskSubTab !== 'deleted' && (
                                    <button
                                        onClick={() => handleBulkStatusChange('deleted')}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2"
                                    >
                                        <Trash size={16} />
                                        <span>Delete</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => setSelectedTasks([])}
                                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-all"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {activeTab === 'users' ? 'User Management' : activeTab === 'posts' ? 'Post Management' : 'Task Management'}
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            {totalItems} {activeTab === 'tasks' ? `${taskSubTab} task${totalItems !== 1 ? 's' : ''}` : `${activeTab}`} available
                        </p>
                    </div>
                    <button
                        onClick={activeTab === 'users' ? handleCreateUser : activeTab === 'posts' ? handleCreatePost : () => setShowTaskModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus size={18} />
                        {activeTab === 'users' ? 'Add User' : activeTab === 'posts' ? 'Add Post' : 'Add Task'}
                    </button>
                </div>

                {/* Content List */}
                {isLoading ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
                        <p className="mt-4 text-sm text-gray-600">Loading {activeTab}...</p>
                    </div>
                ) : activeTab === 'tasks' ? (
                    // Tasks View
                    paginatedData.length === 0 ? (
                        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                            <FileText className="mx-auto text-gray-300 mb-4" size={48} />
                            <h3 className="text-base font-semibold text-gray-900 mb-1">No {taskSubTab} tasks</h3>
                            <p className="text-sm text-gray-600">Tasks you mark as {taskSubTab} will appear here</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {paginatedData.map(task => (
                                <div
                                    key={task.id}
                                    className={`bg-white rounded-lg border transition-all duration-200 p-4 flex items-center gap-4 ${selectedTasks.includes(task.id)
                                        ? 'border-blue-400 shadow-md bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                        } ${taskSubTab === 'completed' || taskSubTab === 'deleted' ? 'opacity-70' : ''}`}
                                >
                                    <label className="relative flex items-center justify-center cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={selectedTasks.includes(task.id)}
                                            onChange={() => handleSelectTask(task.id)}
                                            className="sr-only peer"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all duration-200 flex items-center justify-center group-hover:border-blue-400">
                                            {selectedTasks.includes(task.id) && (
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    </label>
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold sri ${taskSubTab === 'ongoing' ? 'bg-yellow-600' :
                                        taskSubTab === 'completed' ? 'bg-green-600' :
                                            'bg-red-600'
                                        }`}>
                                        {task.title.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`text-sm font-medium text-gray-900 ${taskSubTab === 'deleted' ? 'line-through' : ''}`}>
                                            {task.title}
                                        </h3>
                                        {task.body && <p className="text-xs text-gray-500 mt-0.5">{task.body}</p>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {taskSubTab === 'ongoing' && (
                                            <button
                                                onClick={(e) => handleCompleteTask(e, task.id)}
                                                className="p-2 text-gray-400 hover:text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                                                title="Complete task"
                                            >
                                                <CheckCircle size={18} />
                                            </button>
                                        )}
                                        {taskSubTab !== 'deleted' && (
                                            <button
                                                onClick={(e) => handleDeleteTask(e, task.id)}
                                                className="p-2 text-gray-400 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                                                title="Delete task"
                                            >
                                                <Trash size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
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
                                            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
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
                                            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
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
                        Showing {indexOfFirstItem + 1}–{Math.min(indexOfLastItem, totalItems)} of {totalItems} {activeTab === 'tasks' ? `${taskSubTab} tasks` : activeTab}
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

            {/* Create Task Modal */}
            {showTaskModal && (
                <div className="fixed inset-0 bg-white/10  backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white border rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">Create New Task</h2>
                            <button
                                onClick={() => setShowTaskModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Task Title *
                                </label>
                                <input
                                    type="text"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                                    placeholder="Enter task title"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={newTask.body}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, body: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent resize-none"
                                    rows="3"
                                    placeholder="Enter task description (optional)"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleCreateTask}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Create Task
                                </button>
                                <button
                                    onClick={() => setShowTaskModal(false)}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}