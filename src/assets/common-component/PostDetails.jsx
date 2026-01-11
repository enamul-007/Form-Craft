'use client';

import * as React from 'react';
import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { red, blue } from '@mui/material/colors';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShareIcon from '@mui/icons-material/Share';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CommentIcon from '@mui/icons-material/Comment';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../service/ApiService';
import { ENDPOINTS } from '../service/Endpoints';

/* 🔹 Styled Components */
const HeroImage = styled('img')({
    width: '100%',
    height: '90vh',
    objectFit: 'cover',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
});

const ActionButton = styled(IconButton)(({ theme, active }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '50%',
    padding: '12px',
    transition: 'all 0.3s ease',
    backgroundColor: active ? theme.palette.primary.main : 'transparent',
    color: active ? '#fff' : theme.palette.text.primary,
    '&:hover': {
        backgroundColor: active ? theme.palette.primary.dark : theme.palette.action.hover,
        transform: 'scale(1.1)',
    },
}));

const CommentBox = styled(Box)(({ theme }) => ({
    backgroundColor: '#f0f2f5',
    borderRadius: '18px',
    padding: '12px 16px',
    marginBottom: '12px',
    transition: 'all 0.2s ease',
    '&:hover': {
        backgroundColor: '#e4e6eb',
    },
}));

const CommentInput = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '24px',
        backgroundColor: '#f0f2f5',
        '&:hover': {
            backgroundColor: '#e4e6eb',
        },
        '&.Mui-focused': {
            backgroundColor: '#fff',
        },
    },
}));

