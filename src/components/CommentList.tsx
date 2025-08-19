"use client";

import { useState } from "react";

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  replies?: Comment[];
  parentId?: string;
}

interface CommentItemProps {
  comment: Comment;
  onReply: (parentId: string, content: string) => void;
  depth?: number;
}

function CommentItem({ comment, onReply, depth = 0 }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyContent.trim()) {
      onReply(comment.id, replyContent);
      setReplyContent("");
      setShowReplyForm(false);
    }
  };

  const marginLeft = depth * 32;

  return (
    <div className="mb-4" style={{ marginLeft: `${marginLeft}px` }}>
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {comment.author.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium text-gray-900">{comment.author}</span>
            <span className="text-gray-500 text-sm">
              {comment.timestamp.toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <p className="text-gray-800 mb-3">{comment.content}</p>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Reply
          </button>
          {comment.replies && comment.replies.length > 0 && (
            <span className="text-gray-500 text-sm">
              {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
            </span>
          )}
        </div>

        {showReplyForm && (
          <form onSubmit={handleReplySubmit} className="mt-4">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowReplyForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Reply
              </button>
            </div>
          </form>
        )}
      </div>

      {comment.replies && comment.replies.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          onReply={onReply}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

interface CommentListProps {
  comments: Comment[];
  onReply: (parentId: string, content: string) => void;
}

export default function CommentList({ comments, onReply }: CommentListProps) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onReply={onReply}
        />
      ))}
    </div>
  );
}