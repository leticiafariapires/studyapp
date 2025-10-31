// Temporary component to fix missing user profile
// This can be deleted after all users have profiles

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ProfileFixer() {
  const [fixed, setFixed] = useState(false);

  useEffect(() => {
    const fixProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      // Check if profile exists
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      // If profile doesn't exist, create it
      if (!profile) {
        const { error } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            name: user.email?.split('@')[0] || 'Usuário',
            prefs: {},
          });

        if (!error) {
          setFixed(true);
          console.log('Profile created successfully');
        }
      }
    };

    fixProfile();
  }, []);

  return null;
}
