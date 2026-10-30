# Release

How Bland goes live: the package and the docs site. Everything below is prepared and checked; nothing is published or deployed. `package.json` keeps `"private": true` until Godwin picks a registry (prepared 2026-10-27).

## What is ready

| Command | Does |
| --- | --- |
| `npm run build` | `dist/`: `index.js` (ES module; React, React Aria, React Stately, Floating UI and `@internationalized/*` stay imports), `index.d.ts` and one `.d.ts` per module, `index.css` (every component), `tokens.css`, `fonts.css`, `base.css` |
| `npm pack` | the tarball a registry would get. `prepack` runs the build first, so a pack or publish never ships a stale `dist/`. Holds `dist/`, `README.md`, `CHANGELOG.md`, `LICENSE`, `package.json` (about 140 kB packed, 74 files) |
| `npm run test:package` | packs, installs the tarball into a throwaway Vite + React 19 app, type-checks the app against Bland's declarations (`skipLibCheck` off), builds it and checks it in Chromium: the four stylesheets in order plus a `npm run brand` override with one extra color, Button, Badge, TextInput, Toggle, Alert and Tooltip in a light and a `data-theme="dark"` section. Fails unless the primary button takes the override's 600, Inter loads, the dark section switches, the extra's roles switch, and keyboard focus opens the tooltip. Needs the network. `-- <dir>` keeps the app there |
| `npm run docs:build` | the docs site as static files in `dist-docs/` (not committed) |
| `npm run docs:preview` | serves `dist-docs/` at http://localhost:5181 |

Package entry points (`exports`): `bland-ui` (JS and types), `bland-ui/tokens.css`, `bland-ui/fonts.css`, `bland-ui/base.css`, `bland-ui/styles.css`, `bland-ui/package.json`. `sideEffects` is `**/*.css`, so bundlers tree-shake the JS and keep the CSS imports. A new stylesheet in `src/styles/` needs both a line in the build's `cp` and an `exports` entry.

Peer dependencies are React and React DOM **19**: components take `ref` as a plain prop, which React 18 drops.

`fonts.css` `@import`s the `@fontsource` packages (dependencies of Bland), so it needs a bundler that resolves CSS imports from `node_modules`. Every mainstream one does.

## Decided (Godwin 2026-10-29)

