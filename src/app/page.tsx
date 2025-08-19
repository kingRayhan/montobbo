"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Home() {
  const messages = useQuery(api.messages.getMessages);
  return (
    <div>
      <h1>Messages</h1>
      {messages?.map((message) => (
        <pre>
          {message._id} - {message.body} - {message.user}
        </pre>
      ))}
    </div>
  );
}
