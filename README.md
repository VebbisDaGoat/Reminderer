# Reminderer

A reminders checklist you install like an app. It keeps notifying you every few hours until you check each item off.

## Put it online (required for install and notifications)

Browsers only allow installing and notifications on HTTPS sites, so opening index.html from your disk will not work for those. Upload the files in this folder to any static host:

- GitHub Pages: put the files at the top level of a repo, then Settings > Pages > Deploy from a branch > main, / (root).
- Netlify (app.netlify.com/drop), Cloudflare Pages or Vercel also work. No build step is needed.

## Install

- Android (Chrome): open the site, tap "Install app" in the page or the browser menu, then "Install".
- PC (Chrome or Edge): click the install icon in the address bar, or use the "Install app" button on the page.

Then open the app once and tap "Turn on notifications".

## Quiet times

In the "Quiet times" panel you can set:

- Quiet hours (default 22:00 to 08:00).
- School hours (off by default, 08:30 to 15:00, Monday to Friday). Pick the days that apply.

No notifications are sent during these times. Anything that comes due is sent as soon as they end.

## Notes

- Data is stored on the device, not on a server.
- Notifications fire while the app is open or running in the background. Chrome on an installed Android or PC app may also wake it about once an hour in the background, but the browser decides when.
- When you update the files, change the CACHE name at the top of sw.js so devices pick up the new version.
