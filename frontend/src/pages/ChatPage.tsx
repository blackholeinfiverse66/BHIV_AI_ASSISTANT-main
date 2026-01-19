import { useState, useEffect, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Textarea } from '../components/Textarea'
import { Button } from '../components/Button'
import { useApi } from '../api/useApi'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  type?: string
}

export function ChatPage() {
  const api = useApi()

  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'connecting' | 'offline'>('online')
  const [toast, setToast] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleOnline = () => {
      setConnectionStatus('online')
      showToast('Connected')
    }
    const handleOffline = () => {
      setConnectionStatus('offline')
      showToast('Connection lost')
    }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  const assistantMutation = useMutation({
    mutationFn: (message: string) => api.assistant({ message }),
    onMutate: () => {
      setLoading(true)
      setConnectionStatus('connecting')
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: input,
      }
      setMessages(prev => [...prev, userMessage])
      setInput('')
    },
    onSuccess: (data) => {
      const result = data.data.result
      let content = result.response
      if (result.type === 'task') {
        content += '\n\nTask created'
      }
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content,
        type: result.type,
      }
      setMessages(prev => [...prev, assistantMessage])
      setConnectionStatus('online')
    },
    onError: (error: any) => {
      let errorMessage = 'Something went wrong. Try again.'
      if (!navigator.onLine) {
        errorMessage = 'Assistant unavailable. Please check your connection.'
      } else if (error?.response?.status === 400) {
        errorMessage = 'Unable to process that. Try rephrasing.'
      }
      const errorMsg: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: errorMessage,
      }
      setMessages(prev => [...prev, errorMsg])
      setConnectionStatus(navigator.onLine ? 'online' : 'offline')
    },
    onSettled: () => {
      setLoading(false)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    assistantMutation.mutate(input)
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
      case 'online': return 'Online'
      case 'connecting': return 'Connecting…'
      case 'offline': return 'Offline'
      default: return 'Online'
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

  return (
    <>
      <style>
        {`
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
          .glow {
            animation: pulse 2s infinite;
          }
          .message-fade-in {
            animation: fadeIn 0.3s ease-out;
          }
          .message-slide-up {
            animation: slideUp 0.3s ease-out;
          }
          .typing-dot {
            animation: typing 1.4s infinite ease-in-out;
          }
          .typing-dot:nth-child(2) { animation-delay: 0.2s; }
          .typing-dot:nth-child(3) { animation-delay: 0.4s; }
          .toast {
            position: fixed;
            top: 80px;
            right: 24px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 0.85rem;
            z-index: 1000;
            animation: fadeIn 0.3s ease-out;
          }
          @media (max-width: 767px) {
            .input-form {
              max-width: 100% !important;
              padding: 0 16px !important;
            }
            .navbar {
              height: 48px !important;
              padding: 0 16px !important;
            }
            .navbar h1 {
              font-size: 1.1rem !important;
            }
            .toast {
              right: 16px !important;
            }
          }
          @media (min-width: 768px) and (max-width: 1023px) {
            .chat-area {
              max-width: 720px !important;
            }
            .input-form {
              max-width: 720px !important;
            }
          }
        `}
      </style>
      {toast && <div className="toast">{toast}</div>}
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
          background: 'rgba(255,255,255,0.02)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'relative',
          zIndex: 10,
        }}>
          <h1 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            margin: 0,
            color: 'rgba(255,255,255,0.95)',
          }}>BHIV Assistant</h1>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            color: 'rgba(255,255,255,0.7)',
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: getStatusColor(),
              animation: connectionStatus === 'connecting' ? 'pulse 1s infinite' : 'none',
            }}></div>
            {getStatusText()}
          </div>
        </header>

        {/* Chat Conversation Area */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <div className="chat-area" style={{
            flex: 1,
            maxWidth: '960px',
            margin: '0 auto',
            width: '100%',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            overflowY: 'auto',
          }}>
            {messages.length === 0 && !loading && (
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                marginTop: '-10vh',
              }}>
                <div className="glow" style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.1), transparent)',
                  marginBottom: '24px',
                }}></div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: 'rgba(255,255,255,0.95)',
                  margin: '0 0 8px 0',
                }}>Welcome to BHIV Assistant</h2>
                <p style={{
                  fontSize: '1rem',
                  color: 'rgba(255,255,255,0.7)',
                  margin: 0,
                }}>Ask me anything to get started.</p>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={msg.role === 'user' ? 'message-slide-up' : 'message-fade-in'} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '8px',
              }}>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '16px',
                  maxWidth: '70%',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                    : 'rgba(255,255,255,0.08)',
                  backdropFilter: msg.role === 'assistant' ? 'blur(8px)' : 'none',
                  border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  boxShadow: msg.role === 'user' ? '0 2px 8px rgba(59, 130, 246, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.95rem',
                  lineHeight: '1.4',
                  color: 'white',
                  transition: 'all 0.18s ease-out',
                }}>
                  {msg.content}
                  {msg.type === 'task' && (
                    <div style={{
                      marginTop: '8px',
                      padding: '4px 8px',
                      background: 'rgba(16, 185, 129, 0.2)',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      color: '#10b981',
                      display: 'inline-block',
                    }}>
                      Task created
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
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontSize: '0.95rem',
                  opacity: 0.7,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <div className="typing-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white' }}></div>
                    <div className="typing-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white' }}></div>
                    <div className="typing-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white' }}></div>
                  </div>
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input Composer */}
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '960px',
          padding: '0 24px',
        }}>
          <form onSubmit={handleSubmit} className="input-form" style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '12px',
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '28px',
            padding: '12px 20px',
            transition: 'all 0.18s ease-out',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}>
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                color: 'white',
                fontSize: '1rem',
                resize: 'none',
                outline: 'none',
                minHeight: '20px',
                maxHeight: '80px',
                lineHeight: '1.4',
                padding: '0',
                transition: 'all 0.18s ease-out',
              }}
              rows={1}
            />
            <Button
              type="submit"
              disabled={!input.trim() || loading}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: loading ? 'rgba(255,255,255,0.2)' : 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.18s ease-out',
                transform: 'scale(1)',
                fontSize: '18px',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              {loading ? (
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}></div>
              ) : (
                '➤'
              )}
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}
