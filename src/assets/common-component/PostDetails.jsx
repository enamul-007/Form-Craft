'use client';

import * as React from 'react';
import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import { red } from '@mui/material/colors';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShareIcon from '@mui/icons-material/Share';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CommentIcon from '@mui/icons-material/Comment';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

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

export default function PostDetails() {
    const { id } = useParams(); // URL theke post ID
    const navigate = useNavigate();

    const [post, setPost] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [liked, setLiked] = React.useState(false);

    // 🔹 Fetch post by ID
    React.useEffect(() => {
        if (!id) return;

        setLoading(true);
        axios.get(`http://localhost:5000/posts/${id}`)
            .then(res => {
                setPost(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    const handleBackClick = () => navigate('/posts');
    const handleEditClick = () => navigate(`/create-post/${id}`);

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
            <Typography>Loading...</Typography>
        </Box>
    );

    if (!post) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
            <Typography>Post not found</Typography>
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
                    <Typography variant="body1" sx={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#2d2d2d', mb: 3 }} paragraph>
                        {post.body}
                    </Typography>
                </Box>

                {/* Bottom Divider */}
                {/* <Divider sx={{ my: 5 }} /> */}

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, mb: 4, pb: 3, borderBottom: '1px solid #e0e0e0' }}>
                    <ActionButton active={liked} onClick={() => setLiked(!liked)}>
                        {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </ActionButton>
                    <ActionButton>
                        <CommentIcon />
                    </ActionButton>
                </Box>

                {/* Bottom Actions */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        </Box>
    );
}
