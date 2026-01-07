'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

interface Note {
  id: string
  title: string
  content: string
  updatedAt: string
}

interface NotesSidebarProps {
  currentNoteId?: string
}

export default function NotesSidebar({ currentNoteId }: NotesSidebarProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes')
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

  const createNewNote = async () => {
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
    }
  }

  const deleteNote = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm('Are you sure you want to delete this note?')) {
      return
    }

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
    }
  }

  // Filter notes based on search query
  const filteredNotes = notes.filter(note => {
    const query = searchQuery.toLowerCase()
    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    )
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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md hover:bg-gray-50"
      >
        <svg
          className="w-6 h-6 text-gray-600"
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
          w-72 bg-white border-r border-gray-200
          transform transition-transform duration-200 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 mt-8 lg:mt-0">
              Notes
            </h2>

            {/* Search */}
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
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

            {/* New Note Button */}
            <button
              onClick={createNewNote}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              + New Note
            </button>
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Loading notes...
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchQuery ? 'No notes found' : 'No notes yet'}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredNotes.map((note) => (
                  <Link
                    key={note.id}
                    href={`/notes/${note.id}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      block p-4 hover:bg-gray-50 transition-colors
                      ${currentNoteId === note.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {note.title || 'Untitled'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {getPreview(note.content)}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDate(note.updatedAt)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => deleteNote(note.id, e)}
                        className="ml-2 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
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
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 text-xs text-gray-500 text-center">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
