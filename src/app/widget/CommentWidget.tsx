"use client";

import React, { useEffect } from "react";
import CommentForm from "./CommentForm";
import CommentFeed from "./CommentFeed";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createComment,
  getComments,
  subscribeToComments,
  supabase,
} from "@/lib/supabase";

// Types
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

const CommentWidget = () => {
  const sp = useSearchParams();
  const ownerIdentifier = sp.get("ownerIdentifier") ?? "";
  const appKey = sp.get("appKey") ?? "";
  const queryClient = useQueryClient();

  // TanStack Query hooks
  const {
    data: comments = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["comments", appKey, ownerIdentifier],
    queryFn: () => getComments({ appKey, ownerIdentifier }),
    enabled: !!appKey && !!ownerIdentifier,
  });

  const createCommentMutation = useMutation({
    mutationFn: createComment,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.appKey, variables.ownerIdentifier],
      });
    },
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!appKey || !ownerIdentifier) return;

    (async () => {
      await subscribeToComments({
        appKey,
        ownerIdentifier,
        onInsert: () => {
          // Invalidate and refetch comments
          queryClient.invalidateQueries({
            queryKey: ["comments", appKey, ownerIdentifier],
          });
        },
        onUpdate: () => {
          console.log("Comment updated");
          queryClient.invalidateQueries({
            queryKey: ["comments", appKey, ownerIdentifier],
          });
        },
        onDelete: () => {
          queryClient.invalidateQueries({
            queryKey: ["comments", appKey, ownerIdentifier],
          });
        },
      });
    })();

    return () => {
      // if (subscription) {
      //   subscription.unsubscribe();
      // }
    };
  }, [appKey, ownerIdentifier, queryClient]);

  // Handle comment submission
  const handleCommentSubmit = async (payload: {
    body: string;
    name: string;
    email?: string;
  }) => {
    if (!appKey || !ownerIdentifier) return;

    createCommentMutation.mutate({
      appKey,
      ownerIdentifier,
      body: payload.body,
      user: {
        authType: "external",
        displayName: payload.name,
        email: payload.email,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading comments...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Comments unavailable
            </h3>
            <p className="text-sm text-red-700 mt-1">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <CommentForm
        onSubmit={handleCommentSubmit}
        isSubmitting={createCommentMutation.isPending}
      />

      <div className="mt-4">
        <CommentFeed comments={comments} />
      </div>
    </>
  );
};

export default CommentWidget;
