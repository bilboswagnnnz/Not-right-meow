# Verification — Halloween 2026 presentation

## Checks run for this revision
- All 11 Halloween Chrome checks passed: themed title/copy, date boundaries, a complete spooky music phrase with active Web Audio voices, playable rooftop jumps, pause stopping music, resume, music off/on, and 640/1200 px layouts.
- Inspected the actual animated title screen and four engine-rendered flight scenes. Ghosts, witch and bats are behind solid surfaces; openings and Cookie remain readable.
- A five-date VM check confirmed seasonal artwork/audio activation and restoration on September 30, October 1, October 31, November 1 and November 2, 2026.
- Gameplay regression passed 2,058 baseline assertions plus 36,000 combined clears and crate/progression/material checks. Flight regression passed 80 runs / 8,000 air clears. Balloon-only collision regression passed.
- Syntax and whitespace checks passed. The core gameplay file is unchanged by this update.
- The first seasonal browser check assumed a complete music loop would coincide with six scored landings. This environment advanced game time more slowly than audio time; the test now waits for both conditions. The corrected test passed without changes to movement or collisions.

## Limits
Music playback, voices and stop/resume were verified programmatically in Chrome; subjective sound quality has not been physically listened to. Edge/Firefox, hardware 60 FPS and fullscreen were not retested. The full 17-check flight browser suite below belongs to the preceding revision; this revision reran flight simulations and inspected seasonal flight renders.

---
Historical verification follows.

# Verification — Varied balloon routes

Current revision replaces the shallow flight-height walk with seven shuffled maneuver patterns. Gap sizes vary from 180 to about 315 px. Low openings reach within 16 px of the floor; high openings approach within 16 px of the ceiling. Spacing allows each climb/drop under unchanged flight physics; faster sections require quicker corrections. The balloon and ropes remain decorative.

## Checks actually run for this revision
- `node tests/gameplay.cjs`: passed 2,058 baseline assertions and 36,000 combined clears across 40 seeds and three rooftop timing offsets. Crate, late-speed progression and landing-effect checks also passed.
- `node tests/flight.cjs`: passed 80 seeded runs through score 210, totaling 8,000 air-gap clears. Each first flight section includes top and bottom openings, tight and wide gaps, at least eight substantial climbs and eight drops, ten or more distinct aperture sizes, and both short and longer transfer intervals. Repeated launch/return, pause, flap cooldown and four collision probes passed.
- `node tests/balloon.cjs`: balloon-only contact remains safe at gates and the ceiling; cat/body contact still collides.
- All 17 Chrome application checks passed using keyboard events in the actual `index.html`: launch at 50, inflation, pause/resume, lift, repeat suppression, flight hint, 50 air points, four hazard types, top/bottom passages, tight/wide gaps, repeated climbs/drops, varied spacing, return at 100, resumed rooftop play, best-score updates and restart.
- Inspected four actual-engine browser snapshots showing low, high, tight and wide passages. Arrow signs and gap borders render correctly.
- JavaScript syntax and Git whitespace checks passed. Runtime uses relative paths and has no external dependencies.

## Limits
These are scripted playthroughs, not human difficulty or enjoyment testing. This revision was checked in Chrome; Edge, Firefox, hardware 60 FPS, fullscreen and physical audio playback were not retested. GitHub Pages itself has not been deployed; the download includes the complete static project and deployment instructions.

---
The following sections are historical evidence for earlier revisions, not additional reruns for the current changes. Earlier gap dimensions are superseded by the varied-route revision above.

# Verification — Decorative balloon fix

The chair cameo was removed before publication. The course and artwork are restored to the preceding balloon-flight version. Only Cookie and the bucket now collide: flight body height is 118 px instead of 210 px, excluding the balloon and ropes.

Current checks: gameplay suite passed 36,000 combined clears; flight suite passed 80 runs with 8,000 air clears. The new balloon regression suite passed in Node. Six Chrome collision checks passed using the shipped engine: balloon-only contact is safe at a gate and the upper airspace boundary; cat contact still collides at each. Existing flight controls and transitions remain unchanged.

The sections below record the previous revision’s broader verification, not additional browser reruns for this fix.

# Verification — Balloon flight revision

## Current simulation checks
- `node tests/gameplay.cjs` passed: 2,058 counted baseline assertions plus width, progression and material checks. Forty seeds × three rooftop timing offsets (-15, 0, +15 ms) × 300 points = 36,000 combined clears: 18,000 rooftop landings and 18,000 flying gaps. These are scripted runs, not human play.
- `node tests/flight.cjs` passed: 80 seeded runs through score 210, each with two complete flying sections. That adds 8,000 air-gap clears. Both transitions at 50/100 and repeated transitions at 150/200 passed.
- Exactly 50 air gaps per section. Automatic return landing awards no extra point. All four air obstacle types appear, without adjacent identical types. Openings remain at least 275 px. Flight gradually speeds up.
- Pause freezes launch, flight and landing. Collision probes hit the upper face, lower face, ceiling and floor; all end the run. Restart removes the balloon and resets flight state. Distinct airborne presses give lift, while immediate duplicate flaps are suppressed.
- All eight ground chapters and ten architecture types were traversed, with maximum tested height 440 px. Ordinary landing targets stay at or below 258 px. Marked departure roofs are 320 px; starting and recovery roofs are deliberately longer. Seventy-two generated crate caps in the extra ten-seed check stayed within 109–166 px.
- The first 49 landings match the previous revision exactly across 20 seeded runs.
- JavaScript syntax and Git whitespace checks passed. Runtime remains buildless with relative local paths and no external dependencies.

## Browser verification
All 13 flight browser checks passed in Chrome: takeoff at 50, full inflation, flight pause/resume, airborne Space lift, held-key suppression, control hint, exactly 50 flight points, all four hazard types, automatic return at 100, further rooftop jumps, personal-best updates and clean restart. The new flight QA page exercises the actual index.html application through keyboard events and uses explicit `?qa=1&fast=1` to run six times as many fixed simulation steps per frame. Normal game URLs remain at normal speed. The QA pilot is never loaded by index.html.

Actual-engine snapshots show departure at 50, flight at 55 and 85, and the return approach at 100. These were inspected in Chrome. They are scripted game-renderer captures, not generated concept art.

## Prior checks retained as historical evidence
The preceding revision passed 22 Chrome integration checks for rooftop inputs, pause/resume, scoring, audio scheduling/toggles, saved best, restart, timer, pace and landing effects. It also passed 640/1280/1920 px layout checks. Those exact checks are not automatically claimed as rerun by this flight revision.

## Limits
- Scripted success establishes tested routes and mechanics, not human enjoyment or difficulty.
- Chrome is available here; Edge and Firefox have not been run.
- New balloon sound effects have not been physically listened to.
- Fullscreen was blocked by the preview environment during the preceding revision; actual fullscreen remains unverified.
- Hardware 60 FPS and touch input remain unverified.
- GitHub Pages has not been deployed. The downloadable package includes all source and exact deployment steps. The existing hosted game is published separately.
