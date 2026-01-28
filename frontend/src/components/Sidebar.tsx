import { useState, useEffect } from 'react'
import type { ChatThread } from '../hooks/useChatStore'

//testing 

type SidebarProps = {
  chats: ChatThread[]
  activeChatId: string
  onSelectChat: (chatId: string) => void
  onNewChat: () => void
  onRenameChat: (chatId: string, newTitle: string) => void
  onDeleteChat: (chatId: string) => void
  isOpen: boolean
  onClose: () => void
  collapsed: boolean
}

export function Sidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onRenameChat,
  onDeleteChat,
  isOpen,
  onClose,
  collapsed,
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [hoveringId, setHoveringId] = useState<string | null>(null)

  // Filter out temp chats and sort by recency
  const displayChats = chats
    .filter((c) => !c.id.startsWith('temp_'))
    .sort((a, b) => b.createdAt - a.createdAt)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setMenuOpenId(null)
    if (menuOpenId) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [menuOpenId])

  const handleStartEdit = (chat: ChatThread) => {
    setEditingId(chat.id)
    setEditValue(chat.title)
  }

  const handleSaveEdit = (chatId: string) => {
    if (editValue.trim()) {
      onRenameChat(chatId, editValue.trim())
    }
    setEditingId(null)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
  }

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    chatId: string
  ) => {
    if (e.key === 'Enter') {
      handleSaveEdit(chatId)
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  // Format time for chat list
  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(timestamp).toLocaleDateString()
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="sidebar-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 39,
            display: window.innerWidth < 768 ? 'block' : 'none',
          }}
        />
      )}

      {/* Sidebar Container */}
      <aside
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: window.innerWidth < 768
            ? '300px'
            : collapsed
              ? '0px'
              : '300px',
          height: '100vh',
          background: 'rgba(15, 15, 35, 0.9)',
          backdropFilter: 'blur(16px)',
          borderRight: collapsed ? 'none' : '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 40,
          transform: window.innerWidth < 768
            ? (isOpen ? 'translateX(0)' : 'translateX(-100%)')
            : 'translateX(0)',
          transition: 'width 0.25s ease-out, transform 0.25s ease-out, border 0.25s ease-out',
          paddingTop: '64px',
          overflow: 'hidden',
          boxShadow: collapsed ? 'none' : '2px 0 16px rgba(0,0,0,0.1)',
        }}
      >
        {/* Chat List with Title */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            paddingRight: '4px',
            paddingLeft: '0',
          }}
        >
          {/* Chat History Title */}
          <div style={{
            padding: '8px 20px 8px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            marginBottom: '4px',
            position: 'sticky',
            top: 0,
            background: 'rgba(15, 15, 35, 0.95)',
            backdropFilter: 'blur(16px)',
            zIndex: 5,
          }}>
            <h3 style={{
              fontSize: '0.85rem',
              fontWeight: '600',
              color: 'rgba(255,255,255,0.75)',
              margin: 0,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}>
              Chat History
            </h3>
          </div>
          {displayChats.length === 0 ? (
            <div
              style={{
                padding: '32px 16px',
                color: 'rgba(255,255,255,0.4)',
                fontSize: '0.85rem',
                textAlign: 'center',
                lineHeight: '1.5',
              }}
            >
              Start a new chat to begin
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0' }}>
              {displayChats.map((chat) => (
                <div key={chat.id} style={{ position: 'relative' }}>
                  <button
                    onClick={() => {
                      onSelectChat(chat.id)
                      if (window.innerWidth < 768) {
                        onClose()
                      }
                    }}
                    onMouseEnter={() => setHoveringId(chat.id)}
                    onMouseLeave={() => setHoveringId(null)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background:
                        activeChatId === chat.id
                          ? 'rgba(16, 185, 129, 0.1)'
                          : hoveringId === chat.id
                            ? 'rgba(255,255,255,0.04)'
                            : 'transparent',
                      border: 'none',
                      borderLeft:
                        activeChatId === chat.id
                          ? '3px solid rgba(16, 185, 129, 0.7)'
                          : '3px solid transparent',
                      borderRadius: hoveringId === chat.id ? '8px' : '0',
                      color:
                        activeChatId === chat.id
                          ? 'rgba(255,255,255,0.95)'
                          : 'rgba(255,255,255,0.75)',
                      fontSize: '0.9rem',
                      fontWeight: activeChatId === chat.id ? '600' : '400',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-out',
                      textAlign: 'left',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      position: 'relative',
                      paddingRight: hoveringId === chat.id ? '80px' : '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      alignItems: 'flex-start',
                      justifyContent: 'center',
                    }}
                    title={undefined}
                  >
                    {collapsed && window.innerWidth >= 768 ? (
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: activeChatId === chat.id ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        color: activeChatId === chat.id ? 'rgba(16, 185, 129, 0.9)' : 'rgba(255,255,255,0.7)',
                      }}>
                        {chat.title.charAt(0).toUpperCase()}
                      </div>
                    ) : editingId === chat.id ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, chat.id)}
                        onBlur={() => handleSaveEdit(chat.id)}
                        autoFocus
                        style={{
                          width: '100%',
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          borderRadius: '4px',
                          color: 'rgba(255,255,255,0.95)',
                          fontSize: '0.9rem',
                          padding: '4px 6px',
                          outline: 'none',
                          fontFamily: 'inherit',
                        }}
                      />
                    ) : (
                      <>
                        <span style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          width: '100%',
                          fontSize: '0.9rem',
                          lineHeight: '1.2'
                        }}>
                          {chat.title}
                        </span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            color: 'rgba(255,255,255,0.45)',
                            fontWeight: '400',
                            lineHeight: '1',
                            marginTop: '1px'
                          }}
                        >
                          {formatTime(chat.createdAt)}
                        </span>
                      </>
                    )}
                  </button>

                  {/* Three-dot menu button - hidden by default, shows on row hover or when menu is open */}
                  <div
                    onMouseEnter={() => setHoveringId(chat.id)}
                    onMouseLeave={() => {
                      // Only clear if not hovering over the menu
                      setTimeout(() => {
                        if (menuOpenId !== chat.id) {
                          setHoveringId(null)
                        }
                      }, 100)
                    }}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      opacity: (hoveringId === chat.id || menuOpenId === chat.id) ? 1 : 0,
                      pointerEvents: (hoveringId === chat.id || menuOpenId === chat.id) ? 'auto' : 'none',
                      transition: 'opacity 0.2s ease-out',
                      zIndex: 10,
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setMenuOpenId(menuOpenId === chat.id ? null : chat.id)
                      }}
                      style={{
                        width: '32px',
                        height: '32px',
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255,255,255,0.5)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        borderRadius: '6px',
                        transition: 'all 0.2s ease-out',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                        e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
                        e.currentTarget.style.transform = 'scale(1.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'none'
                        e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
                        e.currentTarget.style.transform = 'scale(1)'
                      }}
                      title="Chat options"
                    >
                      ⋮
                    </button>

                    {/* Dropdown menu */}
                    {menuOpenId === chat.id && (
                      <div style={{
                        position: 'absolute',
                        right: '12px',
                        top: '40px',
                        background: 'rgba(26, 26, 46, 0.95)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                        zIndex: 50,
                        minWidth: '140px',
                        maxWidth: '200px',
                        overflow: 'hidden',
                      }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setMenuOpenId(null)
                            handleStartEdit(chat)
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            background: 'none',
                            border: 'none',
                            color: 'rgba(255,255,255,0.8)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: '0.9rem',
                            transition: 'all 0.15s ease-out',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'none'
                          }}
                        >
                          ✏️ Rename
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setMenuOpenId(null)
                            setDeleteConfirmId(chat.id)
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            background: 'none',
                            border: 'none',
                            color: 'rgba(239, 68, 68, 0.9)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: '0.9rem',
                            transition: 'all 0.15s ease-out',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'none'
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* New Chat Button at Bottom */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => {
              onNewChat()
              if (window.innerWidth < 768) {
                onClose()
              }
            }}
            style={{
              width: '100%',
              padding: '14px 18px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.08))',
              border: '2px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '12px',
              color: 'rgba(16, 185, 129, 0.95)',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.25s ease-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.12))'
              e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.6)'
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.08))'
              e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.15)'
            }}
          >
            <span style={{ fontSize: '18px', lineHeight: '1' }}>+</span>
            <span>New Chat</span>
          </button>
        </div>

        {/* Scrollbar styling */}
        <style>{`
          aside > div::-webkit-scrollbar {
            width: 4px;
          }
          aside > div::-webkit-scrollbar-track {
            background: transparent;
          }
          aside > div::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.12);
            border-radius: 2px;
            opacity: 0;
            transition: opacity 0.2s ease-out;
          }
          aside > div:hover::-webkit-scrollbar-thumb {
            opacity: 1;
          }
          aside > div::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.2);
          }
        `}</style>
      </aside>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div
          onClick={() => setDeleteConfirmId(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 60,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(26, 26, 46, 0.95)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '24px',
              width: '90%',
              maxWidth: '320px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            }}
          >
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              color: 'rgba(255,255,255,0.95)',
              margin: '0 0 8px 0',
            }}>
              Delete chat?
            </h3>
            <p style={{
              fontSize: '0.9rem',
              color: 'rgba(255,255,255,0.7)',
              margin: '0 0 20px 0',
              lineHeight: '1.4',
            }}>
              This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setDeleteConfirmId(null)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '8px',
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-out',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteChat(deleteConfirmId)
                  setDeleteConfirmId(null)
                }}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  color: 'rgba(239, 68, 68, 0.9)',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-out',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  )
}
