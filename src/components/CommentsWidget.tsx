"use client";

import { useState } from "react";
import CommentList from "./CommentList";
import CommentForm from "./CommentForm";

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  replies?: Comment[];
  parentId?: string;
}

export default function CommentsWidget() {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      author: "John Doe",
      content: "This is a great article! I really enjoyed reading it and learned a lot from your insights.",
      timestamp: new Date("2024-01-15T10:30:00"),
      replies: [
        {
          id: "2",
          author: "Jane Smith",
          content: "I completely agree! The examples were particularly helpful.",
          timestamp: new Date("2024-01-15T11:15:00"),
          parentId: "1",
        },
        {
          id: "3",
          author: "Mike Johnson",
          content: "Thanks for sharing your thoughts. Could you elaborate more on the third point?",
          timestamp: new Date("2024-01-15T12:00:00"),
          parentId: "1",
          replies: [
            {
              id: "4",
              author: "John Doe",
              content: "Sure! I'd be happy to explain that further. The third point focuses on...",
              timestamp: new Date("2024-01-15T12:30:00"),
              parentId: "3",
            }
          ]
        }
      ]
    },
    {
      id: "5",
      author: "Sarah Wilson",
      content: "Interesting perspective! I have a different view on some of these points, but I appreciate the detailed analysis.",
      timestamp: new Date("2024-01-16T09:15:00"),
    }
  ]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addComment = (content: string, author: string) => {
    const newComment: Comment = {
      id: generateId(),
      author,
      content,
      timestamp: new Date(),
    };
    setComments([newComment, ...comments]);
  };

  const addReply = (parentId: string, content: string) => {
    const addReplyToComment = (comments: Comment[]): Comment[] => {
      return comments.map(comment => {
        if (comment.id === parentId) {
          const newReply: Comment = {
            id: generateId(),
            author: "Anonymous", // In a real app, this would come from user auth
            content,
            timestamp: new Date(),
            parentId,
          };
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply]
          };
        }
        if (comment.replies) {
          return {
            ...comment,
            replies: addReplyToComment(comment.replies)
          };
        }
        return comment;
      });
    };

    setComments(addReplyToComment(comments));
  };

  const totalComments = comments.reduce((count, comment) => {
    const countReplies = (replies: Comment[] = []) => {
      return replies.reduce((acc, reply) => acc + 1 + countReplies(reply.replies), 0);
    };
    return count + 1 + countReplies(comment.replies);
  }, 0);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Comments ({totalComments})
        </h2>
        <p className="text-gray-600">
          Join the conversation and share your thoughts!
        </p>
      </div>

      <div className="mb-8">
        <CommentForm onSubmit={addComment} />
      </div>

      {comments.length > 0 ? (
        <CommentList comments={comments} onReply={addReply} />
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No comments yet.</p>
          <p className="text-gray-400 mt-2">Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  );
}