import { supabase } from './supabaseClient';
import { Message, Transaction, Holding, UserProfile, Persona, IncomeRange } from '../types';

// Expected tables (create these in Supabase):
// profiles: id (uuid, PK), user_id (uuid, FK auth.users.id), persona (text), age (integer), income (text), goals (text), display_name (text), avatar_data_url (text), country (text), currency (text), locale (text), risk_tolerance (integer), time_horizon (text), created_at (timestamptz), updated_at (timestamptz)
// chats: id (uuid, PK), user_id (uuid, FK profiles.id), created_at (timestamptz)
// chat_messages: id (uuid, PK), chat_id (uuid, FK chats.id), sender (text), text (text), created_at (timestamptz)
// transactions: id (bigint), user_id (uuid), description (text), amount (float8), type (text), date (date), created_at (timestamptz)
// holdings: id (bigint), user_id (uuid), name (text), ticker (text), value (float8), gain (float8), created_at (timestamptz)

export async function getUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

// Profile Management
export async function saveUserProfile(profile: UserProfile): Promise<boolean> {
  const userId = await getUserId();
  console.log('saveUserProfile - userId:', userId);
  if (!userId) {
    console.error('saveUserProfile - No user ID found');
    return false;
  }
  
  try {
    console.log('saveUserProfile - Attempting to upsert profile data:', {
      user_id: userId,
      persona: profile.persona,
      age: profile.age === '' ? null : Number(profile.age),
      income: profile.income || null,
      goals: profile.goals || '',
      display_name: profile.displayName || '',
      avatar_data_url: profile.avatarDataUrl || '',
      country: profile.country || '',
      currency: profile.currency || '',
      locale: profile.locale || '',
      risk_tolerance: profile.riskTolerance || 3,
      time_horizon: profile.timeHorizon || '',
      updated_at: new Date().toISOString(),
    });
    
    const { error } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        persona: profile.persona,
        age: profile.age === '' ? null : Number(profile.age),
        income: profile.income || null,
        goals: profile.goals || '',
        display_name: profile.displayName || '',
        avatar_data_url: profile.avatarDataUrl || '',
        country: profile.country || '',
        currency: profile.currency || '',
        locale: profile.locale || '',
        risk_tolerance: profile.riskTolerance || 3,
        time_horizon: profile.timeHorizon || '',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });
    
    if (error) {
      console.error('saveUserProfile error:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return false;
    }
    
    // Also update user metadata for backward compatibility
    await supabase.auth.updateUser({
      data: {
        persona: profile.persona,
        age: profile.age,
        income: profile.income,
        goals: profile.goals,
        displayName: profile.displayName,
        avatarDataUrl: profile.avatarDataUrl,
        country: profile.country,
        currency: profile.currency,
        locale: profile.locale,
        riskTolerance: profile.riskTolerance,
        timeHorizon: profile.timeHorizon,
      },
    });
    
    return true;
  } catch (error) {
    console.error('saveUserProfile error:', error);
    return false;
  }
}

export async function loadUserProfile(): Promise<UserProfile | null> {
  const userId = await getUserId();
  if (!userId) return null;
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('loadUserProfile error:', error);
      return null;
    }
    
    if (!data) return null;
    
    return {
      persona: (data.persona as Persona) || Persona.STUDENT,
      age: data.age || '',
      income: (data.income as IncomeRange) || '',
      goals: data.goals || '',
      displayName: data.display_name || '',
      avatarDataUrl: data.avatar_data_url || '',
      country: data.country || '',
      currency: data.currency || '',
      locale: data.locale || '',
      riskTolerance: data.risk_tolerance || 3,
      timeHorizon: data.time_horizon || '',
    };
  } catch (error) {
    console.error('loadUserProfile error:', error);
    return null;
  }
}

