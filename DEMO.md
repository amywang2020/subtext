# Demo runbook — BUSGEN 116, June 1

## The night before

- [ ] Open `https://subtext-brown.vercel.app/reveal` and confirm it loads
- [ ] Do one full run-through yourself: landing → intake → story → eval → reveal card appears
- [ ] Clear the Upstash database so the reveal starts fresh on demo day:
  ```bash
  curl -X POST "$UPSTASH_REDIS_REST_URL" \
    -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN" \
    -H "Content-Type: application/json" \
    -d '["DEL", "subtext:submissions"]'
  ```
  (reads the URL and token from your environment — see `.env.local`)
- [ ] Confirm `https://subtext-brown.vercel.app/api/eval` returns `[]`

---

## Morning of

- [ ] Open two tabs: reader URL on one, `/reveal` on the other
- [ ] Have the reader URL ready to share (Slack, Canvas, projected QR code, whatever)
- [ ] Silence your phone

---

## In class

### Phase 1 — Reading (10–12 min)

Share `https://subtext-brown.vercel.app` with the class.

Tell them: *"Open this on your phone or laptop. Answer the questions honestly. Read what comes out. Don't talk to each other yet."*

Let everyone go through the intake and read their story independently. The generation takes 30–35 seconds; the transition screens buy that time. Most people will be reading within 2 minutes of starting.

Once they're reading, remind them to answer "did this know you?" before moving on.

**Your word:** find yours in the top-right corner of your story screen. You'll use it to find your card on the reveal.

---

### Phase 2 — Reveal (5–8 min)

Switch to the `/reveal` tab on projector. Hit **refresh**.

Show the aggregate first: *"X of Y felt recognized."* Let that land before explaining anything.

Scroll through the cards. Point out:
- How different the intake answers are (same four questions, very different answers)
- How the rating correlates — or doesn't — with what people expected

Ask: *"Find your card. What does it say next to your word?"*

---

### Phase 3 — Compare (10–15 min)

Pick two stories with interesting contrast. Good pairs to look for:
- One "mostly here" + one "mostly somewhere else" (presence answer)
- One "face-up" + one "face-down" (phone answer)
- Very different sound environments (silent library vs. crowded café)

Click both cards to select them, then **compare selected**.

The compare view shows their intake answers side by side above their stories. Walk through it:

1. *"Here's what each person told us."* — point to the intake block
2. *"Here's what the story did with it."* — read a sentence or two from each
3. *"Find where their sound appears. Find where their object changed the atmosphere — even though it never shows up directly."*

The argument you're making: the distance between "this recognized me" and "this was designed to recognize me" is a single design decision — show the architecture or hide it. Right now you're showing it.

---

### Discussion prompts

- What did you feel when you read it? When did that feeling shift?
- Did knowing it was generated change the experience retroactively?
- What would it mean if this were running quietly — in a product, in a feed?
- The sensory layer and psychological layer use the same data differently. Which one felt more accurate to you?
- What's the difference between personalization-as-comfort and personalization-as-manipulation? Where's the line?

---

## If something goes wrong

**Story takes too long** — the transition screens hold until generation is ready. If it's been more than 90 seconds past the last transition screen, the API may have hit a rate limit. Ask that person to refresh and try again.

**Reveal shows no responses** — hit refresh. If still empty, check that the URL is `https://subtext-brown.vercel.app` (not localhost). Submissions only go to Upstash on the deployed version.

**Someone got a garbled story** — the validator occasionally lets through a weak attempt on the second try. It won't break the demo; just don't pick that card for the compare view.

**Compare view looks wrong** — make sure exactly two cards are selected (border darkens when selected). Click a third to deselect it if needed.

---

## After class

To export all submissions:

```bash
curl https://subtext-brown.vercel.app/api/eval > submissions.json
```
