# Character stickers on the leaderboard

The game now renders small **transparent cutout stickers** using its existing Cookie and Jim vector artwork next to each rank in the full leaderboard and the Top 3 widget.

**Important: the existing public leaderboard service currently has no character recording in the game repository.** Frontend changes do not by themselves make this feature work on live scores. The score service must be modified separately (its code is not in this repository).

## Deployment safeguard

The game intentionally leaves `window.NRM_ENABLE_CHARACTER_METADATA` **off** until the leaderboard backend supports character data. Existing score submissions therefore keep their original format. Once the score server has been upgraded, set `window.NRM_ENABLE_CHARACTER_METADATA = true;` **before** `src/leaderboard.js` loads (for example in a tiny game config script) and update the script cache version. Do not enable it before the server is ready.

Until then, the transparent stickers render only if the leaderboard API happens to provide confirmed `bestCharacter` metadata. Existing scores and new runs continue functioning, but the full feature is **not live**.

## Server/API requirements

The current API endpoint is `https://not-right-meow-scores.rareboot37.chatgpt.site/api/leaderboard`.

- When a valid authenticated run is started (`action: "start"`), the frontend sends the chosen `character: "cookie" | "jim"` with the existing player nickname and game version.
- When that run is finished (`action: "finish"`), the frontend sends the same character with the existing run ID, score, and elapsed time.
- The score backend must validate the character against the two allowed values and persist the **run's starting character** with the run or otherwise securely associate it with the run. Do **not** trust a changed character supplied only at finish time.
- If the finished score **exceeds the previous best**, update the player's best score and `best_character` together in one database transaction. For scores lower than (or tied with) the existing best, preserve the recorded best character. Keep the current score timing/anti-abuse validation.
- Include `bestCharacter` (camelCase), or `best_character` (snake_case), in **each** public leaderboard `entries[]` item. Possible values: `"cookie"`, `"jim"`, or `null`. The existing fields `rank`, `nickname`, and `score` must continue to work.
- Existing historical best scores have **unknown** characters. Return `null`; never guess based on someone's selected character or the most recent run. The UI hides the sticker on these rows to avoid misleading players.
- Future characters can be added to the API's allowlist and front-end sticker renderer without altering existing high scores.

## Example leaderboard response

```json
{
  "entries": [
    { "rank": 1, "nickname": "Runner", "score": 238, "bestCharacter": "jim" },
    { "rank": 2, "nickname": "CookieFan", "score": 180, "bestCharacter": "cookie" },
    { "rank": 3, "nickname": "LegacyScore", "score": 125, "bestCharacter": null }
  ],
  "me": { "rank": 2, "best": 180 }
}
```

## Testing

Run `node --test tests/leaderboard-character.cjs`. Also manually check both full leaderboard and title Top 3 on a PC and iPhone. Switching characters after earning a high score should **not** change the sticker until a new higher score is achieved.

Changing the *frontend alone* will not retroactively populate the server's historical character data.
