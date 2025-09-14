// This is the backend code that runs securely on Cloudflare

const websiteContext = `
  About GemState Technology: We are a technology solutions provider based in Twin Falls, Idaho. We help local businesses succeed with cutting-edge technology. It is currently September 2025.

  Our Services:
  - Custom Web Development: We build beautiful, fast, and responsive websites.
  - IT Consulting: We provide expert advice to optimize technology and security.
  - Software Solutions: We create custom software to streamline business operations.

  Our Process: We start with a free initial consultation to understand your goals.
`;

export async function onRequest(context) {
  try {
    if (context.request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const { message } = await context.request.json();

    const fullPrompt = `
      You are GemStateBot, a friendly AI assistant for GemState Technology.
      Answer the user's question based *only* on the context provided below.
      If the answer is not in the context, say "I'm sorry, I don't have that information."
      Keep your answers concise.

      CONTEXT:
      ---
      ${websiteContext}
      ---

      USER'S QUESTION:
      ${message}
    `;

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${context.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
      }),
    });

    const geminiData = await geminiResponse.json();
    const reply = geminiData.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ reply: reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to get a response' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
