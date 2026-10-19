# Catalog – frontend

Post as your cat. Rule as an overlord.

Built on the [hydration-starter-kit](https://github.com/Synel96/hydration-starter-kit):
[Vike](https://vike.dev) + React 19 (SSR/prerender) + TypeScript, Tailwind v4
and [shadcn](https://ui.shadcn.com) primitives (Radix). State lives in
[Zustand](https://zustand.docs.pmnd.rs), API calls go through axios to the
Django backend in `backend/catalog`.

## Getting started

```sh
npm install
cp .env.example .env
npm run dev          # http://localhost:5173
```

The backend only allows CORS from `http://localhost:5173`, so the dev and
preview servers are pinned to that port (`vite.config.ts`).

## Environment

Validated with zod in `src/env.ts` (the app throws on startup if invalid):

| Variable          | Default                     | What it is                         |
| ----------------- | --------------------------- | ---------------------------------- |
| `VITE_SITE_URL`   | `http://localhost:5173`     | Public URL (canonical/OG links)    |
| `VITE_BRAND_NAME` | `Catalog`                   | Brand name in titles/footer        |
| `VITE_API_URL`    | `http://localhost:8000/api` | Django REST API, incl. `/api` path |

## Scripts

| Script                 | What it does                                        |
| ---------------------- | --------------------------------------------------- |
| `npm run dev`          | Start the dev server                                |
| `npm run build`        | Production build (client + prerendered HTML)        |
| `npm run preview`      | Build, then serve the production build locally      |
| `npm run typecheck`    | `tsc --noEmit`                                      |
| `npm run lint`         | ESLint over `.ts`/`.tsx`                            |
| `npm run lint:css`     | Stylelint over `.css`                               |
| `npm run format`       | Prettier, write mode                                |
| `npm run format:check` | Prettier, check-only (used in CI)                   |
| `npm run test`         | Vitest: unit + component tests                      |
| `npm run test:e2e`     | Playwright: browser tests on a mock-mode build      |
| `npm run check`        | Runs all of the above (typecheck → lint → test → …) |

A pre-commit hook (Husky + lint-staged) formats/lints staged files; CI
(`.github/workflows/frontend-ci.yml` at the repo root) runs the full check
list plus a build.

## Languages

English by default, Hungarian selectable (EN | HU in the navbar and the
mobile menu). Adapted from the hydration-starter-kit's `i18n` branch:

- The URL decides the language: English at the plain paths (`/street`),
  Hungarian under `/hu/` (`/hu/street`; `/en/…` also works).
  `pages/+onBeforeRoute.ts` strips the prefix and sets `pageContext.lang`,
  `pages/+lang.ts` sets `<html lang>`, and `<I18nProvider>` applies it to
  i18next before anything renders, so prerendered HTML and hydration match.
- Every page is prerendered once per language (each page's
  `+onBeforePrerenderStart.ts` calls `prerenderUrls()`); a new page needs
  the same one-line hook.
- Internal links and `navigate()` calls go through `useLocalePath()` so the
  language sticks; that includes notification links coming from the backend.
- Strings live in `src/locales/{en,hu}.json` (bundled, no fetch).
  `src/i18n/locales.test.ts` fails if the two files' keys drift apart or the
  code uses a key that isn't defined. Titles/descriptions per route are in
  `meta.*` (`pageMeta()` in `src/seo.ts`), with canonical + `hreflang`
  alternates in `pages/+Head.tsx`.
- User content (posts, comments) and the backend's own messages, including
  notification texts, aren't translated.

## Tests

- **Unit** (`*.test.ts`, Node): API error handling, media URLs, the feed
  socket URL, mock notification rules and chatter.
- **Component** (`*.test.tsx`, jsdom via `// @vitest-environment jsdom`):
  real components with Testing Library against the mock backend's own MSW
  handlers, served in Node (`src/test/mock-server.ts` resets the seed per
  test).
- **End-to-end** (`e2e/`, Playwright, desktop + Pixel 7): builds in mock
  mode, serves it and drives the real app: auth, Street, posts, reactions,
  search, whiskers, comments, live chatter and notifications.
  `npx playwright install chromium` once; set `PW_CHROMIUM_PATH` to use a
  Chromium that's already installed instead.

CI runs the Vitest suite in the `check` job and Playwright in its own
`e2e` job.

## Structure

```
e2e/                   Playwright tests
pages/                 Vike pages (filesystem routing) + layout/head
  index/  login/       Login (both `/` and `/login`)
  register/            Registration
  my-slave/            Profile + overlords
  street/              Feed of own + whiskered overlords' posts
  overlord/            Overlord profile (/overlord?id=<id>)
  _error/              404 / error page
components/
  auth/                Login & register forms, welcome slider
  myslave/             Profile card, edit dialog, skeleton
  myoverlords/         Overlord carousel, create/edit dialog, skeleton
  street/              Posts, reactions, composer, search, street navbar
  overlord/            Profile header, whisker toggle
  common/              Shared bits (form field, image viewer)
  ui/                  shadcn primitives
src/
  services/            axios client + typed API calls
  store/               Zustand stores (auth, overlords)
  types/               API response types
```

## Auth & hydration

- Auth uses HttpOnly JWT cookies set by the backend, so every request is sent
  `withCredentials`. On a `401` the axios client calls `auth/refresh/` once
  and replays the request (access tokens only live 5 minutes).
- Pages are prerendered to static HTML, so nothing user-specific is rendered
  on the server. The auth store is persisted to `localStorage` with
  `skipHydration`; `<StoreHydrator>` rehydrates it (and the Street store) after mount so the first
  client render matches the HTML (no hydration mismatch).
- `/my-slave` revalidates the session against `profiles/me/` on load and
  redirects to `/login` if it's gone.
- Toasts (sonner) replace the old snackbar. The `<Toaster>` lives in the
  layout, which survives client-side navigation, so a toast fired just before
  `navigate()` shows on the next page.

## Mock mode (no backend)

With `VITE_API_MOCKS=true` the app talks to an in-browser fake backend
([MSW](https://mswjs.io)) instead of Django, so it can be tried without a
running backend or any CORS setup:

```sh
VITE_API_MOCKS=true npm run dev
```

- Any username/password logs in; the demo user takes on the entered name.
- Profile edits, overlord create/edit and avatar uploads work and are kept
  in `sessionStorage` (per tab). Close the tab to reset.
- `src/mocks/handlers.ts` mirrors the Django endpoints; `src/mocks/db.ts`
  holds the seed data.
- API calls go to the site's own `/api/...`, where the service worker
  (`public/mockServiceWorker.js`, generated by `msw init`) answers them, so
  the CSP needs no changes. A banner shows that the data is fake.
- With the flag off, the mock code isn't included in the bundle at all.

**On Vercel:** add `VITE_API_MOCKS=true` under Settings → Environment
Variables. Tick **Production** too while there's no deployed backend
(deploys from `main` are production deploys); once there is one, keep it on
**Preview** only.

The value is inlined at build time, so changing it does nothing until the
next deploy: push a commit or use Deployments → ⋯ → Redeploy (without the
build cache). The "Demo mode" banner at the top confirms it took effect.

## Street

"Go to the Street with …" on My Slave picks the overlord the user acts as:
posts, reactions and whiskers are done in its name, and the navbar switches
to search + "Go Home". The choice is persisted like the auth store.

- The feed (`feed/posts/`) shows the user's overlords and the ones they
  whisker, and reloads when the backend's Channels socket (`/ws/feed/` on
  the API's origin, see `feedSocketUrl()` in `components/site.ts`) reports
  a new post.
- Overlord profiles live at `/overlord?id=<id>` rather than
  `/overlords/<id>`: a query parameter keeps the page prerenderable for a
  static host, since the id is only read in the browser.
- Mock mode covers all of it, including the websocket.

## Deploying

`vercel.json` deploys `dist/client` as a static site and sets security
headers. Before going live, replace `https://api.example.com` in the CSP's
`connect-src` with the real backend origin, plus its `wss://` origin for the
feed socket (and add the site to the backend's `CORS_ALLOWED_ORIGINS`), or
the browser blocks every API call.
