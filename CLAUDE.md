# Rack

Rack is an agentic fashion marketplace for Lagos. Shoppers describe, upload or photograph an outfit, and **RackGPT** finds matching in-stock pieces from local vendors. Then they try them on and check out in one flow. Vendors get a storefront in the same app.

- Spec: "Rack — Design & Business Requirements" (Claude Docs). Requirement IDs (G1–G7, M1–M9, V1–V4) are referenced in commits and PRs.
- Design source: Figma file `gOTzlDJ0JiyyXJ7iennaUf`, page **Ready for Dev** (node `318:1331`). Screen node IDs are below.
- Public launch: **Fri Nov 20, 2026** (TestFlight + waitlist). Anything not on the MVP list waits.

## Stack

- **App:** Expo (latest SDK) + TypeScript (strict) + Expo Router (file-based routes in `app/`)
- **Styling:** NativeWind v4. Use Tailwind classes only. No inline style objects except for dynamic values such as animated or computed sizes.
- **Backend:** Supabase for Postgres, Auth, Storage and pgvector. Schema changes go through migrations in `supabase/migrations/`, never ad-hoc SQL.
- **State and data:** TanStack Query for server state; Zustand only for local UI state (cart drawer, RackGPT session).
- **Payments (Week 3):** Paystack, card + bank transfer.
- **AI (Week 2):** a vision model tags listings and uploads. Embeddings are stored in pgvector.

## Commands

```bash
npx expo start              # dev server
npx expo start --ios        # iOS simulator
npx tsc --noEmit            # typecheck. Run it before saying a task is done
npx expo lint               # lint
supabase migration new <name>
supabase db push            # apply migrations to the linked hosted project
supabase gen types typescript --linked > lib/database.types.ts
```

## Folder structure

```
app/                  Expo Router routes
  (auth)/             onboarding, login
  (shop)/             tabs: home, rackgpt, cart, orders
  store/[id].tsx      brand store
  product/[id].tsx    product detail
components/ui/        primitives (Button, Chip, Input, Sheet, Card)
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

- **Money:** store as integers in minor units (`price_minor`) with a `currency` column. The default is `NGN`. Format through `lib/format.ts` only. Never use floats for money.
- **Sizes:** the enum is `XS, S, M, L, XL, XXL`. Stock is tracked per product + size + colour (a variant).
- **Images:** product images live in the Supabase Storage bucket `product-images`. Always render them with `expo-image`.
- **Security:** row-level security is on for every table. Shoppers read public catalogue data; vendors write only their own rows.
- **Secrets:** never commit them. Use `.env` with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`. Service keys stay server-side (Edge Functions).
- **Accessibility:** tap targets at least 44pt, including size chips. Every image gets an `accessibilityLabel`. Muted text on grey cards still needs 4.5:1 contrast.
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
