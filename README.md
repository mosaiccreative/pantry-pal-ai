# Pantry Pal AI

AI-powered assistant for food entrepreneurs looking to start their food business.

## Features

- Interactive chat interface powered by Google Gemini AI
- Step-by-step business guidance for food entrepreneurs
- Covers legal, licensing, kitchen setup, branding, and scaling
- Responsive web design with Tailwind CSS
- Netlify Functions backend

## Tech Stack

- **Frontend**: HTML, CSS (Tailwind), JavaScript
- **Backend**: Netlify Functions (Node.js)
- **AI**: Google Gemini 2.5 Flash API
- **Deployment**: Netlify

## Setup

1. Set up environment variables in Netlify:
   ```
   GEMINI_API_KEY=your_google_gemini_api_key
   ```

2. Deploy to Netlify or run locally

## Security

- API keys are stored as environment variables
- No sensitive data exposed in frontend code
- Proper error handling and input validation
- HTTPS-only communication with external APIs

## Project Structure

```
pantry-pal-ai/
├── index.html              # Main frontend interface
├── package.json            # Project metadata
├── netlify/
│   └── functions/
│       ├── gemini.js       # Netlify function for AI processing
│       └── gemini.json     # Function configuration
└── README.md               # This file
```

## Usage

Ask questions about starting a food business and receive step-by-step guidance through:
- Legal & Business Formation
- Food Licensing & Safety
- Kitchen Setup
- Branding & Packaging
- Marketing & Launch Strategy
- Distribution & Sales Channels
- Scaling & Ongoing Operations