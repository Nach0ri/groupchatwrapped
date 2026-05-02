Group Chat Wrapped

Live: https://groupchatwrapped.vercel.app

Drop a WhatsApp_chat.txt (.zip file) export, get a Spotify-Wrapped-style story sequence revealing who's the biggest yapper, the ghost king, and the actual vibe of your groupchat. Each card is screenshot-able and forwardable to the chat in question.

What it does
-

Cards, each with its own bold gradient, swipe-through.

  1. Title card. Total messages, days active, date range
  2. The Yapper. Top sender, percent share, top emojis, AI roast
  3. The Ghost. Slowest median replier, longest ghost, AI roast
  4. The Verdict. Opus 4.7-generated paragraph capturing the chat's vibe
  5. Share card. Native share / clipboard fallback / restart

Tap or swipe up to advance. Swipe down or tap "prev" to go back. Each card has a screenshot button that downloads a PNG.

Privacy
-

The whole parser runs in your browser. Raw messages never leave your device. Only anonymised aggregate stats (counts, latency percentiles, emoji frequencies) are sent to the verdict API for the AI to roast. No database. No analytics. No cookies beyond Next defaults.

Stack
-

  - Next.js 16 App Router on Vercel
  - TypeScript, Tailwind v4, Geist font
  - motion (framer-motion v12) for the card transitions
  - jszip for iPhone .zip uploads
  - html-to-image for per-card PNG screenshots
  - Anthropic Claude Opus 4.7 for verdicts and per-person roasts (server-side)

Local dev
-

```
git clone https://github.com/Nach0ri/groupchatwrapped.git
cd groupchatwrapped
npm install
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local
npm run dev
```

Run the parser smoke test against synthetic fixtures:

```
npm run smoke
```

Deploy
-

```
vercel deploy --prod
```

Set ANTHROPIC_API_KEY in the Vercel project env. Production env is what `--prod` deploys use.

Devpost pitch
-

Group Chat Wrapped takes your WhatsApp group chat export and turns it into a Spotify-Wrapped-style story sequence — biggest yapper, ghost king, AI-roasted group verdict — that's screenshot-friendly and made to be forwarded back to the chat in question. Parsing happens entirely in the browser so no chat history ever leaves your phone, and the only data we send to the AI is anonymised aggregate stats. Built mobile-first for the social-trends theme: every card is a piece of share-bait designed to land with your group's specific energy.

Test data
-

`public/samples/sample-chat.txt` is a synthetic 200-message chat (4 personas, both iPhone+Android format). The "try a sample chat" button on the landing page loads this directly so reviewers can test the flow without uploading their own.

Screenshots
-

Drop the live URL on iPhone / Android and click "try a sample chat" to see all five cards in sequence.

Roadmap
-

  - Stretch cards: Beef Starter, Top Emoji grid per person, Activity heatmap, n-gram phrase card
  - Real-export hardening (very old WhatsApp formats, emoji-name participants)
  - Web Worker parser for chats with more than 50K messages
  - Custom OG image per result (your group's actual yapper on the share preview)
