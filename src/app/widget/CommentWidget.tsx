"use client";

import React, { useMemo } from "react";
import CommentForm from "./CommentForm";
import CommentFeed from "./CommentFeed";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const CommentWidget = () => {
  const sp = useSearchParams();
  const ownerIdentifier = sp.get("ownerIdentifier");
  const origin = sp.get("origin");
  const appKey = sp.get("appKey") ?? "";

  const getAppQuery = useQuery(api.application.getApp, { appKey });
  const createCommentMutation = useMutation(api.comments.createComment);
  // const getAppLoading = useMemo(() => getAppQuery === undefined, [getAppQuery]);

  const { isLoading, error, isValidDomain } = useMemo(() => {
    if (!appKey) {
      return {
        isLoading: false,
        error: "App key is required",
        isValidDomain: false,
      };
    }

    if (getAppQuery === undefined) {
      return {
        isLoading: true,
        error: null,
        isValidDomain: false,
      };
    }

    if (getAppQuery === null) {
      return {
        isLoading: false,
        error: "Invalid app key",
        isValidDomain: false,
      };
    }

    if (!origin) {
      return {
        isLoading: false,
        error: "Origin domain is required",
        isValidDomain: false,
      };
    }

    const isValidDomain = getAppQuery.allowedDomains.some((domain) => {
      return origin === domain;
    });

    if (!isValidDomain) {
      return {
        isLoading: false,
        error: `Domain '${origin}' is not allowed for this app`,
        isValidDomain: false,
      };
    }

    return {
      isLoading: false,
      error: null,
      isValidDomain: true,
    };
  }, [getAppQuery, appKey, origin]);

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
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidDomain || !getAppQuery) {
    return null;
  }

  return (
    <div className="comment-widget p-10">
      <CommentForm
        onSubmit={async (payload) => {
          console.log("Submitting comment:", payload);
          await createCommentMutation({
            appKey: appKey,
            body: payload.body,
            ownerIdentifier: ownerIdentifier ?? "",
            user: {
              name: payload.name,
            },
          });
        }}
      />

      {getAppQuery !== undefined && (
        <div className="mt-4">
          <CommentFeed
            ownerIdentifier={ownerIdentifier ?? ""}
            appId={getAppQuery._id}
          />
        </div>
      )}
    </div>
  );
};

export default CommentWidget;
