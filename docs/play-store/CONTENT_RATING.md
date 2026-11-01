# Content rating (IARC questionnaire in Play Console) and audience

**Category to pick:** Game. Answer "No" to: violence, blood, fear, sexual content, nudity, profanity, controlled substances, discrimination, user-generated content feeds.

**Gambling:** answer **No** for real-money gambling and **No** for simulated gambling. Teen Patti, Poker and Blackjack were removed from the plan for this reason; the card games here have no betting. Coins are play money, cannot be bought, and win/lose results have no cash value.

**Users interact:** answer **Yes** (players in a room play together and see each other's display names). There is no chat, voice, photo or text sharing. Players can choose any display name, so mention that names are user-chosen.

**Shares location:** No. **Digital purchases:** No.

Expected result: lowest age tiers (e.g. IARC 3+ / PEGI 3 / Everyone), with a "users interact" notice.

## Target audience (Play Console -> App content)
- Recommended: **13 and over** (or 16+). Choosing a range that includes under-13 children brings the Families Policy requirements (extra SDK and ads rules, parental-consent expectations). The app is built to be safe for family play, but opting into the Families programme is a separate decision.
- "Appeals to children" - answer honestly; a card-game collection with illustrated avatars can appeal to older children. If unsure, ask Play support or choose the 13+ route.
- If you choose a children's audience, update `public/privacy.html` (run `npm run legal -- "name" "email" children`).
