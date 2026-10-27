# Rack: Claude Code kickoff prompts (Week 1)

Paste one prompt per session. Each one ends with a working app you can open on your phone, and that's your footage.

## Before Tuesday (about 30 min, done by you)

1. **Install the tools.** Node LTS, the Expo Go app on your phone, and the Supabase CLI (`npm i -g supabase` or `brew install supabase/tap/supabase`).
2. **Create a Supabase project** at supabase.com. Region: closest to Lagos (EU West is a sensible default). Copy these three values from Project Settings → API:
   - Project URL
   - anon key
   - project ref
3. **Download Cabinet Grotesk** from Fontshare (free). Keep the Regular, Medium and Bold `.otf` files handy.
4. **Make the project folder.** Create an empty folder called `rack`, put `CLAUDE.md` in it, and open Claude Code there.
5. **Connect Figma to Claude Code** (the Figma MCP) so it can read the Rack file by node ID.
6. **Start screen recording** before you paste Prompt 1 (calendar Days 5 and 14).

---

## Prompt 1 · Tuesday: scaffold + design system (step 8)

```
Read CLAUDE.md first. It's the source of truth for stack, tokens and rules.

Goal for this session: a running Expo app with Rack's design system wired in, the route skeleton in place, and a Supabase client ready. No real features yet.

1. Scaffold an Expo + TypeScript app with Expo Router in this folder (the folder holds only CLAUDE.md; move it aside temporarily if the CLI needs an empty folder, then put it back). Turn on TypeScript strict mode.

2. Set up NativeWind v4 and put the design tokens from CLAUDE.md into tailwind.config.js:
   - colors: ink, muted, inverse, surface, strong, line, primary, primary-hover, card, danger
   - fontFamily: sans = Cabinet Grotesk (Regular), plus medium and bold variants
   - fontSize lg line height = 30
   - borderRadius md = 6
   - boxShadow sm and sm-strong
   I'll drop the Cabinet Grotesk .otf files into assets/fonts. Load them with expo-font and hold the splash screen until they're loaded.

3. Build these primitives in components/ui, each with typed props and an accessibilityLabel:
   - Button: primary (black, full width, optional trailing arrow), secondary (outline), ghost; loading and disabled states
   - Chip: size chip (S/M/L/XL), selected and disabled states, 44pt minimum tap target
   - Input: label, placeholder, helper and error text
   - Card: light grey, rounded-xl
   - Sheet: bottom sheet with a grab handle and title
   - Screen: safe-area wrapper with px-4 and an optional "Back" header with arrow

4. Create the route skeleton from CLAUDE.md:
   - (auth)/onboarding, (auth)/login
   - (shop) tabs: home, rackgpt, cart, orders
   - store/[id], product/[id]
   Each route is a placeholder that renders its screen name with the primitives. Add a floating "Ask Rackgpt" pill (black, chat icon, trailing arrow) on Home that routes to the rackgpt tab, matching Home in Figma node 318:3530.

5. Add lib/supabase.ts. It creates the client from EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY and keeps the session in AsyncStorage. Create .env.example and add .env to .gitignore.

6. Add lib/format.ts with formatPrice(minor: number, currency: 'NGN' | 'USD'). NGN shows ₦ with thousands separators and no decimals; USD shows $ with 2 decimals.

7. Add a dev-only route /dev/design that shows every token and primitive on one screen: colours, the type scale, buttons, chips, input states, a card and the sheet. I'll use it to compare against Figma and to film.

When done: run npx tsc --noEmit and npx expo lint, fix everything, then tell me exactly how to open it on my phone with Expo Go. List anything that didn't match Figma.

Suggested commit: "chore: scaffold Expo app + Rack design system".
```

**Before you close the session:** open `/dev/design` on your phone next to the Figma Style Guide and record 20 seconds of it.

---

## Prompt 2 · Wednesday: database + auth (step 9)

