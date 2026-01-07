'use client'

import React, { useCallback, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'

const lowlight = createLowlight(common)

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 px-3 py-2 mb-3 bg-white border-b border-gray-200 rounded-t-lg">
      {/* Text Formatting */}
      <div className="flex items-center gap-1 pr-3 border-r border-gray-200">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive('bold') ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
          title="Bold (Cmd+B)"
          aria-label="Toggle bold"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 4h5a3 3 0 0 1 0 6H5V4zm0 6h5a3 3 0 0 1 0 6H5v-6z" />
          </svg>
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive('italic') ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
          title="Italic (Cmd+I)"
          aria-label="Toggle italic"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 4h8l-1 2H9l-2 8h2l-1 2H2l1-2h2l2-8H5l1-2z" />
          </svg>
        </button>

        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive('strike') ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
          title="Strikethrough"
          aria-label="Toggle strikethrough"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16M4 8l4 4m0-4l-4 4m12-4l-4 4m4-4l4 4" />
          </svg>
        </button>

        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive('code') ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
          title="Inline code"
          aria-label="Toggle inline code"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m-4 4l-4 4m4-4l4 4" />
          </svg>
        </button>
      </div>

      {/* Headings */}
      <div className="flex items-center gap-1 px-3 border-r border-gray-200">
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
          title="Heading 1"
          aria-label="Toggle heading 1"
        >
          <span className="text-sm font-bold">H1</span>
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
          title="Heading 2"
          aria-label="Toggle heading 2"
        >
          <span className="text-sm font-bold">H2</span>
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive('heading', { level: 3 }) ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
          title="Heading 3"
          aria-label="Toggle heading 3"
        >
          <span className="text-sm font-bold">H3</span>
        </button>
      </div>

      {/* Lists */}
      <div className="flex items-center gap-1 px-3 border-r border-gray-200">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive('bulletList') ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
          title="Bullet list"
          aria-label="Toggle bullet list"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive('orderedList') ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
          title="Numbered list"
          aria-label="Toggle ordered list"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5h12M9 12h12M9 19h12M5 5h.01M5 12h.01M5 19h.01" />
          </svg>
        </button>
      </div>

      {/* Blocks */}
      <div className="flex items-center gap-1 px-3 border-r border-gray-200">
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive('blockquote') ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
          title="Blockquote"
          aria-label="Toggle blockquote"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
        </button>

        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive('codeBlock') ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
          title="Code block"
          aria-label="Toggle code block"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m-4 4l-4 4m4-4l4 4M4 6h16M4 18h16" />
          </svg>
        </button>

        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-700"
          title="Horizontal rule"
          aria-label="Insert horizontal rule"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
      </div>

      {/* Links & Actions */}
      <div className="flex items-center gap-1 pl-3">
        <button
          onClick={() => {
            const url = window.prompt('Enter URL:')
            if (url) {
              editor.chain().focus().setLink({ href: url }).run()
            }
          }}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive('link') ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
          title="Insert link (Cmd+K)"
          aria-label="Insert link"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </button>

        {editor.isActive('link') && (
          <button
            onClick={() => editor.chain().focus().unsetLink().run()}
            className="p-2 rounded hover:bg-gray-100 transition-colors text-red-600"
            title="Remove link"
            aria-label="Remove link"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <button
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
          className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-700"
          title="Clear formatting"
          aria-label="Clear formatting"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1" />

      {/* Undo/Redo */}
      <div className="flex items-center gap-1 pl-3 border-l border-gray-200">
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Undo (Cmd+Z)"
          aria-label="Undo"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>

        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Redo (Cmd+Shift+Z)"
          aria-label="Redo"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function RichTextEditor({ content, onChange, placeholder = 'Start writing...' }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-gray-900 text-gray-100 rounded-lg p-4 my-4',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none max-w-none min-h-[500px] px-3 py-2',
      },
    },
  })

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false)
    }
  }, [content, editor])

  if (!editor) {
    return (
      <div className="flex items-center justify-center min-h-[500px] bg-gray-50 rounded-lg">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
