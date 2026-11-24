import type { IconName } from "@/components/icon";

export type Guide = {
  slug: string; title: string; shortTitle: string; description: string;
  category: string; icon: IconName; image: string; status: string;
  seo: { title: string; description: string };
  sections: {
    heading: string; paragraphs: string[]; steps?: string[];
    image?: { src: string; alt: string; caption: string };
    table?: { caption: string; headings: string[]; rows: string[][] };
  }[];
  faq: [string, string][];
  sources: { label: string; url: string }[]; related: string[];
};

const sources = [
  { label: "Official Steam listing", url: "https://store.steampowered.com/app/5037200/" },
  { label: "Developer announcements", url: "https://steamcommunity.com/app/5037200/allnews/" },
];

const articles: Guide[] = [
  {
    seo: {"title": "Just Volleyball Release Date - Launch & Buying Guide", "description": "Find the Just Volleyball release date, launch times by region and full-game features. Check what to install and how to prepare your first session with friends."},
    slug: "release-date", title: "Just Volleyball Release Date & Launch Details", shortTitle: "Release Date",
    description: "The confirmed launch date, regional release times, full-game features and what to check before installing.",
    category: "Game & Availability", icon: "calendar", image: "/images/game/character-match.jpg",
    status: "Released November 16, 2026 · Windows PC / Steam",
    sections: [
      { heading: "Just Volleyball release date — November 16, 2026", paragraphs: [
        "Just Volleyball released on Steam on November 16, 2026. Developed by temkosoft, the PC game supports offline practice and online volleyball. The full game can now be purchased through Steam.",
        "Older announcements mention November 4 or a possible November 10–15 window. Those dates belonged to earlier plans during the release review. November 16 is the actual Steam release date."
      ] },
      { heading: "Launch time and regional dates", paragraphs: [
        "The developer announced a November 16 launch at 12:00 PM EST, equivalent to 17:00 UTC. That moment fell on November 17 in parts of Asia and Australia.",
        "The historical unlock was 09:00 in Los Angeles, 17:00 in London, 18:00 in Berlin, and 22:30 in New Delhi on November 16. In Beijing it was 01:00 on November 17, in Tokyo 02:00, and in Sydney 04:00. These conversions describe the original unlock, rather than a future launch schedule."
      ] },
      { heading: "What the full release added", paragraphs: [
        "The launch announcement introduced Steam Cloud saves and the Photo Studio within the Locker. Nationals Arena, Clouds and Space expanded the court selection, with evening and night variations for existing environments.",
        "Progression includes achievements, daily and weekly goals, and unlockable titles. Custom lobby modifiers cover options such as player collision, ball indicators and CPU fill. Replay mode lets players review rallies and capture match moments."
      ] },
      { heading: "Price and the launch promotion", paragraphs: [
        "The November 16 announcement advertised a 38% launch discount lasting approximately eight days. That is a historical offer. Check the Updates page’s Release & Price section for a timestamped US price, then confirm the amount for your region at Steam checkout.",
        "A demo installation and a full-game license are separate. Having a past demo in your library does not establish ownership of the released game."
      ] },
      { heading: "Install and prepare your first session", paragraphs: [
        "Check the Windows system requirements before downloading. The Steam listing specifies 500 MB of storage, and saved replay files can increase usage over time."
      ], steps: ["Open the Steam listing for app 5037200 and confirm the developer is temkosoft.", "Install the game and allow Steam to finish all updates.", "Check your active controls in a tutorial or local bot session.", "Create a player in the Locker, then arrange a private game before trying public quickplay."] },
      { heading: "Returning after the demo", paragraphs: [
        "Keep any appearance codes or player-card exports you already have. The launch announcement does not provide a universal guarantee that demo levels, chips or presets transfer to the full game.",
        "After installing, check the selected profile, equipped outfit and available accessories. An imported look may reference items your current profile still needs to unlock."
      ] }
    ],
    faq: [["Is Just Volleyball released?", "Yes. Its Steam release date is November 16, 2026."], ["Why do some guides say November 17?", "The announced EST unlock falls on November 17 in Beijing, Tokyo and Sydney."], ["Where can I see the current price?", "Check Steam or the timestamped Release & Price information on our Updates page."]],
    sources, related: ["demo", "beginner", "online"]
  },
  {
    seo: {"title": "Just Volleyball Demo - Access, Outfits & Full Game Guide", "description": "Check Just Volleyball demo access, the Encore Demo timeline, outfit codes and save questions. Learn what to verify before switching to the full Steam game."},
    slug: "demo", title: "Just Volleyball Demo — Access, Outfits & Full Game", shortTitle: "Demo",
    description: "The Encore Demo timeline, how to check current Steam access, outfit codes and the move to the full release.",
    category: "Game & Availability", icon: "ball", image: "/images/game/locker.webp",
    status: "Encore Demo dates are historical · Check Steam for current access",
    sections: [
      { heading: "Just Volleyball demo availability", paragraphs: [
        "The Encore Demo was a limited Steam event announced in November 2026. The developer expected it to remain available until November 15 at 12:00 PM EST, ahead of the November 16 full release.",
        "That event window has passed. Look for a current demo download on the official Steam listing before planning a session. An archived guide, an old library entry or a cached download button cannot confirm that new accounts can install and play today."
      ] },
      { heading: "Why the Encore Demo reopened", paragraphs: [
        "The developer reopened the demo while the full game was going through its release review. The ENCORE DEMO announcement described a limited opportunity to play and gather feedback during that wait.",
        "The suggested end time was November 15 at 17:00 UTC, or November 16 at 01:00 in Beijing. The announcement qualified that timing as an expectation. It should be read as event history."
      ] },
      { heading: "How to check for an official download", paragraphs: ["Use Steam to inspect the available installation options. If the listing offers only the paid release, arrange your session around that version."], steps: ["Visit the Just Volleyball store page published by temkosoft.", "Check for a demo installation option while signed into Steam.", "If one is offered, read its current access notice and install through Steam.", "Check that your friends are using a compatible edition before attempting an online session."] },
      { heading: "Just Volleyball demo outfit", paragraphs: [
        "A demo outfit is a customized avatar appearance. In builds with Locker access, its look comes from the selected face, hairstyle, jersey number, uniform colors and available accessories.",
        "An appearance code references those choices. It does not unlock accessories. A full-release item can also be missing from an older demo, causing the imported outfit to look different.",
        "Save an exported appearance code or a player-card picture when the build supports it. Keep a separate copy before editing. Our Locker can help you explore combinations, while the game determines which items your profile owns."
      ] },
      { heading: "Just Volleyball demo crack", paragraphs: [
        "Players searching for a demo crack may be trying to reopen expired access or obtain the paid release. This website provides no cracked installer, modified executable or Steam bypass.",
        "A modified build cannot establish access to official matchmaking, current updates or Steam Cloud. Its version can also differ from the one your friends use. Check for an official demo, use a licensed copy, or consider Steam Remote Play Together for a supported shared local session."
      ] },
      { heading: "Progress and presets when moving editions", paragraphs: [
        "Do not assume levels, chips, titles or owned items transfer automatically because two builds show similar characters. The announcement does not establish a general carryover guarantee.",
        "The full-release announcement adds Steam Cloud saves, Photo Studio, more maps, progression rewards and custom lobby modifiers. After changing editions, verify the active profile and test a saved appearance before joining a match."
      ] }
    ],
    faq: [["Can I install the demo now?", "Check the official Steam listing for a current demo option. The November event dates describe past access."], ["Does a demo outfit code unlock paid items?", "No. An imported appearance can require accessories that your profile still needs to own."], ["Does the demo give me the full game?", "Demo access is separate from a full-game license."]], sources, related: ["release-date", "beginner", "controls"]
  },
  {
    seo: {"title": "Just Volleyball Beginner Guide - Learn Your First Rally", "description": "Start playing with this Just Volleyball beginner guide. Practice receiving, setting, serving and attacks, improve positioning and prepare for your first match."},
    slug: "beginner", title: "Just Volleyball Beginner Guide — Your First Rally", shortTitle: "Beginner",
    description: "Learn positioning, receiving, setting and attacking through a repeatable first-session routine.",
    category: "Learn to Play", icon: "ball", image: "/images/game/character-on-court.jpg", status: "Start with local play, bot matches or a private lobby",
    sections: [
      { heading: "Just Volleyball beginner starting point", paragraphs: ["Begin by reaching the ball and sending a controlled touch toward a teammate. A useful receive creates time for the rest of the rally. Winning the first match is a less helpful practice goal than repeating that action.", "Use the tutorial, local play or a private lobby with friends. The routine below is a suggested practice sequence you can repeat at your own pace."] },
      { heading: "Move first, then make contact", paragraphs: ["Movement brings your player into reach; the mouse chooses the outgoing target. Watch the landing indicator and move early. During a serve, sprint into the ball’s path instead of standing still and repeatedly pressing receive.", "Aim toward a teammate who can make the next touch. After passing, return to useful coverage rather than chasing the ball into another player’s space."] },
      { heading: "Receive, set and attack", paragraphs: ["A normal team rally allows up to three touches, with blocks excluded from that count in the default rules. Start with a receive, make a set that gives the attacker time, then send the ball across. In 1v1, the same player can perform the sequence.", "Approach an attack before the set arrives. Try to be airborne as the ball passes above you and contact it near the top of your jump. First aim for a repeatable contact, then work on placement."] },
      { heading: "Start rallies with a reliable serve", paragraphs: ["Use the active serving prompts and aim for a large area inside the opposing court. A playable serve creates more practice opportunities than an advanced attempt that repeatedly ends the point.", "Change one part of the serve at a time. Keep the target similar while adjusting timing. Add difficult placement or float and spin variations after the basic sequence becomes consistent."] },
      { heading: "Dive, block and cover deliberately", paragraphs: ["Walk or sprint into a routine receive when possible. Diving uses stamina and a mistimed dive can disrupt teammates. Save it for a ball that needs the extra reach.", "At the net, watch the attacker before committing to a block. Players behind the block should cover the remaining court. If every teammate moves forward to attack, the backline is left open."] },
      { heading: "A practical first-session routine", paragraphs: ["Choose a single goal for each short practice session. Repeat the earlier step if a match exposes a weakness."], steps: ["Move around the court and learn the landing indicator without attempting difficult shots.", "Receive several balls toward the same teammate.", "Trade controlled sets and attacks in a small lobby.", "Play a bot match while keeping players spread across the court.", "Review an available replay and choose one positioning or timing change for the next session."] },
      { heading: "Joining public games", paragraphs: ["Try public play once you can identify your controls, return a routine ball and leave space for teammates. Small formats make individual contacts easier to follow; larger teams need more disciplined coverage.", "Use server descriptions to find a suitable session. Measure progress through cleaner first touches, fewer panic dives and longer rallies across comparable matches. Return to private practice when the pace feels too fast."] }
    ], faq: [["What should I learn first?", "Move into range and aim a controlled receive toward a teammate."], ["Do I have to start in 6v6?", "No. Use bots, local play or a smaller private format while learning."], ["How do I measure progress?", "Look for more usable receives, fewer positioning errors and longer rallies."]], sources, related: ["controls", "online", "demo"]
  },
  {
    seo: {"title": "Just Volleyball Controls - Keyboard & Controller Guide", "description": "Learn Just Volleyball controls for movement, aiming, serving, setting and attacks. Check default keys, controller setup and fixes for missed or late contacts."},
    slug: "controls", title: "Just Volleyball Controls — Keyboard, Mouse & Controller", shortTitle: "Controls",
    description: "Keyboard and mouse defaults, contact contexts, serving, camera settings and controller troubleshooting.",
    category: "Learn to Play", icon: "book", image: "/images/game/character-match.jpg", status: "Game 1.0.3 keyboard defaults · Your active remapped bindings take priority",
    sections: [
      { heading: "Just Volleyball controls reference", paragraphs: ["The table below summarizes keyboard and mouse defaults from the game configuration. Check Settings before practicing, especially after changing movement options or switching profiles.", "An action can change with context. Grounded, airborne and serving inputs should be practiced alongside positioning and aiming."] },
      { heading: "Left click — receive and spike", paragraphs: ["The main contact action receives on the ground and attacks in the air. Move close enough to the ball and aim the cursor before contact.", "If an attack fails, check your approach and jump timing. Jumping only when the ball reaches you can leave you below the intended contact point."] },
      { heading: "E — setting", paragraphs: ["The set input supports tapping or holding and releasing. Use it to produce a ball a teammate can approach, with an outgoing target that leaves them room to jump.", "Check available assist settings alongside your bindings if your set behaves differently from a tutorial example. Practice a repeatable height and target before changing several options."] },
      { heading: "Right click — dive and block", paragraphs: ["The secondary contact action dives on the ground and blocks in the air. Blocking therefore combines jumping with position at the net.", "For a routine receive, move into position before reaching for the dive input. A deliberate dive preserves control over your stamina and reduces accidental disruption of teammates."] },
      { heading: "Jump, strafe and sprint", paragraphs: ["Space handles jumping, including the charge interaction. Shift is the default strafe binding, while Ctrl is the default sprint binding. Configured double-tap behavior can also affect movement.", "Test those actions individually in local play. If Shift feels unexpected, inspect the assigned action and your sprint settings before relying on habits from other games."] },
      { heading: "Serving and camera", paragraphs: ["R is a serving action, and the main contact input also handles serving charge or toss contexts. Follow your active build’s serving prompts to learn the sequence before attempting jump serves.", "C cycles the camera and V adjusts zoom. Pick a view that keeps the landing indicator and teammates readable. Camera comfort should help you judge the ball’s path."] },
      { heading: "Controller setup and input checks", paragraphs: ["Check your device against the current game prompts and the active Steam Input layout. A November 16 controller-fix announcement re-enabled functionality and advised fully restarting Steam if necessary.", "Controller mappings vary by layout. The keyboard table is not a gamepad button map. Test movement, aiming, jump and both contact actions in local play before joining an online session."], steps: ["Inspect bindings in Settings and check for unintended duplicate assignments.", "Test the input in local play outside a fast rally.", "For contact actions, check range and whether the action requires being grounded or airborne.", "For a controller, inspect Steam Input and restart Steam after configuration changes.", "Repeat slowly before testing in a match."] }
    ], faq: [["Which button receives and spikes?", "Left mouse is the default main contact input. It receives on the ground and attacks in the air."], ["What does Shift do?", "Shift is the default strafe binding. Check your active sprint settings separately."], ["Why does a contact fail?", "Check range, ground or air context, timing and your active binding."]], sources, related: ["beginner", "online", "demo"]
  },
  {
    seo: {"title": "Just Volleyball Online - Multiplayer & Friends Guide", "description": "Play Just Volleyball online with friends. Learn lobby setup, invitations, LAN, local play and Remote Play Together, with checks for common joining problems."},
    slug: "online", title: "Just Volleyball Online — Multiplayer & Friends", shortTitle: "Online & Friends",
    description: "Join quickplay, host a lobby, invite friends and troubleshoot online, LAN and shared local sessions.",
    category: "Multiplayer", icon: "users", image: "/images/game/steam-arena.webp", status: "Online, LAN and local options · Match availability varies by region and time",
    sections: [
      { heading: "Just Volleyball online options", paragraphs: ["The released game supports online matches alongside offline practice and local multiplayer. Formats range from 1v1 to 6v6. Choose a team size that suits the people joining your session.", "Quickplay searches for a match. The server browser lets you choose a listed lobby. A private group can use party and lobby options to organize a session and configure its rules."] },
      { heading: "How to play Just Volleyball with friends", paragraphs: ["Agree on the host and match format before sending invitations. Everyone should finish updates and use a compatible edition. The game menu includes party creation to organize players before selecting a match."], steps: ["Launch compatible updated game clients.", "Create a party or host a custom lobby through the current Play menu.", "Use the available game or Steam invitation controls to bring friends into the session.", "Choose teams, court, rules and CPU fill for empty positions.", "Check that everyone has joined and is ready before starting."] },
      { heading: "Quickplay and queue times", paragraphs: ["Region, time of day and selected formats influence who is available to match. Selecting several formats does not guarantee a faster queue when the local pool is small.", "The November 22 announcement described ranked mode as development work. Check Updates for published changes before planning a ranked session, because an announced target is not evidence that its queue has opened."] },
      { heading: "Custom lobbies for mixed-skill groups", paragraphs: ["Hosts can configure modifiers including player collision, ball indicators and CPU fill. Use a helpful lobby description so joining players understand whether the session is for learning or competitive practice.", "Give new players time to test serves and receives. Short matches let the host adjust teams and rules between rounds. For public games, use the server browser to look for a suitable session rather than assuming every quickplay match will fit the group."] },
      { heading: "LAN, local play and Remote Play Together", paragraphs: ["Steam lists LAN and shared or split-screen multiplayer, plus Remote Play Together. Choose the connection method before arranging a session and test each local input device.", "LAN players need the intended network and compatible versions. Local players follow the game’s join prompts. The local setup supports up to four local players, which is separate from selecting a team format such as 6v6.", "Remote Play Together streams a supported local session from the host. Guests use Steam’s invitation and input-sharing options; this does not give them an independent full-game license or a separate online client."] },
      { heading: "A friend cannot find or join the lobby", paragraphs: ["Start with version and visibility checks. A private invitation and a public server search follow different paths. Confirm that the lobby still has room and refresh the list after changing filters."], steps: ["Check that everyone finished Steam updates and is using a compatible edition.", "Check visibility, invitations, region and server-browser filters.", "Refresh the browser or ask the host to resend an invitation.", "For LAN, check the network and the game’s firewall permission.", "If one host repeatedly fails, try another group member as host and compare the result."] },
      { heading: "Muting, reporting and finishing matches", paragraphs: ["During a match, open Pause → Players & Teams and select a player to mute them. The developer says this hides their chat and distracting avatar content. Use the game’s reporting options for disruptive behavior.", "Version 1.0.3 removed the quick-match matchmaking penalty. That note did not say every loss-recording or match-result rule was removed. Finish the match properly when possible and read the current update notes before relying on an old rule."] }
    ], faq: [["Does Just Volleyball have online multiplayer?", "Yes. Online team formats range from 1v1 to 6v6."], ["Does 6v6 mean twelve local players on one PC?", "No. Team format and local input capacity are separate. The local setup supports up to four players."], ["Can console friends join?", "The confirmed release is Windows PC through Steam. A console crossplay arrangement is not established here."]], sources, related: ["beginner", "controls", "release-date"]
  }
];

