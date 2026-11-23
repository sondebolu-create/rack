import { NotFound } from '@/components/ui/NotFound';

/** Any address that matches no screen. */
export default function NotFoundRoute() {
  return <NotFound title="Page not found" body="That page doesn’t exist." />;
}
