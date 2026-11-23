import { LegalPage } from '@/components/legal/LegalPage';
import { PRIVACY } from '@/lib/legal/privacy';

/** Privacy Policy. The text lives in lib/legal/privacy.ts. */
export default function Privacy() {
  return <LegalPage doc={PRIVACY} />;
}
