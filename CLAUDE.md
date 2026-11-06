# Rack

Rack is an agentic fashion marketplace for Lagos. Shoppers describe, upload or photograph an outfit, and **RackGPT** finds matching in-stock pieces from local vendors. Then they try them on and check out in one flow. Vendors get a storefront in the same app.

- Spec: "Rack — Design & Business Requirements" (Claude Docs). Requirement IDs (G1–G7, M1–M9, V1–V4) are referenced in commits and PRs.
- Design source: Figma file `gOTzlDJ0JiyyXJ7iennaUf`, page **Ready for Dev** (node `318:1331`). Screen node IDs are below.
- Public launch: **Fri Nov 20, 2026** (TestFlight + waitlist). Anything not on the MVP list waits.

## Stack

- **App:** Expo (latest SDK) + TypeScript (strict) + Expo Router (file-based routes in `app/`). **Rack launches as a web app first**, and iOS (Expo Go / TestFlight) is the other target. Web output is `single` (one `index.html`, client-rendered).
- **Styling:** NativeWind v4. Use Tailwind classes only. No inline style objects except for dynamic values such as animated or computed sizes.
- **Backend:** Supabase for Postgres, Auth, Storage and pgvector. Schema changes go through migrations in `supabase/migrations/`, never ad-hoc SQL.
- **State and data:** TanStack Query for server state; Zustand only for local UI state (cart drawer, RackGPT session).
- **Payments (Week 3):** Paystack, card + bank transfer.
- **AI (Week 2):** a vision model tags listings and uploads. Embeddings are stored in pgvector.

## Commands

```bash
npx expo start              # dev server
npx expo start --ios        # iOS simulator
npx expo start --web        # browser (use this to check every screen, see Platforms)
npm run web:build           # regenerate public/index.html + manifest from theme/tokens.js, then export to dist/
npx tsc --noEmit            # typecheck. Run it before saying a task is done
npx expo lint               # lint
supabase migration new <name>
supabase db push            # apply migrations to the linked hosted project
supabase gen types typescript --linked > lib/database.types.ts
```

## Folder structure

```
app/                  Expo Router routes
  (shopper)/          everything a shopper sees. Its layout wraps it in AppFrame (phone width, centred)
    (auth)/           onboarding, login
    (shop)/           tabs: home, rackgpt, cart, orders
    store/[id].tsx    brand store
    product/[id].tsx  product detail
    checkout, review, order/[id]
  (vendor)/           future vendor area: full width, built on SidebarLayout, outside AppFrame
  dev/                dev-only screens (design reference, SidebarLayout demo)
public/               web only: index.html + manifest.webmanifest (generated, commit them), icons/
scripts/              generate-web-files.js (theme colours -> public/)
components/ui/        primitives (Button, Chip, Input, Sheet, Card, AppFrame, SidebarLayout, KeyboardAvoid)
components/<feature>/ feature components (home, product, rackgpt, checkout)
lib/                  supabase client, queries, types, utils
supabase/migrations/  SQL migrations
supabase/seed.sql     seed vendors and products
assets/fonts/         Cabinet Grotesk
```

## Design tokens (from Figma variables, do not invent new ones)

The UI is monochrome, so product photography carries the colour. Primary buttons are near-black, full width, with a trailing arrow.

| Token | Value | Tailwind name |
|---|---|---|
| color-text | `#09090b` | `text-ink` |
| color-text-muted / icon-muted | `#71717a` | `text-muted` |
| color-text-inverse | `#f3f4f6` | `text-inverse` |
| color-bg | `#ffffff` | `bg-surface` |
| color-bg-strong / border | `#e4e4e7` | `bg-strong`, `border-line` |
| color-bg-primary / icon / border-primary | `#18181b` | `bg-primary`, `border-primary` |
| color-text-primary-hover | `#27272a` | `bg-primary-hover` |
| color-icon-error | `#dc2626` | `text-danger` |
| card background (light grey) | `#f4f4f5` | `bg-card` (zinc-100, matches the grey cards in Figma) |

**Type:** Cabinet Grotesk (Regular 400, Medium 500, Bold 700). The scale is Tailwind's default sizes and line heights: xs 12/16, sm 14/20, base 16/24, lg 18/30 (the Figma value; override Tailwind's 28), xl 20/28, 2xl 24/32. Most UI text is `text-sm`. Prices and product names use `font-medium`.

**Spacing:** 2, 8, 12, 16, 36 appear in Figma. Use Tailwind's 4px scale (`0.5`, `2`, `3`, `4`, `9`). Screen side padding is `px-4` (16).

**Radius:** buttons `rounded-md` (6). Chips and pills `rounded-full`. Image cards `rounded-xl`.

**Shadows:** use sparingly.
- `shadow-sm`: `0 1px 2px #1018280D`
- `shadow-sm-strong`: `0 1px 3px #1018281A, 0 1px 2px -1px #0000001A`

Ignore the stray template colours on the checkout frame (`Primary/200 #FA9874`, `Secondary/100 #B6D8FF`, the `Grey/*` scale). They aren't part of Rack's look.

## Screen map (Figma node IDs)

Pull a screen with the Figma MCP (`get_design_context`) before building it. Treat the output as a reference and rebuild it with our components and tokens.

