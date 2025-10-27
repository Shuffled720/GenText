export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "minimax/minimax-m2:free",
          messages: [
            {
              role: "user",
              content: message,
            },
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok || !response.body) {
      throw new Error("Failed to connect to OpenRouter streaming API");
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // process line-by-line
            let lineEnd: number;
            while ((lineEnd = buffer.indexOf("\n")) !== -1) {
              const line = buffer.slice(0, lineEnd).trim();
              buffer = buffer.slice(lineEnd + 1);

              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") {
                  controller.close();
                  return;
                }

                try {
                  const json = JSON.parse(data);
                  const content = json?.choices?.[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(encoder.encode(content));
                  }
                } catch {
                  // ignore bad lines
                }
              }
            }
          }
        } catch (err) {
          console.error("Stream error:", err);
          controller.error(err);
        } finally {
          reader.cancel();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("POST error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch response from OpenRouter" }),
      { status: 500 }
    );
  }
}
