# Redbird panel on any site

This Chrome extension opens the workshop panel on the site you are on, so you can build and try adapters on real websites like NYTimes, not just on Redbird. It is the same panel as on Redbird, with the same adapters and AI, so there is no API key to set up.

## Install

1. Download [redbird-panel-extension.zip](https://redbird-workshop.vercel.app/workshop/redbird-panel-extension.zip) and unzip it.
2. In Chrome, go to `chrome://extensions` and turn on **Developer mode** (top right).
3. Click **Load unpacked** and choose the unzipped `redbird-panel-extension` folder.
4. Click the puzzle piece next to the address bar and pin **Redbird workshop panel**.

This only works in Chrome on a computer, not on phones.

## Use it

- Open any site and click the Redbird button. The page loads again with the panel on the left, and the button says "on".
- Your profile, saved fixes, your own adapter and the adapters you had on in Redbird come with you. For example, you can build a fix on Redbird, then open NYTimes and click the button to see what it does there.
- **Build your adapter** works the same way as on Redbird. What you build on a site stays on that site until you change something on Redbird again.
- The panel stays on as you go to other pages in that tab. Click the button again to turn it off, and the page loads again without it.

## What is different from Redbird

- The problems planted in Redbird, the switch that shows them and their ready-made checks only exist on Redbird, so they aren't on other sites. **Audit** still runs the toolkit's auditors and axe.
- When you build, AI gets a shortened copy of the page, like on Redbird. On a site you are signed in to, that copy can include your name, orders or messages.
- Most big sites send a Content-Security-Policy header that only lets their own servers run scripts on the page, and it would block the panel. While the panel is on in a tab, the pages in that tab load without that header. Other tabs keep it. Turn the panel off before you sign in to a site like your bank.

## Why not show the site inside the builder

We tried loading other sites in an iframe on a Redbird page first. It doesn't work for two reasons:

- Most big sites refuse to load inside another site's page. 10 of the 12 we tried refused, including NYTimes, Amazon, Target and Walmart.
- When a site does load, like Wikipedia, the browser doesn't let the Redbird page read or change what is inside it, so no adapter can run there.

The extension adds the panel to the site's own page instead, so no iframe is needed.

## Change it

`background.js` turns the panel on and off and adds it to each page, and `carry.js` copies your profile and fixes from Redbird. After changing anything in this folder, run `python3 tools/zip-extension.py` from the top of the repository and commit the new zip, so the download link above has it.
