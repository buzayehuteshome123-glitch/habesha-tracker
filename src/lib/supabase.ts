import { createClient } from '@supabase/supabase-js';

const rawSupabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = ((import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key').trim();

// Sanitize URL to prevent common copy-paste errors (like adding /rest/v1 or trailing slashes)
const supabaseUrl = rawSupabaseUrl
  .trim()
  .replace(/\/rest\/v1\/?$/, '') // Remove trailing /rest/v1 or /rest/v1/
  .replace(/\/$/, ''); // Remove trailing slash

// Determine if we should use the local mock client
const isPlaceholder = 
  supabaseUrl.includes('placeholder-project') || 
  supabaseUrl.includes('your-project') || 
  !rawSupabaseUrl || 
  rawSupabaseUrl === 'MY_APP_URL' ||
  supabaseAnonKey === 'your-anon-key' ||
  supabaseAnonKey === 'placeholder-anon-key';

let supabaseClient: any;

if (isPlaceholder) {
  // --- MOCK SUPABASE CLIENT IMPLEMENTATION ---
  
  // Local storage keys
  const KEYS = {
    USERS: 'ht_mock_users',
    SESSION: 'ht_mock_session',
    DB_PREFIX: 'ht_mock_db_'
  };

  // Helper functions
  const getMockUsers = (): any[] => {
    const raw = localStorage.getItem(KEYS.USERS);
    if (!raw) {
      // Seed a default user for immediate testability
      const defaultUsers = [
        { id: 'demo-admin-id', email: 'test@example.com', password: 'Password123!' }
      ];
      localStorage.setItem(KEYS.USERS, JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return JSON.parse(raw);
  };

  const saveMockUsers = (users: any[]) => {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  };

  const getMockSession = () => {
    const raw = localStorage.getItem(KEYS.SESSION);
    return raw ? JSON.parse(raw) : null;
  };

  const setMockSession = (session: any) => {
    if (session) {
      localStorage.setItem(KEYS.SESSION, JSON.stringify(session));
    } else {
      localStorage.removeItem(KEYS.SESSION);
    }
  };

  // Auth Event Listeners
  type AuthChangeListener = (event: string, session: any) => void;
  const authListeners = new Set<AuthChangeListener>();

  const notifyAuthChange = (event: string, session: any) => {
    authListeners.forEach(cb => {
      try {
        cb(event, session);
      } catch (e) {
        console.error('Error in auth state change listener:', e);
      }
    });
  };

  // Query Builder for Local Database Mocking
  class MockQueryBuilder {
    private tableName: string;
    private filters: Array<(item: any) => boolean> = [];

    constructor(tableName: string) {
      this.tableName = tableName;
    }

    private getData(): any[] {
      const raw = localStorage.getItem(`${KEYS.DB_PREFIX}${this.tableName}`);
      return raw ? JSON.parse(raw) : [];
    }

    private saveData(data: any[]) {
      localStorage.setItem(`${KEYS.DB_PREFIX}${this.tableName}`, JSON.stringify(data));
    }

    select(fields: string = '*') {
      return this;
    }

    eq(field: string, value: any) {
      this.filters.push(item => item[field] === value);
      return this;
    }

    in(field: string, values: any[]) {
      this.filters.push(item => values.includes(item[field]));
      return this;
    }

    async maybeSingle() {
      let data = this.getData();
      for (const filter of this.filters) {
        data = data.filter(filter);
      }
      return { data: data.length > 0 ? data[0] : null, error: null };
    }

    // Support direct await on query builder instance
    async then(onfulfilled?: (value: any) => any) {
      let data = this.getData();
      for (const filter of this.filters) {
        data = data.filter(filter);
      }
      const result = { data, error: null };
      return onfulfilled ? onfulfilled(result) : result;
    }

    async upsert(items: any | any[]) {
      const arrayItems = Array.isArray(items) ? items : [items];
      let data = this.getData();
      
      for (const item of arrayItems) {
        // Match existing row by ID, or unique settings per user
        const idx = data.findIndex(d => 
          d.id === item.id || 
          (this.tableName === 'business_settings' && item.userId && d.userId === item.userId)
        );
        if (idx > -1) {
          data[idx] = { ...data[idx], ...item };
        } else {
          data.push(item);
        }
      }
      
      this.saveData(data);
      return { data: items, error: null };
    }

    async delete() {
      const self = this;
      return {
        in(field: string, values: any[]) {
          let data = self.getData();
          data = data.filter(item => !values.includes(item[field]));
          self.saveData(data);
          return Promise.resolve({ data: null, error: null });
        },
        eq(field: string, value: any) {
          let data = self.getData();
          data = data.filter(item => item[field] !== value);
          self.saveData(data);
          return Promise.resolve({ data: null, error: null });
        }
      };
    }
  }

  // Define Mock Client
  supabaseClient = {
    auth: {
      async getSession() {
        const session = getMockSession();
        return { data: { session }, error: null };
      },

      onAuthStateChange(callback: AuthChangeListener) {
        authListeners.add(callback);
        
        // Invoke immediately with current session state
        const session = getMockSession();
        setTimeout(() => {
          if (session) {
            callback('SIGNED_IN', session);
          } else {
            callback('SIGNED_OUT', null);
          }
        }, 0);

        return {
          data: {
            subscription: {
              unsubscribe() {
                authListeners.delete(callback);
              }
            }
          }
        };
      },

      async signInWithPassword({ email, password }: any) {
        const users = getMockUsers();
        const lowerEmail = email.trim().toLowerCase();
        const user = users.find(u => u.email.toLowerCase() === lowerEmail);

        if (!user || user.password !== password) {
          return { 
            data: { user: null, session: null }, 
            error: { message: 'Invalid login credentials. Mock credentials can be any newly registered user or test@example.com / Password123!' } 
          };
        }

        const session = {
          user: { id: user.id, email: user.email },
          access_token: 'mock-access-token-' + Math.random()
        };

        setMockSession(session);
        notifyAuthChange('SIGNED_IN', session);

        return { data: { user: session.user, session }, error: null };
      },

      async signUp({ email, password }: any) {
        const users = getMockUsers();
        const lowerEmail = email.trim().toLowerCase();
        const existing = users.find(u => u.email.toLowerCase() === lowerEmail);

        if (existing) {
          return { data: { user: null, session: null }, error: { message: 'An account with this email already exists.' } };
        }

        const newUser = {
          id: 'mock-user-id-' + Math.random().toString(36).substr(2, 9),
          email: lowerEmail,
          password
        };

        users.push(newUser);
        saveMockUsers(users);

        const session = {
          user: { id: newUser.id, email: newUser.email },
          access_token: 'mock-access-token-' + Math.random()
        };

        setMockSession(session);
        notifyAuthChange('SIGNED_IN', session);

        return { data: { user: session.user, session }, error: null };
      },

      async signInWithOAuth({ provider }: any) {
        const session = {
          user: { id: 'mock-google-id', email: 'google-user@example.com' },
          access_token: 'mock-google-token'
        };

        // Ensure user is registered in our mock store
        const users = getMockUsers();
        if (!users.some(u => u.email === session.user.email)) {
          users.push({ id: session.user.id, email: session.user.email, password: '' });
          saveMockUsers(users);
        }

        setMockSession(session);
        notifyAuthChange('SIGNED_IN', session);

        return { data: { user: session.user, session }, error: null };
      },

      async resetPasswordForEmail(email: string) {
        const users = getMockUsers();
        const lowerEmail = email.trim().toLowerCase();
        const user = users.find(u => u.email.toLowerCase() === lowerEmail);
        
        if (!user) {
          return { error: { message: 'No account found with this email.' } };
        }
        return { error: null };
      },

      async updateUser({ password }: any) {
        const session = getMockSession();
        if (!session || !session.user) {
          return { error: { message: 'Auth session missing.' } };
        }

        const users = getMockUsers();
        const userIdx = users.findIndex(u => u.id === session.user.id);
        if (userIdx > -1) {
          users[userIdx].password = password;
          saveMockUsers(users);
        }

        return { data: { user: session.user }, error: null };
      },

      async signOut() {
        setMockSession(null);
        notifyAuthChange('SIGNED_OUT', null);
        return { error: null };
      }
    },

    from(tableName: string) {
      return new MockQueryBuilder(tableName);
    }
  };

  console.log('💡 Supabase not configured or using placeholder credentials. Operating in Offline/LocalStorage fallback mode.');
} else {
  // Use real Supabase client
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = supabaseClient;


