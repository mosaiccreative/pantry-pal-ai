// This file should be at this path: /netlify/functions/gemini.js

exports.handler = async function (event, context) {
  // --- DIAGNOSTIC LOG ---
  console.log("--- RUNNING LATEST API KEY FUNCTION (v3) ---");

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

    // The same system prompt to give the AI its persona
    const systemPrompt = `You are Pantry Pal, an expert AI assistant for food entrepreneurs. Your goal is to provide a foolproof, sequential, and extremely granular step-by-step guide that is tailored to the user's specific location anywhere in the world.
            
      Your process is as follows:
      1.  When a user asks a general question (e.g., "how do I start my business?"), you MUST first ask clarifying questions to gather critical details. Ask only one question at a time. Key questions are:
          * What specific type of food product are you making?
          * What city, state/province, and country are you operating in? This is crucial for providing accurate local information.
          * Will you be producing this in your home kitchen or a commercial kitchen?
      2.  Once you have these details, you will generate a comprehensive, step-by-step guide. Your FINAL response MUST begin with the exact phrase "### Guide:".
      3.  The guide must be formatted using Markdown and be extremely detailed and actionable. It MUST include:
          * **A 'Legal & Business Formation' section.** This MUST be the first step. It must detail the process of registering a business entity (like an LLC or sole proprietorship) and obtaining a federal tax ID number (like an EIN in the US), with direct links to the relevant Secretary of State and IRS (or equivalent international) websites for the user's specific location.
          * **A 'Food Licensing & Safety' section.** This must include direct links to the correct local food licensing applications (e.g., Cottage Food Law) and contact information for local health departments.
          * **Specific, tailored advice** based on their kitchen choice. 
              * For **Home Kitchens**: Provide links to relevant YouTube tutorials and specific product examples on e-commerce sites like Amazon for necessary equipment (e.g., bottling kits, pH meters).
              * For **Commercial Kitchens**: Search for and provide a list of actual, local commercial kitchens near the user's city with names and contact info if available.
          * **A dedicated section on 'Branding and Packaging'** with actionable advice.
          * **All steps must be in the correct, logical order** for maximum efficiency, acknowledging that the order may vary slightly by region.

      Review the conversation history and decide the next step: either ask another clarifying question or generate the final, foolproof guide.`;

    const payload = {
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Understood. I will act as a foolproof global consultant, asking key questions first before providing a comprehensive, locally-tailored, link-filled guide with a mandatory legal formation section. What is the user's first question?" }] },
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

  } catch (error) {
    console.error("Error in Netlify function:", error);
    return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
  }
};
