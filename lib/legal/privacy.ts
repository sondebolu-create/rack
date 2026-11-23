import type { LegalDoc } from './types';

/** Privacy Policy. Source: "Rack — Privacy Policy & Terms of Use (Draft)". Not legal advice: have it reviewed before launch. */
export const PRIVACY: LegalDoc = {
  title: 'Privacy Policy',
  updated: 'November, 2026',
  sections: [
    {
      heading: '1. Who we are',
      blocks: [
        {
          p: 'Rack is a fashion marketplace that connects shoppers with independent fashion vendors. Rack is operated by **Genius Studio**, Nigeria ("Rack", "we", "us"). For the personal data described here, we are the data controller under the Nigeria Data Protection Act 2023 (NDPA).',
        },
        { p: 'Questions or requests about your data: **sondebolu@gmail.com**' },
      ],
    },
    {
      heading: '2. What we collect',
      blocks: [
        {
          p: '**When you browse without an account:** the items in your cart, stored on your own device, and, if you accept analytics, the anonymous usage data described in section 5.',
        },
        {
          p: '**When you create an account:** your email address and password (the password is stored only as a secure hash by our authentication provider), and optionally your name, phone number and city.',
        },
        {
          p: '**When you make a reservation:** the name, phone number and delivery address you enter, the items, sizes, colours and quantities you reserve, and the order total.',
        },
        {
          p: '**When you apply to sell:** your business name, Instagram handle, phone number, city, the categories you sell, up to three sample product photos, and any note you add.',
        },
        {
          p: '**When you run a shop:** your shop name, description, logo, banner, city and categories, and the product photos, descriptions, prices, sizes, colours and stock you upload. Shop and published product information is public.',
        },
        { p: "**When you join a waitlist:** your email address and which feature you're waiting for." },
        { p: '**When you contact us or report a listing:** the content of your message and your email address.' },
        { p: "We don't collect payment card or bank details. Rack does not process payments at this time." },
      ],
    },
    {
      heading: '3. Why we use it',
      blocks: [
        {
          table: {
            head: ['Purpose', 'Data used', 'Lawful basis (NDPA s.25)'],
            rows: [
              ['Create and secure your account', 'Email, password hash, profile details', 'Performance of our agreement with you'],
              ['Pass your reservation to the vendor', 'Delivery name, phone, address, items', 'Performance of our agreement with you'],
              ['Review vendor applications and run shops', 'Application and shop details', 'Performance of our agreement with you'],
              ['Show shops and products to shoppers', 'Shop and product information', 'Performance of our agreement with the vendor'],
              ['Tell you when a feature launches', 'Waitlist email', 'Your consent'],
              ['Understand how Rack is used and improve it', 'Anonymous analytics', 'Your consent'],
              ['Keep Rack safe, handle reports and prevent misuse', 'Account, listing and report data', 'Our legitimate interest in a safe marketplace'],
              ['Meet legal obligations', 'Any of the above, as required', 'Legal obligation'],
            ],
          },
        },
        { p: "We don't sell your personal data, and we don't use it for advertising." },
      ],
    },
    {
      heading: '4. Who we share it with',
      blocks: [
        {
          p: '**Vendors.** When you reserve items, the vendor whose items you reserved receives your delivery name, phone number and address, and the items you reserved, so they can contact you to confirm, arrange payment and deliver. Each vendor only sees the parts of an order that contain their own items. Once a vendor receives your details, they are responsible for using them only to complete your order.',
        },
        { p: '**Service providers** who process data for us under contract:' },
        {
          table: {
            head: ['Provider', 'What they do', 'Where data is held'],
            rows: [
              ['Supabase', 'Database, sign-in and file storage', 'EU region'],
              ['PostHog', 'Anonymous product analytics', 'European Union'],
              ['Vercel', 'Hosts the Rack website', 'EU'],
              ['Supabase', 'Sends sign-in and password-reset emails', 'EU'],
            ],
          },
        },
        { p: '**Authorities,** where the law requires it.' },
        {
          p: "Some of these providers store data outside Nigeria. Where they do, we rely on the transfer safeguards in Part VIII of the NDPA, such as the provider's contractual data protection commitments.",
        },
      ],
    },
    {
      heading: '5. Analytics',
      blocks: [
        {
          p: "If you accept analytics, we record which pages you open and a few actions (signing up, applying to sell, adding to cart, making a reservation, joining a waitlist) under a random identifier stored on your device. This identifier is never linked to your account, name or email. Product and order numbers are removed from page addresses before anything is sent, and PostHog is set to discard your IP address. Nothing is sent if you decline or if your browser's Do Not Track setting is on. You can change your choice at any time from **Privacy choices** in the footer or on your account screen.",
        },
      ],
    },
    {
      heading: '6. Information stored on your device',
      blocks: [
        {
          p: "Rack stores your sign-in session and your cart on your device so you stay signed in and keep your cart between visits. These are needed for Rack to work. If you accept analytics, the anonymous analytics identifier is also stored there. Clearing your browser's site data removes all of these.",
        },
      ],
    },
    {
      heading: '7. How long we keep it',
      blocks: [
        {
          ul: [
            '**Account and profile:** while your account is open, and deleted within 30 days of you closing it.',
            '**Reservations and orders:** 6 years after the order, for accounting and dispute records.',
            '**Vendor applications:** 12 months after a rejected application; for approved vendors, while the shop is open.',
            '**Shop and product content:** while the shop is open; removed within 30 days of closing it.',
            "**Waitlist emails:** until the feature launches and we've told you, or until you ask us to remove you.",
            '**Analytics events:** 12 months.',
          ],
        },
      ],
    },
    {
      heading: '8. Your rights',
      blocks: [
        { p: 'Under the NDPA you can ask us to:' },
        {
          ul: [
            'give you a copy of the personal data we hold about you;',
            "correct data that's wrong or incomplete;",
            'delete your data, where we no longer need it or you withdraw consent;',
            'restrict how we use it while a concern is being resolved;',
            'give you your data in a portable format;',
            'stop using it where we rely on our legitimate interests;',
            'withdraw your consent at any time, without affecting what we did before.',
          ],
        },
        {
          p: "Email **sondebolu@gmail.com** from the address on your account. We'll reply within 30 days. To close your account and delete its data, email the same address. If you're not satisfied with our response, you can complain to the Nigeria Data Protection Commission (ndpc.gov.ng).",
        },
      ],
    },
    {
      heading: '9. Security',
      blocks: [
        {
          p: "Data is encrypted in transit, access to our database is restricted by account-level security rules so users can only see what they're entitled to, and only authorised Rack staff can access admin tools. If a breach is likely to put your rights at risk, we'll notify the Nigeria Data Protection Commission within 72 hours of becoming aware of it, and tell you without undue delay where the risk to you is high.",
        },
      ],
    },
    {
      heading: '10. Age',
      blocks: [
        {
          p: "Rack is for people aged 18 and over. We don't knowingly collect data from anyone under 18. If you believe a minor has created an account, contact us and we'll delete it.",
        },
      ],
    },
    {
      heading: '11. Changes',
      blocks: [
        {
          p: "We'll update this page when how we handle data changes, for example when we add payments, and change the date at the top. For significant changes, we'll also tell signed-in users in the app or by email.",
        },
      ],
    },
    { heading: '12. Contact', blocks: [{ p: 'Sonde Boluwatife. Email: sondebolu@gmail.com.' }] },
  ],
};
