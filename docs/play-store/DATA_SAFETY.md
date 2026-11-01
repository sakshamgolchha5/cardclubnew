# Play Console - Data safety (recommended answers)

Answer from what the app really does today. Re-check this page every time the app changes (accounts, ads, analytics, cloud saves, purchases all change these answers).

| Question | Recommended answer | Why |
|---|---|---|
| Does the app collect or share any of the required user data types? | **No** (see note) | No accounts, ads, analytics or payments. Name, avatar, coins, history stay on the device. |
| Is all user data encrypted in transit? | Yes | Site and signalling use HTTPS/WSS; WebRTC media/data channels are encrypted (DTLS). |
| Do you provide a way for users to request data deletion? | Yes | Settings -> Clear player data, and `/delete-data.html`. There is no server-side account. |
| Ads? | **No ads** | |
| Contains in-app purchases? | **No** | Coins have no cash value and cannot be bought. |
| Account creation? | **No account** | If accounts are added later, Play requires an in-app deletion path and a web deletion URL. |

**Note on room-code games (please decide with care):** to connect players the app uses the public PeerJS signalling service and WebRTC, which exposes connection details such as an IP address to that service, to third-party relay (STUN/TURN) servers and to the other players in the room. This is ephemeral connection data used only to make the game work. Google's form is about data "collected" and sent off-device; if you decide this counts, declare it under *Device or other IDs / App activity* as "collected, shared with a service provider, needed for app functionality, not used for advertising". Declaring it is the safer, honest choice if you are unsure. Read Google's current definitions before submitting.

**Third-party code in the app:** PeerJS (room codes). No ad, analytics or crash SDKs.
**Permissions:** none beyond network access (the app needs only the Internet permission). No camera, microphone, location, contacts or storage permission.