```
Read CLAUDE.md. Today: the Supabase schema with row-level security, and sign-up/login with the buyer/seller choice (requirement M1). Link the CLI to my hosted project. I'll paste the project ref when you ask.

1. Write a migration with these tables (uuid primary keys, created_at default now()):
   - profiles: id (references auth.users), full_name, avatar_url, role ('buyer' | 'vendor'), city default 'Lagos'
   - vendors: id, owner_id → profiles, name, slug (unique), logo_url, about, city, area (e.g. Lekki), is_live boolean default false
   - products: id, vendor_id, name, description, category ('shirt' | 'gown' | 'dress' | 'buba' | 'agbada' | 'trousers' | 'skirt' | 'set' | 'accessory' | 'other'), gender ('female' | 'male' | 'unisex'), price_minor int, currency default 'NGN', is_sponsored boolean default false, is_active boolean default true
   - product_images: id, product_id, storage_path, position int
   - product_variants: id, product_id, size (enum XS–XXL), color_name, color_hex, stock int ≥ 0; unique on (product_id, size, color_name)
   - carts and cart_items: one open cart per user; cart_items hold variant_id and quantity ≥ 1
   - addresses: id, user_id, label, line1, area, city, phone, is_default
   - orders: id, user_id, vendor_id, status ('pending_payment' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'), delivery_method ('pickup' | 'doorstep'), address_id (nullable), subtotal_minor, shipping_minor, total_minor, currency, paystack_reference
   - order_items: id, order_id, variant_id, name_snapshot, price_minor_snapshot, quantity
   - order_events: id, order_id, status, note, created_at. This powers the Track Order timeline.
   Also add indexes on foreign keys and on products(vendor_id, is_active). Enable the vector extension now; RackGPT tables come in Week 2.

2. Row-level security on every table:
   - Catalogue tables (vendors where is_live, active products, images, variants): anyone signed in can read.
   - Vendors write only rows where vendors.owner_id = auth.uid() (and their products' children).
   - Carts, addresses, orders and order_items belong to their user. A vendor can read and update the status of orders for their own vendor_id.
   - order_events: inserted by the vendor or a server function only, readable by the order's buyer and vendor.

3. Add a trigger that creates a profiles row on sign-up. Create a public Storage bucket product-images, readable by anyone, writable only by vendors under their vendor_id folder.

4. Run supabase db push, then regenerate lib/database.types.ts.

5. Build auth to match Figma:
   - (auth)/onboarding (node 318:3428): dark screen over store photography, "Rack" wordmark, two choices, "I am buying" / "I am selling", each with its description text, footer "The future of fashion stores". Save the choice and continue to login.
   - (auth)/login (node 318:3450): "Log in or sign up", "Continue with Google", "Or", email input. Email uses a 6-digit one-time code (signInWithOtp, then verifyOtp) with a code-entry step. Google uses Supabase OAuth with expo-web-browser and a deep-link redirect. Tell me exactly what I need to set up in Google Cloud and in the Supabase dashboard, step by step.
   - After sign-in, write the chosen role to profiles. Buyers land on (shop)/home. Vendors land on a placeholder vendor/home screen ("Vendor tools coming soon") for now.
   - Route guard: signed-out users can only reach (auth). Persist the session across app restarts.

6. lib/queries: typed TanStack Query hooks useProfile and useSignOut. Put a sign-out button on a temporary profile row on Home.

When done: typecheck and lint. Then give me a test script to run on my phone: sign up as a buyer by email, restart the app, confirm I'm still signed in, sign out, sign up as a vendor.

Suggested commit: "feat(M1): schema, RLS, auth with buyer/vendor onboarding".
```

**Before you close the session:** take a photo of a paper sketch of the stack: app → Supabase (auth, Postgres, storage, pgvector) → vision model → Paystack. That's Day 4's image.

---

## Prompt 3 · Thursday: seed data (step 10)

```
Read CLAUDE.md. Today: realistic seed data so Home, store and product screens have real content.

1. Create supabase/seed.sql plus a small script scripts/seed-images.ts. It uploads images from a local folder seed-images/<vendor-slug>/<product-slug>/1.jpg, 2.jpg… to the product-images bucket and writes product_images rows.
2. Seed 3 live vendors. I'll give you names, areas and logos. Use clear placeholders if I haven't yet.
3. Seed about 60 products across them, with Lagos-relevant categories (agbada, buba, gowns, shirts, sets), realistic NGN prices, 2–4 images each, and variants for S/M/L/XL with stock. Mark 2 products is_sponsored.
4. Give me a CSV template (seed-products.csv) I can fill in from vendor WhatsApp catalogues, and make the script read from it.

Typecheck, run the seed, and show me the row counts.
```

## Prompt 4 · Thursday–Friday: Home, store, product (step 11)

```
Read CLAUDE.md. Build M2, M3 and M4 against the Figma nodes in the screen map. Pull each with the Figma MCP first and rebuild it with our primitives and tokens.

- Home (318:3530):
  - search bar with filter and cart icons
  - Sponsored hero card (image with price overlay, then Brand, Dress Type, Available Sizes, Location, "Go to Product ↗")
  - "From stores near you" horizontal list
  - "Explore" masonry grid
  - floating "Ask Rackgpt" pill
  Data comes from Supabase via TanStack Query hooks.
- Brand store (318:3770 / 3874 / 3971): Back, store name, search, category tabs, 2-column product grid.
- Product detail (318:4068, 318:4165):
  - main image plus 2 thumbnails
  - "Try it on" chip (opens the AR Try On sheet, 318:4549, as UI only for now)
  - "Select size" chips, disabled when out of stock
  - "Select color" swatches
  - price, quantity stepper, Add to cart (writes cart_items)
  - "Similar Products" (same category, for now)

Add loading skeletons and empty states. Typecheck and lint. Then list where the build differs from Figma and why.

Suggested commits: "feat(M2): home feed", "feat(M3): brand store", "feat(M4): product detail + add to cart".
```

**Friday:** record home → store → product → add to cart on your phone. That's the Day 4 clip and the end of Week 1.
