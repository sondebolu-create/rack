import type { LegalDoc } from './types';

/** Terms of Use. Source: "Rack — Privacy Policy & Terms of Use (Draft)". Not legal advice: have it reviewed before launch. */
export const TERMS: LegalDoc = {
  title: 'Terms of Use',
  updated: 'November, 2026',
  intro: [
    'These terms apply to everyone who uses Rack, on the web or in the app. By creating an account or making a reservation, you agree to them. Rack is operated by **Genius Studio,** Nigeria.',
  ],
  sections: [
    {
      heading: '1. What Rack is',
      blocks: [
        {
          p: 'Rack is a marketplace. Independent vendors list their own fashion items, and shoppers browse and reserve them. **Rack does not own, stock, sell or deliver the items listed.** Each sale is between the shopper and the vendor. Rack provides the platform that connects them.',
        },
      ],
    },
    {
      heading: '2. Accounts',
      blocks: [
        {
          ul: [
            'You must be at least 18 to create an account.',
            "Give accurate information and keep your password private. You're responsible for activity on your account.",
            'You can browse without an account, but reserving items and selling on Rack require one.',
            'You can close your account at any time by contacting **sondebolu@gmail.com**.',
          ],
        },
      ],
    },
    {
      heading: '3. Reservations (for shoppers)',
      blocks: [
        {
          ul: [
            '**A reservation is not a payment.** When you reserve items, Rack holds the stock and sends your reservation and delivery details to the vendor. No money changes hands on Rack.',
            'The vendor will contact you to confirm availability, the final price including any delivery cost, how to pay and how delivery or pick-up will work.',
            "**Pay only after the vendor has confirmed your order with you directly.** Rack does not hold, process or guarantee payments, and can't recover money paid to a vendor.",
            'Either you or the vendor can cancel a reservation before it is shipped. Cancelled items go back into stock.',
            'Prices are shown in Nigerian naira. Listing details, including price, size and colour, are provided by the vendor.',
            'Your rights as a consumer under the Federal Competition and Consumer Protection Act 2018 apply to your purchase from the vendor, and nothing in these terms limits them.',
          ],
        },
      ],
    },
    {
      heading: '4. Selling on Rack (for vendors)',
      blocks: [
        {
          ul: [
            '**Approval.** You must apply and be approved before you can sell. We may decline an application at our discretion.',
            '**Accurate listings.** Your photos, descriptions, sizes, colours, prices and stock must be accurate and kept up to date. Photos must show the actual item for sale.',
            "**Authentic goods.** You may only list items you have the right to sell. Counterfeits, replicas sold as originals, and items that infringe someone else's trademark or copyright are not allowed.",
            '**Fulfilling reservations.** Contact shoppers promptly after a reservation, honour the listed price unless you agree otherwise with the shopper, and keep the order status on Rack up to date.',
            "**Shopper data.** You'll receive shoppers' names, phone numbers and delivery addresses. Use them only to complete that order: no marketing, sharing or reselling. Keep them secure and delete them when you no longer need them for the order.",
            '**Your responsibilities.** You are responsible for the items you sell, delivery, returns, refunds, any taxes due on your sales, and complying with the laws that apply to your business.',
            "**Your content.** You keep ownership of the photos and text you upload. You give Rack a non-exclusive, royalty-free licence to display, resize and share them on Rack and in Rack's promotion of your shop and products, for as long as they're on Rack.",
          ],
        },
      ],
    },
    {
      heading: "5. Items that aren't allowed",
      blocks: [
        {
          p: "Counterfeit or replica goods; stolen goods; items you don't have the right to sell; anything illegal in Nigeria; and listings that are misleading, offensive or unrelated to fashion. We may remove any listing that breaks these rules.",
        },
      ],
    },
    {
      heading: '6. Acceptable use',
      blocks: [
        {
          p: "Don't misuse Rack. That includes: using someone else's account; harassing vendors or shoppers; making reservations you don't intend to complete; scraping or copying Rack's content in bulk; trying to access data or areas you're not entitled to; or interfering with how Rack works.",
        },
      ],
    },
    {
      heading: '7. Reporting',
      blocks: [
        {
          p: 'Use **Report this listing** on any product page, or email **sondebolu@gmail.com**, to tell us about a listing that breaks these terms. We review reports and may remove listings, suspend shops or close accounts.',
        },
      ],
    },
    {
      heading: '8. Fees',
      blocks: [
        {
          p: "Rack is currently free for shoppers and vendors. If we introduce fees, we'll tell vendors at least **30** days in advance, and fees will only apply after that date.",
        },
      ],
    },
    {
      heading: '9. Features that are coming soon',
      blocks: [
        {
          p: "Some features, including RackGPT and virtual try-on, are not available yet. Joining a waitlist doesn't guarantee when or whether a feature launches.",
        },
      ],
    },
    {
      heading: '10. Suspension and closing accounts',
      blocks: [
        {
          p: "We may suspend or close an account, or remove a shop or listing, if it breaks these terms, puts other users at risk, or if we're required to by law. Where reasonable, we'll tell you why and give you a chance to respond. Vendors can close their shop at any time.",
        },
      ],
    },
    {
      heading: "11. Rack's content",
      blocks: [
        { p: 'The Rack name, logo, design and software belong to Genius Studio. You may not use them without our permission.' },
      ],
    },
    {
      heading: '12. Disclaimers',
      blocks: [
        {
          p: "Rack is provided as it is. We work to keep it available and accurate, but we don't guarantee it will always be available or error-free. Vendors, not Rack, are responsible for their listings and items. We don't guarantee the quality, safety, legality or authenticity of items, or that a vendor will complete a reservation.",
        },
      ],
    },
    {
      heading: '13. Limitation of liability',
      blocks: [
        {
          p: "To the extent the law allows, Rack is not liable for losses arising from transactions between shoppers and vendors, or for indirect or consequential losses. Nothing in these terms limits liability that can't be limited by law, including under the Federal Competition and Consumer Protection Act 2018.",
        },
      ],
    },
    {
      heading: '14. Changes to these terms',
      blocks: [
        {
          p: "We may update these terms. We'll change the date at the top and, for significant changes, tell signed-in users in the app or by email before they take effect. Continuing to use Rack after that means you accept the updated terms.",
        },
      ],
    },
    {
      heading: '15. Governing law',
      blocks: [
        {
          p: 'These terms are governed by the laws of the Federal Republic of Nigeria. Disputes will be handled by the courts of **Lagos State**, unless the law gives you the right to bring a claim elsewhere.',
        },
      ],
    },
    { heading: '16. Contact', blocks: [{ p: 'Sonde Boluwatife. Email: sondebolu@gmail.com.' }] },
  ],
};
