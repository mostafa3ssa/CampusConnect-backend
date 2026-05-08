import React, { useEffect, useState } from 'react';
import { getNewsFeed, likePost, unlikePost, getComments, addComment } from '../../api/posts';
import type { Post, Comment } from '../../types';
import { Card } from '../../components/ui/Card';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import styles from './Dashboard.module.css';

export const Dashboard: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState<{ [key: number]: string }>({});
  const [loadingCommentPostId, setLoadingCommentPostId] = useState<number | null>(null);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const data = await getNewsFeed();
      // The backend shape is { newsFeed: [...] }
      setPosts(data.newsFeed || []);
    } catch (error) {
      toast.error('Failed to load news feed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (postId: number, isLiked: boolean) => {
    try {
      // Optimistic update
      setPosts(posts.map(p => {
        if (p.post_id === postId) {
          return { ...p, is_liked: !isLiked, like_count: isLiked ? p.like_count - 1 : p.like_count + 1 };
        }
        return p;
      }));

      if (isLiked) {
        await unlikePost(postId);
      } else {
        await likePost(postId);
      }
    } catch (error) {
      toast.error('Action failed');
      fetchFeed(); // Revert on failure
    }
  };

  const handleViewComments = async (postId: number) => {
    try {
      if (expandedPostId === postId) {
        setExpandedPostId(null);
        return;
      }

      const result = await getComments(postId);
      setPosts(posts.map(p => 
        p.post_id === postId 
          ? { ...p, comments: result.comments }
          : p
      ));
      setExpandedPostId(postId);
    } catch (error) {
      toast.error('Failed to load comments');
    }
  };

  const handleAddComment = async (postId: number) => {
    const comment = commentText[postId]?.trim();
    if (!comment) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      setLoadingCommentPostId(postId);
      await addComment(postId, comment);
      setCommentText({ ...commentText, [postId]: '' });
      toast.success('Comment added');
      // Reload comments
      const result = await getComments(postId);
      setPosts(posts.map(p => 
        p.post_id === postId 
          ? { ...p, comments: result.comments, comment_count: result.comments.length }
          : p
      ));
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setLoadingCommentPostId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-center py-8">
        <svg className="spinner" viewBox="0 0 24 24" width="32" height="32" stroke="var(--primary)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
          <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
          <path d="M12 2v4"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.welcome}>
        <div>
          <h1>Your News Feed</h1>
          <p>Catch up on the latest events and club news</p>
        </div>
      </div>

      <div className={styles.feed}>
        {posts.length === 0 ? (
          <div className={styles.emptyState}>
            <MessageCircle size={48} className="mb-4 text-muted" />
            <h3>No posts yet</h3>
            <p>Follow some clubs to see their updates here.</p>
          </div>
        ) : (
          posts.map((post) => (
            <Card key={post.post_id} className={styles.postCard}>
              <div className={styles.postHeader}>
                <div className={styles.postAvatar}>
                  {post.club_id} {/* Assuming no club details in post object per API docs, we just show ID or generic */}
                </div>
                <div className={styles.postMeta}>
                  <h3>Club #{post.club_id}</h3>
                  <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                </div>
              </div>
              
              <div className={styles.postContent}>{post.content}</div>
              
              {post.image_url && (
                <img src={post.image_url} alt="Post content" className={styles.postImage} />
              )}
              
              <div className={styles.postActions}>
                <button 
                  className={`${styles.actionButton} ${post.is_liked ? styles.liked : ''}`}
                  onClick={() => handleLike(post.post_id, post.is_liked)}
                >
                  <Heart size={20} fill={post.is_liked ? 'currentColor' : 'none'} />
                  {post.like_count}
                </button>
                <button 
                  className={styles.actionButton}
                  onClick={() => handleViewComments(post.post_id)}
                >
                  <MessageCircle size={20} />
                  {post.comment_count}
                </button>
                <button className={styles.actionButton}>
                  <Share2 size={20} />
                  Share
                </button>
              </div>

              {expandedPostId === post.post_id && (
                <div className={styles.commentsSection}>
                  <div className={styles.commentsList}>
                    {post.comments && post.comments.length > 0 ? (
                      post.comments.map((comment: Comment, index: number) => (
                        <div key={index} className={styles.comment}>
                          <div className={styles.commentHeader}>
                            <strong>{comment.student_name}</strong>
                            <span className={styles.commentTime}>
                              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className={styles.commentContent}>{comment.content}</p>
                        </div>
                      ))
                    ) : (
                      <p className={styles.noComments}>No comments yet</p>
                    )}
                  </div>

                  <div className={styles.commentInput}>
                    <textarea
                      placeholder="Write a comment..."
                      value={commentText[post.post_id] || ''}
                      onChange={(e) => setCommentText({ ...commentText, [post.post_id]: e.target.value })}
                      className={styles.commentTextarea}
                    />
                    <button
                      onClick={() => handleAddComment(post.post_id)}
                      disabled={loadingCommentPostId === post.post_id}
                      className={styles.commentButton}
                    >
                      {loadingCommentPostId === post.post_id ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
