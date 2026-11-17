import { useEffect, useState } from 'react';

/** `value`, but only after it has stopped changing for `ms`. Used so typing in a search box doesn't query on every key. */
export function useDebounced<T>(value: T, ms = 300): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}
