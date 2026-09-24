// follows + creator-lists store
//
// dual-mode: signed-in buyers persist to supabase
// (creator_follows / creator_lists / creator_list_items), demo + guest
// users persist to localStorage so the experience works without auth.
// the api shape is identical from a caller's perspective; consumers
// just await the helpers.

import { supabase } from "@/integrations/supabase/client";

const FOLLOWS_KEY = "sculptura_follows";
const LISTS_KEY = "sculptura_creator_lists";

function readLocal(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; }
}
function writeLocal(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
  window.dispatchEvent(new Event("follows-updated"));
}
function uid() { return Math.random().toString(36).slice(2, 12); }
function token() { return Array.from(crypto.getRandomValues(new Uint8Array(12))).map((b) => b.toString(16).padStart(2, "0")).join(""); }

async function currentUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}

// --- follows ---

export async function getFollows() {
  const user = await currentUser();
  if (!user) return readLocal(FOLLOWS_KEY, []);
  const { data } = await supabase.from("creator_follows").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  return data || [];
}

export async function isFollowing(handle) {
  const list = await getFollows();
  return list.some((f) => f.creator_handle === handle);
}

export async function toggleFollow(handle) {
  const user = await currentUser();
  if (!user) {
    const list = readLocal(FOLLOWS_KEY, []);
    const idx = list.findIndex((f) => f.creator_handle === handle);
    if (idx >= 0) list.splice(idx, 1);
    else list.unshift({ id: uid(), creator_handle: handle, created_at: new Date().toISOString() });
    writeLocal(FOLLOWS_KEY, list);
    return idx < 0;
  }
  const { data: existing } = await supabase.from("creator_follows").select("id").eq("user_id", user.id).eq("creator_handle", handle).maybeSingle();
  if (existing) {
    await supabase.from("creator_follows").delete().eq("id", existing.id);
    window.dispatchEvent(new Event("follows-updated"));
    return false;
  }
  await supabase.from("creator_follows").insert({ user_id: user.id, creator_handle: handle });
  window.dispatchEvent(new Event("follows-updated"));
  return true;
}

// --- lists ---

export async function getLists() {
  const user = await currentUser();
  if (!user) {
    return readLocal(LISTS_KEY, []);
  }
  const { data: lists } = await supabase.from("creator_lists").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  if (!lists?.length) return [];
  const ids = lists.map((l) => l.id);
  const { data: items } = await supabase.from("creator_list_items").select("*").in("list_id", ids);
  const byList = {};
  (items || []).forEach((it) => { (byList[it.list_id] ||= []).push(it); });
  return lists.map((l) => ({ ...l, items: byList[l.id] || [] }));
}

export async function createList({ name, description = "", visibility = "private" }) {
  const user = await currentUser();
  if (!user) {
    const list = readLocal(LISTS_KEY, []);
    const newList = { id: uid(), name, description, visibility, share_token: token(), items: [], created_at: new Date().toISOString() };
    list.unshift(newList);
    writeLocal(LISTS_KEY, list);
    return newList;
  }
  const { data, error } = await supabase.from("creator_lists").insert({ user_id: user.id, name, description, visibility }).select().single();
  if (error) throw error;
  return { ...data, items: [] };
}

export async function updateList(id, patch) {
  const user = await currentUser();
  if (!user) {
    const list = readLocal(LISTS_KEY, []);
    const i = list.findIndex((l) => l.id === id);
    if (i >= 0) { list[i] = { ...list[i], ...patch }; writeLocal(LISTS_KEY, list); }
    return list[i];
  }
  const { data, error } = await supabase.from("creator_lists").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteList(id) {
  const user = await currentUser();
  if (!user) {
    writeLocal(LISTS_KEY, readLocal(LISTS_KEY, []).filter((l) => l.id !== id));
    return;
  }
  await supabase.from("creator_lists").delete().eq("id", id);
  window.dispatchEvent(new Event("follows-updated"));
}

export async function addCreatorToList(listId, handle, note = "") {
  const user = await currentUser();
  if (!user) {
    const list = readLocal(LISTS_KEY, []);
    const i = list.findIndex((l) => l.id === listId);
    if (i < 0) return;
    list[i].items = list[i].items || [];
    if (!list[i].items.some((it) => it.creator_handle === handle)) {
      list[i].items.unshift({ id: uid(), creator_handle: handle, note, created_at: new Date().toISOString() });
    }
    writeLocal(LISTS_KEY, list);
    return;
  }
  await supabase.from("creator_list_items").insert({ list_id: listId, creator_handle: handle, note }).select();
  window.dispatchEvent(new Event("follows-updated"));
}

export async function removeCreatorFromList(listId, handle) {
  const user = await currentUser();
  if (!user) {
    const list = readLocal(LISTS_KEY, []);
    const i = list.findIndex((l) => l.id === listId);
    if (i >= 0) {
      list[i].items = (list[i].items || []).filter((it) => it.creator_handle !== handle);
      writeLocal(LISTS_KEY, list);
    }
    return;
  }
  await supabase.from("creator_list_items").delete().eq("list_id", listId).eq("creator_handle", handle);
  window.dispatchEvent(new Event("follows-updated"));
}

// fetch a public (unlisted) list by share token. works for anon users.
export async function getListByToken(shareToken) {
  // try local first (own list shared on same device)
  const local = readLocal(LISTS_KEY, []).find((l) => l.share_token === shareToken);
  if (local) return local;
  const { data: list } = await supabase.from("creator_lists").select("*").eq("share_token", shareToken).maybeSingle();
  if (!list) return null;
  const { data: items } = await supabase.from("creator_list_items").select("*").eq("list_id", list.id);
  return { ...list, items: items || [] };
}
