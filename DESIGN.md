# Subtext — Design Rationale

## The thesis

What is the minimum data required to produce the sensation of recognition — not accuracy, recognition?

The demo answers this live: four questions, one story, every reader gets a different version. The experimental finding — *this is how little it takes* — is the argument.

## The two-layer personalization model

Reader context enters the story through two distinct channels:

**What the reader carried in** — the last book they read and the last thing they listened to. Never named or placed in the scene; used to infer the reader's sensibility and mood, which color the register. The reader recognizes themselves without knowing they were read.

> **The co-location pivot.** The live demo runs in a single room (one GSB seminar room), at one moment. That means *environmental* signals — ambient sound, the nearest object, the time — converge across the whole audience and individuate no one. So the personalization weight moved off the environment and onto what's interior and behavioral: what a reader carried in their head, and how they behaved while answering. That a co-located room still gets meaningfully different stories — from interior state, not surroundings — is a sharper point than "we used your coffee-shop sound."

**Psychological & behavioral layer** — calibrates Sofía's emotional register. Not described, not named. Derived from signals that differ person-to-person even in one room:
- *"Right now, are you mostly here or mostly somewhere else?"* → presence/dissociation maps to how Sofía's fear is rendered: embodied and physically present vs. composed on the surface with something running underneath
- *"Is your phone face-up or face-down right now?"* → Sofía's phone is face-up per the fixed architecture and does not change. The reader's answer calibrates its weight in the room — face-up readers get a phone that pulls at the edges of every sentence; face-down readers get one that is present but held at a distance
- *Answer-timing (never asked)* → how long the reader hesitated on each question, captured silently. A longer pause means Sofía's fear sits closer to the surface. This is the signal the reader never chose to give — the manual rhyme of the typing-cadence and dwell-time signals real systems harvest.

## Why these questions and not others

The intake went through several iterations. Key decisions:

**Dropped geolocation** — ipapi.co was unreliable, and the location signal was causing the model to physically relocate stories (California smoke story became a Texas coffee shop). Location provides atmospheric texture but the model couldn't distinguish "use as texture" from "set the story here." Removed entirely.

**Dropped direct psychological questions** — "When you're worried about something, does it stay in the background or take over?" and "Is there something you keep almost checking right now?" were accurate to the thesis but too pointed. A reader would see the shape of the story before reading it. Replaced with oblique equivalents that feel contemplative.

**Swapped the sensory questions for "what you carried in"** — the original intake asked for ambient sound and the nearest object. In a co-located room those converge (everyone hears the same room, everyone's object is a laptop or a pen), so they stopped individuating anyone. Replaced with the last book read and the last thing listened to — recent cultural residue that varies sharply per person and is independent of where the reader physically is. Kept free-text: a specific title gives the model something real to infer from; fixed options would only give it a category.

**The phone question does triple work** — it's a mundane thing to ask (feels like a wellness check-in), it captures psychological signal (monitoring vs. suppressing), and it directly mirrors the central gesture of the story. The reader who says "face-up" is already in Sofía's position before they know it.

## Prompt design constraints

Arrived at through iteration:

**No proper nouns from reader context** — the model would name-drop cities, streets, neighborhoods. "Stanford, CA" became "that new place on University." Fixed: translate location into atmospheric texture, never proper nouns.

**Light cannot be the opening subject** — the model defaults to opening with light when given a light answer. "The light through the windows has that quality of afternoon..." is too transparent. Fixed: light falls on objects, never named as subject in the opening.

**Invisible scaffolding rule** — intake answers are not observations, they're structure. If the reader last listened to something frantic, the scene should feel keyed-up without the music ever appearing. The reader should feel recognized, not described.

**No interior memory chains** — the model reaches for associative leaps when filling space: vending machine hum → piano lessons → river song. Replaced with a constraint: what the character notices is external. Interiority lives in what they do with their hands, not what they remember.

**At most one class/status marker** — the table guests risk becoming cartoonishly wealthy (cashmere + manicured + wine + travel agent + Cabo + resort zones). The obliviousness of the conversation carries the social register; stacked markers tip it into caricature.

**Fixed closing line** — identical across all readers, human-authored: *"Somewhere, her grandmother's phone rings into whatever room it's in."* The model is told to stop before the final beat. The closing line is sent as a final SSE chunk server-side, after generation completes.

## The structural context layer

The personal story prompt also receives the `newsEvent` — the systemic pressure behind the scene — as invisible background. The model knows *why* the nurse won't make eye contact, *why* the wait is long, *why* Sofía's grandmother is unreachable. This produces texture rather than editorializing: the PLEASE BE PATIENT WE ARE SHORT STAFFED sign taped to the wall; the WhatsApp messages stopped coming at six this morning.

## What the reveal shows

Phase 3 of the demo projects two or three readers' versions side by side. The room sees:
- Same plot, different threshold
- How sensory embeds shifted (their object, their sound, in the scene)
- How psychological register shifted (Sofía more embodied vs. more dissociated)
- The actual prompt scaffold: fixed elements in one color, intake-variable slots in another

The argument: the distance between personalization-as-comfort and personalization-as-manipulation is a single design decision — show the architecture or hide it. This demo shows it.
