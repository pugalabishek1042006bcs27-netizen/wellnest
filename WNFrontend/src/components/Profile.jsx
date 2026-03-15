import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { profileService, blogService } from '../services/api'
import Navbar from './Navbar'
import './Home.css'

const Profile = () => {
  const navigate = useNavigate()
  const { user, logout, updateProfile: saveProfileToContext } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [myPosts, setMyPosts] = useState([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [editFormData, setEditFormData] = useState({
    age: '',
    height: '',
    weight: '',
    recentHealthIssues: [],
    pastHealthIssues: []
  })

  const healthIssuesOptions = [
    'Diabetes',
    'Hypertension',
    'Heart Disease',
    'Asthma',
    'Thyroid Issues',
    'Depression/Anxiety',
    'Obesity',
    'High Cholesterol',
    'Arthritis',
    'Back Pain',
    'Migraine',
    'Sleep Disorder',
    'PCOD/PCOS',
    'Allergies',
    'None'
  ]

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (user?.email) {
          const response = await profileService.getProfile(user.email)
          setProfile(response.data)
          setEditFormData({
            age: response.data.age != null ? String(response.data.age) : '',
            height: response.data.height != null ? String(response.data.height) : '',
            weight: response.data.weight != null ? String(response.data.weight) : '',
            recentHealthIssues: response.data.recentHealthIssues || [],
            pastHealthIssues: response.data.pastHealthIssues || []
          })
        }
      } catch (err) {
        console.log('Profile not yet set up')
      } finally {
        setLoading(false)
      }
    }

    const fetchMyPosts = async () => {
      try {
        if (user?.email) {
          const posts = await blogService.getPostsByUser(user.email)
          setMyPosts(posts)
        }
      } catch (err) {
        console.error('Failed to fetch posts:', err)
        setMyPosts([])
      } finally {
        setLoadingPosts(false)
      }
    }

    fetchProfile()
    fetchMyPosts()
  }, [user])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleHomeClick = () => {
    navigate('/home')
  }

  const getUserInitial = () => {
    return user?.fullName?.charAt(0).toUpperCase() || 'U'
  }

  const handleEditInputChange = (e) => {
    const { name, value } = e.target

    if (name === 'age') {
      if (!/^\d{0,3}$/.test(value)) {
        return
      }
      setEditFormData({ ...editFormData, [name]: value })
      return
    }

    if (name === 'height' || name === 'weight') {
      if (!/^\d*\.?\d*$/.test(value)) {
        return
      }
      setEditFormData({ ...editFormData, [name]: value })
    }
  }

  const handleHealthIssueChange = (issue, type) => {
    setEditFormData(prev => {
      const issuesKey = type === 'recent' ? 'recentHealthIssues' : 'pastHealthIssues'
      const currentIssues = prev[issuesKey]

      if (currentIssues.includes(issue)) {
        return {
          ...prev,
          [issuesKey]: currentIssues.filter(i => i !== issue)
        }
      }

      return {
        ...prev,
        [issuesKey]: [...currentIssues, issue]
      }
    })
  }

  const handleSaveProfile = async () => {
    try {
      const payload = {
        ...editFormData,
        age: editFormData.age === '' ? null : Number(editFormData.age),
        height: editFormData.height === '' ? null : Number(editFormData.height),
        weight: editFormData.weight === '' ? null : Number(editFormData.weight)
      }
      const updated = await profileService.updateProfile(user.email, payload)
      setProfile(updated.data)
      saveProfileToContext(updated.data)
      setIsEditingProfile(false)
    } catch (err) {
      console.error('Failed to update profile')
    }
  }

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return
    }

    try {
      await blogService.deletePost(postId, user.email)
      setMyPosts(myPosts.filter(post => (post.id || post._id) !== postId))
      alert('Post deleted successfully!')
    } catch (err) {
      console.error('Failed to delete post:', err)
      alert('Failed to delete post. Please try again.')
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

  return (
    <div className="home-container">
      <Navbar />

      <div className="container">
        <div className="profile-section section-card animate delay-1">
          <div className="profile-header">
            <h2>📋 Your Health Profile</h2>
            <button
              className="edit-profile-btn"
              onClick={() => setIsEditingProfile(!isEditingProfile)}
            >
              {isEditingProfile ? '✕ Cancel' : '✏️ Edit Profile'}
            </button>
          </div>

          {loading ? (
            <p>Loading profile...</p>
          ) : !isEditingProfile ? (
            <div className="profile-display">
              {profile && profile.profileCompleted ? (
                <div className="profile-grid">
                  <div className="profile-item">
                    <div className="profile-label">Age</div>
                    <div className="profile-value">{profile.age} years</div>
                  </div>
                  <div className="profile-item">
                    <div className="profile-label">Height</div>
                    <div className="profile-value">{profile.height} cm</div>
                  </div>
                  <div className="profile-item">
                    <div className="profile-label">Weight</div>
                    <div className="profile-value">{profile.weight} kg</div>
                  </div>
                  <div className="profile-item">
                    <div className="profile-label">BMI</div>
                    <div className="profile-value">
                      {((profile.weight / ((profile.height / 100) ** 2)).toFixed(1))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-profile">
                  <p>Complete your health profile to get started</p>
                  <button
                    className="complete-profile-btn"
                    onClick={() => setIsEditingProfile(true)}
                  >
                    Complete Profile Now
                  </button>
                </div>
              )}

              {profile && profile.recentHealthIssues && profile.recentHealthIssues.length > 0 && (
                <div className="health-issues-display">
                  <div className="issues-section">
                    <h4>Recent Health Issues:</h4>
                    <div className="issues-list">
                      {profile.recentHealthIssues.map((issue, idx) => (
                        <span key={idx} className="issue-badge">{issue}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {profile && profile.pastHealthIssues && profile.pastHealthIssues.length > 0 && (
                <div className="health-issues-display">
                  <div className="issues-section">
                    <h4>Past Health Issues:</h4>
                    <div className="issues-list">
                      {profile.pastHealthIssues.map((issue, idx) => (
                        <span key={idx} className="issue-badge past">{issue}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="profile-edit-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Age (years) *</label>
                  <input
                    type="number"
                    name="age"
                    value={editFormData.age}
                    onChange={handleEditInputChange}
                    min="10"
                    max="120"
                  />
                </div>
                <div className="form-group">
                  <label>Height (cm) *</label>
                  <input
                    type="number"
                    name="height"
                    value={editFormData.height}
                    onChange={handleEditInputChange}
                    step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label>Weight (kg) *</label>
                  <input
                    type="number"
                    name="weight"
                    value={editFormData.weight}
                    onChange={handleEditInputChange}
                    step="0.1"
                  />
                </div>
              </div>

              <div className="form-group-full">
                <label>Recent Health Issues</label>
                <div className="health-issues-grid">
                  {healthIssuesOptions.map(issue => (
                    <div key={`recent-${issue}`} className="checkbox-item">
                      <input
                        type="checkbox"
                        id={`recent-${issue}`}
                        checked={editFormData.recentHealthIssues.includes(issue)}
                        onChange={() => handleHealthIssueChange(issue, 'recent')}
                      />
                      <label htmlFor={`recent-${issue}`}>{issue}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group-full">
                <label>Past Health Issues</label>
                <div className="health-issues-grid">
                  {healthIssuesOptions.map(issue => (
                    <div key={`past-${issue}`} className="checkbox-item">
                      <input
                        type="checkbox"
                        id={`past-${issue}`}
                        checked={editFormData.pastHealthIssues.includes(issue)}
                        onChange={() => handleHealthIssueChange(issue, 'past')}
                      />
                      <label htmlFor={`past-${issue}`}>{issue}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button className="btn-save" onClick={handleSaveProfile}>
                  Save Profile
                </button>
                <button
                  className="btn-cancel"
                  onClick={() => setIsEditingProfile(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* My Blog Posts Section */}
        <div className="profile-section section-card animate delay-2" style={{ marginTop: '20px' }}>
          <div className="profile-header">
            <h2>📝 My Blog Posts</h2>
            <span style={{ fontSize: '14px', color: '#64748b' }}>
              {myPosts.length} {myPosts.length === 1 ? 'post' : 'posts'}
            </span>
          </div>

          {loadingPosts ? (
            <p>Loading your posts...</p>
          ) : myPosts.length === 0 ? (
            <div className="no-profile" style={{ textAlign: 'center', padding: '30px' }}>
              <p style={{ fontSize: '16px', color: '#64748b' }}>You haven't created any blog posts yet.</p>
              <button
                className="complete-profile-btn"
                onClick={() => navigate('/blog')}
                style={{ marginTop: '15px' }}
              >
                Create Your First Post
              </button>
            </div>
          ) : (
            <div className="my-posts-grid">
              {myPosts.map((post) => (
                <div key={post.id || post._id} className="my-post-card">
                  <div className="my-post-header">
                    <div>
                      <h3 className="my-post-title">{post.title}</h3>
                      <p className="my-post-meta">
                        <span className={`visibility-badge ${post.visibility}`}>
                          {post.visibility === 'friends' ? '👥 Friends' : '🌍 Public'}
                        </span>
                        <span style={{ margin: '0 8px' }}>•</span>
                        <span>{getTimeLabel(post.createdAt)}</span>
                        <span style={{ margin: '0 8px' }}>•</span>
                        <span>{post.category}</span>
                      </p>
                    </div>
                    <button
                      className="delete-post-btn"
                      onClick={() => handleDeletePost(post.id || post._id)}
                      title="Delete post"
                    >
                      🗑️
                    </button>
                  </div>

                  {post.images && post.images.length > 0 && (
                    <div className="my-post-image">
                      <img src={post.images[0]} alt={post.title} />
                    </div>
                  )}

                  <p className="my-post-content">
                    {post.content.length > 150
                      ? post.content.substring(0, 150) + '...'
                      : post.content}
                  </p>

                  {post.tags && post.tags.length > 0 && (
                    <div className="my-post-tags">
                      {post.tags.map((tag, idx) => (
                        <span key={idx} className="my-post-tag">#{tag}</span>
                      ))}
                    </div>
                  )}

                  <div className="my-post-stats">
                    <span>❤️ {post.likes?.length || 0} likes</span>
                    <span>💬 {post.comments?.length || 0} comments</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
