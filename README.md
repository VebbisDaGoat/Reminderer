# Nudge

A reminders checklist you install like an app. It keeps notifying you every few hours until you check each item off.

## Put it online (required for install and notifications)

Browsers only allow installing and notifications on HTTPS sites, so opening index.html from your disk will not work for those. Upload this whole folder to any static host:

- Netlify: go to app.netlify.com/drop and drag the folder in.
- GitHub Pages, Cloudflare Pages or Vercel also work. No build step is needed.

## Install

- Android (Chrome): open the site, tap "Install app" in the page or the browser menu, then "Install".
- PC (Chrome or Edge): click the install icon in the address bar, or use the "Install app" button on the page.

Then open the app once and tap "Turn on notifications".

## Notes

- Data is stored on the device, not on a server.
- Notifications fire while the app is open or running in the background. Chrome on an installed Android or PC app may also wake it about once an hour in the background, but the browser decides when.
- Quiet hours (default 22:00 to 08:00) pause notifications; due items notify when quiet hours end.
