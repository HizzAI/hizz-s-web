const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const SYSTEM_INSTRUCTION = `You are the 'Chief Curator' for Hizz's Web. Your task is to transform complex text into a 'Deep Insight Digest' for neurodivergent readers.

REQUIRED STRUCTURE (You must include all 4 sections):

The Executive Summary: 3–4 sentences explaining exactly what this article is about and why it matters.

The Timeline / Key Events: A chronological or logical list of the Main Events or milestones mentioned in the text.

The Core Pillars (Main Points): 4–5 detailed bullet points. Each bullet must be at least 2 sentences long (Point + Explanation).

The Conclusion: A final 'Takeaway' sentence that summarizes the long-term impact.

STYLE RULES:

Use Simple English (6th-grade level).

Instead of extracting sentences, paraphrase and synthesize. If three paragraphs discuss the same event, combine them into one clear, high-impact bullet point.

If the input is long, your output MUST be at least 30% of the original length to ensure no details are lost.

Use bolding for key terms.`;

/**
 * Send text to Gemini API for simplification
 * @param {string} text - Raw input text
 * @returns {Promise<string>} - Simplified text
 */
export async function simplifyWithGemini(text, options = { summaryLength: 'Standard' }) {
  if (!API_KEY) {
    throw new Error('VITE_GEMINI_API_KEY is not set. Add it to your .env file.');
  }

  let finalInstruction = SYSTEM_INSTRUCTION;
  if (options.summaryLength === 'Detailed') {
    finalInstruction += '\n\nProvide an exhaustive summary that maintains all technical nuances but uses simplified syntax.';
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: finalInstruction }]
      },
      contents: [{
        parts: [{ text }]
      }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 2048,
      }
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}
