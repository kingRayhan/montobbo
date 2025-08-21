import React from "react";

interface Comment {
  id: string;
  owner_resource_identifier: string;
  body: string;
  user_id: string;
  parent_id?: string;
  app_id: string;
  created_at: number;
  edited_at?: number;
  user?: {
    id: string;
    display_name: string;
    email?: string;
    avatar_path?: string;
  };
  replies?: Comment[];
}

interface CommentFeedProps {
  comments: Comment[];
}

const CommentFeed: React.FC<CommentFeedProps> = ({ comments }) => {
  if (!comments.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Comments ({comments.length})
        </h3>
      </div>
      <ul className="space-y-4">
        {comments.map((comment) => (
          <li key={comment.id} className="border-b border-gray-200 pb-4">
            <div className="flex items-start space-x-3">
              {comment.user?.avatar_path ? (
                <img
                  src={comment.user.avatar_path}
                  alt={comment.user.display_name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {comment.user?.display_name?.charAt(0).toUpperCase() || "?"}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-gray-900">
                    {comment.user?.display_name || "Anonymous"}
                  </p>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 mt-1">{comment.body}</p>
                
                {/* Show replies if any */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-4 mt-3 space-y-3 border-l-2 border-gray-100 pl-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex items-start space-x-3">
                        {reply.user?.avatar_path ? (
                          <img
                            src={reply.user.avatar_path}
                            alt={reply.user.display_name}
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                              {reply.user?.display_name?.charAt(0).toUpperCase() || "?"}
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900 text-sm">
                              {reply.user?.display_name || "Anonymous"}
                            </p>
                            <span className="text-xs text-gray-500">
                              {new Date(reply.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700 mt-1 text-sm">{reply.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommentFeed;
