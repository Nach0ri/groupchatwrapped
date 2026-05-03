Group Chat Wrapped

Live: https://groupchatwrapped.vercel.app

A Spotify Wrapped, but for your WhatsApp group chat. Drop a `_chat.txt` and get nine swipe-through cards roasting everyone in the chat: the yapper, the ghost, the vibe killer, the most unhinged. Each card screenshots into a clean PNG, and the share button gives you a permalink that re-renders identically for everyone you forward it to.

Built for HackMelbourne Trend Hacker, May 2026.

What it does
-

Drop a WhatsApp export (`_chat.txt` or iPhone `.zip`). The parser runs in your browser, then nine cards reveal:

  1. Title: total messages, days active, date range
  2. The Yapper: top sender, percentage of all messages, top emojis, AI roast
  3. The Ghost: slowest median replier, longest unanswered message
  4. The Vibe Killer: most messages sent right before 6+ hour silences
  5. The Nonchalant: lowest emoji rate, all-lowercase energy, deadpan replies
  6. Most Unhinged: swears plus ALL CAPS rants
  7. Phrase of the Season: the inside joke that took over (only renders if there's a clear winner)
  8. The Verdict: a Gen Z roast specific to your group's vibe
  9. Share card: share permalink, see detailed stats, wrap another chat

Tap right to advance, left to go back. Hold to pause auto-advance. The button on each card downloads it as a PNG. There's a separate scrollable summary at `/wrapped/summary` with a 24x7 activity heatmap and full per-person breakdowns.

Privacy
-

The parser runs entirely in your browser. Raw messages never leave your device. We send anonymised aggregate stats (counts, percentages, latency percentiles) to the verdict API for the AI to write the roast text. No database, no analytics, no cookies beyond what Next.js needs.

Tech
-

  - Next.js 16 App Router on Vercel
  - TypeScript, Tailwind v4, Geist font
  - motion (formerly framer-motion) for card transitions
  - jszip for iPhone .zip uploads
  - html-to-image for per-card screenshots
  - Anthropic SDK for the AI verdicts (server-side, anonymised stats only)
  - Vercel KV (Upstash Redis) for shareable permalinks

Local dev
-

```
git clone https://github.com/Nach0ri/groupchatwrapped.git
cd groupchatwrapped
npm install
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local
npm run dev
```

Generate a fresh demo chat (five personas, 21-day arc):

```
npm run gen-demo
```

Run the parser smoke tests against synthetic fixtures:

```
npm run smoke
```

Deploy
-

```
vercel deploy --prod
```

Set `ANTHROPIC_API_KEY` in your Vercel project env. For permalinks, provision a Vercel KV (Upstash for Redis) store via the Vercel dashboard and connect it with the prefix `KV`. Without it, the share button still works but uses the homepage URL as fallback.

Sample chat
-

The "or try a sample chat" button on the landing page loads a 21-day synthetic group chat between five long-distance friends (yes, including a breakup arc and 3am thesis breakdowns). Use it to test the flow without uploading anything personal.
