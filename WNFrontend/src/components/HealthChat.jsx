import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { healthChatService } from '../services/api'
import Navbar from './Navbar'
import './Home.css'
import './TrackerPages.css'

const HealthChat = () => {
  const { user } = useAuth()
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: chatInput,
      sender: 'user'
    }

    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setIsLoading(true)
    setError('')

    try {
      // Send message to backend using the service
      const response = await healthChatService.sendMessage(user?.email, userMessage.text)

      // Add AI response
      const aiMessage = {
        id: Date.now() + 1,
        text: response.reply || 'I apologize, but I could not generate a response. Please try again.',
        sender: 'assistant'
      }

      setChatMessages(prev => [...prev, aiMessage])
    } catch (err) {
      console.error('Error sending message:', err)
      setError('Failed to send message. Please try again.')
      
      // Add error message to chat
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'assistant'
      }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear all messages?')) {
      setChatMessages([])
      setError('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="home-container">
      <Navbar />

      <div className="container">
        <div className="section-card animate">
          <h2 style={{ marginBottom: '1.5rem', color: 'red', textAlign: 'center' }}>Health Chat</h2>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <p>Get instant health advice and answers from our AI health assistant</p>
          </div>

          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            {error && (
              <div style={{
                padding: '1rem',
                marginBottom: '1rem',
                backgroundColor: '#f8d7da',
                color: '#721c24',
                borderRadius: '8px',
                border: '1px solid #f5c6cb'
              }}>
                {error}
              </div>
            )}

            <div style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              height: '450px',
              padding: '1rem',
              marginBottom: '1rem',
              backgroundColor: '#f9f9f9',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {chatMessages.length === 0 ? (
                <p style={{
                  color: '#666',
                  textAlign: 'center',
                  margin: 'auto',
                  fontSize: '1.1rem'
                }}>
                  Start a conversation with your AI health assistant...
                </p>
              ) : (
                <>
                  {chatMessages.map(message => (
                    <div
                      key={message.id}
                      style={{
                        marginBottom: '1rem',
                        textAlign: message.sender === 'user' ? 'right' : 'left'
                      }}
                    >
                      <div style={{
                        display: 'inline-block',
                        padding: '0.75rem 1.25rem',
                        borderRadius: '18px',
                        backgroundColor: message.sender === 'user' ? '#007bff' : '#e9ecef',
                        color: message.sender === 'user' ? 'white' : 'black',
                        maxWidth: '70%',
                        wordWrap: 'break-word',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                      }}>
                        {message.text}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                  {isLoading && (
                    <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
                      <div style={{
                        display: 'inline-block',
                        padding: '0.75rem 1.25rem',
                        borderRadius: '18px',
                        backgroundColor: '#e9ecef',
                        color: 'black'
                      }}>
                        <span style={{ fontSize: '1.2rem' }}>●●●</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'flex-end'
            }}>
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about health, nutrition, or fitness... (Press Enter to send)"
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontFamily: 'inherit',
                  minHeight: '45px',
                  maxHeight: '120px',
                  resize: 'vertical',
                  fontSize: '0.95rem'
                }}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={handleClearChat}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1
                }}
                disabled={isLoading}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleSendMessage}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'red',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  opacity: isLoading ? 0.6 : 1
                }}
                disabled={isLoading || !chatInput.trim()}
              >
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HealthChat
