import React, { createContext, useState, useEffect, ReactNode, useMemo, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";
import { PlannedOutfit, PlannerEvent } from "../types/Outfit";

type PlannerContextType = {
  plannedOutfits: PlannedOutfit[];
  events: PlannerEvent[];

  // Planned outfit CRUD
  getPlannedOutfitsForDate: (date: string) => PlannedOutfit[];
  addPlannedOutfit: (date: string, outfitId?: string, photoUri?: string, note?: string) => void;
  updatePlannedOutfit: (item: PlannedOutfit) => void;
  removePlannedOutfit: (id: string) => void;

  // Events CRUD
  getEventsForDate: (date: string) => PlannerEvent[];
  addEvent: (date: string, title: string, description?: string) => void;
  removeEvent: (id: string) => void;

  // Helpers
  getDatesWithPlans: () => Set<string>;
};

export const PlannerContext = createContext<PlannerContextType | null>(null);

const PLANNED_OUTFITS_KEY = "@planned_outfits";
const EVENTS_KEY = "@planner_events";

export const PlannerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [plannedOutfits, setPlannedOutfits] = useState<PlannedOutfit[]>([]);
  const [events, setEvents] = useState<PlannerEvent[]>([]);

  // Load data on mount
  useEffect(() => {
    (async () => {
      try {
        const [outfitsJson, eventsJson] = await Promise.all([
          AsyncStorage.getItem(PLANNED_OUTFITS_KEY),
          AsyncStorage.getItem(EVENTS_KEY),
        ]);
        if (outfitsJson) setPlannedOutfits(JSON.parse(outfitsJson));
        if (eventsJson) setEvents(JSON.parse(eventsJson));
      } catch (e) {
        console.error("Error loading planner data:", e);
      }
    })();
  }, []);

  // Persist planned outfits
  useEffect(() => {
    AsyncStorage.setItem(PLANNED_OUTFITS_KEY, JSON.stringify(plannedOutfits)).catch((e) =>
      console.error("Error saving planned outfits:", e)
    );
  }, [plannedOutfits]);

  // Persist events
  useEffect(() => {
    AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events)).catch((e) =>
      console.error("Error saving events:", e)
    );
  }, [events]);

  const getPlannedOutfitsForDate = useCallback(
    (date: string) => plannedOutfits.filter((p) => p.date === date),
    [plannedOutfits]
  );

  const addPlannedOutfit = useCallback(
    (date: string, outfitId?: string, photoUri?: string, note?: string) => {
      const now = new Date().toISOString();
      const newItem: PlannedOutfit = {
        id: uuidv4(),
        date,
        outfitId,
        photoUri,
        note: note || "",
        createdAt: now,
        updatedAt: now,
      };
      setPlannedOutfits((prev) => [...prev, newItem]);
    },
    []
  );

  const updatePlannedOutfit = useCallback((item: PlannedOutfit) => {
    setPlannedOutfits((prev) =>
      prev.map((p) => (p.id === item.id ? { ...item, updatedAt: new Date().toISOString() } : p))
    );
  }, []);

  const removePlannedOutfit = useCallback((id: string) => {
    setPlannedOutfits((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const getEventsForDate = useCallback(
    (date: string) => events.filter((e) => e.date === date),
    [events]
  );

  const addEvent = useCallback((date: string, title: string, description?: string) => {
    const now = new Date().toISOString();
    const newEvent: PlannerEvent = {
      id: uuidv4(),
      date,
      title,
      description: description || "",
      createdAt: now,
    };
    setEvents((prev) => [...prev, newEvent]);
  }, []);

  const removeEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const getDatesWithPlans = useCallback(() => {
    const dates = new Set<string>();
    plannedOutfits.forEach((p) => dates.add(p.date));
    events.forEach((e) => dates.add(e.date));
    return dates;
  }, [plannedOutfits, events]);

  const value = useMemo(
    () => ({
      plannedOutfits,
      events,
      getPlannedOutfitsForDate,
      addPlannedOutfit,
      updatePlannedOutfit,
      removePlannedOutfit,
      getEventsForDate,
      addEvent,
      removeEvent,
      getDatesWithPlans,
    }),
    [
      plannedOutfits,
      events,
      getPlannedOutfitsForDate,
      addPlannedOutfit,
      updatePlannedOutfit,
      removePlannedOutfit,
      getEventsForDate,
      addEvent,
      removeEvent,
      getDatesWithPlans,
    ]
  );

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
};
