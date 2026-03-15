import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Home.css'

const Navbar = () => {
  const navigate = useNavigate()
  const { user, logout, isGuest } = useAuth()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const handleTrackerNavigation = (path) => {
    navigate(path)
  }

  const handleProfileClick = () => {
    setIsUserMenuOpen(false)
    navigate('/profile')
  }

  const handleFriendsClick = () => {
    setIsUserMenuOpen(false)
    navigate('/friends')
  }

  const handleSettingsClick = () => {
    setIsUserMenuOpen(false)
    navigate('/settings')
  }

  const handleMenuToggle = () => {
    setIsUserMenuOpen(prev => !prev)
  }

  const handleLogoutClick = () => {
    setIsUserMenuOpen(false)
    logout()
    navigate('/login')
  }

  const getUserInitial = () => {
    return user?.fullName?.charAt(0).toUpperCase() || 'U'
  }

  return (
    <nav className="navbar">
      <button className="navbar-brand" onClick={() => handleTrackerNavigation('/home')}>WellNest</button>
      <div className="navbar-options">
        <button className="navbar-nav-btn" onClick={() => handleTrackerNavigation('/home')}>🏠 Home</button>
        <button className="navbar-nav-btn" onClick={() => handleTrackerNavigation('/diet-planner')}>🍽️ Diet Planner</button>
        <button className="navbar-nav-btn" onClick={() => handleTrackerNavigation('/workout-planner')}>💪 Workout Planner</button>
        <button className="navbar-nav-btn" onClick={() => handleTrackerNavigation('/chat')}>💬 Health Chat</button>
        {!isGuest && (
          <button className="navbar-nav-btn" onClick={() => handleTrackerNavigation('/blog')}>📰 Blog</button>
        )}
      </div>

      <div className="navbar-user">
        <div className="user-menu">
          <button
            className="user-info-btn"
            onClick={handleMenuToggle}
            aria-haspopup="menu"
            aria-expanded={isUserMenuOpen}
          >
            <span className="user-info">
              <span className="user-avatar">{getUserInitial()}</span>
              <span>{user?.fullName}{isGuest && ' (Guest)'}</span>
            </span>
          </button>
          {isUserMenuOpen && (
            <div className="user-menu-dropdown" role="menu">
              <button className="menu-item" role="menuitem" onClick={handleProfileClick}>
                <span className="menu-item-content">
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="M4 20c1.8-4 5-6 8-6s6.2 2 8 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span>Profile</span>
                </span>
              </button>
              {!isGuest && (
                <button className="menu-item" role="menuitem" onClick={handleFriendsClick}>
                  <span className="menu-item-content">
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <circle cx="9" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
                      <circle cx="17" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
                      <path d="M3 20c1-3 4-5 6-5s5 2 6 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M13 20c1-3 4-5 6-5s5 2 6 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span>Friends</span>
                  </span>
                </button>
              )}
              <button className="menu-item" role="menuitem" onClick={handleSettingsClick}>
                <span className="menu-item-content">
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="M3.5 12a8.5 8.5 0 0 1 .1-1.2l2.2-.6.6-1.5-1.4-1.8a8.7 8.7 0 0 1 1.7-1.7l1.8 1.4 1.5-.6.6-2.2A8.5 8.5 0 0 1 12 3.5c.4 0 .8 0 1.2.1l.6 2.2 1.5.6 1.8-1.4a8.7 8.7 0 0 1 1.7 1.7l-1.4 1.8.6 1.5 2.2.6c.1.4.1.8.1 1.2s0 .8-.1 1.2l-2.2.6-.6 1.5 1.4 1.8a8.7 8.7 0 0 1-1.7 1.7l-1.8-1.4-1.5.6-.6 2.2c-.4.1-.8.1-1.2.1s-.8 0-1.2-.1l-.6-2.2-1.5-.6-1.8 1.4a8.7 8.7 0 0 1-1.7-1.7l1.4-1.8-.6-1.5-2.2-.6c-.1-.4-.1-.8-.1-1.2Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  </svg>
                  <span>Settings</span>
                </span>
              </button>
              <button className="menu-item" role="menuitem" onClick={handleLogoutClick}>
                <span className="menu-item-content">
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M10 12h10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M12 9l-3 3 3 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 12h5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span>Logout</span>
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
