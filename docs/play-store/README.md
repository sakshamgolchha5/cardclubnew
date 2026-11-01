# Play Store pack - Card Club Arcade

Everything needed to get from "works on Vercel" to "live on Google Play". Read in this order:

1. `RELEASE_CHECKLIST.md` - the whole journey, step by step, and who does each step.
2. `ANDROID_BUILD.md` - two ways to make the Android app file (.aab): PWABuilder (no code) or the GitHub workflow.
3. `LISTING.md` - the store text, ready to paste (character limits are checked by a test).
4. `DATA_SAFETY.md` and `CONTENT_RATING.md` - what to answer in Play Console.
5. `../../store/` - icon, feature graphic and phone screenshots at the required sizes.

Public pages already in the app (they deploy with the site): `/privacy.html`, `/terms.html`, `/delete-data.html`.
Before submitting, run once: `npm run legal -- "Your legal name" "support@yourmail.com"` (fills the placeholders in those pages and in these documents), then redeploy.

Not legal advice. These are practical drafts; have the final privacy policy and terms checked for the countries you publish in.
