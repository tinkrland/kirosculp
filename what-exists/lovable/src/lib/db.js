// db facade
//
// the original base44 sdk exposed three top-level surfaces:
//   - db.auth.{me, logout, redirectToLogin, isAuthenticated}
//   - db.entities.<EntityName>.{list, filter, get, create, update, delete}
//   - db.integrations.Core.UploadFile({ file })
//
// every page in this app was written against that shape. rather than
// rewrite ~30 files we keep the same surface and route every call to
// the supabase backend behind it. that way the ui stays untouched and
// the project remains portable: swap this file out and you can point
// at any other backend without touching pages.
//
// entity field names already match snake_case postgres columns, so the
// facade can pass payloads through verbatim. the only translation we
// need is sort syntax: base44 used "-created_date" / "created_date"
// where the column is actually "created_at".

import { supabase } from '@/integrations/supabase/client';

const ENTITY_TO_TABLE = {
  Artifact: 'artifacts',
  CreatorProfile: 'creator_profiles',
  MarketAccount: 'market_accounts',
  Order: 'orders',
  Collection: 'collections',
  CommissionRequest: 'commission_requests',
};

// translate base44 sort tokens into supabase order args.
// "-field" => descending, "field" => ascending.
// "created_date" is mapped to "created_at" because that's how the
// column is actually named in postgres.
function parseSort(token) {
  if (!token) return { column: 'created_at', ascending: false };
  let column = token;
  let ascending = true;
  if (token.startsWith('-')) {
    column = token.slice(1);
    ascending = false;
  }
  if (column === 'created_date') column = 'created_at';
  return { column, ascending };
}

function makeEntity(entityName) {
  const table = ENTITY_TO_TABLE[entityName];
  if (!table) {
    throw new Error(`unknown entity: ${entityName}`);
  }

  return {
    // list(sortToken?, limit?)
    async list(sortToken, limit = 100) {
      const { column, ascending } = parseSort(sortToken);
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order(column, { ascending })
        .limit(limit);
      if (error) throw error;
      return data || [];
    },

    // filter(criteria, sortToken?, limit?)
    async filter(criteria = {}, sortToken, limit = 100) {
      const { column, ascending } = parseSort(sortToken);
      let query = supabase.from(table).select('*');
      for (const [key, value] of Object.entries(criteria)) {
        // arrays mean "in"; everything else is equality.
        if (Array.isArray(value)) query = query.in(key, value);
        else query = query.eq(key, value);
      }
      query = query.order(column, { ascending }).limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async get(id) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },

    async create(payload) {
      // attach created_by for entities that have it. this is what the
      // ownership rls policies check against.
      const enriched = { ...payload };
      if (entityName === 'Artifact' || entityName === 'CreatorProfile') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          if (entityName === 'Artifact' && !enriched.created_by) enriched.created_by = user.id;
          if (entityName === 'CreatorProfile' && !enriched.user_id) enriched.user_id = user.id;
        }
      }
      const { data, error } = await supabase
        .from(table)
        .insert(enriched)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async update(id, patch) {
      // market account updates are routed through an edge function so
      // that the access key is verified server-side. the dashboard
      // stores the verified key in sessionStorage during the visit.
      if (entityName === 'MarketAccount') {
        return updateMarketAccountViaEdge(id, patch);
      }
      const { data, error } = await supabase
        .from(table)
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async delete(id) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      return true;
    },
  };
}

// market account writes use an edge function so the access key is
// verified server-side before the row is mutated. the key is stashed in
// sessionStorage by the dashboard on first verify, so the facade can
// pick it up here without changing any consumer code.
async function updateMarketAccountViaEdge(id, patch) {
  const handle = sessionStorage.getItem('market_handle');
  const key = sessionStorage.getItem('market_key');
  const { data, error } = await supabase.functions.invoke('store-update', {
    body: { id, handle, key, patch },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data?.account;
}

const entitiesProxy = new Proxy({}, {
  get(target, name) {
    if (typeof name !== 'string') return undefined;
    if (!target[name]) target[name] = makeEntity(name);
    return target[name];
  },
});

// auth surface that mirrors what AuthContext + a couple of pages call.
const auth = {
  async me() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const err = new Error('not authenticated');
      err.status = 401;
      throw err;
    }
    // surface the email at the top level the way base44 used to.
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    return {
      id: user.id,
      email: user.email,
      display_name: profile?.display_name || user.user_metadata?.display_name || null,
      avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || null,
      is_demo: profile?.is_demo || false,
    };
  },

  async isAuthenticated() {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  },

  async logout() {
    await supabase.auth.signOut();
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  },

  redirectToLogin() {
    if (typeof window !== 'undefined') {
      window.location.href = '/auth';
    }
  },
};

// file uploads. we use the 'artifacts' bucket as a generic destination
// since this is what publishartifact uses in practice. names are made
// unique with a timestamp prefix so concurrent uploads cannot collide.
const integrations = {
  Core: {
    async UploadFile({ file }) {
      if (!file) return { file_url: '' };
      const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `uploads/${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${safeName}`;
      const { error } = await supabase.storage
        .from('artifacts')
        .upload(path, file, { upsert: false, contentType: file.type || `application/${ext}` });
      if (error) throw error;
      const { data } = supabase.storage.from('artifacts').getPublicUrl(path);
      return { file_url: data.publicUrl };
    },
  },
};

export const db = { auth, entities: entitiesProxy, integrations };
export default db;
