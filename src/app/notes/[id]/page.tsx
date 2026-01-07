'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import NotesSidebar from '@/components/NotesSidebar'

interface Note {
  id: string
  title: string
  content: string
  updatedAt: string
}

export default function NoteEditorPage() {
  const params = useParams()
  const router = useRouter()
  const noteId = params.id as string

  const [note, setNote] = useState<Note | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Fetch note on mount
  useEffect(() => {
    fetchNote()
  }, [noteId])

  const fetchNote = async () => {
    try {
      const response = await fetch(`/api/notes/${noteId}`)
      if (!response.ok) {
        if (response.status === 404) {
          setError('Note not found')
          router.push('/notes')
          return
        }
        throw new Error('Failed to fetch note')
      }
      const data = await response.json()
      setNote(data)
      setTitle(data.title)
      setContent(data.content)
      setLastSaved(new Date(data.updatedAt))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
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
        body: JSON.stringify({ title, content })
      })

      if (!response.ok) throw new Error('Failed to save note')

      const updatedNote = await response.json()
      setNote(updatedNote)
      setLastSaved(new Date())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save note')
    } finally {
      setSaving(false)
    }
  }, [noteId, title, content, note, saving])

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

      router.push('/notes')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note')
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
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <NotesSidebar currentNoteId={noteId} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1" />
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

        {/* Error Message */}
        {error && (
          <div className="px-6 pt-4">
            <div className="p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
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
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
            className="w-full text-3xl font-bold text-gray-900 placeholder-gray-400 border-none outline-none mb-6 bg-transparent"
          />

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
  )
}
