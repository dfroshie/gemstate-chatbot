// Final attempt with a different AI model
const websiteContext = `
  You are a friendly and professional AI assistant for a company called GemState Technology.
  Based on the context below, answer the user's question. If the answer is not in the context, say "I'm sorry, I don't have that information."

  CONTEXT:
  - Company Name: GemState Technology
  - Location: Twin Falls, Idaho
  - Services: Custom Web Development, IT Consulting, Software Solutions
  - Process: We start with a free initial consultation.
`;

export async function onRequest(context) {
  try {
    const { message } = await context.request.json();
    const apiKey = context.env.HF_API_TOKEN;

    const fullPrompt = `${websiteContext}\n\nUSER'S QUESTION:\n${message}`;

    // THIS IS THE ONLY LINE WE ARE CHANGING
    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/google/gemma-7b-it",
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        method: "POST",
        body: JSON.stringify({ "inputs": fullPrompt }),
      }
    );

    const hfData = await hfResponse.json();

    if (hfData.error) {
      return new Response(JSON.stringify({ error: `Hugging Face Error: ${hfData.error}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const reply = hfData[0].generated_text.replace(fullPrompt, "").trim();

    return new Response(JSON.stringify({ reply: reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: `The final attempt failed. The underlying error is: ${error.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