const expandedSections: Record<string, Guide["sections"]> = {
  "release-date": [
    { heading: "Release timeline — from review delays to launch", paragraphs: [
      "The original release plan changed while the build went through Steam review. The developer’s account describes a submission in October, corrections to store and controller-related requirements, and another review cycle. Those delays explain why old videos and early guides can show conflicting dates.",
      "The November ENCORE DEMO notice belongs to that waiting period. A later announcement confirmed November 16 at noon EST. The full-release announcement then marked the game as available. When checking a claim about launch, compare the announcement’s publication date with the event it describes.",
      "For someone installing today, the useful checks are much simpler: confirm the correct Steam app, allow the current build to finish downloading, and check your library license. A launch-day screenshot showing Coming Soon describes the store at that moment. It should not override the released product listing."
    ], table: { caption: "Key points in the release history", headings: ["Period", "What it means"], rows: [["October review cycle", "The release build was reviewed and required corrections."], ["Earlier November 4 plan", "An earlier target that was superseded."], ["November Encore Demo", "Temporary access reopened during the wait."], ["November 16, 2026", "Actual Steam release date."]] } },
    { heading: "Release time conversion table", paragraphs: ["The following times all refer to the same announced unlock. Use the city and date together when comparing an old launch post with a video recorded elsewhere."], table: { caption: "Announced launch moment by timezone", headings: ["Location / zone", "Local date", "Local time"], rows: [["Los Angeles / PST", "November 16, 2026", "09:00"], ["New York / EST", "November 16, 2026", "12:00"], ["UTC / London GMT", "November 16, 2026", "17:00"], ["Berlin / CET", "November 16, 2026", "18:00"], ["New Delhi / IST", "November 16, 2026", "22:30"], ["Beijing / UTC+8", "November 17, 2026", "01:00"], ["Tokyo / JST", "November 17, 2026", "02:00"], ["Sydney / AEDT", "November 17, 2026", "04:00"]] } },
    { heading: "Plan the download and first launch", paragraphs: [
      "Set aside time for installation and one short local test before promising friends an immediate online match. Download completion, the first launch and checking controls are separate steps. A connection problem is easier to investigate after confirming that local play works.",
      "If the game is already installed, let Steam apply pending updates. Version differences matter for online sessions. If the install appears damaged, use Steam’s file-integrity check before replacing files manually. For a machine with limited storage, remember that keeping replays can increase disk usage.",
      "On the first run, choose your profile and check the active bindings. Test the camera, movement and a basic contact. Create a simple recognizable outfit, then join a private session. This gives you a known working setup before adding unfamiliar rules or playing with strangers."
    ], image: { src: "/images/game/character-profile.png", alt: "Just Volleyball profile panel beside a custom player on court", caption: "Check the selected player profile before starting a new session." } },
    { heading: "Platforms, editions and what to buy", paragraphs: [
      "The confirmed release covered Windows PC on Steam. Check the current platform information if you are buying for a different operating system. Streaming through a host PC and running a native release are different arrangements, with different input and network requirements.",
      "For an online group, agree on the edition everyone will launch. An expired demo cannot be assumed to join a licensed full-game session. For shared local play, review the available player inputs before the group arrives. Remote Play Together is another option for streaming a supported local session from the owner’s PC.",
      "The launch date does not determine the date of future modes or cosmetics. Read the Updates page for patch history and development plans. If an announcement discusses a target month, confirm that a later release note actually shipped the feature before arranging your session around it."
    ] }
  ],
  demo: [
    { heading: "What to test during a playable demo window", paragraphs: [
      "A useful demo session answers whether the movement, aiming and match pace suit you. Start with the tutorial or a local session and learn how your player reaches the ball. Then try the three-contact rally with a friend or bots. Leave enough time to test the camera and your preferred input device.",
      "Look at how the game performs during an active rally, rather than judging only the menu. Try a court view where you can read the floor indicator and see teammates. If you plan to play online, test an actual session with the people you expect to join, because solo practice cannot tell you how that connection feels.",
      "Treat any future demo as its own event. Check the access notice for its dates, features and version. A full-game store feature list does not by itself prove that every feature is included in every demo build."
    ], image: { src: "/images/game/character-match.jpg", alt: "An indoor Just Volleyball rally with multiple custom players near the net", caption: "A full-game rally illustrates the movement and team positioning to evaluate during play." } },
    { heading: "Demo app, full game and playtest", paragraphs: [
      "Steam can keep separate entries for a demo, a playtest and the released game. Check the product name before launching from an old shortcut. Seeing two related installations is not automatically a broken update.",
      "The full game uses app 5037200; the demo entry used app 5401090. Availability belongs to the specific product and account. If a store link redirects to the full game, inspect the options currently offered instead of assuming the old demo remains downloadable.",
      "Avoid deleting a working profile just to resolve an edition mismatch. First confirm which app is running, whether updates are complete and whether the event is open. Preserve exported appearance codes and any other backups before changing save data."
    ], table: { caption: "What each type of access establishes", headings: ["Entry", "What to check"], rows: [["Full game", "A license, current installed build and platform requirements."], ["Demo", "A currently offered download and an active access window."], ["Playtest", "Participation and access for that separate testing build."], ["Old installation", "Whether that version can still launch and join compatible sessions."]] } },
    { heading: "Rebuild a demo outfit in the Locker", paragraphs: [
      "If you have a screenshot but no code, rebuild the visible parts systematically. Begin with skin tone, head shape and face features. Add hair next, then match the jersey number and major uniform colors. Accessories are easier to identify once the base look is close.",
      "Check the selected outfit context as you work. Captain and gym outfits can use different colors and clothing choices. A player pictured in casual clothing will not necessarily match a captain-uniform preview, even when the underlying profile is the same.",
      "When importing a code, inspect the entire character from several angles. A hat can hide hair, a cape may be visible primarily from behind, and the lighting can alter how a color reads. Save the updated code only after checking the combination you intend to use."
    ], image: { src: "/images/game/locker.webp", alt: "Locker controls for a green jersey and the player wearing it", caption: "Match the outfit context, jersey number and main colors before adding accessories." }, steps: ["Save a copy of the original appearance code or screenshot.", "Match the face, body and hairstyle.", "Choose the intended outfit and set its number and colors.", "Check accessory requirements and inspect front and rear views.", "Export a new code after checking the finished combination."] },
    { heading: "When a demo will not launch or connect", paragraphs: [
      "First distinguish installation problems from access problems. An event that has ended can prevent play even if local files are present. Reinstalling the same expired build does not establish fresh event access.",
      "If access is currently offered, finish pending downloads and check file integrity through Steam. For a friend session, compare editions and patch versions before changing network settings. When local play works but joining fails, move to the online guide’s visibility and connection checks.",
      "Keep the full-game purchase decision separate from a troubleshooting experiment. Check what Steam offers to your account and region, and read the current description before paying for a different product than the one you meant to install."
    ] }
  ],
  beginner: [
    { heading: "Practice block — receiving under a little pressure", paragraphs: [
      "Once a stationary receive feels comfortable, add movement before contact. Begin slightly away from the anticipated landing area, then move into place and aim at your teammate. Repeat from both sides so you learn to receive after moving in either direction.",
      "Use a small batch of attempts and notice why each one fails. Were you late to the ball, aiming at an awkward target, or diving when a step would have worked? Change the part that caused the miss before increasing the speed. These are suggested practice checks, rather than hidden game requirements.",
      "The receiver’s job continues after the pass. Recover into space that lets you cover the next touch. Following your own pass all the way to the setter can remove the room they need to create an attack."
    ], image: { src: "/images/game/character-on-court.jpg", alt: "A player and ball on the orange court in Just Volleyball", caption: "Read the court space, then move into the ball’s path before choosing the next touch." } },
    { heading: "Practice block — build a hittable set", paragraphs: [
      "Choose one attacker and one approach area for a short exercise. Receive toward the setter, make the set and let the attacker approach without chasing the ball at the last moment. Keep the same target for several repetitions to make differences easier to notice.",
      "If the hitter arrives late, move the approach earlier before changing the set. If the ball lands behind the hitter, adjust the target and repeat. If both players change timing and target on every attempt, it becomes difficult to identify which change helped.",
      "Swap roles after a few rallies. Receiving a teammate’s set gives you a clearer sense of the time and space a hitter needs. It also helps both players develop a simple call for who takes the first and second contacts."
    ], steps: ["Agree who receives, who sets and where the attacker approaches.", "Repeat the same target at a comfortable pace.", "Adjust one timing or placement choice after a failed attempt.", "Swap roles and compare which sets are easiest to attack."] },
    { heading: "Choose a target before the attack", paragraphs: [
      "As the set develops, look at the defenders and the block. Decide where you want the attack to go before you make contact. This reduces the temptation to aim hurriedly while also trying to jump and hit.",
      "In early practice, choose a broad open area and focus on staying in the rally. A playable return gives you another chance to receive and set. Once contact becomes consistent, try placing attacks toward different areas and watch how the defense responds.",
      "After hitting, get ready for the ball to return. An attack that is blocked or defended is still part of the same rally. A teammate who covers behind you can turn a difficult rebound into another organized attempt."
    ], image: { src: "/images/game/character-match.jpg", alt: "Several Just Volleyball players jumping and covering near the net", caption: "An attack draws players toward the net; coverage behind the hitter keeps the next ball playable." } },
    { heading: "Track improvement with a simple practice log", paragraphs: [
      "Compare similar sessions. A clean receive in a quiet bot game and a desperate save in a crowded public match measure different things. Keep the format and goal similar for a few sessions before deciding whether a change helped.",
      "A short note is enough: what you practiced, the mistake you noticed and the adjustment to try next time. Reviewing every point can be overwhelming. Pick one rally that shows the issue clearly, then repeat the relevant movement in practice.",
      "Move to a larger team format when you can recognize your coverage area and communicate who takes a shared ball. More players add options, but also more chances for two people to chase the same contact. Keep the same habit of making space for the next teammate."
    ], table: { caption: "Suggested practice checks", headings: ["Skill", "What to observe", "Next adjustment"], rows: [["Receive", "Can the teammate use your pass?", "Move earlier and prepare the cursor target."], ["Set", "Can the attacker follow a repeatable approach?", "Keep a consistent target while adjusting timing."], ["Attack", "Do you select a landing area before contact?", "Choose a broad target before jumping."], ["Coverage", "Is someone ready after a block or defended hit?", "Recover into space after your touch."], ["Teamwork", "Do players collide or leave the middle untouched?", "Agree on a simple call and responsibility."]] } }
  ],
  controls: [
    { heading: "Put movement and cursor aim together", paragraphs: [
      "Practice the two jobs separately before combining them. First move around the court while keeping the cursor on a chosen target. Then hold position and aim at different areas. Finally move into a receive while preparing the target before contact.",
      "If moving makes your aim wander, lower the pace and repeat. You are trying to make the target deliberate while your player gets into reach. A camera change can also affect how easy it is to judge screen space, so test the view before changing several bindings.",
      "When checking an input, watch what happens in the game. A button press that registers outside contact range will not create the same result as a correctly timed touch. This is why local slow practice is useful even when you already know the key map."
    ], image: { src: "/images/game/character-on-court.jpg", alt: "A single player standing beside the ball in the Just Volleyball court", caption: "Movement establishes contact range while cursor aim prepares the outgoing touch." } },
    { heading: "Ground and air action checklist", paragraphs: [
      "The main and secondary contact buttons change with your movement context. When diagnosing an unexpected action, check whether you were actually airborne at the moment you pressed it.",
      "Use a local exercise to test jump, contact and recovery in that order. Begin with grounded receives, then add a jump before the main contact. Test the secondary contact separately so a hurried press does not become an unintended dive."
    ], table: { caption: "Read the context before the contact", headings: ["Situation", "Default input", "What to check"], rows: [["Grounded receive", "Left mouse", "Position in range and outgoing cursor target."], ["Airborne attack", "Left mouse", "Approach, jump timing and contact point."], ["Grounded dive", "Right mouse", "Whether ordinary movement can reach the ball."], ["Airborne block", "Right mouse", "Net position and timing against the attack."], ["Set", "E", "Active tap or hold-release behavior and set assists."], ["Serving", "R / prompted contact sequence", "Follow the current build’s serve prompts."]] } },
    { heading: "A short controls practice circuit", paragraphs: [
      "Use this circuit after a remap or a long break. Stop when an input feels unfamiliar and verify the binding rather than carrying the uncertainty into an online match.",
      "Repeat the circuit with the actual device and profile you will use. Switching from mouse and keyboard to a controller can change the way you aim, even if you understand the rally. A familiar character appearance does not prove that the active input layout is the one you intended."
    ], steps: ["Move forward, backward and across the court while following a visible target.", "Test strafe and sprint independently and confirm how each starts and stops.", "Make grounded receives toward one target.", "Add a jump and test the airborne main contact.", "Test a deliberate dive and then a separate jump-block attempt.", "Finish with the serving prompts, camera cycle and zoom controls."] },
    { heading: "Make one settings change at a time", paragraphs: [
      "If you remap movement and contact buttons together, a failed touch can be difficult to diagnose. Change one assignment, test it in local play and keep the result only when it feels clear. Take a screenshot of the layout if you want a quick reference while learning.",
      "For controllers, check whether Steam Input is applying a layout in addition to the game’s bindings. Review device assignments when multiple local players are joining. A second device controlling the wrong player is a different problem from a missed contact.",
      "If an input works locally but feels late online, compare another session before repeatedly remapping it. Network conditions can affect the experience, while a local input failure points you back toward the device, binding or action context. Use the online guide for the connection checks."
    ], image: { src: "/images/game/character-match.jpg", alt: "A busy indoor Just Volleyball rally with several players", caption: "Verify your input layout in practice before relying on it during a fast multiplayer rally." } }
  ],
  online: [
    { heading: "Choose the connection setup for your group", paragraphs: [
      "Start with where everyone is playing and how many PCs are available. Friends in different homes generally need an online session. A room with several PCs can test LAN. A shared local game uses the player-join and device options on one host PC.",
      "Remote Play Together adds another arrangement: the host runs a supported local session and streams it to guests. Test that arrangement before planning a competitive game, because the host’s performance and both sides’ connections affect the result."
    ], table: { caption: "Match the session to the group", headings: ["Your setup", "Option to test", "Check before starting"], rows: [["Separate homes, individual clients", "Online lobby", "Compatible editions, updates and invitations."], ["Several PCs on one network", "LAN", "Network visibility and firewall permission."], ["Several players at one PC", "Local multiplayer", "Input devices, profiles and local-player capacity."], ["Remote guest joining a host’s local game", "Remote Play Together", "Steam invitation, stream quality and shared inputs."]] } },
    { heading: "Organize the party before the match", paragraphs: [
      "Choose one person to host and tell the group which route you are using. A party invitation, an in-game lobby invitation and a Remote Play invitation are not interchangeable. State whether each friend should launch their own client or accept a streamed local session.",
      "Agree on team size, CPU fill and the intended pace before the first serve. If only a few people are present, choose a format that lets everyone participate regularly. A large lobby with unclear teams can make a simple input or visibility issue look like a matchmaking failure.",
      "Keep the first round short. Confirm that each person can move, aim and make contact, then adjust the session. When teaching a new player, give them a clear responsibility for a few rallies rather than changing roles after every missed ball."
    ], image: { src: "/images/game/character-profile.png", alt: "A selected Just Volleyball profile beside its custom avatar", caption: "Check the active profile and player assignment before starting with friends." } },
    { heading: "Connection quality and host checks", paragraphs: [
      "A session can be technically connected while still feeling inconsistent. Compare the same basic contact locally and online. If local movement is responsive but an online session is unstable, check the host and network before replacing your control layout.",
      "Pause large downloads and compare a wired connection when available. If one host produces a poor session for everyone, try another group member as host. Compare the result under similar conditions so you can identify whether the problem follows the host or one joining player.",
      "For LAN, confirm the PCs are on the intended network rather than assuming proximity is enough. Check the game’s firewall permission and the host’s network settings. Leave security changes limited to what is needed for the game and test discovery again after each relevant change."
    ] },
    { heading: "Remote Play Together session walkthrough", paragraphs: [
      "The host should launch a game that supports Remote Play Together, open Steam’s friend invitation options and invite the guest to the local session. The guest accepts, then the host checks which controller or shared keyboard inputs they can use.",
      "The guest is seeing the host’s running game. This is why the local-player setup still matters and why a guest does not need to join the same session again through the public server browser. Check that each participant is assigned an intended input before starting a round.",
      "If the streamed session feels delayed, check connection quality and Steam’s available streaming settings. Reduce unrelated background activity and test a short local round. If it is still unsuitable for your group, use an independent online session for players who own compatible clients."
    ], steps: ["Host a supported local session on the owner’s PC.", "Invite the guest through Steam Remote Play Together.", "Have the guest accept and check the streamed game appears.", "Assign player inputs and verify each person controls the intended player.", "Play a short test round before committing to a longer match."] },
    { heading: "Troubleshooting by the point of failure", paragraphs: [
      "Describe the failure precisely when comparing with friends: the lobby is missing, the invite fails, the player joins but cannot control, or the match starts but feels unstable. Those symptoms call for different checks.",
      "After a successful test, keep the working setup for the next session. Note the host, connection route and device assignments. Repeating a known setup is easier than rebuilding the party, lobby and input layout from scratch every time."
    ], table: { caption: "A practical joining checklist", headings: ["Symptom", "First checks"], rows: [["Lobby absent", "Visibility, filters, version and whether the host is still in that lobby."], ["Invitation fails", "Current session, compatible edition and a fresh invitation."], ["Joined but no control", "Assigned player profile, input device and Steam sharing permissions."], ["LAN discovery fails", "Same network, host visibility and the game’s firewall permission."], ["Only streamed play feels delayed", "Host performance, connection and streaming settings."], ["All players have a poor session", "Background downloads and comparison with another host."]] }, image: { src: "/images/game/character-match.jpg", alt: "An active indoor Just Volleyball multiplayer match", caption: "Test a short round after everyone joins so input and connection issues surface early." } }
  ]
};

