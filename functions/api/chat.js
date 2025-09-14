// Backend code for Hugging Face
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
    const apiKey = context.env.HF_API_TOKEN; // Note the new variable name

    const fullPrompt = `${websiteContext}\n\nUSER'S QUESTION:\n${message}`;

    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        method: "POST",
        body: JSON.stringify({ "inputs": fullPrompt }),
      }
    );

    const hfData = await hfResponse.json();
    const reply = hfData[0].generated_text.replace(fullPrompt, "").trim();

    return new Response(JSON.stringify({ reply: reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to get a response from the AI' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
