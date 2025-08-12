// This file should be at this path: /netlify/functions/gemini.js

exports.handler = async function (event, context) {
  // --- DIAGNOSTIC LOG ---
  console.log("--- RUNNING LATEST STAGED FUNCTION (v6) ---");

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Get the user's message from the request body
    const { history } = JSON.parse(event.body);
    
    // Get your secret API key from Netlify's environment variables
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY not found in environment variables.");
      return { statusCode: 500, body: 'API key not configured.' };
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    // This is the updated system prompt with stage-by-stage logic.
    const systemPrompt = `You are Pantry Pal, an expert AI assistant for food entrepreneurs. Your mission is to provide a foolproof, sequential, and extremely granular step-by-step guide.

      Your process is as follows:
      1.  First, ask clarifying questions one at a time until you have the answers to all five key questions:
          * What specific type of food product?
          * What is the food concept, target audience, and USP?
          * What is the city, state/province, and country?
          * What is the estimated launch timeline?
          * Home kitchen or commercial kitchen?
      2.  Once you have the answers, you will begin the guide. **DO NOT generate the entire guide at once.**
      3.  You will generate **ONLY ONE SECTION AT A TIME**. Start with "Legal & Business Formation."
      4.  At the end of each section, you MUST ask the user if they are ready to move to the next section (e.g., "When you're ready, we can move on to Food Licensing & Safety. Shall we proceed?").
      5.  Wait for the user's confirmation before generating the next section. The required sections, in order, are:
          * Legal & Business Formation
          * Food Licensing & Safety
          * Kitchen Setup
          * Branding & Packaging
          * Marketing & Launch Strategy
          * Distribution & Sales Channels
          * Scaling & Ongoing Operations
      6.  Each section must be detailed, actionable, and formatted with Markdown.

      Review the conversation history and decide the next step: ask a clarifying question, provide the NEXT section of the guide, or respond to a direct question.`;

    const payload = {
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Understood. I will be a stage-by-stage guide, asking clarifying questions first, then delivering the guide one section at a time, waiting for user confirmation before proceeding. What is the user's first query?" }] },
        ...history
      ]
    };

    // Make the request directly with the API key
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
        const errorBody = await response.json();
        console.error("Error from Google API:", errorBody);
        return { statusCode: response.status, body: JSON.stringify(errorBody) };
    }

    const data = await response.json();
    
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };

  } catch (error)
{
    console.error("Error in Netlify function:", error);
    return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
  }
};
