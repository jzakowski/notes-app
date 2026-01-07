'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { ThemeToggle } from '@/components/ThemeToggle'
import NoteCardSkeleton from '@/components/NoteCardSkeleton'
import Spinner from '@/components/Spinner'

interface Note {
  id: string
  title: string
  content: string
  updatedAt: string
  categoryId: string | null
}

interface Category {
  id: string
  name: string
  color: string
  _count?: { notes: number }
}

interface Tag {
  id: string
  name: string
  _count?: { noteTags: number }
}

interface NotesSidebarProps {
  currentNoteId?: string
  categoryId?: string | null
}

export default function NotesSidebar({ currentNoteId, categoryId }: NotesSidebarProps) {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const selectedTagIds = searchParams.getAll('tagIds') || []
  const [notes, setNotes] = useState<Note[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null)
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState('#3B82F6')
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' })
  }

  // Swipe gesture detection
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isRightSwipe && !isMobileMenuOpen) {
      // Swipe from left edge opens sidebar
      setIsMobileMenuOpen(true)
    } else if (isLeftSwipe && isMobileMenuOpen) {
      // Swipe left closes sidebar
      setIsMobileMenuOpen(false)
    }
  }

  useEffect(() => {
    fetchNotes()
    fetchCategories()
    fetchTags()
  }, [selectedTagIds])

  // Keyboard shortcut: Cmd+/ or Ctrl+/ to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Debounced search with 300ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const fetchNotes = async () => {
    try {
      // Build URL with tag filters
      const urlParams = new URLSearchParams()
      selectedTagIds.forEach(tagId => urlParams.append('tagIds', tagId))

      const url = urlParams.toString() ? `/api/notes?${urlParams.toString()}` : '/api/notes'
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch notes')
      const data = await response.json()

      // Sort by updated date (newest first)
      const sorted = data.sort((a: Note, b: Note) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      setNotes(sorted)
    } catch (err) {
      console.error('Failed to fetch notes:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (!response.ok) throw new Error('Failed to fetch categories')
      const data = await response.json()
      setCategories(data)
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags')
      if (!response.ok) throw new Error('Failed to fetch tags')
      const data = await response.json()
      setTags(data)
    } catch (err) {
      console.error('Failed to fetch tags:', err)
    }
  }

  const createCategory = async () => {
    if (!newCategoryName.trim()) return

    setCreatingCategory(true)
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          color: newCategoryColor
        })
      })

      if (!response.ok) throw new Error('Failed to create category')

      const newCategory = await response.json()
      setCategories([...categories, newCategory])
      setShowCategoryModal(false)
      setNewCategoryName('')
      setNewCategoryColor('#3B82F6')
    } catch (err) {
      console.error('Failed to create category:', err)
      alert('Failed to create category')
    } finally {
      setCreatingCategory(false)
    }
  }

  const deleteCategory = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm('Delete this category? Notes will be moved to Uncategorized.')) {
      return
    }

    setDeletingCategoryId(id)
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete category')

      setCategories(categories.filter(cat => cat.id !== id))
    } catch (err) {
      console.error('Failed to delete category:', err)
      alert('Failed to delete category')
    } finally {
      setDeletingCategoryId(null)
    }
  }

  const createNewNote = async () => {
    setCreating(true)
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Untitled Note',
          content: ''
        })
      })

      if (!response.ok) throw new Error('Failed to create note')

      const newNote = await response.json()

      // Add to local state
      setNotes([newNote, ...notes])

      // Navigate to the new note
      router.push(`/notes/${newNote.id}`)

      // Close mobile menu
      setIsMobileMenuOpen(false)
    } catch (err) {
      console.error('Failed to create note:', err)
    } finally {
      setCreating(false)
    }
  }

  const deleteNote = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm('Are you sure you want to delete this note?')) {
      return
    }

    setDeletingNoteId(id)
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete note')

      // Remove from local state
      setNotes(notes.filter(note => note.id !== id))

      // If we deleted the current note, redirect to notes list
      if (currentNoteId === id) {
        router.push('/notes')
      }

      // Close mobile menu
      setIsMobileMenuOpen(false)
    } catch (err) {
      console.error('Failed to delete note:', err)
    } finally {
      setDeletingNoteId(null)
    }
  }

  // Toggle tag filter
  const toggleTagFilter = (tagId: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (selectedTagIds.includes(tagId)) {
      // Remove tag filter
      const newTagIds = selectedTagIds.filter(id => id !== tagId)
      params.delete('tagIds')
      newTagIds.forEach(id => params.append('tagIds', id))
    } else {
      // Add tag filter
      params.append('tagIds', tagId)
    }

    // Update URL without navigating
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.push(newUrl)
  }

  // Clear all tag filters
  const clearTagFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('tagIds')

    // Keep category filter if exists
    if (categoryId) {
      params.set('category', categoryId)
    }

    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.push(newUrl)
  }

  // Get selected tag objects
  const selectedTags = tags.filter(tag => selectedTagIds.includes(tag.id))

  // Filter notes based on search query and category
  const filteredNotes = notes.filter(note => {
    const query = debouncedSearchQuery.toLowerCase()
    const matchesSearch =
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)

    const matchesCategory = !categoryId || note.categoryId === categoryId

    return matchesSearch && matchesCategory
  })

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      // Today - show time
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }
  }

  // Get preview text (first 100 chars)
  const getPreview = (content: string) => {
    if (!content) return 'No content'
    return content.length > 100 ? content.substring(0, 100) + '...' : content
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6 text-gray-600 dark:text-gray-400"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isMobileMenuOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
          transform transition-transform duration-200 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4 mt-8 lg:mt-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Notes
                </h2>
                {session?.user?.email && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {session.user.email}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Logout"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 min-h-[44px] pl-10 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-3 top-3.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="mb-3">
                <select
                  value={categoryId || 'all'}
                  onChange={(e) => {
                    const value = e.target.value
                    router.push(value === 'all' ? '/notes' : `/notes?category=${value}`)
                  }}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-700 dark:text-gray-300"
                >
                  <option value="all">All Notes</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category._count?.notes || 0})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* New Note Button */}
            <button
              onClick={createNewNote}
              disabled={creating}
              className="w-full px-4 py-3 min-h-[44px] bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium mb-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {creating ? (
                <>
                  <Spinner size="sm" className="text-white" />
                  Creating...
                </>
              ) : (
                '+ New Note'
              )}
            </button>

            {/* New Category Button */}
            <button
              onClick={() => setShowCategoryModal(true)}
              className="w-full px-4 py-3 min-h-[44px] border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-sm"
            >
              + New Category
            </button>
          </div>

          {/* Categories Section */}
          {categories.length > 0 && (
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Categories
                </h3>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {category.name}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {category._count?.notes || 0}
                      </span>
                    </div>
                    <button
                      onClick={(e) => deleteCategory(category.id, e)}
                      disabled={deletingCategoryId === category.id}
                      className="opacity-0 group-hover:opacity-100 p-2 min-w-[36px] min-h-[36px] text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Delete category"
                    >
                      {deletingCategoryId === category.id ? (
                        <Spinner size="sm" className="text-red-600 w-4 h-4" />
                      ) : (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags Section */}
          {tags.length > 0 && (
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Tags
                </h3>
                {selectedTagIds.length > 0 && (
                  <button
                    onClick={clearTagFilters}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              {/* Selected tag chips */}
              {selectedTags.length > 0 && (
                <div className="px-4 py-2 flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
                  {selectedTags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTagFilter(tag.id)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      #{tag.name}
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  ))}
                </div>
              )}

              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    onClick={() => toggleTagFilter(tag.id)}
                    className={`px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between group cursor-pointer transition-colors ${
                      selectedTagIds.includes(tag.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className={`text-sm font-medium ${
                        selectedTagIds.includes(tag.id)
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-blue-600 dark:text-blue-400'
                      }`}>
                        #{tag.name}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {tag._count?.noteTags || 0}
                      </span>
                    </div>
                    {selectedTagIds.includes(tag.id) && (
                      <svg
                        className="w-5 h-5 text-blue-600 dark:text-blue-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {/* Show 5 skeleton cards while loading */}
                {[...Array(5)].map((_, index) => (
                  <NoteCardSkeleton key={index} />
                ))}
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                {searchQuery ? 'No notes found' : 'No notes yet'}
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredNotes.map((note) => (
                  <Link
                    key={note.id}
                    href={`/notes/${note.id}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      block p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
                      ${currentNoteId === note.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400' : ''}
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {note.title || 'Untitled'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {getPreview(note.content)}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                          {formatDate(note.updatedAt)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => deleteNote(note.id, e)}
                        disabled={deletingNoteId === note.id}
                        className="ml-2 p-2 min-w-[36px] min-h-[36px] text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Delete note"
                      >
                        {deletingNoteId === note.id ? (
                          <Spinner size="sm" className="text-red-600" />
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 text-center">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Create Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 shadow-xl w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Create New Category
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g., Work, Personal, Ideas"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewCategoryColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        newCategoryColor === color ? 'border-gray-900 dark:border-gray-100 scale-110' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowCategoryModal(false)
                  setNewCategoryName('')
                  setNewCategoryColor('#3B82F6')
                }}
                className="px-4 py-3 min-h-[44px] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createCategory}
                disabled={!newCategoryName.trim() || creatingCategory}
                className="px-4 py-3 min-h-[44px] bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {creatingCategory ? (
                  <>
                    <Spinner size="sm" className="text-white" />
                    Creating...
                  </>
                ) : (
                  'Create'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
