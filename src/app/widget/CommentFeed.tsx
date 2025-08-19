import { useQuery } from "convex/react";
import React from "react";
import { api } from "../../../convex/_generated/api";

interface CommentFeedProps {
  ownerIdentifier: string;
  appId: string;
}
const CommentFeed: React.FC<CommentFeedProps> = ({
  ownerIdentifier,
  appId,
}) => {
  const getCommentsQuery = useQuery(api.comments.getComments, {
    appId,
    ownerIdentifier,
  });

  return (
    <div>
      <ul className="space-y-4">
        {getCommentsQuery?.map((comment) => (
          <li key={comment._id} className="border-b border-gray-200 pb-4">
            <p className="font-medium">{comment.user.name}</p>
            <p className="text-gray-600">{comment.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommentFeed;
