import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { friendService } from '../services/api'
import Navbar from './Navbar'
import './Home.css'
import './Friends.css'

const Friends = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('friends') // friends, search, requests
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [friends, setFriends] = useState([])
  const [friendRequests, setFriendRequests] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (user?.email) {
      loadFriends()
      loadFriendRequests()
      loadSentRequests()
    }
  }, [user])

  const loadFriends = async () => {
    try {
      const response = await friendService.getFriends(user.email)
      setFriends(response.data || [])
    } catch (err) {
      console.error('Failed to load friends:', err)
    }
  }

  const loadFriendRequests = async () => {
    try {
      const response = await friendService.getFriendRequests(user.email)
      setFriendRequests(response.data || [])
    } catch (err) {
      console.error('Failed to load friend requests:', err)
    }
  }

  const loadSentRequests = async () => {
    try {
      const response = await friendService.getSentRequests(user.email)
      setSentRequests(response.data || [])
    } catch (err) {
      console.error('Failed to load sent requests:', err)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      setError('Please enter a search term')
      return
    }

    setIsLoading(true)
    setError('')
    setSearchResults([])

    try {
      const response = await friendService.searchUsers(user.email, searchQuery)
      setSearchResults(response.data || [])
      if (response.data.length === 0) {
        setError('No users found')
      }
    } catch (err) {
      setError('Failed to search users. Please try again.')
      console.error('Search error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendRequest = async (friendEmail) => {
    setError('')
    setSuccessMessage('')

    try {
      await friendService.sendFriendRequest(user.email, friendEmail)
      setSuccessMessage('Friend request sent successfully!')
      loadSentRequests()
      // Remove from search results or update status
      setSearchResults(prev => prev.filter(u => u.email !== friendEmail))
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send friend request')
    }
  }

  const handleAcceptRequest = async (friendEmail) => {
    setError('')
    setSuccessMessage('')

    try {
      await friendService.acceptFriendRequest(user.email, friendEmail)
      setSuccessMessage('Friend request accepted!')
      loadFriends()
      loadFriendRequests()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError('Failed to accept friend request')
    }
  }

  const handleRejectRequest = async (friendEmail) => {
    setError('')
    setSuccessMessage('')

    try {
      await friendService.rejectFriendRequest(user.email, friendEmail)
      setSuccessMessage('Friend request rejected')
      loadFriendRequests()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError('Failed to reject friend request')
    }
  }

  const handleRemoveFriend = async (friendEmail) => {
    if (!window.confirm('Are you sure you want to remove this friend?')) {
      return
    }

    setError('')
    setSuccessMessage('')

    try {
      await friendService.removeFriend(user.email, friendEmail)
      setSuccessMessage('Friend removed')
      loadFriends()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError('Failed to remove friend')
    }
  }

  const getUserInitial = (name) => {
    return name?.charAt(0).toUpperCase() || 'U'
  }

  return (
    <div className="home-container">
      <Navbar user={user} logout={logout} />
      
      <div className="container">
        <section className="section-card tracker-hero animate delay-1">
          <div>
            <h1>Friends</h1>
            <p>Connect with friends and share your wellness journey.</p>
          </div>
        </section>

        {error && (
          <div className="section-card animate" style={{ background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)', padding: '1rem', marginBottom: '1rem' }}>
            <p style={{ color: '#dc2626', margin: 0 }}>{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="section-card animate" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1rem', marginBottom: '1rem' }}>
            <p style={{ color: '#10b981', margin: 0 }}>{successMessage}</p>
          </div>
        )}

        <section className="section-card animate delay-2" style={{ marginBottom: '2rem' }}>
          <div className="friends-tabs">
            <button 
              className={`friends-tab ${activeTab === 'friends' ? 'active' : ''}`}
              onClick={() => setActiveTab('friends')}
            >
              My Friends ({friends.length})
            </button>
            <button 
              className={`friends-tab ${activeTab === 'search' ? 'active' : ''}`}
              onClick={() => setActiveTab('search')}
            >
              Search Users
            </button>
            <button 
              className={`friends-tab ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              Requests ({friendRequests.length})
            </button>
          </div>

          {activeTab === 'search' && (
            <div className="friends-search-section">
              <form onSubmit={handleSearch} className="search-form">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-btn" disabled={isLoading}>
                  {isLoading ? 'Searching...' : '🔍 Search'}
                </button>
              </form>

              <div className="search-results">
                {searchResults.map((result) => (
                  <div key={result.email} className="friend-card">
                    <div className="friend-info">
                      <div className="friend-avatar">{getUserInitial(result.fullName)}</div>
                      <div className="friend-details">
                        <h3>{result.fullName}</h3>
                        <p>{result.email}</p>
                      </div>
                    </div>
                    <button 
                      className="btn-add-friend"
                      onClick={() => handleSendRequest(result.email)}
                    >
                      ➕ Add Friend
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'friends' && (
            <div className="friends-list-section">
              {friends.length === 0 ? (
                <div className="empty-state">
                  <p>You haven't added any friends yet.</p>
                  <button 
                    className="btn-primary"
                    onClick={() => setActiveTab('search')}
                  >
                    Search for Friends
                  </button>
                </div>
              ) : (
                <div className="friends-grid">
                  {friends.map((friend) => (
                    <div key={friend.email} className="friend-card">
                      <div className="friend-info">
                        <div className="friend-avatar">{getUserInitial(friend.fullName)}</div>
                        <div className="friend-details">
                          <h3>{friend.fullName}</h3>
                          <p>{friend.email}</p>
                        </div>
                      </div>
                      <button 
                        className="btn-remove-friend"
                        onClick={() => handleRemoveFriend(friend.email)}
                      >
                        ✕ Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="friends-requests-section">
              <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Received Requests</h3>
              {friendRequests.length === 0 ? (
                <p style={{ color: 'var(--ink-500)', marginBottom: '2rem' }}>No pending friend requests</p>
              ) : (
                <div className="requests-list">
                  {friendRequests.map((request) => (
                    <div key={request.email} className="friend-card request-card">
                      <div className="friend-info">
                        <div className="friend-avatar">{getUserInitial(request.fullName)}</div>
                        <div className="friend-details">
                          <h3>{request.fullName}</h3>
                          <p>{request.email}</p>
                        </div>
                      </div>
                      <div className="request-actions">
                        <button 
                          className="btn-accept"
                          onClick={() => handleAcceptRequest(request.email)}
                        >
                          ✓ Accept
                        </button>
                        <button 
                          className="btn-reject"
                          onClick={() => handleRejectRequest(request.email)}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <h3 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.2rem' }}>Sent Requests</h3>
              {sentRequests.length === 0 ? (
                <p style={{ color: 'var(--ink-500)' }}>No sent requests</p>
              ) : (
                <div className="requests-list">
                  {sentRequests.map((request) => (
                    <div key={request.email} className="friend-card">
                      <div className="friend-info">
                        <div className="friend-avatar">{getUserInitial(request.fullName)}</div>
                        <div className="friend-details">
                          <h3>{request.fullName}</h3>
                          <p>{request.email}</p>
                        </div>
                      </div>
                      <span className="status-badge">Pending</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default Friends
