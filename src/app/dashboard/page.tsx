'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, Building2, Settings, LogOut, Send, MessageCircle, Mic, Paperclip, Bot, Moon, Sun, Calculator, BarChart3, TrendingUp, Zap, ChevronDown, Receipt, List } from 'lucide-react'
import { chatApi } from '@/lib/api'
import { useSocket } from '@/hooks/useSocket'
import { useTheme } from '@/contexts/ThemeContext'
import { SimpleBudgetAnalysis } from '@/components/budget/SimpleBudgetAnalysis'
import { DataAnalyst } from '@/components/budget/DataAnalyst'
import UsageWidget from '@/components/subscription/UsageWidget'
import { QuickTransaction } from '@/components/transaction/QuickTransaction'
import { AllTransactions } from '@/components/transaction/AllTransactions'

export default function DashboardPage() {
  const { user, logout, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [isLoadingMessage, setIsLoadingMessage] = useState(false)
  const [conversations, setConversations] = useState<Array<{id: string, title: string, created_at: string}>>([])
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const [activeView, setActiveView] = useState<'chat' | 'budget' | 'dataAnalyst' | 'transaction' | 'allTransactions'>('chat')
  const [showQuickActions, setShowQuickActions] = useState(false)
  const { socket, isConnected, on, off } = useSocket(user?.id)
  const { theme, toggleTheme } = useTheme()

  // Quick AI action prompts
  const quickActions = [
    { icon: '💰', label: 'Show my budget summary', prompt: 'Can you show me my current budget summary and how much I\'ve spent this month?' },
    { icon: '📊', label: 'Analyze my spending', prompt: 'Analyze my spending patterns and give me insights on where I can save money.' },
    { icon: '💳', label: 'Recent transactions', prompt: 'Show me my recent transactions from the last 7 days.' },
    { icon: '🎯', label: 'Financial goals', prompt: 'Help me set up financial goals and track my progress.' },
    { icon: '📈', label: 'Income vs Expenses', prompt: 'Compare my income versus expenses for this month.' },
    { icon: '🔔', label: 'Budget alerts', prompt: 'Set up budget alerts to notify me when I\'m approaching my spending limits.' },
    { icon: '💡', label: 'Saving tips', prompt: 'Give me personalized tips on how to save money based on my spending habits.' },
    { icon: '📅', label: 'Monthly report', prompt: 'Generate a monthly financial report with all my transactions and insights.' },
  ]

  useEffect(() => {
    console.log('🔍 Dashboard - Auth state check')
    console.log('🔍 User:', user)
    console.log('🔍 Auth loading:', authLoading)
    
    // Don't redirect if still loading auth state
    if (authLoading) {
      console.log('⏳ Still loading auth state...')
      return
    }
    
    if (!user) {
      console.log('❌ No user found, redirecting to login')
      router.push('/auth/login')
      return
    }
    
    // Redirect business users to business dashboard (only once)
    if (user.type === 'BUSINESS') {
      console.log('🏢 Business user detected, redirecting to business dashboard')
      router.replace('/business') // Use replace instead of push
      return
    }
    
    console.log('✅ User authenticated, showing dashboard')
    setIsPageLoading(false)
    
    // Load conversations when user is authenticated
    if (user && String(user.type) !== 'BUSINESS') {
      loadConversations()
    }
  }, [user?.id, user?.type, authLoading]) // Only depend on specific user properties

  // Load conversations from API
  const loadConversations = async () => {
    try {
      setIsLoadingConversations(true)
      const response = await chatApi.getConversations()
      console.log('📋 Loaded conversations:', response)
      if (response.body) {
        setConversations(response.body)
      }
    } catch (error) {
      console.error('❌ Error loading conversations:', error)
    } finally {
      setIsLoadingConversations(false)
    }
  }

  // Load message history for a conversation
  const loadMessageHistory = async (conversationId: string) => {
    try {
      const response = await chatApi.getMessageHistory(conversationId)
      console.log('💬 Loaded message history:', response)
      if (response.body) {
        setChatHistory(response.body)
        setCurrentConversationId(conversationId)
      }
    } catch (error) {
      console.error('❌ Error loading message history:', error)
    }
  }

  // Handle conversation selection
  const handleConversationSelect = (conversationId: string) => {
    loadMessageHistory(conversationId)
  }

  // Handle new chat
  const handleNewChat = () => {
    setChatHistory([])
    setCurrentConversationId(null)
  }

  // Socket.IO event listeners for real-time chat
  useEffect(() => {
    if (!socket || !isConnected) return

    const handleNewMessage = (data: { role: 'assistant', content: string, conversationId: string }) => {
      console.log('📨 Received real-time message:', data)
      if (data.conversationId === currentConversationId) {
        setChatHistory(prev => [...prev, { role: data.role, content: data.content }])
        setIsLoadingMessage(false)
      }
    }

    const handleTyping = (data: { isTyping: boolean, conversationId: string }) => {
      console.log('⌨️ AI typing status:', data)
      // You can add typing indicator logic here if needed
    }

    // Register event listeners
    on('new_message', handleNewMessage)
    on('ai_typing', handleTyping)

    // Cleanup listeners on unmount
    return () => {
      off('new_message', handleNewMessage)
      off('ai_typing', handleTyping)
    }
  }, [socket, isConnected, currentConversationId, on, off])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleQuickAction = (prompt: string) => {
    setChatMessage(prompt)
    setShowQuickActions(false)
    // Auto-send the quick action
    setTimeout(() => handleSendMessage(prompt), 100)
  }

  const handleSendMessage = async (messageOverride?: string) => {
    const messageToSend = messageOverride || chatMessage
    if (!messageToSend.trim() || isLoadingMessage) return
    
    const userMessage = messageToSend
    setChatMessage('')
    setIsLoadingMessage(true)
    setShowQuickActions(false)
    
    // Add user message to chat history
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }])
    
    try {
      // Send message to backend API
      const response = await chatApi.sendPrompt({
        prompt: userMessage,
        conversation_id: currentConversationId || undefined
      })
      
      console.log('🤖 AI Response:', response)
      
      // Update conversation ID if this is a new conversation
      if (response.body?.conversationId && !currentConversationId) {
        setCurrentConversationId(response.body.conversationId)
        // Refresh conversations list to show the new conversation
        loadConversations()
      }
      
      // Add AI response to chat history
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: response.body?.response || 'Sorry, I encountered an error processing your request.' 
      }])
    } catch (error) {
      console.error('❌ Chat Error:', error)
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }])
    } finally {
      setIsLoadingMessage(false)
    }
  }

  if (authLoading || isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) return null

  
  // Business users will be redirected by the useEffect above
  // Show loading while redirect happens
  if (user.type === 'BUSINESS') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Redirecting to Business Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-black bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 flex transition-all duration-300 overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 min-w-80 bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col transition-all duration-300 shadow-xl">
        <div className="p-6 border-b border-gray-200/30 dark:border-gray-700/30">
          <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Echo Transaction</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Personal Dashboard</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {/* Navigation Buttons */}
          <div className="space-y-2 mb-4">
            <div 
              className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                activeView === 'chat' 
                  ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'
              }`}
              onClick={() => setActiveView('chat')}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">AI Chat</span>
            </div>
            <div 
              className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                activeView === 'budget' 
                  ? 'text-white bg-gradient-to-r from-green-600 to-blue-600 shadow-lg' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'
              }`}
              onClick={() => setActiveView('budget')}
            >
              <Calculator className="w-5 h-5" />
              <span className="font-semibold">Budget Analysis</span>
            </div>
            <div 
              className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                activeView === 'dataAnalyst' 
                  ? 'text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'
              }`}
              onClick={() => setActiveView('dataAnalyst')}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="font-semibold">Data Analyst</span>
            </div>
            <div 
              className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                activeView === 'transaction' 
                  ? 'text-white bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'
              }`}
              onClick={() => setActiveView('transaction')}
            >
              <Receipt className="w-5 h-5" />
              <span className="font-semibold">Quick Transaction</span>
            </div>
            <div 
              className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                activeView === 'allTransactions' 
                  ? 'text-white bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'
              }`}
              onClick={() => setActiveView('allTransactions')}
            >
              <List className="w-5 h-5" />
              <span className="font-semibold">All Transactions</span>
            </div>
          </div>

          {/* New Chat Button - Only show in chat view */}
          {activeView === 'chat' && (
            <div 
              className="flex items-center space-x-3 p-4 text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl cursor-pointer mb-4 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              onClick={handleNewChat}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">New Chat</span>
            </div>
          )}

          {/* Conversations List - Only show in chat view */}
          {activeView === 'chat' && (
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-3 py-2">
                Recent Conversations
              </h3>
            
            {isLoadingConversations ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 dark:border-gray-500"></div>
              </div>
            ) : conversations.length > 0 ? (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`flex items-center space-x-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-xl cursor-pointer transition-all duration-300 backdrop-blur-sm ${
                    currentConversationId === conversation.id ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200 dark:border-blue-700 shadow-md' : 'hover:shadow-md'
                  }`}
                  onClick={() => handleConversationSelect(conversation.id)}
                >
                  <div className={`w-3 h-3 rounded-full ${
                    currentConversationId === conversation.id ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-400 dark:bg-gray-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{conversation.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(conversation.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 px-3 py-2">No conversations yet</p>
            )}
            </div>
          )}
        </nav>

        {/* Subscription Plan Widget */}
        <div className="p-4 border-t border-gray-200/30 dark:border-gray-700/30">
          <UsageWidget />
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <div 
            className="flex items-center space-x-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors duration-200"
            onClick={() => router.push('/dashboard/settings')}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </div>
          <div 
            className="flex items-center space-x-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors duration-200"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </div>
          <div 
            className="flex items-center space-x-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors duration-200"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-transparent overflow-hidden">
        <div className="px-8 py-6 backdrop-blur-sm bg-white/30 dark:bg-gray-900/30 border-b border-white/20 dark:border-gray-700/30">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
            Hello, {user.firstname} {user.lastname}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Ready to manage your finances?</p>
        </div>

        {/* Dynamic Content Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeView === 'chat' ? (
            <>
              <div className="flex items-center justify-between px-8 py-4 backdrop-blur-sm bg-white/20 dark:bg-gray-900/20 border-b border-white/20 dark:border-gray-700/30">
                <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  Chat with AI Assistant
                </h3>
                <div className={`text-sm px-3 py-1 rounded-full ${
                  isConnected 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}>
                  {isConnected ? '● Connected' : '● Offline'}
                </div>
              </div>
            </>
          ) : activeView === 'budget' ? (
            <div className="flex items-center justify-between px-8 py-4 backdrop-blur-sm bg-white/20 dark:bg-gray-900/20 border-b border-white/20 dark:border-gray-700/30">
              <h3 className="text-xl font-semibold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl shadow-lg">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                Monthly Budget Analysis
              </h3>
              <div className="text-sm px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                ● Financial Planning
              </div>
            </div>
          ) : activeView === 'transaction' ? (
            <div className="flex items-center justify-between px-8 py-4 backdrop-blur-sm bg-white/20 dark:bg-gray-900/20 border-b border-white/20 dark:border-gray-700/30">
              <h3 className="text-xl font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                  <Receipt className="w-5 h-5 text-white" />
                </div>
                Quick Transaction Entry
              </h3>
              <div className="text-sm px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                ● Fast Entry
              </div>
            </div>
          ) : activeView === 'allTransactions' ? (
            <div className="flex items-center justify-between px-8 py-4 backdrop-blur-sm bg-white/20 dark:bg-gray-900/20 border-b border-white/20 dark:border-gray-700/30">
              <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                  <List className="w-5 h-5 text-white" />
                </div>
                All Transactions
              </h3>
              <div className="text-sm px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                ● Complete History
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between px-8 py-4 backdrop-blur-sm bg-white/20 dark:bg-gray-900/20 border-b border-white/20 dark:border-gray-700/30">
              <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                Data Analysis & Insights
              </h3>
              <div className="text-sm px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                ● Advanced Analytics
              </div>
            </div>
          )}
          <div className="h-full flex flex-col">
            {activeView === 'chat' ? (
              <>
                {/* Chat Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 chat-scroll">
                {chatHistory.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center max-w-md">
                      <div className="relative mb-8">
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl">
                          <Bot className="w-12 h-12 text-white" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-gray-900"></div>
                      </div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
                        Ready to Create Something New?
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                        Ask about budgeting, financial planning, expense tracking, or anything else you need help with.
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">💰 Budgeting</span>
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">📊 Planning</span>
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm">💳 Expenses</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  chatHistory.map((chat, index) => (
                    <div key={index} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'} mb-6`}>
                      <div className={`max-w-xs lg:max-w-md px-5 py-4 rounded-2xl shadow-lg backdrop-blur-sm ${
                        chat.role === 'user' 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                          : 'bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 border border-gray-200/50 dark:border-gray-700/50'
                      }`}>
                        <p className="text-sm leading-relaxed">{chat.content}</p>
                      </div>
                    </div>
                  ))
                )}
                
                {/* AI Typing Indicator */}
                {isLoadingMessage && (
                  <div className="flex justify-start mb-4">
                    <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-700 shadow-sm">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Chat Input */}
              <div className="p-6 backdrop-blur-sm bg-white/30 dark:bg-gray-900/30 border-t border-white/20 dark:border-gray-700/30">
                {/* Quick Actions Dropdown */}
                {showQuickActions && (
                  <div className="mb-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-600/50 shadow-2xl overflow-hidden">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Quick AI Actions
                      </h4>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {quickActions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickAction(action.prompt)}
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{action.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{action.label}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{action.prompt}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-600/50 p-4 shadow-xl">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowQuickActions(!showQuickActions)}
                    className="h-10 w-10 p-0 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 relative"
                    title="Quick Actions"
                  >
                    <Zap className="w-5 h-5" />
                    {showQuickActions && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    )}
                  </Button>
                  <Input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Ask anything..."
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    className="flex-1 border-0 bg-transparent focus:ring-0 focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-base"
                    disabled={isLoadingMessage}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-all duration-200"
                  >
                    <Mic className="w-5 h-5" />
                  </Button>
              <Button
  onClick={() => handleSendMessage()}
  size="sm"
  disabled={isLoadingMessage || !chatMessage.trim()}
  className="h-10 w-10 p-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
>

                    {isLoadingMessage ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send className="w-4 h-4 text-white" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
              </>
            ) : activeView === 'budget' ? (
              /* Budget Analysis View */
              <div className="flex-1 p-6 overflow-y-auto">
                <SimpleBudgetAnalysis />
              </div>
            ) : activeView === 'transaction' ? (
              /* Quick Transaction View */
              <div className="flex-1 p-6 overflow-y-auto">
                <QuickTransaction />
              </div>
            ) : activeView === 'allTransactions' ? (
              /* All Transactions View */
              <div className="flex-1 p-6 overflow-y-auto">
                <AllTransactions />
              </div>
            ) : (
              /* Data Analyst View */
              <div className="flex-1 p-6 overflow-y-auto">
                <DataAnalyst />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
