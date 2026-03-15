import React, { useEffect, useMemo, useRef, useState } from 'react'
import Navbar from './Navbar'
import { useAuth } from '../context/AuthContext'
import { blogService } from '../services/api'
import './Blog.css'

const BLOG_STORIES_KEY = 'wellnest_blog_stories_v1'
const STORY_TTL_MS = 24 * 60 * 60 * 1000
const MAX_STORY_DURATION_SECONDS = 90

const Blog = () => {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [stories, setStories] = useState([])
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
  const [activeStory, setActiveStory] = useState(null)
  const [isCreatingStory, setIsCreatingStory] = useState(false)
  const [commentInputs, setCommentInputs] = useState({})
  const storyInputRef = useRef(null)

  const [postForm, setPostForm] = useState({
    visibility: 'public',
    title: '',
    content: '',
    category: 'Wellness',
    tags: '',
    images: []
  })

  const readStorage = (key, fallback = []) => {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return fallback
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : fallback
    } catch {
      return fallback
    }
  }

  const writeStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value))
  }

  const fileToDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  const getVideoDurationSeconds = (file) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      const objectUrl = URL.createObjectURL(file)

      video.preload = 'metadata'
      video.src = objectUrl
      video.onloadedmetadata = () => {
        const duration = video.duration
        URL.revokeObjectURL(objectUrl)
        if (!Number.isFinite(duration)) {
          reject(new Error('Invalid video duration'))
          return
        }
        resolve(duration)
      }
      video.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        reject(new Error('Unable to read video metadata'))
      }
    })
  }

  const pruneExpiredStories = (storyList) => {
    const now = Date.now()
    return storyList.filter((story) => {
      const createdAt = new Date(story.createdAt).getTime()
      return Number.isFinite(createdAt) && now - createdAt < STORY_TTL_MS
    })
  }

  useEffect(() => {
    // Load posts from backend API
    const fetchPosts = async () => {
      if (user?.email) {
        try {
          const fetchedPosts = await blogService.getPosts(user.email)
          setPosts(fetchedPosts)
        } catch (error) {
          console.error('Failed to fetch posts:', error)
          setPosts([])
        }
      }
    }

    // Load stories from localStorage (short-lived, 24h)
    const savedStories = readStorage(BLOG_STORIES_KEY)
    const validStories = pruneExpiredStories(savedStories)

    fetchPosts()
    setStories(validStories)
    if (validStories.length !== savedStories.length) {
      writeStorage(BLOG_STORIES_KEY, validStories)
    }
  }, [user?.email])

  useEffect(() => {
    const timer = setInterval(() => {
      setStories((prev) => {
        const next = pruneExpiredStories(prev)
        if (next.length !== prev.length) {
          writeStorage(BLOG_STORIES_KEY, next)
        }
        return next
      })
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  const orderedPosts = useMemo(() => {
    return [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [posts])

  const orderedStories = useMemo(() => {
    return [...stories].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [stories])

  const handlePostInputChange = (event) => {
    const { name, value } = event.target
    setPostForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePostImageChange = async (event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return

    try {
      const imageDataUrls = await Promise.all(files.map((file) => fileToDataUrl(file)))
      setPostForm((prev) => ({
        ...prev,
        images: [...prev.images, ...imageDataUrls].slice(0, 6)
      }))
    } catch {
      alert('Could not process selected images.')
    }
  }

  const handleCreatePost = async () => {
    const trimmedTitle = postForm.title.trim()
    const trimmedContent = postForm.content.trim()

    if (!trimmedTitle || !trimmedContent) {
      alert('Title and content are required.')
      return
    }

    const postData = {
      userEmail: user?.email || 'anonymous@wellnest.local',
      username: user?.fullName || 'WellNest User',
      visibility: postForm.visibility,
      title: trimmedTitle,
      content: trimmedContent,
      category: postForm.category,
      tags: postForm.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      images: postForm.images
    }

    try {
      const createdPost = await blogService.createPost(postData)
      setPosts([createdPost, ...posts])

      setPostForm({
        visibility: 'public',
        title: '',
        content: '',
        category: 'Wellness',
        tags: '',
        images: []
      })
      setIsPostModalOpen(false)
    } catch (error) {
      console.error('Failed to create post:', error)
      alert('Failed to create post. Please try again.')
    }
  }

  const handleCreateStory = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    setIsCreatingStory(true)
    try {
      const duration = await getVideoDurationSeconds(file)
      if (duration > MAX_STORY_DURATION_SECONDS) {
        alert('Story video must be 1.5 minutes (90 seconds) or less.')
        return
      }

      const videoDataUrl = await fileToDataUrl(file)
      const createdStory = {
        id: Date.now(),
        authorName: user?.fullName || 'WellNest User',
        authorEmail: user?.email || 'anonymous@wellnest.local',
        visibility: 'friends',
        videoUrl: videoDataUrl,
        durationSeconds: Math.round(duration),
        createdAt: new Date().toISOString()
      }

      const nextStories = pruneExpiredStories([createdStory, ...stories])
      setStories(nextStories)
      writeStorage(BLOG_STORIES_KEY, nextStories)
    } catch {
      alert('Could not upload story video. Please try another file.')
    } finally {
      setIsCreatingStory(false)
    }
  }

  const getTimeLabel = (isoDate) => {
    const then = new Date(isoDate).getTime()
    const diffMs = Date.now() - then
    const diffMinutes = Math.max(1, Math.floor(diffMs / 60000))

    if (diffMinutes < 60) return `${diffMinutes}m ago`
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return `${Math.floor(diffHours / 24)}d ago`
  }

  const handleToggleLike = async (postId) => {
    if (!postId) {
      console.error('Post ID is undefined')
      return
    }
    
    const userEmail = user?.email || 'anonymous@wellnest.local'
    
    try {
      const updatedPost = await blogService.toggleLike(postId, userEmail)
      setPosts(posts.map((post) => (post.id || post._id) === postId ? updatedPost : post))
    } catch (error) {
      console.error('Failed to toggle like:', error, 'PostId:', postId)
      alert('Failed to update like. Please try again.')
    }
  }

  const handleAddComment = async (postId) => {
    const commentText = (commentInputs[postId] || '').trim()
    if (!commentText) return

    const commentData = {
      author: user?.fullName || 'WellNest User',
      authorEmail: user?.email || 'anonymous@wellnest.local',
      text: commentText
    }

    try {
      const updatedPost = await blogService.addComment(postId, commentData)
      setPosts(posts.map((post) => (post.id || post._id) === postId ? updatedPost : post))
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }))
    } catch (error) {
      console.error('Failed to add comment:', error)
      alert('Failed to add comment. Please try again.')
    }
  }

  const handleCommentInputChange = (postId, value) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: value }))
  }

  return (
    <div className="blog-page">
      <Navbar />

      <main className="blog-shell">
        <section className="stories-section">
          <div className="stories-header">
            <div>
              <h2>Stories</h2>
              <p>Friends-only videos, 1.5 min max, auto-expire in 24 hours.</p>
            </div>
            <button
              type="button"
              className="story-upload-btn"
              onClick={() => storyInputRef.current?.click()}
              disabled={isCreatingStory}
            >
              {isCreatingStory ? 'Uploading...' : '+ Add Story'}
            </button>
            <input
              ref={storyInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={handleCreateStory}
              hidden
            />
          </div>

          <div className="stories-row">
            {orderedStories.length === 0 && <p className="empty-note">No active stories yet.</p>}
            {orderedStories.map((story) => (
              <button
                type="button"
                key={story.id}
                className="story-chip"
                onClick={() => setActiveStory(story)}
              >
                <span className="story-ring">
                  <span className="story-initial">{(story.authorName || 'U').charAt(0).toUpperCase()}</span>
                </span>
                <span className="story-meta">
                  <span className="story-author">{story.authorName}</span>
                  <span className="story-time">{getTimeLabel(story.createdAt)}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="posts-section">
          <div className="posts-header">
            <div>
              <h2>Blog Feed</h2>
              <p>Share your progress, lessons, and health journey.</p>
            </div>
          </div>

          {orderedPosts.length === 0 && (
            <div className="empty-card">
              <h3>No posts yet</h3>
              <p>Create your first health blog post using the + button.</p>
            </div>
          )}

          <div className="posts-list">
            {orderedPosts.map((post) => (
              <article key={post.id} className="post-card">
                <div className="post-head">
                  <div>
                    <h3>{post.title}</h3>
                    <p>{post.username} • {getTimeLabel(post.createdAt)}</p>
                  </div>
                  <span className={`visibility-pill ${post.visibility}`}>
                    {post.visibility === 'friends' ? 'Friends' : 'Public'}
                  </span>
                </div>

                <div className="post-body">
                  {!!post.images?.length && (
                    <div className="post-image-container">
                      <img src={post.images[0]} alt={post.title} loading="lazy" />
                    </div>
                  )}
                  
                  <div className="post-text-content">
                    <div className="post-category">{post.category}</div>
                    <p className="post-content">{post.content}</p>
                  </div>
                </div>

                {!!post.tags?.length && (
                  <div className="post-tags">
                    {post.tags.map((tag) => (
                      <span key={`${post.id}-${tag}`} className="tag-chip">#{tag}</span>
                    ))}
                  </div>
                )}

                <div className="post-interactions">
                  <button 
                    type="button" 
                    className={`like-btn ${(post.likes || []).includes(user?.email) ? 'liked' : ''}`}
                    onClick={() => handleToggleLike(post.id || post._id)}
                  >
                    <span className="like-icon">{(post.likes || []).includes(user?.email) ? '❤️' : '🤍'}</span>
                    <span>{(post.likes || []).length} {(post.likes || []).length === 1 ? 'like' : 'likes'}</span>
                  </button>
                  <span className="comment-count">💬 {(post.comments || []).length} {(post.comments || []).length === 1 ? 'comment' : 'comments'}</span>
                </div>

                <div className="comments-section">
                  {(post.comments || []).length > 0 && (
                    <div className="comments-list">
                      {post.comments.map((comment, idx) => (
                        <div key={`comment-${post.id}-${idx}`} className="comment-item">
                          <div className="comment-head">
                            <strong>{comment.author}</strong>
                            <span>{getTimeLabel(comment.timestamp || comment.createdAt)}</span>
                          </div>
                          <p className="comment-text">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="comment-input-row">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={commentInputs[post.id || post._id] || ''}
                      onChange={(e) => handleCommentInputChange(post.id || post._id, e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddComment(post.id || post._id)
                        }
                      }}
                    />
                    <button 
                      type="button" 
                      onClick={() => handleAddComment(post.id || post._id)}
                      disabled={!(commentInputs[post.id || post._id] || '').trim()}
                    >
                      Post
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <button type="button" className="create-post-fab" onClick={() => setIsPostModalOpen(true)}>
        +
      </button>

      {isPostModalOpen && (
        <div className="blog-modal-overlay" onClick={() => setIsPostModalOpen(false)}>
          <div className="blog-modal" onClick={(event) => event.stopPropagation()}>
            <div className="blog-modal-head">
              <h3>Create Blog Post</h3>
              <button type="button" onClick={() => setIsPostModalOpen(false)}>x</button>
            </div>

            <div className="blog-modal-grid">
              <label>
                Visibility
                <select name="visibility" value={postForm.visibility} onChange={handlePostInputChange}>
                  <option value="public">Public</option>
                  <option value="friends">Friends</option>
                </select>
              </label>

              <label>
                Category
                <select name="category" value={postForm.category} onChange={handlePostInputChange}>
                  <option value="Wellness">Wellness</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Nutrition">Nutrition</option>
                  <option value="Sleep">Sleep</option>
                  <option value="Mental Health">Mental Health</option>
                </select>
              </label>

              <label className="full-width">
                Title
                <input
                  name="title"
                  value={postForm.title}
                  onChange={handlePostInputChange}
                  placeholder="Give your post a clear title"
                />
              </label>

              <label className="full-width">
                Content
                <textarea
                  name="content"
                  value={postForm.content}
                  onChange={handlePostInputChange}
                  rows={6}
                  placeholder="Write your story, tips, or progress update"
                />
              </label>

              <label className="full-width">
                Tags (comma separated)
                <input
                  name="tags"
                  value={postForm.tags}
                  onChange={handlePostInputChange}
                  placeholder="weight-loss, morning-routine, hydration"
                />
              </label>

              <label className="full-width">
                Images
                <input type="file" accept="image/*" multiple onChange={handlePostImageChange} />
              </label>

              {!!postForm.images.length && (
                <div className="preview-grid full-width">
                  {postForm.images.map((image, index) => (
                    <img key={`preview-${index}`} src={image} alt={`Selected ${index + 1}`} />
                  ))}
                </div>
              )}
            </div>

            <div className="blog-modal-actions">
              <button type="button" className="secondary" onClick={() => setIsPostModalOpen(false)}>Cancel</button>
              <button type="button" className="primary" onClick={handleCreatePost}>Publish</button>
            </div>
          </div>
        </div>
      )}

      {activeStory && (
        <div className="story-viewer-overlay" onClick={() => setActiveStory(null)}>
          <div className="story-viewer" onClick={(event) => event.stopPropagation()}>
            <div className="story-viewer-head">
              <span>{activeStory.authorName}</span>
              <button type="button" onClick={() => setActiveStory(null)}>x</button>
            </div>
            <video src={activeStory.videoUrl} controls autoPlay playsInline />
            <p>{activeStory.durationSeconds}s • Expires in 24h</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Blog
