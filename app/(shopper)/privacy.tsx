import { LegalPage, LegalSection, Li, P } from '@/components/legal/LegalPage';

/**
 * Privacy Policy. PLACEHOLDER: replace the text with your own. It is outlined around the Nigeria Data Protection
 * Act 2023 because Rack collects names, phone numbers and delivery addresses.
 */
export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy" updated="[DATE]">
      <LegalSection heading="Who we are">
        <P>[COMPANY NAME], [REGISTERED ADDRESS], runs Rack. We decide how your personal data is used (the “data controller”). Contact: [PRIVACY EMAIL].</P>
      </LegalSection>
      <LegalSection heading="What we collect">
        <Li>Account details: email address, password (stored hashed), and your name and phone number if you add them.</Li>
        <Li>Order details: delivery name, phone number, delivery address and city, and what you reserved or bought.</Li>
        <Li>For vendors: business name, Instagram handle, phone, city and the photos you upload.</Li>
        <Li>Usage data: which pages you open and a few actions (signing up, adding to cart, reserving), sent to PostHog under a random device id that is not linked to your account. We do not use cookies or tracking across other sites, and we ignore browsers that send Do Not Track. Our PostHog project is in PostHog’s EU cloud region, and your IP address is discarded rather than stored.</Li>
      </LegalSection>
      <LegalSection heading="Why we use it, and the legal basis">
        <Li>To create your account and run the service (contract).</Li>
        <Li>To pass your delivery name, phone number and address to the vendor you ordered from, so they can contact you and arrange delivery (contract).</Li>
        <Li>To keep Rack safe and fix problems (legitimate interests).</Li>
        <Li>To email you about features you asked to hear about, such as the waitlist (consent, which you can withdraw).</Li>
      </LegalSection>
      <LegalSection heading="Who we share it with">
        <P>Vendors, only for their own orders. Our service providers, who process data for us: [HOSTING AND DATABASE PROVIDER, SUPABASE], [PAYMENT PROVIDER, ONCE PAYMENTS ARE ON], PostHog (analytics). We do not sell personal data.</P>
      </LegalSection>
      <LegalSection heading="Transfers outside Nigeria">
        <P>Some providers store data outside Nigeria. [DESCRIBE WHERE, AND THE SAFEGUARDS YOU RELY ON UNDER THE NDPA.]</P>
      </LegalSection>
      <LegalSection heading="How long we keep it">
        <P>[RETENTION PERIODS, FOR EXAMPLE: ACCOUNT DATA UNTIL YOU DELETE YOUR ACCOUNT; ORDER RECORDS FOR [N] YEARS FOR TAX AND DISPUTES.]</P>
      </LegalSection>
      <LegalSection heading="Your rights">
        <P>Under the Nigeria Data Protection Act 2023 you can ask to see your data, correct it, delete it, restrict or object to how we use it, receive a copy, and withdraw consent. Write to [PRIVACY EMAIL]. You can also complain to the Nigeria Data Protection Commission.</P>
      </LegalSection>
      <LegalSection heading="Security">
        <P>[DESCRIBE YOUR SECURITY MEASURES.] If a breach puts your data at risk we will tell you and the Commission as the law requires.</P>
      </LegalSection>
      <LegalSection heading="Children">
        <P>Rack is not for anyone under [AGE]. [CONFIRM.]</P>
      </LegalSection>
      <LegalSection heading="Changes">
        <P>If we change this policy we will update the date above and, for big changes, tell you.</P>
      </LegalSection>
    </LegalPage>
  );
}
