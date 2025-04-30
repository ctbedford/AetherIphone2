import React, { createContext, PropsWithChildren } from 'react';
import { supabase } from '@/utils/supabase';

export const SupabaseContext = createContext(supabase);
export const useSupabase = () => React.useContext(SupabaseContext);

export function SupabaseProvider({ children }: PropsWithChildren) {
  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
}
