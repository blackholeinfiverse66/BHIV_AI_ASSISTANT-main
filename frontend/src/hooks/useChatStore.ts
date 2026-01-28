import { useState, useEffect, useCallback } from 'react'

export type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export type ChatThread = {
  id: string
  title: string
  createdAt: number
  messages: Message[]
}

const STORAGE_KEY = 'bhiv_chat_threads'
const ACTIVE_CHAT_KEY = 'bhiv_active_chat_id'

export function useChatStore() {
  const [chats, setChats] = useState<ChatThread[]>([])
  const [activeChatId, setActiveChatId] = useState<string>('')
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedChats = localStorage.getItem(STORAGE_KEY)

      if (savedChats) {
        const parsed = JSON.parse(savedChats)
        if (Array.isArray(parsed)) {
          setChats(parsed)
          // Don't auto-load last chat - start fresh on page load
          // Only load if user explicitly navigated back
        }
      }
    } catch (error) {
      console.warn('Failed to load chats from localStorage', error)
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage whenever chats change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(chats))
      } catch (error) {
        console.warn('Failed to save chats to localStorage', error)
      }
    }
  }, [chats, isLoaded])

  // Save active chat ID whenever it changes
  useEffect(() => {
    if (isLoaded && activeChatId) {
      try {
        localStorage.setItem(ACTIVE_CHAT_KEY, activeChatId)
      } catch (error) {
        console.warn('Failed to save active chat ID to localStorage', error)
      }
    }
  }, [activeChatId, isLoaded])

  const createNewChat = useCallback(() => {
    // Only create if no active chat exists
    if (activeChatId && chats.some((c) => c.id === activeChatId)) {
      return activeChatId
    }
    // Create new chat with temp ID - real chat created on first message
    const tempId = 'temp_' + Date.now()
    setActiveChatId(tempId)
    return tempId
  }, [activeChatId, chats])

  const getActiveChat = useCallback((): ChatThread | undefined => {
    return chats.find((c) => c.id === activeChatId)
  }, [chats, activeChatId])

  const addMessage = useCallback(
    (role: 'user' | 'assistant', content: string) => {
      const message: Message = {
        id: Date.now().toString(),
        role,
        content,
        timestamp: Date.now(),
      }

      setChats((prev) => {
        // Handle case where no active chat exists (fresh start)
        const chatExists = prev.some((c) => c.id === activeChatId)

        if (!chatExists) {
          // Create the chat on first message
          const realId = Date.now().toString()
          const newChat: ChatThread = {
            id: realId,
            title: role === 'user' ? generateChatTitle(content) : 'New chat',
            createdAt: Date.now(),
            messages: [message],
          }
          // Update active ID to real ID
          setActiveChatId(realId)
          return [newChat, ...prev]
        }

        // Update existing chat and sort by recency
        const updated = prev.map((chat) => {
          if (chat.id === activeChatId) {
            return {
              ...chat,
              messages: [...chat.messages, message],
              title:
                chat.title === 'New chat' && role === 'user'
                  ? generateChatTitle(content)
                  : chat.title,
              createdAt: Date.now(), // Update to current time for sorting
            }
          }
          return chat
        })

        // Sort by most recent first
        return updated.sort((a, b) => b.createdAt - a.createdAt)
      })

      return message
    },
    [activeChatId]
  )

  const renameChat = useCallback((chatId: string, newTitle: string) => {
    setChats((prev) =>
      prev.map((chat) => (chat.id === chatId ? { ...chat, title: newTitle } : chat))
    )
  }, [])

  const deleteChat = useCallback((chatId: string) => {
    setChats((prev) => {
      const filtered = prev.filter((c) => c.id !== chatId)
      // If we deleted the active chat, clear it to show welcome screen
      if (activeChatId === chatId) {
        setActiveChatId('')
      }
      return filtered
    })
  }, [activeChatId])

  const clearActiveChat = useCallback(() => {
    setChats((prev) =>
      prev.map((chat) => (chat.id === activeChatId ? { ...chat, messages: [] } : chat))
    )
  }, [activeChatId])

  return {
    chats,
    activeChatId,
    setActiveChatId,
    createNewChat,
    getActiveChat,
    addMessage,
    renameChat,
    deleteChat,
    clearActiveChat,
    isLoaded,
  }
}

// Helper function to generate chat title from first message
function generateChatTitle(firstMessage: string): string {
  // Remove extra whitespace and split into words
  const words = firstMessage.trim().split(/\s+/)
  // Take first 4-6 words
  const titleWords = words.slice(0, 5)
  const title = titleWords.join(' ')

  // Capitalize first letter of each word
  return title
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}
