'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import NotesSidebar from '@/components/NotesSidebar'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import toast from 'react-hot-toast'

interface Note {
  id: string
  title: string
  content: string
  categoryId: string | null
  category: { id: string; name: string; color: string } | null
  updatedAt: string
}

interface Category {
  id: string
  name: string
  color: string
}

interface Tag {
  id: string
  name: string
}

export default function NoteEditorPage() {
  const params = useParams()
  const router = useRouter()
  const noteId = params.id as string

  const [note, setNote] = useState<Note | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [tagInput, setTagInput] = useState('')
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [titleError, setTitleError] = useState<string | null>(null)

  // Fetch note on mount
  useEffect(() => {
    fetchNote()
    fetchCategories()
    fetchTags()
    fetchNoteTags()
  }, [noteId])

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
      setAllTags(data)
    } catch (err) {
      console.error('Failed to fetch tags:', err)
    }
  }

  const fetchNoteTags = async () => {
    try {
      const response = await fetch(`/api/notes/${noteId}/tags`)
      if (!response.ok) throw new Error('Failed to fetch note tags')
      const data = await response.json()
      setTags(data)
    } catch (err) {
      console.error('Failed to fetch note tags:', err)
    }
  }

  const fetchNote = async () => {
    try {
      const response = await fetch(`/api/notes/${noteId}`)
      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Note not found')
          router.push('/notes')
          return
        }
        throw new Error('Failed to fetch note')
      }
      const data = await response.json()
      setNote(data)
      setTitle(data.title)
      setContent(data.content)
      setCategoryId(data.categoryId)
      setLastSaved(new Date(data.updatedAt))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Auto-save with debouncing
  const saveNote = useCallback(async () => {
    if (!note || saving) return

    setSaving(true)
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, categoryId })
      })

      if (!response.ok) {
        throw new Error('Failed to save note')
      }

      const updatedNote = await response.json()
      setNote(updatedNote)
      setLastSaved(new Date())
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save note'
      // Only show toast for network errors, not validation errors
      if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
        toast.error('Network error. Please check your connection.')
      }
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }, [noteId, title, content, categoryId, note, saving])

  // Debounced save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (note && (title !== note.title || content !== note.content)) {
        saveNote()
      }
    }, 2000) // 2 second debounce

    return () => clearTimeout(timer)
  }, [title, content, note, saveNote])

  const deleteNote = async () => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete note')

      toast.success('Note deleted successfully')
      router.push('/notes')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete note'
      toast.error(errorMessage)
      setError(errorMessage)
    }
  }

  const addTag = async (tagName: string) => {
    try {
      // Create or get existing tag
      const createResponse = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tagName })
      })

      if (!createResponse.ok) throw new Error('Failed to create tag')
      const tag = await createResponse.json()

      // Associate tag with note
      const associateResponse = await fetch(`/api/notes/${noteId}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagId: tag.id })
      })

      if (!associateResponse.ok) throw new Error('Failed to add tag to note')

      // Update local state
      setTags([...tags, tag])
      setAllTags([...allTags.filter(t => t.id !== tag.id), tag])
      setTagInput('')
      setShowTagSuggestions(false)
      toast.success(`Tag "${tag.name}" added`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add tag'
      toast.error(errorMessage)
    }
  }

  const removeTag = async (tagId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}/tags/${tagId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to remove tag')

      setTags(tags.filter(t => t.id !== tagId))
      toast.success('Tag removed')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove tag'
      toast.error(errorMessage)
    }
  }

  const handleTagInputChange = (value: string) => {
    setTagInput(value)
    // Show suggestions if user types #
    if (value.includes('#')) {
      setShowTagSuggestions(true)
    } else {
      setShowTagSuggestions(false)
    }
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      const tagName = tagInput.replace(/^#/, '').trim()
      if (tagName) {
        addTag(tagName)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Note not found</div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-white overflow-hidden">
        {/* Sidebar */}
        <NotesSidebar currentNoteId={noteId} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {/* Category Selector */}
                <select
                  value={categoryId || ''}
                  onChange={(e) => setCategoryId(e.target.value || null)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">No Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                {saving && (
                  <span className="text-sm text-gray-500">Saving...</span>
                )}
                {!saving && lastSaved && (
                  <span className="text-sm text-gray-500">
                    Saved {lastSaved.toLocaleTimeString()}
                  </span>
                )}
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message with Retry */}
        {error && (
          <div className="px-6 pt-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-700">{error}</span>
              </div>
              <button
                onClick={() => {
                  setError(null)
                  saveNote()
                }}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Note?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{title}"? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteNote}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Editor */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="mb-6">
            <input
              type="text"
              value={title}
              onChange={(e) => {
                const value = e.target.value
                setTitle(value)
                // Validate title length
                if (value.length > 200) {
                  setTitleError('Title must be less than 200 characters')
                } else {
                  setTitleError(null)
                }
              }}
              placeholder="Note title"
              className={`w-full text-3xl font-bold text-gray-900 placeholder-gray-400 border-none outline-none bg-transparent ${
                titleError ? 'border-b-2 border-red-500' : ''
              }`}
            />
            {titleError && (
              <p className="mt-2 text-sm text-red-600">{titleError}</p>
            )}
          </div>

          {/* Tags Section */}
          <div className="mb-6">
            {/* Tag Chips */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                  >
                    #{tag.name}
                    <button
                      onClick={() => removeTag(tag.id)}
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Tag Input */}
            <div className="relative">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => handleTagInputChange(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="Add tags (type #tagname)"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Tag Suggestions Dropdown */}
              {showTagSuggestions && allTags.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {allTags
                    .filter(tag =>
                      tag.name.toLowerCase().includes(tagInput.replace(/^#/, '').toLowerCase()) &&
                      !tags.some(t => t.id === tag.id)
                    )
                    .map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => addTag(tag.name)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center justify-between"
                      >
                        <span className="text-sm">#{tag.name}</span>
                        <span className="text-xs text-gray-500">Click to add</span>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your note..."
            className="w-full min-h-[500px] text-lg text-gray-700 placeholder-gray-400 border-none outline-none resize-none bg-transparent leading-relaxed"
          />

          {/* Auto-save indicator */}
          <div className="mt-8 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-400">
              Changes are saved automatically
            </p>
          </div>
        </div>
      </div>
    </div>
    </ErrorBoundary>
  )
}
