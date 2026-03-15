import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import { useAuth } from '../context/AuthContext'
import { authService, profileService } from '../services/api'
import './Settings.css'

const Settings = () => {
  const navigate = useNavigate()
  const { user, isGuest, logout, isDarkMode, toggleDarkMode } = useAuth()

  const [status, setStatus] = useState('')
  const [isResetting, setIsResetting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const clearLocalProfileCache = () => {
    localStorage.removeItem('profile')
    sessionStorage.removeItem('profile')
    sessionStorage.removeItem('guestProfile')
    sessionStorage.removeItem('guestGoals')
  }

  const handleResetAccount = async () => {
    setStatus('')

    if (!user?.email && !isGuest) {
      setStatus('Unable to reset account. Please login again.')
      return
    }

    setIsResetting(true)

    try {
      if (isGuest) {
        clearLocalProfileCache()
        setStatus('Guest account data reset successfully.')
      } else {
        await profileService.resetAccount(user.email)
        clearLocalProfileCache()
        setStatus('Account data reset successfully.')
      }
    } catch (error) {
      setStatus(error?.response?.data?.message || 'Failed to reset account.')
    } finally {
      setIsResetting(false)
    }
  }

  const handleDeleteAccount = async () => {
    setStatus('')

    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      setStatus('Type DELETE to confirm account deletion.')
      return
    }

    if (!user?.email && !isGuest) {
      setStatus('Unable to delete account. Please login again.')
      return
    }

    setIsDeleting(true)

    try {
      if (!isGuest) {
        await authService.deleteAccount(user.email)
      }

      logout()
      navigate('/login')
    } catch (error) {
      setStatus(error?.response?.data?.message || 'Failed to delete account.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="home-container">
      <Navbar />

      <div className="container settings-container">
        <div className="section-card settings-card">
          <h2>Settings</h2>
          <p className="settings-subtitle">Manage appearance and account controls.</p>

          <div className="settings-row">
            <div>
              <h3>Dark Mode</h3>
              <p>Switch between light and dark themes across the app.</p>
            </div>
            <button className="settings-toggle-btn" onClick={toggleDarkMode}>
              {isDarkMode ? 'Turn Off Dark Mode' : 'Turn On Dark Mode'}
            </button>
          </div>

          <div className="settings-row danger">
            <div>
              <h3>Reset Account</h3>
              <p>Clears your profile and tracker data while keeping your login account.</p>
            </div>
            <button className="danger-btn" onClick={handleResetAccount} disabled={isResetting}>
              {isResetting ? 'Resetting...' : 'Reset Account'}
            </button>
          </div>

          <div className="settings-row danger delete-row">
            <div>
              <h3>Delete Account</h3>
              <p>Permanently remove your account. This action cannot be undone.</p>
            </div>
            <div className="delete-controls">
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
              />
              <button className="danger-btn" onClick={handleDeleteAccount} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>

          {status && <p className="settings-status">{status}</p>}
        </div>
      </div>
    </div>
  )
}

export default Settings
