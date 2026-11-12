// In-memory conversation state, keyed by phone hash — never the raw number.
// Not written to the store or disk (pending photos can be large data URLs).

import { hashPhone, normalisePhone } from "./privacy";

export function conversationKey(rawFrom: string): string {
  const n = normalisePhone(rawFrom);
  if (/^\+\d{7,15}$/.test(n)) return hashPhone(n);
  return hashPhone("unlisted:" + rawFrom.trim().toLowerCase());
}

export interface Conversation {
  awaitingUnit?: boolean;
  pendingBody?: string;
  pendingMediaUrl?: string;
  pendingMediaType?: string;
  guestTenantId?: string;
  selfHelpJobId?: string;
}

const g = globalThis as unknown as { __velocefixConv?: Map<string, Conversation> };

function map() {
  if (!g.__velocefixConv) g.__velocefixConv = new Map();
  return g.__velocefixConv;
}

export function getConversation(rawFrom: string): Conversation {
  const k = conversationKey(rawFrom);
  const cur = map().get(k);
  if (cur) return cur;
  const blank: Conversation = {};
  map().set(k, blank);
  return blank;
}

export function setConversation(rawFrom: string, next: Conversation) {
  map().set(conversationKey(rawFrom), next);
}

export function clearConversations() {
  g.__velocefixConv = new Map();
}