// Helper function to format time
const getTimeAgo = (date) => {
    if (!date) return 'Just now';

    const now = new Date();
    const commentDate = new Date(date);
    const seconds = Math.floor((now - commentDate) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)} days ago`;
    return commentDate.toLocaleDateString();
};

export default function PostDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [liked, setLiked] = React.useState(false);

    // Comments State
    const [comments, setComments] = React.useState([]);
    const [commentsLoading, setCommentsLoading] = React.useState(true);
    const [commentText, setCommentText] = React.useState('');
    const [editingCommentId, setEditingCommentId] = React.useState(null);
    const [editText, setEditText] = React.useState('');
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [selectedCommentId, setSelectedCommentId] = React.useState(null);

    // 🆕 Snackbar State for Better Error/Success Handling
    const [snackbar, setSnackbar] = React.useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // 🆕 Loading States
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [isUpdating, setIsUpdating] = React.useState(false);

    // 🔹 Fetch Post by ID
    React.useEffect(() => {
        if (!id) return;

        setLoading(true);
        apiService.getById(ENDPOINTS.POSTS, id)
            .then(res => {
                setPost(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Post fetch error:', err);
                setLoading(false);
                showSnackbar('Failed to load post', 'error');
            });
    }, [id]);

    // 🔹 Fetch Comments
    React.useEffect(() => {
        if (!id) return;

        setCommentsLoading(true);
        apiService.get(`${ENDPOINTS.COMMENTS}?postId=${id}`)
            .then(res => {
                // 🆕 Get stored timestamps from localStorage
                const storedTimestamps = JSON.parse(localStorage.getItem('commentTimestamps') || '{}');

                const commentsWithTime = res.data.map(comment => {
                    // Check if we have a stored timestamp for this comment
                    const storedTime = storedTimestamps[comment.id];

                    // If stored time exists, use it. Otherwise create new timestamp
                    const timestamp = storedTime || new Date().toISOString();

                    // Store the timestamp if it's new
                    if (!storedTime) {
                        storedTimestamps[comment.id] = timestamp;
                    }

                    return {
                        ...comment,
                        createdAt: timestamp
                    };
                });

                // Save updated timestamps to localStorage
                localStorage.setItem('commentTimestamps', JSON.stringify(storedTimestamps));

                setComments(commentsWithTime);
                setCommentsLoading(false);
            })
            .catch(err => {
                console.error('Comments fetch error:', err);
                setCommentsLoading(false);
                showSnackbar('Failed to load comments', 'error');
            });
    }, [id]);

    // 🆕 Snackbar Helper
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleBackClick = () => navigate('/posts');
    const handleEditClick = () => navigate(`/create-post/${id}`);

    const handleLike = () => {
        setLiked(!liked);
    };

    // 🔹 Add Comment
    const handleAddComment = () => {
        if (!commentText.trim() || !post) return;

        const newComment = {
            postId: parseInt(id),
            body: commentText,
            name: post.userName || 'Unknown User',
            email: "user@example.com"
        };

        apiService.post(ENDPOINTS.COMMENTS, newComment)
            .then(res => {
                const currentTime = new Date().toISOString();
                const addedComment = {
                    ...res.data,
                    body: commentText,
                    name: newComment.name,
                    createdAt: currentTime
                };

                // 🆕 Store the timestamp in localStorage
                const storedTimestamps = JSON.parse(localStorage.getItem('commentTimestamps') || '{}');
                storedTimestamps[res.data.id] = currentTime;
                localStorage.setItem('commentTimestamps', JSON.stringify(storedTimestamps));

                setComments([addedComment, ...comments]);
                setCommentText('');
                showSnackbar('Comment added successfully!');
            })
            .catch(err => {
                console.error('Add comment error:', err);
                showSnackbar('Failed to add comment', 'error');
            });
    };

    // 🔹 Menu Handlers
    const handleMenuOpen = (event, commentId) => {
        setAnchorEl(event.currentTarget);
        setSelectedCommentId(commentId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedCommentId(null);
    };

    // 🔹 Edit Comment - START EDITING
    const handleEditComment = () => {
        const comment = comments.find(c => c.id === selectedCommentId);
        if (!comment) {
            showSnackbar('Comment not found', 'error');
            handleMenuClose();
            return;
        }
        setEditingCommentId(selectedCommentId);
        setEditText(comment.body || '');
        handleMenuClose();
    };

    // 🔹 Save Edit - FIXED VERSION
    const handleSaveEdit = () => {
        if (!editText.trim()) {
            showSnackbar('Comment cannot be empty', 'warning');
            return;
        }

        const commentToUpdate = comments.find(c => c.id === editingCommentId);
        if (!commentToUpdate) {
            showSnackbar('Comment not found', 'error');
            return;
        }

        setIsUpdating(true);

        // 🆕 Prepare full updated comment object
        const updatedComment = {
            ...commentToUpdate,
            body: editText,
            // Preserve all other fields
        };

        // 🔹 API Call - Using update method (which uses PATCH)
        apiService.update(ENDPOINTS.COMMENTS, editingCommentId, { body: editText })
            .then(res => {
                // 🆕 Update state with FULL comment object (preserving all fields)
                setComments(comments.map(c =>
                    c.id === editingCommentId
                        ? { ...c, body: editText } // Preserve all existing fields
                        : c
                ));
                setEditingCommentId(null);
                setEditText('');
                setIsUpdating(false);
                showSnackbar('Comment updated successfully!');
            })
            .catch(err => {
                console.error('Edit comment error:', err);
                setIsUpdating(false);
                showSnackbar('Failed to update comment', 'error');
            });
    };

    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditText('');
    };

    // 🔹 Delete Comment - IMPROVED VERSION
    const handleDeleteComment = () => {
        if (!selectedCommentId) {
            showSnackbar('No comment selected', 'error');
            return;
        }

        setIsDeleting(true);

        apiService.remove(ENDPOINTS.COMMENTS, selectedCommentId)
            .then(() => {
                // 🆕 Remove timestamp from localStorage
                const storedTimestamps = JSON.parse(localStorage.getItem('commentTimestamps') || '{}');
                delete storedTimestamps[selectedCommentId];
                localStorage.setItem('commentTimestamps', JSON.stringify(storedTimestamps));

                // Update UI
                setComments(comments.filter(c => c.id !== selectedCommentId));
                handleMenuClose();
                setIsDeleting(false);
                showSnackbar('Comment deleted successfully!');
            })
            .catch(err => {
                console.error('Delete comment error:', err);
                setIsDeleting(false);
                showSnackbar('Failed to delete comment', 'error');
                handleMenuClose();
            });
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <CircularProgress />
        </Box>
    );

    if (!post) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
            <Typography variant="h5">Post not found</Typography>
        </Box>
    );

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#fafafa', pb: 8 }}>
            {/* 🔹 Top Navigation Bar */}
            <Box sx={{
                backgroundColor: '#fff',
                borderBottom: '1px solid #e0e0e0',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={handleBackClick}
                            variant="contained"
                            sx={{ borderRadius: '24px', px: 3, textTransform: 'none', fontWeight: 600 }}
                        >
                            Back to Posts
                        </Button>
                        <Button
                            startIcon={<EditIcon />}
                            onClick={handleEditClick}
                            variant="contained"
                            sx={{ borderRadius: '24px', px: 3, textTransform: 'none', fontWeight: 600 }}
                        >
                            Edit Post
                        </Button>
                    </Box>
                </Container>
            </Box>

            {/* 🔹 Main Content */}
            <Container maxWidth="lg" sx={{ mt: 5 }}>
                {/* Author Info */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                            src={post.photo || ''}
                            sx={{ width: 56, height: 56, fontSize: '1.5rem', bgcolor: red[500] }}
                        >
                            {post.userName?.charAt(0).toUpperCase() || 'U'}
                        </Avatar>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                {post.userName || 'Unknown User'}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                    {post.date || 'Unknown Date'}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* Post Title */}
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, lineHeight: 1.2, color: '#1a1a1a' }}>
                    {post.title}
                </Typography>

                {/* Featured Image */}
                {post.photo && <HeroImage src={post.photo} alt={post.title} />}

                {/* Content */}
                <Box sx={{ mt: 5 }}>
                    <Typography variant="body1" sx={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#2d2d2d', mb: 3 }}>
                        {post.body}
                    </Typography>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, mb: 2, pb: 3, borderBottom: '1px solid #e0e0e0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ActionButton active={liked} onClick={handleLike}>
                            {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                        </ActionButton>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ActionButton>
                            <CommentIcon />
                        </ActionButton>
                        <Typography variant="body2" color="text.secondary">
                            {comments.length}
                        </Typography>
                    </Box>
                    <ActionButton>
                        <ShareIcon />
                    </ActionButton>
                </Box>

                {/* 🔹 Comments Section */}
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                        Comments ({comments.length})
                    </Typography>

                    {/* Add Comment Input */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                        <Avatar sx={{ bgcolor: red[500] }}>
                            {post.userName?.charAt(0).toUpperCase() || 'U'}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <CommentInput
                                fullWidth
                                multiline
                                maxRows={4}
                                placeholder="Write a comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleAddComment();
                                    }
                                }}
                            />
                            {commentText && (
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, gap: 1 }}>
                                    <Button
                                        size="small"
                                        onClick={() => setCommentText('')}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        endIcon={<SendIcon />}
                                        onClick={handleAddComment}
                                        sx={{ borderRadius: '20px' }}
                                    >
                                        Post
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    </Box>

                    {/* Comments Loading */}
                    {commentsLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        /* Comments List */
                        <Box>
                            {comments.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                                    No comments yet. Be the first to comment!
                                </Typography>
                            ) : (
                                comments.map((comment) => (
                                    <Box key={comment.id} sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                        <Avatar sx={{ bgcolor: blue[500] }}>
                                            {comment.name?.charAt(0).toUpperCase() || 'U'}
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            {editingCommentId === comment.id ? (
                                                // Edit Mode
                                                <Box>
                                                    <CommentInput
                                                        fullWidth
                                                        multiline
                                                        maxRows={4}
                                                        value={editText}
                                                        onChange={(e) => setEditText(e.target.value)}
                                                        autoFocus
                                                        disabled={isUpdating}
                                                    />
                                                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                                        <Button
                                                            size="small"
                                                            onClick={handleCancelEdit}
                                                            startIcon={<CloseIcon />}
                                                            disabled={isUpdating}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            onClick={handleSaveEdit}
                                                            sx={{ borderRadius: '20px' }}
                                                            disabled={isUpdating || !editText.trim()}
                                                        >
                                                            {isUpdating ? <CircularProgress size={16} /> : 'Save'}
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            ) : (
                                                // View Mode
                                                <>
                                                    <CommentBox>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                            <Box sx={{ flex: 1 }}>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                                                    {comment.name || 'Unknown User'}
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ mt: 0.5, wordBreak: 'break-word' }}>
                                                                    {comment.body}
                                                                </Typography>
                                                            </Box>
                                                            <IconButton
                                                                size="small"
                                                                onClick={(e) => handleMenuOpen(e, comment.id)}
                                                                disabled={isDeleting}
                                                            >
                                                                <MoreVertIcon fontSize="small" />
                                                            </IconButton>
                                                        </Box>
                                                    </CommentBox>
                                                    <Box sx={{ display: 'flex', gap: 2, ml: 2, mt: 0.5 }}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {getTimeAgo(comment.createdAt)}
                                                        </Typography>
                                                    </Box>
                                                </>
                                            )}
                                        </Box>
                                    </Box>
                                ))
                            )}
                        </Box>
                    )}

                    {/* Comment Menu */}
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        <MenuItem onClick={handleEditComment} disabled={isDeleting}>
                            <EditIcon fontSize="small" sx={{ mr: 1 }} />
                            Edit
                        </MenuItem>
                        <MenuItem onClick={handleDeleteComment} sx={{ color: 'error.main' }} disabled={isDeleting}>
                            {isDeleting ? <CircularProgress size={16} sx={{ mr: 1 }} /> : <DeleteIcon fontSize="small" sx={{ mr: 1 }} />}
                            Delete
                        </MenuItem>
                    </Menu>
                </Box>

                {/* Bottom Actions */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 5 }}>
                    <Typography variant="body2" color="text.secondary">
                        Published on {post.date || 'Unknown'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button startIcon={<ShareIcon />} variant="outlined" sx={{ borderRadius: '24px' }}>
                            Share
                        </Button>
                        <Button startIcon={<EditIcon />} variant="contained" onClick={handleEditClick} sx={{ borderRadius: '24px' }}>
                            Edit Post
                        </Button>
                    </Box>
                </Box>
            </Container>

            {/* 🆕 Snackbar for Success/Error Messages */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}