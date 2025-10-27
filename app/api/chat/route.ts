export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    // const response = await openai.chat.completions.create({
    //   model: "gpt-3.5-turbo",
    //   messages: [{ role: "user", content: message }],
    // });
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
        }),
      }
    );

    const data = await response.json();
    const responseMessage = data.choices[0].message.content;

    //TODO: also include any <think>...</think> content in the response
    //cleaning the response to remove <think> tags for now
    const cleanedResponse = responseMessage
      .replace(/<think>[\s\S]*?<\/think>/g, "")
      .trim();
    return new Response(JSON.stringify({ response: cleanedResponse }), {
      status: 200,
    });
  } catch (error) {
    console.log(error);

    return new Response(
      JSON.stringify({ error: "Failed to fetch response from OpenRouter" }),
      { status: 500 }
    );
  }
}
