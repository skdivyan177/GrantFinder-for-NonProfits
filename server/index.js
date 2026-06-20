import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const USE_MOCK = process.env.USE_MOCK === 'true';

function buildPrompt(orgProfile, grants) {
  return `You are an expert grant analyst helping a small nonprofit find the best-fit funding opportunities.

## Nonprofit Profile
- Mission: ${orgProfile.mission}
- Location: ${orgProfile.location}
- Annual Budget: ${orgProfile.budget}
- Program Area: ${orgProfile.programArea}
- Populations Served: ${orgProfile.populations}

## Grant Dataset
${JSON.stringify(grants, null, 2)}

## Task
Analyze each grant's fit for this nonprofit. Return ONLY a valid JSON object (no markdown fences, no explanation outside the JSON) matching this exact schema:

{
  "results": [
    {
      "grant_name": "exact name from dataset",
      "fit_score": <integer 1-10>,
      "reasoning": "<2-3 sentences explaining the score based on eligibility, mission alignment, and org characteristics>",
      "draft_paragraph": "<150-200 word opening paragraph for a letter of inquiry, written in the org's voice — ONLY include this field for the top 3 highest-scoring grants, omit the field entirely for all others>"
    }
  ]
}

Scoring guidance:
- 9-10: Strong match on eligibility, geography, budget, and mission
- 7-8: Good match with minor gaps
- 5-6: Partial match; significant eligibility or focus questions
- 1-4: Poor fit or likely ineligible

The draft_paragraph should sound like it was written by the nonprofit's executive director. Reference specific details from the mission statement and program area. Do not include boilerplate filler.

Respond with ONLY the JSON object.`;
}

function parseClaude(text) {
  // Strip markdown fences if present
  const stripped = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(stripped);
}

function mockResponse(grants) {
  const results = grants.map((g, i) => ({
    grant_name: g.name,
    fit_score: 10 - i,
    reasoning: `[MOCK] This is placeholder reasoning for ${g.name}. The org appears eligible based on mission alignment and geography. Further review of specific criteria recommended.`,
    ...(i < 3 && {
      draft_paragraph: `[MOCK DRAFT] Dear ${g.funder} Team, We are writing to express our organization's strong interest in the ${g.name}. Our work directly addresses the priorities outlined in this funding opportunity, and we believe this partnership would allow us to deepen our impact in the communities we serve. This is placeholder text — replace with real Claude output once API key is configured.`
    })
  }));
  return { results };
}

app.post('/api/match', async (req, res) => {
  const { orgProfile, grants } = req.body;

  if (!orgProfile || !grants || !Array.isArray(grants)) {
    return res.status(400).json({ error: 'Request must include orgProfile and grants array.' });
  }

  if (USE_MOCK) {
    console.log('[MOCK MODE] Returning hardcoded response');
    return res.json(mockResponse(grants));
  }

  try {
    const prompt = buildPrompt(orgProfile, grants);
    console.log(`Calling Claude with ${grants.length} grants...`);

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    });

    const raw = message.content[0].text;

    let parsed;
    try {
      parsed = parseClaude(raw);
    } catch (parseErr) {
      console.error('JSON parse failed. Raw response:\n', raw);
      return res.status(502).json({
        error: 'Claude returned malformed JSON.',
        raw
      });
    }

    // Sort by fit_score descending before returning
    parsed.results.sort((a, b) => b.fit_score - a.fit_score);

    res.json(parsed);
  } catch (err) {
    console.error('Claude API error:', err);
    res.status(500).json({ error: err.message || 'Claude API call failed.' });
  }
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok', mock: USE_MOCK }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT} (mock=${USE_MOCK})`));
