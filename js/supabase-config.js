/**
 * ============================================================
 * 🏛️ اتحاد طلاب تحيا مصر - محافظة المنوفية
 * Supabase Integration Config & Client Helper
 * ============================================================
 */

// ⚙️ Supabase Credentials
const SUPABASE_URL = 'https://gnselvsjtafvpkplxpeg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imduc2VsdnNqdGFmdnBrcGx4cGVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MzgzNTksImV4cCI6MjEwMDQxNDM1OX0.5Z5ioJj8vCt8i3PQKSj0xUAYBUw69rLlEhy7fDhXIPw';

// Default fallback arrays
const FALLBACK_NEWS = [];
const FALLBACK_EVENTS = [];
const FALLBACK_BOARD_MEMBERS = [
  {
    id: "b1",
    name: "مصطفي قطامش",
    title: "رئيس الاتحاد",
    role_level: 1,
    committee: "مجلس إدارة الاتحاد",
    image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    phone: "",
    linkedin: ""
  },
  {
    id: "b2",
    name: "ناصر زغلان",
    title: "نائب رئيس الاتحاد",
    role_level: 1,
    committee: "مجلس إدارة الاتحاد",
    image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    phone: "",
    linkedin: ""
  },
  {
    id: "b3",
    name: "عبدالرحمن البربري",
    title: "نائب رئيس الاتحاد",
    role_level: 1,
    committee: "مجلس إدارة الاتحاد",
    image_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    phone: "",
    linkedin: ""
  }
];
const FALLBACK_TOP_MEMBERS = [];

// LocalStorage Persistence Helpers for Demo/Offline Mode
function getLocalItems(key, fallback) {
  try {
    const data = localStorage.getItem('tmsu_' + key);
    if (!data) return fallback;
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length === 0 && Array.isArray(fallback) && fallback.length > 0) {
      return fallback;
    }
    return parsed || fallback;
  } catch (e) {
    return fallback;
  }
}

function saveLocalItems(key, items) {
  try {
    localStorage.setItem('tmsu_' + key, JSON.stringify(items));
  } catch (e) {}
}

// Initialize Supabase Client if CDN loaded & keys provided
let supabaseClient = null;
const isSupabaseConfigured = () => {
  return SUPABASE_URL && !SUPABASE_URL.includes('YOUR_SUPABASE_PROJECT_ID') && SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes('YOUR_SUPABASE_ANON_KEY');
};

function initSupabase() {
  if (typeof supabase !== 'undefined' && isSupabaseConfigured()) {
    try {
      supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log('✅ Supabase initialized successfully');
    } catch (e) {
      console.warn('⚠️ Supabase init error, using fallback state:', e);
    }
  } else {
    console.info('💡 Supabase credentials not set or SDK loading. Operating in LocalStorage fallback mode.');
  }
}

