import { useEffect, useRef, useState, type ComponentRef, type ReactNode } from 'react';
import { View } from 'react-native';
import type { KeyboardAvoidProps } from './KeyboardAvoid';

/**
 * Web has no KeyboardAvoidingView: mobile browsers leave the layout viewport alone and shrink only the
 * visual viewport. So measure how far the keyboard overlaps this view's bottom edge and pad by that much.
 */
export function KeyboardAvoid({ children, className = 'flex-1' }: KeyboardAvoidProps & { children: ReactNode }) {
  const ref = useRef<ComponentRef<typeof View>>(null);
  const [pad, setPad] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    const el = ref.current as unknown as HTMLElement | null;
    if (!vv || !el) return;
    const update = () => {
      // The element's bottom edge doesn't move when its own padding changes, so this doesn't feed back on itself.
      const overlap = el.getBoundingClientRect().bottom - (vv.offsetTop + vv.height);
      setPad(overlap > 80 ? Math.round(overlap) : 0); // under 80px is browser chrome, not a keyboard
      if (overlap > 80) {
        requestAnimationFrame(() => (document.activeElement as HTMLElement | null)?.scrollIntoView?.({ block: 'nearest' }));
      }
    };
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    // Dynamic value, so a style object is fine here.
    <View ref={ref} className={className} style={{ paddingBottom: pad }}>
      {children}
    </View>
  );
}
