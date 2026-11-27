import { useEffect, useState } from "react";
import { initialStore, storeSchema, type Store } from "@/lib/kalolab";
export function useKalolab() {
  const [store, setStore] = useState<Store>(initialStore);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("kalolab-v1");
      if (raw) {
        const parsed = storeSchema.safeParse(JSON.parse(raw));
        if (parsed.success) setStore(parsed.data);
      }
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem("kalolab-v1", JSON.stringify(store));
      } catch {}
    }
  }, [store, ready]);
  return {
    store,
    setStore,
    ready,
    profile: store.accounts.find((a) => a.phone === store.session)?.profile ?? null,
  };
}
