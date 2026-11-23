import { LegalPage } from '@/components/legal/LegalPage';
import { TERMS } from '@/lib/legal/terms';

/** Terms of Use. The text lives in lib/legal/terms.ts. */
export default function Terms() {
  return <LegalPage doc={TERMS} />;
}
