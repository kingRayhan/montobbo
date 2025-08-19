"use client";

import React from "react";
import CommentWidget from "./CommentWidget";

const WidgetPage = () => {
  // Function to notify parent about height changes
  const notifyHeightChange = React.useCallback(() => {
    const height = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );

    if (window.parent !== window) {
      window.parent.postMessage(
        {
          type: "resize",
          height: height,
        },
        "*"
      );
    }
  }, []);

  // Notify on initial load and count changes
  React.useEffect(() => {
    // Initial notification after content renders
    const timer = setTimeout(notifyHeightChange, 100);

    // Set up ResizeObserver to watch for size changes
    const observer = new ResizeObserver(notifyHeightChange);
    observer.observe(document.body);
    observer.observe(document.documentElement);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [notifyHeightChange]);

  // Notify when count changes (content changes)
  React.useEffect(() => {
    notifyHeightChange();
  }, [notifyHeightChange]);

  return (
    <>
      <CommentWidget />
    </>
  );
};

export default WidgetPage;