const illustrations: Record<string, Record<number, NonNullable<Guide["sections"][number]["image"]>>> = {
  "release-date": { 2: { src: "/images/game/locker.webp", alt: "Just Volleyball Locker uniform editor", caption: "The Locker is where you prepare your player’s appearance for the full game." } },
  demo: { 3: { src: "/images/game/locker.webp", alt: "Custom player and outfit settings in the Locker", caption: "An outfit combines the player’s base appearance with the selected uniform and accessories." } },
  beginner: { 2: { src: "/images/game/steam-arena.webp", alt: "Players spread across an indoor volleyball court", caption: "Leave room for the next teammate as the rally moves from receive to set to attack." } },
  controls: { 2: { src: "/images/game/steam-arena.webp", alt: "An indoor court and players on both sides of the net", caption: "A useful set gives the attacker time to approach while the rest of the team covers." } },
  online: { 3: { src: "/images/game/steam-arena.webp", alt: "Just Volleyball indoor team match", caption: "Agree on teams and session settings before the first round." } }
};

export const guides: Guide[] = articles.map(guide => ({
  ...guide,
  sections: [
    ...guide.sections.map((section, index) => ({ ...section, image: illustrations[guide.slug]?.[index] })),
    ...expandedSections[guide.slug],
  ],
}));

export const guideRedirects: Record<string, string> = {
  "how-to-play": "beginner", "float-serve": "beginner", "how-to-set": "beginner",
  "how-to-spike": "beginner", receiving: "beginner", blocking: "beginner",
  rules: "beginner", courts: "beginner", customization: "beginner",
  multiplayer: "online", "online-not-working": "online",
};