1. **Name: `bland-ui`.** `bland` is taken on npm (someone else's 0.0.1). The product stays Bland; only the install name and import path change (`npm install bland-ui`, `import … from 'bland-ui'`, `bland-ui/tokens.css`). Renamed in package.json, the README, the docs site's import lines, the stories and the component map. A name is only held once something is published under it, so publishing 0.1.0 soon keeps it.
2. **License: MIT** (`LICENSE`, `"license": "MIT"`): anyone may use, change and share Bland if they keep the copyright notice. The fonts are SIL Open Font License, Phosphor is MIT.
3. **Docs site: public**, on Cloudflare Pages (below).
4. **Registry: public npm** follows from the name (option A). GitHub Packages would need a scoped name (`@jgodwyn/bland-ui`); a git install would work with any name.

## Published

`bland-ui` 0.1.0 went to public npm on 2026-10-30 (account `gdwn`, two-factor auth on). npm asks for a browser confirmation on each publish, which a non-interactive shell cannot wait for (it fails with EOTP): run `npm publish` in a terminal you can see, press Enter, approve in the browser. While a version is processed npm briefly shows a `0.0.0-stage` placeholder; `npm view bland-ui dist-tags` shows the real version a minute later.

## Before every release

```bash
npm run typecheck && npm run lint:css && npm test && npm run test:package
```

Move the CHANGELOG's "unreleased" heading to the version and date, then `npm version <patch|minor> --no-git-tag-version` for the next one (0.1.0 is set already), commit, and tag `v<version>`. Until 1.0, a minor may break an API; a patch never does (`CHANGELOG.md`).

## Package option A: public npm

Name and license are done. Left:

1. In `package.json`: delete `"private": true`.
2. `npm login` once (an npm account with two-factor auth).

Go live:

```bash
npm publish
```

A project installs it with `npm install bland-ui`.

## Package option B: GitHub Packages

Needs: the scoped name `@jgodwyn/bland-ui`, and a classic personal access token with `write:packages` (publishing) or `read:packages` (installing). The `repository` field is already set, which links the package to the repo.

1. In `package.json`: `"name": "@jgodwyn/bland-ui"`, delete `"private": true`, add `"publishConfig": { "registry": "https://npm.pkg.github.com" }` and a `license`.
2. Update the import lines.
3. In `~/.npmrc` (never in the repo): `//npm.pkg.github.com/:_authToken=<token with write:packages>`.

Go live:

```bash
npm publish
```

Each project then needs an `.npmrc` with `@jgodwyn:registry=https://npm.pkg.github.com` and a `read:packages` token (GitHub's npm registry asks for one even for public packages), then `npm install @jgodwyn/bland`.

## Package option C: install from the GitHub repo

Needs: the repo to stay reachable by whoever installs (SSH key or token for the private repo), and a `prepare` script. Works with the name `bland-ui` and `"private": true` (that only blocks publishing).

1. In `package.json` scripts: `"prepare": "npm run build"`. A git install installs Bland's dev dependencies and runs `prepare` before packing; `prepack` alone runs without them and fails. The cost: every `npm install` in this repo also runs the build (a few seconds).
2. Tag the release.

Go live (pushes, so only with Godwin's yes):

```bash
git tag v0.1.0 && git push origin main v0.1.0
```

A project installs it with `npm install github:JGodwyn/bland-design-system#v0.1.0`. Installs are slower (Bland's dev dependencies come along for the build). Tried 2026-10-27 on a local clone tagged v0.1.0: without `prepare` the install succeeds with no `dist/`; with it, `dist/` is built (about 10 s). npm 11 warns that `bland`'s `prepare` is not covered by `allowScripts` but runs it; if a later npm blocks unapproved scripts, the project runs `npm install-scripts approve bland` once.

## Docs site

`npm run docs:build` writes a static site to `dist-docs/`. Asset paths are relative (`base: './'`) and every route is a hash (`#/components/button`), so it works at a domain root or under a subpath with no rewrites or 404 page. Checked 2026-10-27 from a plain static server under `/bland-design-system/` (the GitHub Pages path): pages, fonts, images, no failed requests.

The site is the whole playground, Brand theme page included; anything hosted publicly shows every component and token. Host configs are kept as inert examples in `docs/hosting/`: copy one into place to use it.

### Cloudflare Pages (Godwin's pick, 2026-10-29)

The public site is the landing page at `/` and the docs at `/docs/`. Godwin designs the landing page in Figma; until it is built, `/` redirects to `/docs/` (`site/_redirects`).

- `npm run site:build` builds the docs and assembles `dist-site/`: `docs/` plus everything in `site/` (today only `_redirects`; the landing page goes there).
- `.node-version` (24) sets Node for Cloudflare's build image.
- Checked 2026-10-29 with Cloudflare's own local server (`npx wrangler pages dev dist-site`): `/` answers 302 to `/docs/`, `/docs` 308 to `/docs/`, pages, fonts and images load, no failed requests.
- Free plan. Public by default; Cloudflare Access (Zero Trust, free up to 50 people) can put it behind an email sign-in.

Needs from Godwin: a Cloudflare account (sign in yourself). The site is public (decided 2026-10-29), so no Access.

Go live (deploys on every push to `main` from then on): Cloudflare dashboard, Workers & Pages, Create, Pages, Connect to Git, pick `JGodwyn/bland-design-system` (private repos are fine), then:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Build command | `npm run site:build` |
| Build output directory | `dist-site` |

The site is then at `https://<project-name>.pages.dev` (a custom domain can be added in the project's settings). Cloudflare builds what is on GitHub, so local commits need a push first.

Or deploy from this Mac without Git (after `npx wrangler login` once):

```bash
npm run site:build && npx wrangler pages deploy dist-site --project-name bland
```

### Vercel

Needs: a Vercel account with GitHub connected (Hobby works with a private repo for a personal account; password protection is a paid feature).

1. Copy `docs/hosting/vercel.json` to the repo root (or enter the same build command `npm run docs:build` and output directory `dist-docs` in the project settings).
2. Import the repo at vercel.com/new: it then deploys on every push to `main`.

Go live from the command line instead (after `npx vercel link` once):

```bash
npx vercel --prod
```

### Netlify

Needs: a Netlify account (password protection is a paid feature).

1. Copy `docs/hosting/netlify.toml` to the repo root.
2. Connect the repo in Netlify (deploys on every push), or deploy from here (after `npx netlify-cli login` and `npx netlify-cli link` once):

```bash
npx netlify-cli deploy --build --prod
```

### GitHub Pages

Needs: a public repo, or GitHub Pro/Team for Pages on a private repo; the site itself is public either way. URL: `https://jgodwyn.github.io/bland-design-system/`.

1. Copy `docs/hosting/github-pages.yml` to `.github/workflows/docs.yml`.
2. Repo Settings → Pages → Source: **GitHub Actions**.

Go live (pushes, so only with Godwin's yes): commit the workflow and

```bash
git push origin main
```

It then rebuilds and deploys on every push to `main`.

## Not in 0.1.0

- The brand tool (`npm run brand`) lives in this repo, not the package: a project runs it from a Bland checkout or uses the docs site's Brand theme page. Shipping it as a `bin` is a later call.
- No CI runs the tests on push; `npm test` needs Chromium and the docs server.
