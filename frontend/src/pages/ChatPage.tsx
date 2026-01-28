import { useState, useEffect, useRef } from 'react'
import { Textarea } from '../components/Textarea'
import { Button } from '../components/Button'
import { Sidebar } from '../components/Sidebar'
import { useApi } from '../api/useApi'
import { useChatStore, type Message as ChatMessage } from '../hooks/useChatStore'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  type?: string
}

// Safely parse response and extract message
function extractAssistantMessage(data: unknown): string {
  try {
    if (!data || typeof data !== 'object') {
      return "I'm having trouble processing that. Please try again."
    }

    const response = data as any
    const result = response?.data?.result

    if (!result || typeof result !== 'object') {
      return "I'm having trouble processing that. Please try again."
    }

    const message = result.response
    if (!message || typeof message !== 'string') {
      return "I'm having trouble processing that. Please try again."
    }

    return message
  } catch {
    return "I'm having trouble processing that. Please try again."
  }
}

export function ChatPage() {
  const { isConfigured, assistant } = useApi()
  const {
    chats,
    activeChatId,
    setActiveChatId,
    getActiveChat,
    addMessage: addMessageToStore,
    renameChat,
    deleteChat,
    isLoaded,
  } = useChatStore()

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'connecting' | 'offline'>('online')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('bhiv_sidebar_collapsed')
    return saved ? JSON.parse(saved) : true // Default collapsed
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const loadingStartTimeRef = useRef<number | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const [inputFocused, setInputFocused] = useState(false)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState('')

  const placeholders = [
    'Ask me anything…',
    'Plan your day…',
    'Get help with tasks…',
  ]

  // Get messages from active chat
  const activeChat = getActiveChat()
  const messages: Message[] = activeChat
    ? activeChat.messages.map((m: ChatMessage) => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        type: undefined,
      }))
    : []

  // Persist sidebar collapsed state
  useEffect(() => {
    localStorage.setItem('bhiv_sidebar_collapsed', JSON.stringify(sidebarCollapsed))
  }, [sidebarCollapsed])

  // No auto-initialization - start fresh

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  // Ensure loading state never stays stuck
  useEffect(() => {
    if (!loading) return

    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('[Chat] Loading state exceeded 60s timeout, forcing reset')
        setLoading(false)
        const fallbackMsg: ChatMessage = {
          id: (Date.now() + 999).toString(),
          role: 'assistant',
          content: "I'm taking too long to respond. Please try again.",
          timestamp: Date.now(),
        }
        addMessageToStore('assistant', fallbackMsg.content)
      }
    }, 60000)

    return () => clearTimeout(timeout)
  }, [loading, addMessageToStore])

  // Animated placeholder effect
  useEffect(() => {
    if (input.length > 0) {
      return
    }

    const currentPlaceholder = placeholders[placeholderIndex]
    let charIndex = 0
    let isDeleting = false
    let typeTimeout: NodeJS.Timeout

    const type = () => {
      if (!isDeleting) {
        if (charIndex < currentPlaceholder.length) {
          setDisplayedPlaceholder(currentPlaceholder.slice(0, charIndex + 1))
          charIndex++
          typeTimeout = setTimeout(type, 50)
        } else {
          typeTimeout = setTimeout(() => {
            isDeleting = true
            type()
          }, 2000)
        }
      } else {
        if (charIndex > 0) {
          setDisplayedPlaceholder(currentPlaceholder.slice(0, charIndex - 1))
          charIndex--
          typeTimeout = setTimeout(type, 30)
        } else {
          setPlaceholderIndex((prev) => (prev + 1) % placeholders.length)
          isDeleting = false
          typeTimeout = setTimeout(type, 500)
        }
      }
    }

    typeTimeout = setTimeout(type, 500)
    return () => clearTimeout(typeTimeout)
  }, [input, placeholderIndex])

  // Configuration error UI - renders if env vars not set
  if (!isConfigured) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: `
          radial-gradient(circle at 20% 20%, rgba(255,255,255,0.05), transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(0,0,0,0.3), transparent 50%),
          linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #0c1222 100%)
        `,
        color: 'white',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '24px',
      }}>
        <div style={{
          maxWidth: '500px',
          textAlign: 'center',
        }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '16px',
            color: 'rgba(255,255,255,0.95)',
          }}>Configuration Error</h1>
          <p style={{
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '24px',
            lineHeight: '1.6',
          }}>
            The API connection is not configured. Please set the following environment variables:
          </p>
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'left',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            marginBottom: '24px',
            color: 'rgba(255,255,255,0.6)',
          }}>
            <div>VITE_API_BASE_URL</div>
            <div>VITE_API_KEY</div>
          </div>
          <p style={{
            fontSize: '0.9rem',
            color: 'rgba(255,255,255,0.5)',
          }}>
            Please check your .env file and restart the development server.
          </p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Prevent empty input
    if (!input.trim() || loading) {
      return
    }

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Record loading start time for minimum visibility
    loadingStartTimeRef.current = Date.now()

    // Add user message via store
    const userInput = input
    addMessageToStore('user', userInput)
    setInput('')
    setLoading(true)
    setConnectionStatus('connecting')

    // Make request
    makeAssistantRequest(userInput)
  }

  const makeAssistantRequest = async (message: string) => {
    try {
      const startTime = Date.now()
      const data = await assistant({ message })

      // Ensure minimum loading visibility of 300ms
      const elapsed = Date.now() - startTime
      if (elapsed < 300) {
        await new Promise(r => setTimeout(r, 300 - elapsed))
      }

      // Parse response defensively
      const responseText = extractAssistantMessage(data)

      addMessageToStore('assistant', responseText)
      setConnectionStatus('online')
    } catch (error: any) {
      // Ensure minimum loading visibility even on error
      const elapsed = Date.now() - (loadingStartTimeRef.current || Date.now())
      if (elapsed < 300) {
        await new Promise(r => setTimeout(r, 300 - elapsed))
      }

      let errorMessage = "I'm having trouble right now. Please try again."

      // Check connection first
      if (!navigator.onLine) {
        errorMessage = "I can't reach the server. Please check your connection."
      } else if (error?.response?.status === 400) {
        errorMessage = 'That didn\'t work. Could you rephrase that?'
      } else if (error?.name === 'AbortError') {
        errorMessage = "I was interrupted. Please try again."
      }

      addMessageToStore('assistant', errorMessage)
      setConnectionStatus(navigator.onLine ? 'online' : 'offline')
    } finally {
      setLoading(false)
      loadingStartTimeRef.current = null
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    } else if (e.key === 'Escape') {
      textareaRef.current?.blur()
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'online': return 'Connected'
      case 'connecting': return 'Connecting…'
      case 'offline': return 'Offline'
      default: return 'Connected'
    }
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'online': return '#10b981'
      case 'connecting': return '#f59e0b'
      case 'offline': return '#ef4444'
      default: return '#10b981'
    }
  }

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(!sidebarOpen)
    } else {
      setSidebarCollapsed(!sidebarCollapsed)
    }
  }

  const handleCloseSidebar = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    } else {
      setSidebarCollapsed(true)
    }
  }

  return (
    <>
      <style>
        {`
          /* Breathing Pulse - Subtle and Slow */
          @keyframes breathingPulse {
            0% {
              transform: scale(0.85);
              opacity: 0.35;
            }
            50% {
              transform: scale(1.05);
              opacity: 0.55;
            }
            100% {
              transform: scale(0.85);
              opacity: 0.35;
            }
          }

          /* Gentle appearance animations */
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(16px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translateY(-8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes pulse {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes typing {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-10px); }
          }

          /* CSS Classes */
          .breathing-pulse {
            animation: breathingPulse 5s ease-in-out infinite;
          }

          .message-fade-in {
            animation: fadeIn 0.4s ease-out;
          }

          .message-slide-up {
            animation: slideUp 0.4s ease-out;
          }

          .typing-dot {
            animation: typing 1.4s infinite ease-in-out;
          }

          .typing-dot:nth-child(2) { animation-delay: 0.2s; }
          .typing-dot:nth-child(3) { animation-delay: 0.4s; }

          .action-card {
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .action-card:hover {
            transform: translateY(-6px);
            background: rgba(255,255,255,0.08) !important;
            border-color: rgba(16, 185, 129, 0.5) !important;
            box-shadow: 0 12px 32px rgba(16, 185, 129, 0.12);
          }

          .action-card:active {
            transform: translateY(-2px);
          }

          /* Focus states for keyboard navigation */
          .action-card:focus-visible {
            outline: 2px solid rgba(16, 185, 129, 0.6);
            outline-offset: 2px;
          }

          .navbar {
            animation: fadeInDown 0.5s ease-out;
          }

          .hero-content {
            animation: fadeInUp 0.6s ease-out;
          }

          .action-grid {
            animation: fadeInUp 0.6s ease-out 0.15s both;
          }

          .input-composer {
            animation: fadeInUp 0.5s ease-out 0.2s both;
          }

          /* Smooth scrollbar */
          .chat-area::-webkit-scrollbar {
            width: 6px;
          }

          .chat-area::-webkit-scrollbar-track {
            background: transparent;
          }

          .chat-area::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.08);
            border-radius: 3px;
          }

          .chat-area::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.15);
          }

          /* Reduced motion support */
          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }

          /* Mobile optimizations */
          @media (max-width: 640px) {
            .input-composer {
              bottom: 16px !important;
              padding: 0 16px !important;
            }

            .input-form {
              max-width: 100% !important;
              padding: 11px 14px 11px 16px !important;
              border-radius: 28px !important;
            }

            .send-button {
              width: 38px !important;
              height: 38px !important;
              min-width: 38px !important;
              min-height: 38px !important;
            }

            .navbar {
              height: 56px !important;
              padding: 0 16px !important;
            }

            .navbar-title {
              font-size: 1rem !important;
            }

            .hero-content {
              padding: 24px 16px !important;
            }

            .action-grid {
              grid-template-columns: 1fr !important;
              max-width: 100% !important;
              gap: 12px !important;
            }

            .action-card-label {
              font-size: 0.9rem !important;
            }

            .chat-area {
              padding: 24px 16px 120px 16px !important;
            }
          }

          @media (min-width: 641px) and (max-width: 1024px) {
            .chat-area {
              max-width: 720px !important;
            }

            .action-grid {
              max-width: 500px !important;
            }
          }

          @media (min-width: 1025px) {
            .chat-area {
              max-width: 720px !important;
            }

            .action-grid {
              max-width: 600px !important;
            }
          }
        `}
      </style>
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: `
          radial-gradient(circle at 20% 20%, rgba(255,255,255,0.05), transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(0,0,0,0.3), transparent 50%),
          linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #0c1222 100%),
          url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><defs><filter id="noise"><feTurbulence baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/><feColorMatrix values="0"/></filter></defs><rect width="100%" height="100%" filter="url(%23noise)" opacity="0.05"/></svg>')
        `,
        color: 'white',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        {/* Top Navigation Bar */}
        <header className="navbar" style={{
          height: '64px',
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          position: 'relative',
          zIndex: 10,
          flexShrink: 0,
          marginLeft: window.innerWidth >= 768 && !sidebarCollapsed ? '300px' : '0px',
          transition: 'margin-left 0.25s ease-out',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <button
              onClick={handleToggleSidebar}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.8)',
                cursor: 'pointer',
                padding: '8px',
                marginRight: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                transition: 'all 0.2s ease-out',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'rgba(16, 185, 129, 0.8)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
              }}
              title="Toggle chat history"
            >
              ☰
            </button>
            <button
              onClick={() => setActiveChatId('')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.2rem',
                fontWeight: '700',
                margin: 0,
                color: 'rgba(255,255,255,0.98)',
                letterSpacing: '-0.6px',
                cursor: 'pointer',
                padding: '4px 8px',
              }}
              title="Start new chat"
            >
              Assistant
            </button>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.55)',
            fontWeight: '600',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}>
            <div style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: getStatusColor(),
              animation: connectionStatus === 'connecting' ? 'pulse 1.5s infinite' : 'none',
              boxShadow: `0 0 8px ${getStatusColor()}`,
              transition: 'all 0.3s ease-out',
            }}></div>
            <span>{getStatusText()}</span>
          </div>
        </header>

        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={handleCloseSidebar}
          collapsed={sidebarCollapsed}
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={setActiveChatId}
          onNewChat={() => setActiveChatId('')}
          onRenameChat={renameChat}
          onDeleteChat={deleteChat}
        />

        {/* Chat Conversation Area */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}>
          <div className="chat-area" style={{
            flex: 1,
            maxWidth: '720px',
            margin: '0 auto',
            width: '100%',
            padding: `32px 24px ${(messages.length > 0 || loading) ? '120px' : '32px'} 24px`,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            overflowY: 'auto',
            transition: 'padding 0.3s ease-out',
          }}>
            {messages.length === 0 && !loading && (
              <div className="hero-content" style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                paddingTop: '32px',
                paddingBottom: '32px',
              }}>
                {/* Breathing Pulse Circle - Subtle and Centered */}
                <div style={{
                  position: 'relative',
                  width: '140px',
                  height: '140px',
                  marginBottom: '56px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {/* Outer breathing pulse ring */}
                  <div className="breathing-pulse" style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15), transparent)',
                    border: '2px solid rgba(16, 185, 129, 0.25)',
                  }}></div>
                  {/* Middle breathing ring */}
                  <div style={{
                    position: 'absolute',
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08), transparent)',
                    border: '1.5px solid rgba(16, 185, 129, 0.15)',
                  }}></div>
                  {/* Inner subtle glow */}
                  <div style={{
                    position: 'absolute',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1), transparent)',
                  }}></div>
                </div>

                {/* Hero Text - Professional and Friendly */}
                <h2 style={{
                  fontSize: '2.4rem',
                  fontWeight: '800',
                  color: 'rgba(255,255,255,0.99)',
                  margin: '0 0 20px 0',
                  letterSpacing: '-1px',
                  maxWidth: '650px',
                  lineHeight: '1.15',
                }}>Hi, I'm your AI Assistant</h2>
                
                <p style={{
                  fontSize: '1.1rem',
                  color: 'rgba(255,255,255,0.60)',
                  margin: '0 0 32px 0',
                  maxWidth: '550px',
                  lineHeight: '1.75',
                  fontWeight: '400',
                  letterSpacing: '0.2px',
                }}>Ask questions, plan tasks, or explore new ideas — I'm here to help.</p>

                {/* Input Box in Welcome Screen */}
                <div style={{
                  maxWidth: '600px',
                  width: '100%',
                  marginBottom: '32px',
                }}>
                  <form
                    onSubmit={handleSubmit}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      background: inputFocused
                        ? 'rgba(255,255,255,0.18)'
                        : 'rgba(255,255,255,0.09)',
                      backdropFilter: 'blur(16px)',
                      border: inputFocused
                        ? '1.5px solid rgba(16, 185, 129, 0.6)'
                        : '1.5px solid rgba(255,255,255,0.12)',
                      borderRadius: '24px',
                      padding: inputFocused ? '16px 20px' : '12px 18px',
                      transition: 'all 0.25s ease-out',
                      boxShadow: inputFocused
                        ? '0 16px 40px rgba(16, 185, 129, 0.25), 0 0 20px rgba(16, 185, 129, 0.1)'
                        : '0 6px 20px rgba(0,0,0,0.16)',
                    }}
                  >
                    <Textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onFocus={() => setInputFocused(true)}
                      onBlur={() => setInputFocused(false)}
                      placeholder={input.length > 0 ? '' : displayedPlaceholder}
                      style={{
                        flex: 1,
                        border: 'none',
                        background: 'transparent',
                        color: 'rgba(255,255,255,0.95)',
                        fontSize: '0.95rem',
                        resize: 'none',
                        outline: 'none',
                        minHeight: '20px',
                        maxHeight: '80px',
                        lineHeight: '1.5',
                        padding: '0',
                        transition: 'all 0.2s ease-out',
                        fontFamily: 'inherit',
                      }}
                      rows={1}
                    />

                    {/* Loading Indicator */}
                    {loading && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.75rem',
                        color: 'rgba(255,255,255,0.5)',
                        fontWeight: '500',
                        letterSpacing: '0.2px',
                      }}>
                        <div style={{
                          width: '4px',
                          height: '4px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(16, 185, 129, 0.7)',
                          animation: 'pulse 1.4s infinite',
                        }}></div>
                        <span>Thinking</span>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={!input.trim() || loading}
                      style={{
                        width: '40px',
                        height: '40px',
                        minWidth: '40px',
                        minHeight: '40px',
                        borderRadius: '50%',
                        background: loading || !input.trim()
                          ? 'rgba(255,255,255,0.08)'
                          : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        border: 'none',
                        cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease-out',
                        fontSize: '16px',
                        boxShadow: (loading || !input.trim())
                          ? 'none'
                          : '0 4px 12px rgba(16, 185, 129, 0.3)',
                        flexShrink: 0,
                        padding: '0',
                      }}
                      onMouseEnter={(e) => {
                        if (!loading && input.trim()) {
                          e.currentTarget.style.transform = 'scale(1.1) rotate(5deg) translateY(-2px)'
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!loading && input.trim()) {
                          e.currentTarget.style.transform = 'scale(1) rotate(0deg) translateY(0)'
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'
                        }
                      }}
                    >
                      {loading ? (
                        <div style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid rgba(255,255,255,0.25)',
                          borderTop: '2px solid rgba(255,255,255,0.9)',
                          borderRadius: '50%',
                          animation: 'spin 0.7s linear infinite',
                        }}></div>
                      ) : (
                        <span style={{ fontSize: '18px', lineHeight: '1', fontWeight: '600' }}>→</span>
                      )}
                    </Button>
                  </form>
                </div>

              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={msg.role === 'user' ? 'message-slide-up' : 'message-fade-in'} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                transition: 'all 180ms ease-out',
              }}>
                <div style={{
                  padding: msg.role === 'user' ? '10px 16px' : '12px 16px',
                  borderRadius: '16px',
                  maxWidth: '80%',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : 'rgba(255,255,255,0.06)',
                  backdropFilter: msg.role === 'assistant' ? 'blur(8px)' : 'none',
                  border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                  boxShadow: msg.role === 'user'
                    ? '0 2px 8px rgba(16, 185, 129, 0.2)'
                    : '0 2px 4px rgba(0,0,0,0.1)',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.95rem',
                  lineHeight: '1.5',
                  color: msg.role === 'user' ? 'white' : 'rgba(255,255,255,0.9)',
                  transition: 'all 180ms ease-out',
                  overflowWrap: 'break-word',
                }}>
                  {msg.content}
                  {msg.type === 'task' && (
                    <div style={{
                      marginTop: '10px',
                      paddingTop: '10px',
                      borderTop: '1px solid rgba(255,255,255,0.1)',
                      fontSize: '0.8rem',
                      color: '#10b981',
                      fontWeight: '500',
                    }}>
                      ✓ Task created
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
              }}>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'rgba(255,255,255,0.7)',
                }}>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <div className="typing-dot" style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(255,255,255,0.8)' }}></div>
                    <div className="typing-dot" style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(255,255,255,0.8)' }}></div>
                    <div className="typing-dot" style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(255,255,255,0.8)' }}></div>
                  </div>
                  <span style={{ fontWeight: '500' }}>Thinking…</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* New Message Input Box - Only show when there are messages or loading */}
        {(messages.length > 0 || loading) && (
          <div style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '720px',
            padding: '0 24px',
            zIndex: 20,
            pointerEvents: 'none',
          }}>
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: inputFocused
                ? 'rgba(255,255,255,0.18)'
                : 'rgba(255,255,255,0.09)',
              backdropFilter: 'blur(16px)',
              border: inputFocused
                ? '1.5px solid rgba(16, 185, 129, 0.6)'
                : '1.5px solid rgba(255,255,255,0.12)',
              borderRadius: '24px',
              padding: inputFocused ? '16px 20px' : '12px 18px',
              transition: 'all 0.25s ease-out',
              boxShadow: inputFocused
                ? '0 16px 40px rgba(16, 185, 129, 0.25), 0 0 20px rgba(16, 185, 129, 0.1)'
                : '0 6px 20px rgba(0,0,0,0.16)',
              pointerEvents: 'auto',
              transform: inputFocused ? 'translateY(-2px)' : 'translateY(0)',
            }}
          >
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder={input.length > 0 ? '' : displayedPlaceholder}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                color: 'rgba(255,255,255,0.95)',
                fontSize: '0.95rem',
                resize: 'none',
                outline: 'none',
                minHeight: '20px',
                maxHeight: '80px',
                lineHeight: '1.5',
                padding: '0',
                transition: 'all 0.2s ease-out',
                fontFamily: 'inherit',
              }}
              rows={1}
            />

            {/* Loading Indicator */}
            {loading && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.5)',
                fontWeight: '500',
                letterSpacing: '0.2px',
              }}>
                <div style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(16, 185, 129, 0.7)',
                  animation: 'pulse 1.4s infinite',
                }}></div>
                <span>Thinking</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={!input.trim() || loading}
              style={{
                width: '40px',
                height: '40px',
                minWidth: '40px',
                minHeight: '40px',
                borderRadius: '50%',
                background: loading || !input.trim()
                  ? 'rgba(255,255,255,0.08)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease-out',
                fontSize: '16px',
                boxShadow: (loading || !input.trim())
                  ? 'none'
                  : '0 4px 12px rgba(16, 185, 129, 0.3)',
                flexShrink: 0,
                padding: '0',
              }}
              onMouseEnter={(e) => {
                if (!loading && input.trim()) {
                  e.currentTarget.style.transform = 'scale(1.1) rotate(5deg) translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && input.trim()) {
                  e.currentTarget.style.transform = 'scale(1) rotate(0deg) translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'
                }
              }}
            >
              {loading ? (
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.25)',
                  borderTop: '2px solid rgba(255,255,255,0.9)',
                  borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                }}></div>
              ) : (
                <span style={{ fontSize: '18px', lineHeight: '1', fontWeight: '600' }}>→</span>
              )}
            </Button>
          </form>
          </div>
        )}
      </div>
    </>
  )
}


