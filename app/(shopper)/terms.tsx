import { LegalPage, LegalSection, Li, P } from '@/components/legal/LegalPage';

/** Terms of Use. PLACEHOLDER: replace the text with your own, reviewed by a Nigerian lawyer. */
export default function Terms() {
  return (
    <LegalPage title="Terms of Use" updated="[DATE]">
      <LegalSection heading="About Rack">
        <P>Rack is a marketplace where independent fashion vendors in Lagos list pieces and shoppers reserve them. [COMPANY NAME] ([REGISTERED ADDRESS]) runs it. By using Rack you agree to these terms.</P>
      </LegalSection>
      <LegalSection heading="Reservations, not payments">
        <P>While payments are off, placing an order reserves the pieces. The vendor contacts you to confirm and to arrange payment and delivery. [STATE WHEN THE ORDER IS BINDING, AND HOW A RESERVATION IS CANCELLED OR EXPIRES.]</P>
      </LegalSection>
      <LegalSection heading="Vendors">
        <P>Vendors are independent sellers, not employees or agents of Rack. They are responsible for their listings, prices, stock, delivery and any returns. [STATE RACK’S ROLE, FEES AND WHAT HAPPENS WHEN A VENDOR DOES NOT DELIVER.]</P>
      </LegalSection>
      <LegalSection heading="Your account">
        <Li>Give accurate details and keep your password safe.</Li>
        <Li>You are responsible for what happens under your account.</Li>
      </LegalSection>
      <LegalSection heading="Not allowed">
        <Li>Listing counterfeit, stolen or illegal goods.</Li>
        <Li>Misleading photos, prices or descriptions.</Li>
        <Li>Harassing others, or trying to break or misuse the service.</Li>
      </LegalSection>
      <LegalSection heading="Reporting a listing">
        <P>Use “Report this listing” on a product page. We may remove listings or accounts that break these terms.</P>
      </LegalSection>
      <LegalSection heading="Liability">
        <P>[LIMITS ON RACK’S LIABILITY, AS ALLOWED BY NIGERIAN LAW.]</P>
      </LegalSection>
      <LegalSection heading="Privacy">
        <P>How we use your personal data is in the Privacy Policy.</P>
      </LegalSection>
      <LegalSection heading="Law and changes">
        <P>These terms are governed by the laws of the Federal Republic of Nigeria. [COURTS / DISPUTE RESOLUTION.] We may update them and will change the date above when we do.</P>
      </LegalSection>
    </LegalPage>
  );
}
