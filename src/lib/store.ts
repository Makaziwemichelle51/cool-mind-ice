import { useCallback, useEffect, useState } from "react";

export type CartItem = { id: string; name: string; price: number; qty: number };

export type Order = {
  id: string;
  createdAt: string;
  items: CartItem[];
  total: number;
  fulfilment: "delivery" | "collection";
  customer: { name: string; phone: string; address: string; notes: string };
  status: "pending" | "completed";
};

export type Activity = { id: string; at: string; kind: string; label: string };

export type AiStats = {
  emails: number;
  meetings: number;
  plans: number;
};

const KEYS = {
  cart: "cc.cart",
  orders: "cc.orders",
  stats: "cc.aiStats",
  activity: "cc.activity",
  settings: "cc.settings",
  schedules: "cc.schedules",
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("cc-store", { detail: key }));
}

export function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setValue(read<T>(key, fallback));
    setHydrated(true);
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (detail === key) setValue(read<T>(key, fallback));
    };
    window.addEventListener("cc-store", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("cc-store", onChange);
      window.removeEventListener("storage", onChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        write(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  return { value, setValue: update, hydrated };
}

export const useCart = () => useStored<CartItem[]>(KEYS.cart, []);
export const useOrders = () => useStored<Order[]>(KEYS.orders, []);
export const useActivity = () => useStored<Activity[]>(KEYS.activity, []);
export const useAiStats = () =>
  useStored<AiStats>(KEYS.stats, { emails: 0, meetings: 0, plans: 0 });
export const useSettings = () =>
  useStored(KEYS.settings, {
    businessName: "Cool Cubes",
    whatsapp: "27820000000",
    email: "orders@coolcubes.co.za",
    defaultTone: "professional",
    workStart: "08:00",
    workEnd: "17:00",
  });
export const useSavedSchedules = () =>
  useStored<{ id: string; at: string; title: string; content: string }[]>(
    KEYS.schedules,
    [],
  );

export function logActivity(kind: string, label: string) {
  const list = read<Activity[]>(KEYS.activity, []);
  const next = [
    { id: crypto.randomUUID(), at: new Date().toISOString(), kind, label },
    ...list,
  ].slice(0, 25);
  write(KEYS.activity, next);
}

export function bumpAiStat(field: keyof AiStats) {
  const stats = read<AiStats>(KEYS.stats, { emails: 0, meetings: 0, plans: 0 });
  write(KEYS.stats, { ...stats, [field]: stats[field] + 1 });
}
