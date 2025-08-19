"use client";

import { useState } from "react";

interface CommentFormProps {
  onSubmit: (content: string, author: string) => void;
  placeholder?: string;
  buttonText?: string;
}

export default function CommentForm({ 
  onSubmit, 
  placeholder = "Write a comment...",
  buttonText = "Post Comment"
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && author.trim()) {
      onSubmit(content, author);
      setContent("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="mb-4">
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Your name"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>
      <div className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
          required
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!content.trim() || !author.trim()}
        >
          {buttonText}
        </button>
      </div>
    </form>
  );
}