// Global API Object
window.TMSU_API = {
  isConfigured: isSupabaseConfigured,
  
  // Auth Operations
  async login(email, password) {
    if (supabaseClient) {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error || !data?.session) {
        throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التأكد من إضافة المستخدم في Supabase.');
      }
      return data;
    }
    throw new Error('تعذر الاتصال بقاعدة البيانات. التأكد من ربط حساب الأدمن في Supabase.');
  },

  async getCurrentUser() {
    if (supabaseClient) {
      try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) return user;
      } catch (e) {}
    }
    return null;
  },

  async logout() {
    if (supabaseClient) {
      await supabaseClient.auth.signOut();
    }
    localStorage.removeItem('tmsu_admin_session');
  },

  // News Operations
  async fetchNews() {
    if (supabaseClient) {
      const { data, error } = await supabaseClient.from('news').select('*').order('created_at', { ascending: false });
      if (error) {
        console.warn('Supabase news fetch error, fallback:', error);
        return getLocalItems('news', []);
      }
      return data || [];
    }
    return getLocalItems('news', []);
  },

  async addNews(newsItem) {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('news').insert([newsItem]).select();
        if (!error && data && data.length > 0) return data[0];
      } catch (e) {
        console.warn('Supabase addNews failed, using local storage fallback:', e);
      }
    }
    const news = getLocalItems('news', []);
    const newItem = { ...newsItem, id: Date.now().toString(), created_at: new Date().toISOString() };
    news.unshift(newItem);
    saveLocalItems('news', news);
    return newItem;
  },

  async updateNews(id, updatedFields) {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('news').update(updatedFields).eq('id', id).select();
        if (!error && data && data.length > 0) return data[0];
      } catch (e) {
        console.warn('Supabase updateNews failed, using local storage fallback:', e);
      }
    }
    let news = getLocalItems('news', []);
    news = news.map(item => item.id === id ? { ...item, ...updatedFields } : item);
    saveLocalItems('news', news);
  },

  async deleteNews(id) {
    if (supabaseClient) {
      try {
        const { error } = await supabaseClient.from('news').delete().eq('id', id);
        if (!error) return;
      } catch (e) {
        console.warn('Supabase deleteNews failed, using local storage fallback:', e);
      }
    }
    let news = getLocalItems('news', []);
    news = news.filter(item => item.id !== id);
    saveLocalItems('news', news);
  },

  // Events Operations
  async fetchEvents() {
    if (supabaseClient) {
      const { data, error } = await supabaseClient.from('events').select('*').order('event_date', { ascending: true });
      if (error) {
        console.warn('Supabase events fetch error, fallback:', error);
        return getLocalItems('events', []);
      }
      return data || [];
    }
    return getLocalItems('events', []);
  },

  async addEvent(eventItem) {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('events').insert([eventItem]).select();
        if (!error && data && data.length > 0) return data[0];
      } catch (e) {
        console.warn('Supabase addEvent failed, using local storage fallback:', e);
      }
    }
    const events = getLocalItems('events', []);
    const newItem = { ...eventItem, id: Date.now().toString(), created_at: new Date().toISOString() };
    events.unshift(newItem);
    saveLocalItems('events', events);
    return newItem;
  },

  async updateEvent(id, updatedFields) {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('events').update(updatedFields).eq('id', id).select();
        if (!error && data && data.length > 0) return data[0];
      } catch (e) {
        console.warn('Supabase updateEvent failed, using local storage fallback:', e);
      }
    }
    let events = getLocalItems('events', []);
    events = events.map(item => item.id === id ? { ...item, ...updatedFields } : item);
    saveLocalItems('events', events);
  },

  async deleteEvent(id) {
    if (supabaseClient) {
      try {
        const { error } = await supabaseClient.from('events').delete().eq('id', id);
        if (!error) return;
      } catch (e) {
        console.warn('Supabase deleteEvent failed, using local storage fallback:', e);
      }
    }
    let events = getLocalItems('events', []);
    events = events.filter(item => item.id !== id);
    saveLocalItems('events', events);
  },

  // Join Applications Operations
  async fetchJoinApplications() {
    if (supabaseClient) {
      const { data, error } = await supabaseClient.from('join_applications').select('*').order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    return getLocalItems('join_applications', []);
  },

  async addJoinApplication(appData) {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('join_applications').insert([appData]).select();
        if (!error && data && data.length > 0) return data[0];
      } catch (e) {
        console.warn('Supabase addJoinApplication failed, using local storage:', e);
      }
    }
    const apps = getLocalItems('join_applications', []);
    const newItem = { ...appData, id: Date.now().toString(), created_at: new Date().toISOString() };
    apps.unshift(newItem);
    saveLocalItems('join_applications', apps);
    return newItem;
  },

  async deleteJoinApplication(id) {
    if (supabaseClient) {
      try {
        const { error } = await supabaseClient.from('join_applications').delete().eq('id', id);
        if (!error) return;
      } catch (e) {
        console.warn('Supabase deleteJoinApplication failed, using local fallback:', e);
      }
    }
    let apps = getLocalItems('join_applications', []);
    apps = apps.filter(item => item.id !== id);
    saveLocalItems('join_applications', apps);
  },

  // Contact Messages Operations
  async fetchContactMessages() {
    if (supabaseClient) {
      const { data, error } = await supabaseClient.from('contact_messages').select('*').order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    return getLocalItems('contact_messages', []);
  },

  async addContactMessage(msgData) {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('contact_messages').insert([msgData]).select();
        if (!error && data && data.length > 0) return data[0];
      } catch (e) {
        console.warn('Supabase addContactMessage failed, using local storage:', e);
      }
    }
    const msgs = getLocalItems('contact_messages', []);
    const newItem = { ...msgData, id: Date.now().toString(), created_at: new Date().toISOString() };
    msgs.unshift(newItem);
    saveLocalItems('contact_messages', msgs);
    return newItem;
  },

  async deleteContactMessage(id) {
    if (supabaseClient) {
      try {
        const { error } = await supabaseClient.from('contact_messages').delete().eq('id', id);
        if (!error) return;
      } catch (e) {
        console.warn('Supabase deleteContactMessage failed, using local fallback:', e);
      }
    }
    let msgs = getLocalItems('contact_messages', []);
    msgs = msgs.filter(item => item.id !== id);
    saveLocalItems('contact_messages', msgs);
  },

  // --- 5. Board Members API (الهيكل القيادي والبورد) ---
  async fetchBoardMembers() {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('board_members').select('*').order('role_level', { ascending: true }).order('created_at', { ascending: true });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase fetchBoardMembers failed, fallback to local storage:', e);
      }
    }
    return getLocalItems('board_members', FALLBACK_BOARD_MEMBERS);
  },

  async addBoardMember(data) {
    if (supabaseClient) {
      try {
        const { data: inserted, error } = await supabaseClient.from('board_members').insert([data]).select();
        if (!error && inserted) return inserted[0];
      } catch (e) {
        console.warn('Supabase addBoardMember failed, fallback to local storage:', e);
      }
    }
    const members = getLocalItems('board_members', FALLBACK_BOARD_MEMBERS);
    const newItem = { ...data, id: Date.now().toString(), created_at: new Date().toISOString() };
    members.push(newItem);
    saveLocalItems('board_members', members);
    return newItem;
  },

  async updateBoardMember(id, data) {
    if (supabaseClient) {
      try {
        const { error } = await supabaseClient.from('board_members').update(data).eq('id', id);
        if (!error) return;
      } catch (e) {
        console.warn('Supabase updateBoardMember failed, using local fallback:', e);
      }
    }
    let members = getLocalItems('board_members', FALLBACK_BOARD_MEMBERS);
    members = members.map(m => m.id === id ? { ...m, ...data } : m);
    saveLocalItems('board_members', members);
  },

  async deleteBoardMember(id) {
    if (supabaseClient) {
      try {
        const { error } = await supabaseClient.from('board_members').delete().eq('id', id);
        if (!error) return;
      } catch (e) {
        console.warn('Supabase deleteBoardMember failed, using local fallback:', e);
      }
    }
    let members = getLocalItems('board_members', FALLBACK_BOARD_MEMBERS);
    members = members.filter(item => item.id !== id);
    saveLocalItems('board_members', members);
  },

  // Top Members (أعضاء الشهر المميزين) Operations
  async fetchTopMembers() {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('top_members').select('*').order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase top_members fetch error:', e);
      }
    }
    return getLocalItems('top_members', FALLBACK_TOP_MEMBERS);
  },

  async addTopMember(data) {
    if (supabaseClient) {
      try {
        const { data: inserted, error } = await supabaseClient.from('top_members').insert([data]).select();
        if (!error && inserted && inserted.length > 0) return inserted[0];
      } catch (e) {
        console.warn('Supabase addTopMember failed, fallback to local storage:', e);
      }
    }
    const members = getLocalItems('top_members', FALLBACK_TOP_MEMBERS);
    const newItem = { ...data, id: Date.now().toString(), created_at: new Date().toISOString() };
    members.unshift(newItem);
    saveLocalItems('top_members', members);
    return newItem;
  },

  async updateTopMember(id, data) {
    if (supabaseClient) {
      try {
        const { error } = await supabaseClient.from('top_members').update(data).eq('id', id);
        if (!error) return;
      } catch (e) {
        console.warn('Supabase updateTopMember failed, using local fallback:', e);
      }
    }
    let members = getLocalItems('top_members', FALLBACK_TOP_MEMBERS);
    members = members.map(m => m.id === id ? { ...m, ...data } : m);
    saveLocalItems('top_members', members);
  },

  async deleteTopMember(id) {
    if (supabaseClient) {
      try {
        const { error } = await supabaseClient.from('top_members').delete().eq('id', id);
        if (!error) return;
      } catch (e) {
        console.warn('Supabase deleteTopMember failed, using local storage fallback:', e);
      }
    }
    let members = getLocalItems('top_members', FALLBACK_TOP_MEMBERS);
    members = members.filter(m => m.id !== id);
    saveLocalItems('top_members', members);
  },

  // Clear all data utility
  async deleteAllData() {
    if (supabaseClient) {
      try {
        await supabaseClient.from('news').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabaseClient.from('events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabaseClient.from('join_applications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabaseClient.from('contact_messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabaseClient.from('board_members').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (e) {}
    }
    localStorage.removeItem('tmsu_news');
    localStorage.removeItem('tmsu_events');
    localStorage.removeItem('tmsu_join_applications');
    localStorage.removeItem('tmsu_contact_messages');
    localStorage.removeItem('tmsu_board_members');
  },

  // Storage Bucket File Upload
  async uploadImage(file, bucket = 'public-images') {
    if (!supabaseClient) return null;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { data, error } = await supabaseClient.storage.from(bucket).upload(fileName, file, { cacheControl: '3600', upsert: true });
      if (error) {
        console.warn('Supabase storage upload error:', error);
        return null;
      }
      const { data: publicUrlData } = supabaseClient.storage.from(bucket).getPublicUrl(fileName);
      return publicUrlData?.publicUrl || null;
    } catch (e) {
      console.warn('Storage upload exception:', e);
      return null;
    }
  },

  // Realtime Live Subscriptions
  subscribeToRealtimeChanges(callback) {
    if (supabaseClient && typeof supabaseClient.channel === 'function') {
      try {
        const channel = supabaseClient
          .channel('public-tmsu-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'join_applications' }, (payload) => {
            if (typeof callback === 'function') callback('join_applications', payload);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, (payload) => {
            if (typeof callback === 'function') callback('contact_messages', payload);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'board_members' }, (payload) => {
            if (typeof callback === 'function') callback('board_members', payload);
          })
          .subscribe();
        return channel;
      } catch (e) {
        console.warn('Realtime subscription error:', e);
      }
    }
    return null;
  }
};

// Initialize on script load
document.addEventListener('DOMContentLoaded', initSupabase);
