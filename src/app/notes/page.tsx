'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import NotesSidebar from '@/components/NotesSidebar'
import toast from 'react-hot-toast'

interface Note {
  id: string
  title: string
  content: string
  updatedAt: string
}

export default function NotesListPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filterCategoryId = searchParams.get('category')
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchNotes()
  }, [filterCategoryId])

  const fetchNotes = async () => {
    try {
      const url = filterCategoryId ? `/api/notes?categoryId=${filterCategoryId}` : '/api/notes'
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch notes')
      const data = await response.json()

      // Sort by updated date (newest first)
      const sorted = data.sort((a: Note, b: Note) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      setNotes(sorted)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // If there are notes, redirect to the most recent one
  useEffect(() => {
    if (!loading && notes.length > 0) {
      router.push(`/notes/${notes[0].id}`)
    }
  }, [loading, notes, router])

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
      toast.success('Note created successfully')
      router.push(`/notes/${newNote.id}`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create note'
      toast.error(errorMessage)
      setError(errorMessage)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Loading notes...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <NotesSidebar categoryId={filterCategoryId} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center overflow-hidden">
        {notes.length === 0 ? (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Notes
            </h1>
            <p className="text-gray-600 mb-8">
              You don't have any notes yet. Create your first note to get started!
            </p>
            <button
              onClick={createNewNote}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-lg"
            >
              + Create Your First Note
            </button>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            Loading most recent note...
          </div>
        )}

        {error && (
          <div className="fixed bottom-4 right-4 p-4 bg-red-50 text-red-700 rounded-lg shadow-lg max-w-md">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
