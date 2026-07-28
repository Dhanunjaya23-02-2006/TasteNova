import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config';
import toast from 'react-hot-toast';
import { Users, Heart, MessageCircle, Send, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const ChefCommunity = () => {
    const { user } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPost, setNewPost] = useState('');
    const [newImage, setNewImage] = useState('');
    const [showCommentInput, setShowCommentInput] = useState(null);
    const [commentText, setCommentText] = useState('');

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await fetch(`${API_URL}/community`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                setPosts(await res.json());
            }
        } catch (error) {
            console.error('Error fetching community posts', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPost.trim()) return;

        try {
            const res = await fetch(`${API_URL}/community`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}` 
                },
                body: JSON.stringify({ content: newPost, image: newImage })
            });

            if (res.ok) {
                const created = await res.json();
                setPosts([created, ...posts]);
                setNewPost('');
                setNewImage('');
                toast.success('Posted to community!');
            }
        } catch (error) {
            toast.error('Failed to post');
        }
    };

    const handleLike = async (postId) => {
        try {
            const res = await fetch(`${API_URL}/community/${postId}/like`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                const likes = await res.json();
                setPosts(posts.map(p => p._id === postId ? { ...p, likes } : p));
            }
        } catch (error) {
            toast.error('Failed to like post');
        }
    };

    const handleComment = async (postId) => {
        if (!commentText.trim()) return;
        try {
            const res = await fetch(`${API_URL}/community/${postId}/comment`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}` 
                },
                body: JSON.stringify({ text: commentText })
            });
            if (res.ok) {
                const comments = await res.json();
                setPosts(posts.map(p => p._id === postId ? { ...p, comments } : p));
                setCommentText('');
                setShowCommentInput(null);
                toast.success('Comment added');
            }
        } catch (error) {
            toast.error('Failed to add comment');
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="glass-panel" style={{ padding: '20px', marginBottom: '30px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-color)' }}>
                    <Users size={24} /> Create Post
                </h3>
                <form onSubmit={handleCreatePost}>
                    <textarea 
                        className="form-control"
                        rows="3"
                        placeholder="Share a tip, ask a question, or show off your kitchen..."
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        style={{ width: '100%', marginBottom: '10px', resize: 'none' }}
                        required
                    />
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <ImageIcon size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                            <input 
                                type="text" 
                                className="form-control"
                                placeholder="Image URL (optional)" 
                                value={newImage}
                                onChange={(e) => setNewImage(e.target.value)}
                                style={{ paddingLeft: '35px', width: '100%' }}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Send size={16} /> Post
                        </button>
                    </div>
                </form>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>Loading Community...</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {posts.map(post => (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={post._id} 
                            className="glass-panel" 
                            style={{ padding: '20px' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                    {post.author?.name ? post.author.name.charAt(0).toUpperCase() : 'C'}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{post.author?.businessName || post.author?.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {new Date(post.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            
                            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{post.content}</p>
                            
                            {post.image && (
                                <img 
                                    src={post.image} 
                                    alt="Post attachment" 
                                    style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '10px', marginTop: '10px' }} 
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                            )}

                            <div style={{ display: 'flex', gap: '20px', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid var(--border)' }}>
                                <button 
                                    onClick={() => handleLike(post._id)}
                                    style={{ background: 'none', border: 'none', color: post.likes.includes(user._id) ? 'var(--error)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}
                                >
                                    <Heart size={18} fill={post.likes.includes(user._id) ? 'var(--error)' : 'none'} /> 
                                    {post.likes.length} Likes
                                </button>
                                <button 
                                    onClick={() => setShowCommentInput(showCommentInput === post._id ? null : post._id)}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}
                                >
                                    <MessageCircle size={18} /> {post.comments?.length || 0} Comments
                                </button>
                            </div>

                            {/* Comments Section */}
                            {(showCommentInput === post._id || (post.comments && post.comments.length > 0)) && (
                                <div style={{ marginTop: '20px', backgroundColor: 'var(--bg-dark)', padding: '15px', borderRadius: '10px' }}>
                                    {post.comments?.map((comment, i) => (
                                        <div key={i} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: i !== post.comments.length -1 ? '1px solid var(--border)' : 'none' }}>
                                            <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{comment.author?.businessName || comment.author?.name}</span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '10px' }}>{new Date(comment.createdAt).toLocaleDateString()}</span>
                                            <p style={{ margin: '5px 0 0 0', fontSize: '0.95rem' }}>{comment.text}</p>
                                        </div>
                                    ))}
                                    
                                    {showCommentInput === post._id && (
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                placeholder="Write a comment..." 
                                                value={commentText}
                                                onChange={(e) => setCommentText(e.target.value)}
                                                style={{ flex: 1 }}
                                            />
                                            <button className="btn btn-primary" onClick={() => handleComment(post._id)}>Post</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    ))}
                    {posts.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No posts yet. Be the first to post!</div>}
                </div>
            )}
        </div>
    );
};

export default ChefCommunity;
