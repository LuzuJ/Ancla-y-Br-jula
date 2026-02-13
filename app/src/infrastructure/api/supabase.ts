import { createClient } from '@supabase/supabase-js';
import { ENV } from '@/infrastructure/config/environment';

const supabaseUrl = ENV.SUPABASE_URL;
const supabaseAnonKey = ENV.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials missing. Using offline mode.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// ============= AUTH HELPERS =============
export const authService = {
  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });
    
    if (error) throw error;
    
    // Verificar si el email necesita confirmación
    const needsConfirmation = !data.user?.email_confirmed_at;
    
    // Si necesita confirmación, cerrar la sesión que Supabase creó automáticamente
    if (needsConfirmation) {
      await supabase.auth.signOut();
      
      const confirmationError: any = new Error('Te hemos enviado un email de confirmación. Revisa tu bandeja de entrada.');
      confirmationError.emailNotConfirmed = true;
      confirmationError.email = email;
      confirmationError.isNewUser = true;
      throw confirmationError;
    }
    
    // Solo crear perfil si el email ya está confirmado (raro pero posible)
    if (data.user) {
      await supabase.from('user_profiles').insert({
        user_id: data.user.id,
        daily_check_in_streak: 0,
        favorite_exercises: [],
        preferences: {
          notifications: true,
          darkMode: true,
          soundEnabled: true
        }
      });
    }
    
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      // Detectar error de email no confirmado
      if (error.message.includes('Email not confirmed') || error.message.includes('not confirmed')) {
        const customError: any = new Error('Tu email aún no ha sido confirmado. Revisa tu bandeja de entrada.');
        customError.emailNotConfirmed = true;
        customError.email = email;
        throw customError;
      }
      throw error;
    }
    
    // Update last login
    if (data.user) {
      await supabase.from('users').update({
        last_login: new Date().toISOString()
      }).eq('id', data.user.id);
    }
    
    return data;
  },

  async resendConfirmationEmail(email: string) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email
    });
    
    if (error) throw error;
    return { success: true };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// ============= JOURNAL HELPERS =============
export const journalService = {
  async getEntries(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  async createEntry(entry: any) {
    const { data, error } = await supabase
      .from('journal_entries')
      .insert(entry)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteEntry(id: string) {
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// ============= VAULT HELPERS =============
export const vaultService = {
  async getEntries(userId: string) {
    const { data, error } = await supabase
      .from('vault_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async addEntry(entry: any) {
    const { data, error } = await supabase
      .from('vault_entries')
      .insert(entry)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteEntry(id: string) {
    const { error } = await supabase
      .from('vault_entries')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// ============= CHAT HISTORY HELPERS =============
export const chatService = {
  async saveMessage(userId: string, message: any) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        ...message
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getHistory(userId: string, limit = 100) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: true })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  async clearHistory(userId: string) {
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('user_id', userId);
    
    if (error) throw error;
  }
};

// ============= DAILY CONTENT HELPERS =============
export const contentService = {
  async getTodayContent() {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('daily_content')
      .select('*')
      .eq('date', today)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data;
  },

  async saveContent(content: any) {
    const { data, error } = await supabase
      .from('daily_content')
      .upsert(content, { onConflict: 'date' })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// ============= PROFILE HELPERS =============
export const profileService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(); // Cambiado de .single() a .maybeSingle() para manejar caso de que no exista
    
    // Solo lanzar error si es un error real, no si simplemente no existe el perfil
    if (error) throw error;
    return data; // Puede ser null si no existe
  },

  async createProfile(userId: string, name?: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        daily_check_in_streak: 0,
        favorite_exercises: [],
        preferences: {
          notifications: true,
          darkMode: true,
          soundEnabled: true
        }
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
