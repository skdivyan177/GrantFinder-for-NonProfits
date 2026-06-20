# Grant Finder

AI-powered grant matching for small nonprofits. Describe your org once; Claude scores every grant in the dataset for fit, explains the reasoning, and drafts an LOI opening paragraph for your top 3 matches.

## Quick Start

### 1. Add your API key
Edit `server/.env`:
```
ANTHROPIC_API_KEY=sk-ant-...
USE_MOCK=false
```

### 2. Start the server (terminal 1)
```bash
cd server
node index.js
```

### 3. Start the React app (terminal 2)
```bash
cd client
npm start
```

App opens at http://localhost:3000. The React dev server proxies `/api/*` to the Express server on port 3001.

## Mock mode (no API key needed)
Set `USE_MOCK=true` in `server/.env` to get hardcoded placeholder results — useful for frontend development without spending API credits.

## Grant dataset
Edit `client/src/grants.json`. Each grant needs:
```json
{
  "name": "Grant Name",
  "funder": "Funder Organization",
  "amount_range": "$X – $Y",
  "eligibility": "Full eligibility text...",
  "deadline": "Rolling",
  "source_link": "https://..."
}
```
The full eligibility text is what Claude reads for matching — be thorough.

## Stack
- **Frontend**: React (Create React App), CSS Modules
- **Backend**: Node.js / Express (ESM)
- **AI**: Anthropic Claude claude-sonnet-4-6
