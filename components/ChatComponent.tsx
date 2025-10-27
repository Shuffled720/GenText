"use client";

import React, { useState } from "react";

const ChatComponent = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingContent, setThinkingContent] = useState("");

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
      setThinkingContent("");
      setIsThinking(false);
      setLoading(true);

      const response = await fetch("/api/chat/stream-response", {
        method: "POST",
        headers: {
          "Content-Type": "text/event-stream",
        },
        body: JSON.stringify({ message }),
      });

      const reader = response.body?.getReader();
      if (!reader) {
        setLoading(false);
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let insideThinkTag = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          setLoading(false);
          setIsThinking(false);
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Process the buffer to separate thinking content from response
        while (true) {
          if (!insideThinkTag) {
            const thinkStart = buffer.indexOf("<think>");
            if (thinkStart !== -1) {
              // Add content before <think> to response
              if (thinkStart > 0) {
                setResponse((prev) => prev + buffer.substring(0, thinkStart));
              }
              buffer = buffer.substring(thinkStart + 7); // Remove "<think>"
              insideThinkTag = true;
              setIsThinking(true);
            } else {
              // No <think> tag found, check if we might get one in the next chunk
              const partialTag = buffer.match(/<think?$/);
              if (partialTag) {
                // Keep potential partial tag in buffer
                const safeContent = buffer.substring(0, partialTag.index);
                if (safeContent) {
                  setResponse((prev) => prev + safeContent);
                }
                buffer = buffer.substring(partialTag.index!);
                break;
              } else {
                // Add all to response
                setResponse((prev) => prev + buffer);
                buffer = "";
                break;
              }
            }
          } else {
            const thinkEnd = buffer.indexOf("</think>");
            if (thinkEnd !== -1) {
              // Add thinking content
              setThinkingContent(
                (prev) => prev + buffer.substring(0, thinkEnd)
              );
              buffer = buffer.substring(thinkEnd + 8); // Remove "</think>"
              insideThinkTag = false;
              setIsThinking(false);
            } else {
              // Still inside thinking tag, check for partial closing tag
              const partialTag = buffer.match(/<\/think?$/);
              if (partialTag) {
                const safeContent = buffer.substring(0, partialTag.index);
                if (safeContent) {
                  setThinkingContent((prev) => prev + safeContent);
                }
                buffer = buffer.substring(partialTag.index!);
                break;
              } else {
                // Add all to thinking content
                setThinkingContent((prev) => prev + buffer);
                buffer = "";
                break;
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching response:", error);
    } finally {
      setLoading(false);
      setIsThinking(false);
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

      {loading && <p className="mt-4">Loading...</p>}

      {isThinking && (
        <div className="mt-4 p-4 border border-yellow-300 rounded-md bg-yellow-50">
          <p className="font-semibold italic text-yellow-700">
            AI is thinking...
          </p>
          <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
            {thinkingContent}
          </p>
        </div>
      )}

      <div className="mt-4 p-4 border border-gray-300 rounded-md bg-gray-50">
        <p className="font-semibold mb-2">Response:</p>
        <div className="whitespace-pre-wrap">{response}</div>
      </div>
    </>
  );
};

export default ChatComponent;
