import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export type Profile = { full_name: string | null; phone: string | null; city: string | null };

/** The signed-in shopper's own profile (name, phone, city). Null for guests. */
export function useProfile() {
  const userId = useAuthStore((s) => s.session?.user.id);
  return useQuery({
    queryKey: ['profile', userId],
    enabled: !!userId,
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase.from('profiles').select('full_name, phone, city').eq('id', userId!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}
