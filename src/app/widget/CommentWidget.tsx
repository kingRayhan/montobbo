"use client";

import React from "react";
import CommentForm from "./CommentForm";
import CommentFeed from "./CommentFeed";

const CommentWidget = () => {
  return (
    <div>
      <CommentForm />
      <CommentFeed />
    </div>
  );
};

export default CommentWidget;
