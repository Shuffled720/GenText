"use client";

import { useState } from "react";

const ChatComponent = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");

  const getResponse = async () => {
    try {
      setResponse("");
      setLoading(true);
      const response = await fetch("/api/chat/complete-response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();
      setResponse(data.response);
    } catch (error) {
      console.error("Error fetching response:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStreamResponse = async () => {
    try {
      setResponse("");

      setLoading(true);

      const response = await fetch("/api/chat/stream-response", {
        method: "POST",
        headers: {
          "Content-Type": "text/event-stream",
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to connect to streaming API");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let fullResponse = "";
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        fullResponse += chunkValue;
        setResponse(fullResponse);
      }
    } catch (error) {
      console.error("Error fetching stream response:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div>
        <textarea
          placeholder="Type your message here..."
          className="w-full h-32 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        ></textarea>
        <button
          onClick={getResponse}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mr-2"
        >
          Get Response
        </button>
        <button
          onClick={getStreamResponse}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Get Stream Response
        </button>
      </div>

      <div className="mt-4 p-4 border border-gray-300 rounded-md bg-gray-50">
        <p className="font-semibold mb-2">Response:</p>
        <div className="whitespace-pre-wrap">
          {response}
          {loading && (
            <span className="inline-flex items-center space-x-2" aria-hidden>
              <span className="w-6 h-6 bg-gray-400 rounded-full animate-pulse" />
              <span
                className="w-6 h-6 bg-gray-400 rounded-full animate-pulse"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-6 h-6 bg-gray-400 rounded-full animate-pulse"
                style={{ animationDelay: "300ms" }}
              />
            </span>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatComponent;
