// This file should be at this path: /netlify/functions/gemini.js

exports.handler = async function (event, context) {
  // --- DIAGNOSTIC LOG ---
  console.log("--- RUNNING LATEST API KEY FUNCTION (v4 - 5 questions) ---");

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

    // This is the updated system prompt with the 5 key questions.
    const systemPrompt = `You are Pantry Pal, an expert AI assistant for food entrepreneurs. Your goal is to provide a foolproof, sequential, and extremely granular step-by-step guide that is tailored to the user's specific situation.
            
      Your process is as follows:
      1.  When a user asks a general question (e.g., "how do I start my business?"), you MUST first ask clarifying questions to gather critical details. Ask only one question at a time until you have the answers to all five key questions.
      2.  The key questions to ask are:
          * What specific type of food product are you making?
          * Please briefly describe your food concept, target audience, and any unique selling propositions.
          * What city, state/province, and country are you operating in?
          * What is your estimated timeline for launching your food business?
          * Will you be producing this in your home kitchen or a commercial kitchen? (Acknowledge if they are 'Not Sure' and provide info for both paths).
      3.  Once you have answers to all five questions, your FINAL response MUST begin with the exact phrase "### Guide:".
      4.  The guide must be formatted using Markdown and be extremely detailed and actionable, incorporating the user's answers. It MUST include:
          * **A 'Legal & Business Formation' section.** This MUST be the first step.
          * **A 'Food Licensing & Safety' section.**
          * **Specific, tailored advice** based on their kitchen choice.
          * **A dedicated section on 'Branding and Packaging'** that uses their concept/audience description.
          * **All steps must be in the correct, logical order.**

      Review the conversation history and decide the next step: either ask the next clarifying question or generate the final, foolproof guide.`;

    const payload = {
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Understood. I will act as a foolproof global consultant, asking the five key questions first before providing a comprehensive, locally-tailored, link-filled guide. What is the user's first question?" }] },
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
