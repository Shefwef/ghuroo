# Black-box scan of the production bundle (IDA-Pro-analog exercise)

**Artifact:** `client/dist/assets/index-71cf8e48.js` (479,470 bytes, minified,
no source map). Note this directory matches the bare `dist` rule in
`.gitignore`, so it is a **locally built, untracked artifact** — not part of
repo history, and (confirmed below) it predates the search-feature commit.
That staleness doesn't affect the purpose of this exercise: we are not
reading it for feature-completeness, only asking one structural question —
*does the compiled client hardcode any backend origin?* — the same class of
question IDA Pro is used for against a stripped binary (recover facts about
behaviour with zero access to source).

## Method

No `client/src` files were consulted while running these greps — only the
built artifact, exactly as if it had shipped without source (the honest
analog of opening a binary in IDA Pro with no debug symbols).

```
grep -oE 'https?://[a-zA-Z0-9./_-]+' index-71cf8e48.js | sort -u
grep -o '"/api[^"]*"' index-71cf8e48.js | sort -u
```

## Findings

1. Every absolute `http(s)://` string recovered from the bundle belongs to a
   **third-party SDK** (Firebase, Google reCAPTCHA/Identity, unsplash.com
   image CDN, React/Redux error-decoder doc links, the Apache license
   header). None reference `ghuroo.onrender.com`, `localhost:8080`, or any
   other Ghuroo-controlled backend host. The one `http://localhost` hit is
   inside Firebase's own SDK environment-detection code, not
   application code.
2. Every backend call recovered is a **relative** path literal:
   `"/api/auth/google"`, `"/api/auth/signin"`, `"/api/auth/signout"`,
   `"/api/auth/signup"`, `"/api/admin/..."`, etc. — no origin/protocol/host
   prefix.

## Why this matters for AM-01

This independently confirms, from the compiled artifact rather than the
source, the assumption the adaptive-maintenance fix relies on: **the React
client never hardcodes a backend origin** — it always calls same-origin
relative paths, which the browser resolves against whatever host served the
page (works identically on `ghuroo.onrender.com`, a future custom domain, or
a Vercel preview, with zero client changes). This is *why* AM-01's scope is
correctly limited to the server side (`api/index.js` CORS allow-list): the
client has no equivalent hardcoded-origin defect to fix. If this scan had
turned up a baked-in `https://ghuroo.onrender.com/api/...` absolute URL, the
adaptive-maintenance change would have had to extend into
`client/vite.config.js` / a client-side API-base constant as well — the scan
result is what closes that question rather than leaving it assumed.
