"use client";

import React from "react";

const page = () => {
  const [count, setCount] = React.useState(0);

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
  }, [count, notifyHeightChange]);

  return (
    <div style={{ padding: "20px" }}>
      {Array.from({ length: count + 5 }).map((_, i) => (
        <h1
          key={i}
          className="text-3xl border-b border-red-100"
          style={{
            fontSize: "1.5rem",
            borderBottom: "1px solid #fecaca",
            marginBottom: "10px",
            padding: "10px 0",
          }}
        >
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ipsam omnis
          odio earum labore, modi sed non voluptatem voluptatibus, quibusdam
          sint quasi numquam autem quia mollitia fugiat debitis! Modi, iure
          fugiat!
        </h1>
      ))}

      <div
        style={{
          marginTop: "20px",
          padding: "20px",
          backgroundColor: "#f3f4f6",
          borderRadius: "8px",
        }}
      >
        <button
          onClick={() => {
            window.parent.postMessage({ type: "trigger", count }, "*");
          }}
          style={{
            padding: "10px 20px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            marginRight: "10px",
            cursor: "pointer",
          }}
        >
          Trigger message
        </button>

        <h1 style={{ margin: "10px 0", fontSize: "1.2rem" }}>Count: {count}</h1>
        <button
          onClick={() => setCount(count + 1)}
          style={{
            padding: "10px 20px",
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Add More Content (Increment)
        </button>
      </div>
    </div>
  );
};

export default page;
