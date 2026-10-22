# Tasks

## 1. Icons

- [x] 1.1 Commit the master (`icons-src/icon-master.jpg`) and `icons-src/render.py`, remove the old SVG sources and Chromium script, render `public/icons/*` and add the favicon link; verified by viewing the rendered icons as iOS rounded square, Android circle crop and 32px favicon
- [x] 1.2 Exclude the install-only 512px icons from the precache with a unit test (excluded files stay in the cache-name hash); verified with `npm test` and the built `dist/sw.js` listing
- [x] 1.3 Verify installability (`Page.getInstallabilityErrors` empty with a persistent context), manifest without errors, and no failed requests from a sub-path; update `README.md`