| Screen | Node(s) | Req |
|---|---|---|
| Onboarding, "I am buying / I am selling" | `318:3428` | M1 |
| Log in / sign up (Google + email) | `318:3450` | M1 |
| Home | `318:3530` | M2 |
| Brand store (Fashion Nova) | `318:3770`, `318:3874`, `318:3971` | M3 |
| Product detail | `318:4068`, with quantity `318:4165` | M4 |
| AR Try On sheet | `318:4549` | M5 |
| Try-on camera / result | `318:4681`, `318:4736` | M5 |
| Cart | `318:4264` | M6 |
| Checkout | `318:4303`, `318:4342`; address modal `318:4511` | M7 |
| Review order | `318:4386` | M8 |
| Order confirmed | `318:4474` | M8 |
| Track order | `318:4429` | M9 |
| RackGPT: empty, typing, attachment | `318:1332`, `318:1872`, `318:2424` | G1 |
| RackGPT: analyzing | `318:2975` | G2 |
| RackGPT: results, added | `318:3038`, `318:3111` | G3, G4 |

## Rules

- **Platforms:** every new screen must work on iOS **and in a mobile browser** (390px wide). Vendor screens must also work at desktop width (1440px) using `SidebarLayout`. Shopper screens stay at phone width inside `AppFrame` on every device; do not design a desktop layout for them yet. Before saying a screen is done, open it with `npx expo start --web` at 390px (and 1440px for vendor screens) and check the console is clean.
  - **Native-only APIs need a web fallback.** That includes `expo-camera`, `expo-image-picker`, `Linking.openSettings`, `Alert`, `BackHandler`, `KeyboardAvoidingView`, haptics and anything iOS-only like `accessibilityElementsHidden` or `automaticallyAdjustKeyboardInsets`. Use a `.web.ts(x)` file when behaviour differs (see `pickPhoto.web.ts`, `KeyboardAvoid.web.tsx`), and `Platform.select`/`Platform.OS` only for copy or one-line differences. The `.web` file must export the same API.
  - **Photos:** go through `pickPhoto`. On web it is a file input, and browsers only open it from inside a tap, so call it straight from the press handler with no `await` first. The live camera needs HTTPS (localhost is fine); `CameraStep` falls back to Upload without it.
  - **No Pressable inside a Pressable.** It is a button inside a button in HTML, and breaks keyboard and screen-reader use. Make the container a View and give it separate pressable parts.
  - **Don't put padding or margin classes on `SafeAreaView`.** On web it writes inline padding that overrides them. Put them on a child View (see `Screen`).
  - **Hide what is behind an overlay with `aria-hidden`** as well as the native props.
  - Every screen sets its browser tab title: `Screen` and `FlowScreen` do it from `accessibilityLabel`/`title`, others call `usePageTitle`.
  - Hover states use existing tokens only (`hover:bg-primary-hover`, `hover:bg-card`).

- **Money:** store as integers in minor units (`price_minor`) with a `currency` column. The default is `NGN`. Format through `lib/format.ts` only. Never use floats for money.
- **Sizes:** the enum is `XS, S, M, L, XL, XXL`. Stock is tracked per product + size + colour (a variant).
- **Images:** product images live in the Supabase Storage bucket `product-images`. Always render them with `expo-image`.
- **Security:** row-level security is on for every table. Shoppers read public catalogue data; vendors write only their own rows.
- **Secrets:** never commit them. Use `.env` with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`. Service keys stay server-side (Edge Functions).
- **Accessibility:** tap targets at least 44pt, including size chips. Every image gets an `accessibilityLabel`. Text needs 4.5:1 contrast.
  - `text-muted` (`#71717a`) passes on `bg-surface` (4.83:1) but **fails on `bg-card` (4.40:1) and `bg-strong` (3.81:1)**. On those backgrounds use `text-primary-hover` (13.6:1 on card) for secondary text, or `text-ink`. Never `text-muted`.
  - Known exception: input placeholders on `bg-card` (home search, RackGPT composer) use `text-muted` at 4.40:1, because a darker colour reads as typed text. Revisit if we add a `placeholder` token.
  - `text-disabled` (`#a1a1aa`, about 2.3-2.6:1) is for inactive or out-of-stock states only, never for information the shopper needs. Give the control an `accessibilityLabel` that says what is unavailable.
  - White text on a photo needs a dark scrim behind it (`bg-ink/50` or darker), not a pale translucent one.
  - **Flag contrast fixes, don't apply them.** The substitutions above (`text-primary-hover` for `text-muted` on grey) are the only automatic ones. If any other Figma colour pair fails 4.5:1, keep Figma's colours, and list it in the summary with the node ID, the pair, the ratio and the fix you suggest. The user decides.
- **Copy:** use the Figma copy as written. "Rack" is the brand; "Ask Rackgpt" is the floating button label.
- **Scope:** one feature per session. When done, typecheck, summarise what changed, list anything skipped, and suggest a commit message that cites the requirement ID.
- **Ask first:** stop and ask before adding a new dependency, changing the schema outside a migration, or building anything not in the MVP.

## MVP scope (until Nov 20)

**In:**
- G1–G7 (RackGPT)
- M1–M4 and M6–M9
- M5 as a v0 (try-on on an uploaded photo)
- V2 and V3 (listing + order status via a simple admin)
- Paystack

**Out:**
- Live in-app camera for RackGPT
- Full AR with body tracking
- Vendor analytics
- Self-serve vendor onboarding
- Self-serve sponsored placements
