# Redbird panel on any site

This Chrome extension opens the workshop panel on the site you are on, so you can build and try adapters on real websites like NYTimes, not just on Redbird. It is the same panel as on Redbird, with the same adapters and AI, so there is no API key to set up.

## Install

1. Download [redbird-panel-extension.zip](https://redbird-workshop.vercel.app/workshop/redbird-panel-extension.zip) and unzip it.
2. In Chrome, go to `chrome://extensions` and turn on **Developer mode** (top right).
3. Click **Load unpacked** and choose the unzipped `redbird-panel-extension` folder.
4. Click the puzzle piece next to the address bar and pin **Redbird workshop panel**.

This only works in Chrome on a computer, not on phones. If you use a keyboard or a screen reader, press Alt+Shift+R (Option+Shift+R on a Mac) instead of clicking the button.

## Use it

- Open any site and click the Redbird button. The page loads again with the panel on the left, and the button says "on".
- Your profile, saved fixes, your own adapter and the adapters you have on come with you, between Redbird and every site where the panel is on. For example, you can build a fix on Redbird, then open NYTimes and click the button to see what it does there.
- **Build your adapter** works the same way as on Redbird. An adapter built for one site can do nothing, or the wrong thing, on another. If it does, turn it off in **Adapter Library**.
- The panel stays on as you go to other pages in that tab. Click the button again to turn it off, and the page loads again without it.

## Use it with a coding agent

If a starter folder is running on your computer (`npm run dev`, see [starter/](../starter/README.md)), the panel finds it by itself. The site then runs the folder's `adapter.js`, and the page runs it again each time the file is saved. This works with any coding agent.

If [opencode](https://opencode.ai) is installed, you can also chat with it in the **Build your adapter** tab. You don't need to start opencode, since `npm run dev` does that. From this chat, opencode can read the folder and change the adapter. A site could hide instructions in the text that goes to opencode, so it can't run commands or open websites from here. To let it do more, run opencode yourself in the folder.

There's no key to set up: from the panel, opencode uses the workshop's shared AI model.

## What is different from Redbird

- The problems planted in Redbird, the switch that shows them and their ready-made checks only exist on Redbird, so they aren't on other sites. **Audit** still runs the toolkit's auditors and axe.
- When you build, AI gets a shortened copy of the page, like on Redbird. On a site you are signed in to, that copy can include your name, orders or messages.
- While the panel is on, your profile is in that site's browser storage and the site's own scripts can read it, along with anything in the panel. Pressing the button to turn the panel off removes it from that site, and the extension keeps its own copy. Closing the tab with the panel still on leaves it there. So keep private details out of a profile you use on sites you don't trust.
- A site's scripts can't send messages to opencode or write to your folder unless you pressed a key or clicked in the panel in the last 3 seconds. They can read the folder's `adapter.js` and `fix.json`.
- An adapter runs with the same powers as the site's own scripts, on every site where it's on. That includes one opencode wrote, and hidden text on a page can try to steer what opencode writes.
- Most big sites send a Content-Security-Policy header that only lets their own servers run scripts on the page, and it would block the panel. While the panel is on in a tab, the pages in that tab load without that header. Other tabs keep it. Turn the panel off before you sign in to a site like your bank.
- Please stay signed out at the workshop. We test on a short list of sites without an account.

## What we tested

On each site we opened the panel, and closed it again. This was in Chrome for testing, signed out, so try your own site before you rely on it.

| site | panel | chat with opencode |
|---|---|---|
| Wikipedia | works | works |
| NYTimes | works | works, but it blocked our test browser as a robot after many runs |
| Amazon | works | works |
| The Guardian, GitHub, weather.gov, Medicare.gov, IRS.gov | works | not tried |
| Target | opens, but the site asked our test browser to prove it's human, so we couldn't try it | not tried |

- If a site shows a robot check, the extension can't get around it. Go back to Redbird and keep working there.
- Some sites, like Amazon and the Guardian, are wider than the room left beside the panel. You can scroll sideways, move the panel to the other side, or make it narrower.
- An adapter written by AI can be wrong in ways a test doesn't catch. For example, one made Amazon's prices bigger and "$29.99" turned into "$2999". Have someone check each change with their own tools.

## Why not show the site inside the builder

We tried loading other sites in an iframe on a Redbird page first. It doesn't work for two reasons:

- Most big sites refuse to load inside another site's page. 10 of the 12 we tried refused, including NYTimes, Amazon, Target and Walmart.
- When a site does load, like Wikipedia, the browser doesn't let the Redbird page read or change what is inside it, so no adapter can run there.

The extension adds the panel to the site's own page instead, so no iframe is needed.

## Change it

`background.js` turns the panel on and off, adds it to each page, and carries the panel's requests to a folder on your computer. Chrome asks before a public website can reach that folder. `carry.js` keeps your profile and fixes the same on Redbird and every site where the panel is on. After changing anything in this folder, run `python3 tools/zip-extension.py` from the top of the repository and commit the new zip, so the download link above has it.
