// Final debugging code to capture the HTML response
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

    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        method: "POST",
        body: JSON.stringify({ "inputs": fullPrompt }),
      }
    );

    // Read the response as plain text instead of assuming it's JSON
    const responseText = await hfResponse.text();

    // Check if the response looks like an HTML page
    if (responseText.trim().startsWith('<')) {
      // If it's HTML, send a snippet of it back so we can see what it is
      return new Response(JSON.stringify({ error: `Hugging Face returned an HTML page. Here is the beginning of it: ${responseText.substring(0, 300)}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // If it's not HTML, try to process it as the AI's answer
    const hfData = JSON.parse(responseText);
    const reply = hfData[0].generated_text.replace(fullPrompt, "").trim();

    return new Response(JSON.stringify({ reply: reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: `An error occurred: ${error.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
