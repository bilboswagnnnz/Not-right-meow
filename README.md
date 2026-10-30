# Not Right Meow — After Hours

A standalone HTML5 Canvas endless runner starring Cookie.

## Play
Open `index.html` in a desktop browser. No installation, build, server, CDN, API or account required for the downloaded game. Hosted versions require a network only to load the files. Space or left mouse click jumps on rooftops and gives lift during balloon flight; P / Escape pauses; Space restarts or resumes; F requests fullscreen. Top-right controls separately toggle effects and music. On touchscreens, tap the game area to jump. Landscape is recommended.

## Halloween 2026 special
The Halloween presentation is active through November 1, 2026, using your device's local date. Reopening or refreshing on November 2 restores the regular After Hours presentation automatically. Original cutout ghosts, a broom-riding witch and bats drift behind the playable surfaces. The title screen adds pumpkins, a web, a hanging spider and amber/purple styling. Decorations never collide or affect scoring.

During the event, the music toggle controls an original 84 BPM minor-key bell/organ soundtrack with low pulses and echo notes. It is synthesized locally using Web Audio, starts after a user gesture, stops on pause, and uses no external audio files. The regular 100 BPM soundtrack returns after the event. Movement, route generation, difficulty, saved best and balloon collision rules are unchanged.

## Rooftops → balloon flight
At 50 points, the last landing target is a marked departure roof. A balloon inflates on a harness attached to Cookie’s bucket; takeoff takes about a second and the first obstacle gives a clear lead-in. In flight, tap Space or click repeatedly to lift; gravity pulls Cookie down between taps. Holding Space does not continuously flap. Keep Cookie and the bucket within the striped opening. The balloon and ropes are decorative and do not count as a hit, including at the upper airspace boundary.

Clear 50 air gaps to reach 100 points, then Cookie automatically descends onto a recovery roof. Rooftop jumping resumes. The endless course alternates 50 rooftop landings and 50 flying gaps: takeoffs at 50, 150, 250… and returns at 100, 200, 300… . No extra point is awarded for the automatic return landing.

Flight obstacles mix bridge supports, hanging cargo, antenna structures and steelwork, without adjacent identical types. Seven shuffled flight patterns create low passes, high wires, rapid climbs, dive steps, switchbacks, tight needles and wider recovery gaps. Openings vary from 180 to about 315 game pixels and span almost the full height of the airspace. Horizontal spacing varies with the climb or drop required; small arrows preview the direction. Tap faster for steep climbs and release early for drops. Later gaps get slightly tighter and closer, while the geometry retains enough transfer time for the existing flight physics. Flight speed rises from 330 to about 408 px/s across the first air section, with a bounded extra increase on later cycles. Flight uses its own speed and gravity, while rooftop difficulty retains the elapsed-time ramp. Pause freezes takeoff, flight and landing. Missing a gap, touching a solid face or leaving the vertical airspace ends the run.

## Skyline route
The run begins on a building. Jump near the roof edge to cross to the next building, then onto a crane deck and the steel beams suspended from its boom. There is no safe ground below the route. Missing a landing or striking a building face ends the run.

Eight traversal chapters use ten kinds of playable architecture: buildings, crane decks, suspended beams, skybridges, scaffolding, ducts, water towers, gantries, stacked shipping containers, and narrow staggered wooden cargo stacks. Chapters include Rooftop Escape, The Lift, Skybridge, Steelworks, Water Towers, Dry Dock, The Descent and Night Express. Each has a different sequence of ascents, drops, widths and gaps. The opening crossing introduces the mechanics; subsequent chapter order is shuffled without immediate duplicates. Widths and gaps vary within tested limits. These are finite designed chapters that eventually return, not infinitely unique levels.

Cargo stacks are staggered front-to-back, with amber front landing caps only 109–166 game pixels wide. Their first appearance follows the first roof crossing. Later crate caps narrow. After one minute, generated landing targets gradually shrink by up to another 10%, reaching that extra reduction at 2:30. Every other surface is also a short landing target: roofs approximately 175–252 px, crane decks 160–222 px, bridges 184–258 px, and beams 114–158 px. Widths no longer increase with speed. The starting roof and automatic return roof provide a runway. Each 50th landing uses a 320 px departure roof; ordinary generated platforms remain short. Successive small caps require a quick new jump after landing; there is no automatic bounce. Gaps use ballistic flight timing to keep the narrow caps reachable.

The camera follows altitude and the skyline changes with the chapter. Clear highlighted top edges are the landing surfaces. Scoring awards one point for each new surface landed on, once only. Jumping on the same roof cannot farm points. During rooftop sections, one press means one jump; no double jump. The approved opening speed ramps from 470 to 760 px/s over about 53 seconds, then keeps rising more slowly to 860 px/s at about 2:58. The HUD shows elapsed run time and four pace stages: Warmup, Momentum (0:20), Overtime (0:55) and Redline (1:40). Stage names mark the continuous ramp; they do not abruptly change physics. Spacing integrates the speed ramp over each later jump to keep the route reachable. A level jump lasts about 0.68 seconds; rising and falling transfers have different flight times. Focus loss pauses; restart is available after the 0.4-second collision animation.

