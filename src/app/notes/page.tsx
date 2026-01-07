'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Note {
  id: string
  title: string
  content: string
  updatedAt: string
}

export default function NotesListPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes')
      if (!response.ok) throw new Error('Failed to fetch notes')
      const data = await response.json()
      setNotes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
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
      // Redirect to the new note editor
      window.location.href = `/notes/${newNote.id}`
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create note')
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading notes...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notes</h1>
            <p className="text-gray-600 mt-1">{notes.length} notes</p>
          </div>
          <button
            onClick={createNewNote}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            + New Note
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Notes List */}
        {notes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No notes yet</p>
            <p className="text-gray-400 mt-2">Click "New Note" to create your first note</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <Link
                key={note.id}
                href={`/notes/${note.id}`}
                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-5 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {note.title || 'Untitled'}
                    </h3>
                    <p className="text-gray-600 mt-1 line-clamp-2">
                      {note.content || 'No content'}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      {new Date(note.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <button
                    onClick={(e) => deleteNote(note.id, e)}
                    className="ml-4 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Delete
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