export async function createProfileIfNotExists(): Promise<boolean> {
  const userId = await getUserId();
  if (!userId) return false;
  
  try {
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (existingProfile) return true; // Profile already exists
    
    // Create default profile
    const { error } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        persona: Persona.STUDENT,
        age: null,
        income: null,
        goals: '',
        display_name: '',
        avatar_data_url: '',
        country: '',
        currency: '',
        locale: '',
        risk_tolerance: 3,
        time_horizon: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    
    if (error) {
      console.error('createProfileIfNotExists error:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('createProfileIfNotExists error:', error);
    return false;
  }
}

// Chats
export async function createChat(): Promise<string | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const { data, error } = await supabase
    .from('chats')
    .insert({ user_id: userId })
    .select('id')
    .single();
  if (error) {
    // eslint-disable-next-line no-console
    console.error('createChat error', error);
    return null;
  }
  return data.id as string;
}

export async function saveChatMessages(chatId: string, messages: Message[]): Promise<void> {
  const rows = messages.map((m) => ({ chat_id: chatId, sender: m.sender, text: m.text }));
  const { error } = await supabase.from('chat_messages').insert(rows);
  if (error) {
    // eslint-disable-next-line no-console
    console.error('saveChatMessages error', error);
  }
}

export async function loadLatestChatMessages(limit = 1): Promise<{ chatId: string | null; messages: Message[] }>{
  const userId = await getUserId();
  if (!userId) return { chatId: null, messages: [] };
  const { data: chats, error: chatErr } = await supabase
    .from('chats')
    .select('id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (chatErr || !chats || chats.length === 0) return { chatId: null, messages: [] };
  const chatId = chats[0].id as string;
  const { data: msgs, error: msgErr } = await supabase
    .from('chat_messages')
    .select('id, sender, text, created_at')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });
  if (msgErr || !msgs) return { chatId, messages: [] };
  const mapped: Message[] = msgs.map((r: any) => ({ id: String(r.id || `${r.created_at}`), text: r.text, sender: r.sender }));
  return { chatId, messages: mapped };
}

export interface ChatListItem {
  id: string;
  created_at: string;
  last_message_at: string | null;
  title?: string | null;
}

export async function listChats(): Promise<ChatListItem[]> {
  const userId = await getUserId();
  if (!userId) return [];
  const { data, error } = await supabase
    .from('chats')
    .select('id, created_at, last_message_at, title')
    .eq('user_id', userId)
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as ChatListItem[];
}

export async function loadChatMessagesById(chatId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('id, sender, text, created_at')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });
  if (error || !data) return [];
  return (data as any[]).map((r) => ({ id: String(r.id || `${r.created_at}`), text: r.text, sender: r.sender }));
}

export async function updateChatTitle(chatId: string, title: string): Promise<void> {
  await supabase.from('chats').update({ title }).eq('id', chatId);
}

export async function deleteChat(chatId: string): Promise<void> {
  await supabase.from('chats').delete().eq('id', chatId);
}

export async function clearAllChats(): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;
  await supabase.from('chats').delete().eq('user_id', userId);
}

// Taxes (transactions)
export async function upsertTransaction(tx: Transaction): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;
  const row = { ...tx, user_id: userId } as any;
  const { error } = await supabase.from('transactions').upsert(row, { onConflict: 'id' });
  if (error) {
    // eslint-disable-next-line no-console
    console.error('upsertTransaction error', error);
  }
}

export async function deleteTransaction(id: number): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;
  const { error } = await supabase.from('transactions').delete().match({ id, user_id: userId });
  if (error) {
    // eslint-disable-next-line no-console
    console.error('deleteTransaction error', error);
  }
}

export async function loadTransactions(): Promise<Transaction[]> {
  const userId = await getUserId();
  if (!userId) return [];
  const { data, error } = await supabase
    .from('transactions')
    .select('id, description, amount, type, date')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error || !data) return [];
  return data as Transaction[];
}

// Investments (holdings)
export async function upsertHolding(h: Holding): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;
  const row = { ...h, user_id: userId } as any;
  const { error } = await supabase.from('holdings').upsert(row, { onConflict: 'id' });
  if (error) {
    // eslint-disable-next-line no-console
    console.error('upsertHolding error', error);
  }
}

export async function deleteHolding(id: number): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;
  const { error } = await supabase.from('holdings').delete().match({ id, user_id: userId });
  if (error) {
    // eslint-disable-next-line no-console
    console.error('deleteHolding error', error);
  }
}

export async function loadHoldings(): Promise<Holding[]> {
  const userId = await getUserId();
  if (!userId) return [];
  const { data, error } = await supabase
    .from('holdings')
    .select('id, name, ticker, value, gain')
    .eq('user_id', userId)
    .order('id', { ascending: true });
  if (error || !data) return [];
  return data as Holding[];
}


