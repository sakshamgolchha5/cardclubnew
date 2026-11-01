# Release checklist

Owner: **You** = needs your identity, money or accounts. **Me** = I can prepare it.

| # | Step | Who | Notes |
|---|---|---|---|
| 1 | Pick the permanent app id and a support email | You | Default id `com.cardclubarcade.app`. |
| 2 | Run `npm run legal -- "Your legal name" "email"` and redeploy | You/Me | Fills the privacy, terms and delete-data pages. |
| 3 | Create a Google Play developer account (one-time US$25) and finish identity verification | You | play.google.com/console. Personal accounts need ID verification and a phone number. |
| 4 | Build the signed .aab (ANDROID_BUILD.md) and test on a real phone | You | Check: landscape, notch, sound, room code with a friend. |
| 5 | Create the app in Play Console (free, app, English) | You | Then fill every "App content" form (see DATA_SAFETY.md, CONTENT_RATING.md). |
| 6 | Store listing: paste LISTING.md text, upload `store/` images | You | Icon 512, feature graphic 1024x500, 2+ phone screenshots. |
| 7 | App content: privacy URL, ads = No, app access = all functionality available, target audience, content rating, data safety, government app = No, financial features = None | You | Answers are in this folder. |
| 8 | Closed testing: upload the .aab to a closed track, add testers, run the required test period | You | New personal accounts must run a closed test with at least 12 testers for 14 days before production access. Confirm the current rule in Play Console -> Dashboard. |
| 9 | Apply for production, fix any review feedback, publish | You | First review can take several days. |
| 10 | After launch: version bumps, fixes, new games | Me | Increase versionCode, rebuild, upload to production. |

Legal reminders (not legal advice): keep the privacy policy accurate if you add accounts, ads or analytics; no real-money gambling features; keep the keystore safe; respond to Play policy emails.