The combined rooftop/flight course saves to `not-right-meow.skyline-flight.v4`. On the first load it carries forward your previous skyline best and audio preferences; the older record remains untouched. Scores and sound preferences are local to each browser and origin. Clearing browser data clears them. The soundtrack is an original 100 BPM halftime electronic loop with a separate toggle.

## Landing feedback
Wood, masonry and metal have distinct original synthesized landing sounds. Impact strength drives bucket compression, a brief landing ring and material-colored dust. Pausing freezes these effects. Reduced-motion settings omit the ring.

## Changing weather
Clear dusk, rain, fog and storms rotate over a 56-second cycle, with four-second blends. Weather continues across restarts and freezes while paused. Rain, drifting cloud banks, layered mist and subdued storm glows are visual only: jump physics and collision stay consistent. Reduced-motion settings remove lightning and reduce rain movement.

## GitHub Pages — no build required
1. Sign in to GitHub and create a **public** repository named `not-right-meow`.
2. Extract this ZIP. Upload its **contents**, including `index.html`, `style.css`, `src/` and `assets/`, to the repository root. Do not upload the ZIP itself or wrap everything in another folder.
3. Commit to `main`.
4. Open repository **Settings → Pages**.
5. Under **Build and deployment → Source**, select **Deploy from a branch**.
6. Select **main** and **/(root)**, then **Save**.
7. Wait for GitHub's Pages deployment to succeed. Use the URL displayed by GitHub (normally `https://USERNAME.github.io/not-right-meow/`).

All runtime paths are relative, so project subdirectories work. No npm packages or GitHub Actions workflow is needed. GitHub documentation: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Source
- `assets/art.js`: Cookie's jointed vector artwork, dusk scenery and obstacles.
- `src/core.js`: pure deterministic game simulation, 120 Hz fixed step.
- `src/renderer.js`: Canvas scenery, character animation, parallax and particles.
- `src/audio.js`: original synthesized effects and electronic beat, Web Audio.
- `src/game.js`: controls, menus, persistence and frame scheduling.
- `tests/gameplay.cjs`: dependency-free mixed-course physics checks; run `node tests/gameplay.cjs`.
- `tests/balloon.cjs` and `balloon-check.html`: regression checks that balloon-only overlaps are safe while cat contact still collides.
- `tests/flight.cjs`: 80 seeded two-cycle flight runs, top/bottom routes, varied openings and spacing, transitions, bounds and pause checks; run `node tests/flight.cjs`.
- `tests/pilot.js`: scripted QA driver; never loaded in the playable game.
- `flight-check.html`: actual-engine visual snapshots and full browser flight integration checks.
- `route-check.html`: engine-generated snapshots of the rooftop, crane and beam crossing.
- `progression-check.html`: actual-engine snapshots at four pace stages, plus landing-audio scheduling and desktop layout checks.
- `weather-check.html`: four actual-renderer previews and pause/restart weather checks.
- `browser-check.html`: browser integration checks; serve locally for iframe access (for example `python3 -m http.server 8000`, then open `/browser-check.html`). This QA page is optional and does not need to be deployed.

Cookie is a vector adaptation of the approved concept art. No Nintendo assets, third-party artwork, external fonts, or audio samples are included. All graphics and synthesized audio were created for this project from the user-provided references.

## Browser notes
Web Audio starts after a user gesture. Browser privacy settings may prevent persistent scores; the game falls back to session-only scores. Fullscreen can be blocked inside embedded previews. Chrome, Edge and Firefox use the same standard Canvas/Web Audio APIs, but only the browsers explicitly listed in QA_RESULTS.md were tested.

- `assets/seasonal.js`: original seasonal artwork and event dates.
- `halloween-check.html`: seasonal presentation, date, music and layout browser checks.

## Shared online leaderboard
Open the trophy button in the upper-right corner, enter a nickname, check **Post my future runs automatically**, and press **Save**. Future runs with at least one point are posted automatically. The Top 100 and your own rank are shared with other players. Leaderboard browsing pauses an active run; closing it leaves the run paused until resumed.

A random player token is saved only in the current browser. Clearing site data or changing browser/device creates a new leaderboard identity. Names can repeat; a short tag distinguishes them. Nicknames and scores are public. Turning sharing off stops future submissions but does not erase previously posted scores. Old device-only bests cannot be imported. A failed connection never prevents local play; the game shows a retry option for a failed score post. QA URL runs never submit.

The game is still static on GitHub Pages. Shared scores use the separate D1-backed service at `https://not-right-meow-scores.rareboot37.chatgpt.site/api/leaderboard`. The public frontend contains no database keys. This optional online feature requires network access; the downloaded game remains playable locally without it. The backend limits requests and checks run ownership, duplicates, score/time bounds, and version. These are basic abuse checks, not cheat-proof server replay verification.
