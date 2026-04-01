"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { ClientRecord, PricingConfigRecord } from "./types";
import { v4 as uuidv4 } from "uuid";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

interface DataStore {
  clients: ClientRecord[];
  configs: PricingConfigRecord[];
}

interface DataContextType {
  clients: ClientRecord[];
  configs: PricingConfigRecord[];
  getClient: (id: string) => ClientRecord | undefined;
  getClientBySlug: (slug: string) => ClientRecord | undefined;
  createClient: (name: string, status: ClientRecord["status"], notes?: string) => ClientRecord;
  updateClient: (id: string, updates: Partial<Pick<ClientRecord, "name" | "status" | "notes">>) => void;
  deleteClient: (id: string) => void;
  getConfigsForClient: (clientId: string) => PricingConfigRecord[];
  getActiveConfigForSlug: (slug: string) => PricingConfigRecord | null;
  createConfig: (clientId: string, config: Partial<PricingConfigRecord>) => PricingConfigRecord;
  updateConfig: (configId: string, updates: Partial<PricingConfigRecord>) => void;
  deleteConfig: (configId: string) => void;
  setActiveConfig: (configId: string) => void;
}

const DataContext = createContext<DataContextType | null>(null);

const STORAGE_KEY = "kyndly-pricing-data";

function loadStore(): DataStore {
  if (typeof window === "undefined") return { clients: [], configs: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { clients: [], configs: [] };
}

function saveStore(store: DataStore) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [configs, setConfigs] = useState<PricingConfigRecord[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const store = loadStore();
    setClients(store.clients);
    setConfigs(store.configs);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      saveStore({ clients, configs });
    }
  }, [clients, configs, loaded]);

  const getClient = useCallback(
    (id: string) => clients.find((c) => c.id === id),
    [clients]
  );

  const getClientBySlug = useCallback(
    (slug: string) => clients.find((c) => c.slug === slug),
    [clients]
  );

  const createClient = useCallback(
    (name: string, status: ClientRecord["status"], notes?: string) => {
      let slug = slugify(name);
      // Ensure unique slug
      const existing = clients.map((c) => c.slug);
      if (existing.includes(slug)) {
        slug = `${slug}-${Date.now().toString(36)}`;
      }
      const now = new Date().toISOString();
      const client: ClientRecord = {
        id: uuidv4(),
        name,
        slug,
        status,
        notes,
        createdAt: now,
        updatedAt: now,
      };
      setClients((prev) => [...prev, client]);
      return client;
    },
    [clients]
  );

  const updateClient = useCallback(
    (id: string, updates: Partial<Pick<ClientRecord, "name" | "status" | "notes">>) => {
      setClients((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, ...updates, updatedAt: new Date().toISOString() }
            : c
        )
      );
    },
    []
  );

  const deleteClient = useCallback((id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    setConfigs((prev) => prev.filter((c) => c.clientSlug !== clients.find((cl) => cl.id === id)?.slug));
  }, [clients]);

  const getConfigsForClient = useCallback(
    (clientId: string) => {
      const client = clients.find((c) => c.id === clientId);
      if (!client) return [];
      return configs.filter((c) => c.clientSlug === client.slug);
    },
    [clients, configs]
  );

  const getActiveConfigForSlug = useCallback(
    (slug: string) => {
      return configs.find((c) => c.clientSlug === slug && c.isActive) ?? null;
    },
    [configs]
  );

  const createConfig = useCallback(
    (clientId: string, partial: Partial<PricingConfigRecord>) => {
      const client = clients.find((c) => c.id === clientId);
      const now = new Date().toISOString();
      const config: PricingConfigRecord = {
        id: uuidv4(),
        clientSlug: client?.slug ?? "",
        label: partial.label ?? "Default",
        tiers: partial.tiers ?? null,
        borCommissionPmpm: partial.borCommissionPmpm ?? null,
        conciergePepm: partial.conciergePepm ?? null,
        paymentProcessingPepm: partial.paymentProcessingPepm ?? null,
        defaultMembership: partial.defaultMembership ?? null,
        defaultAdminPepm: partial.defaultAdminPepm ?? null,
        defaultMemberRatio: partial.defaultMemberRatio ?? null,
        isActive: partial.isActive ?? true,
        createdAt: now,
        updatedAt: now,
      };
      setConfigs((prev) => {
        if (config.isActive) {
          // Deactivate other configs for the same client
          const updated = prev.map((c) =>
            c.clientSlug === config.clientSlug
              ? { ...c, isActive: false, updatedAt: now }
              : c
          );
          return [...updated, config];
        }
        return [...prev, config];
      });
      return config;
    },
    [clients]
  );

  const updateConfig = useCallback(
    (configId: string, updates: Partial<PricingConfigRecord>) => {
      setConfigs((prev) =>
        prev.map((c) =>
          c.id === configId
            ? { ...c, ...updates, updatedAt: new Date().toISOString() }
            : c
        )
      );
    },
    []
  );

  const setActiveConfig = useCallback(
    (configId: string) => {
      setConfigs((prev) => {
        const target = prev.find((c) => c.id === configId);
        if (!target) return prev;
        const now = new Date().toISOString();
        return prev.map((c) =>
          c.clientSlug === target.clientSlug
            ? { ...c, isActive: c.id === configId, updatedAt: now }
            : c
        );
      });
    },
    []
  );

  const deleteConfig = useCallback((configId: string) => {
    setConfigs((prev) => prev.filter((c) => c.id !== configId));
  }, []);

  if (!loaded) return null;

  return (
    <DataContext.Provider
      value={{
        clients,
        configs,
        getClient,
        getClientBySlug,
        createClient,
        updateClient,
        deleteClient,
        getConfigsForClient,
        getActiveConfigForSlug,
        createConfig,
        updateConfig,
        deleteConfig,
        setActiveConfig,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
