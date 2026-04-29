import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { Space, subscribeToUserSpaces, subscribeToEvents, Event, getUserProfile, UserProfile, addEvent as persistEvent } from '../lib/api';
import { demoEvents, demoPartnerProfile, demoSpace, SHOWCASE_MODE } from '../lib/demo';

interface AppContextType {
  space: Space | null;
  events: Event[];
  partnerProfile: UserProfile | null;
  loading: boolean;
  setSpace: (space: Space | null) => void;
  loadSpace: () => void;
  createEvent: (event: Omit<Event, 'id'>) => Promise<void>;
}

const AppContext = createContext<AppContextType>({
  space: null,
  events: [],
  partnerProfile: null,
  loading: true,
  setSpace: () => {},
  loadSpace: () => {},
  createEvent: async () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [space, setSpace] = useState<Space | null>(SHOWCASE_MODE ? demoSpace : null);
  const [events, setEvents] = useState<Event[]>(SHOWCASE_MODE ? demoEvents : []);
  const [partnerProfile, setPartnerProfile] = useState<UserProfile | null>(SHOWCASE_MODE ? demoPartnerProfile : null);
  const [loading, setLoading] = useState(!SHOWCASE_MODE);

  // We actually don't need loadSpace anymore as it's real-time, 
  // but keep it to satisfy interface just in case.
  const loadSpace = () => {};

  const createEvent = async (event: Omit<Event, 'id'>) => {
    if (SHOWCASE_MODE) {
      setEvents((current) => [
        ...current,
        { ...event, id: `demo-${Date.now()}` },
      ].sort((a, b) => a.startTime - b.startTime));
      return;
    }

    if (space) {
      await persistEvent(space.id, event);
    }
  };

  useEffect(() => {
    if (SHOWCASE_MODE) {
      setSpace(demoSpace);
      setPartnerProfile(demoPartnerProfile);
      setEvents(demoEvents);
      setLoading(false);
      return;
    }

    if (!user) {
      setSpace(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeToUserSpaces(user.uid, (spaces) => {
      if (spaces.length > 0) {
        setSpace(spaces[0]);
      } else {
        setSpace(null);
      }
      setLoading(false);
    });
    return unsub;
  }, [user]);

  useEffect(() => {
    if (SHOWCASE_MODE) return;

    if (space && user) {
      const partnerId = space.members.find(id => id !== user.uid);
      if (partnerId) {
        getUserProfile(partnerId).then(p => setPartnerProfile(p));
      } else {
        setPartnerProfile(null);
      }
      
      const unsub = subscribeToEvents(space.id, (evs) => {
        setEvents(evs);
      });
      return unsub;
    } else {
      setEvents([]);
      setPartnerProfile(null);
    }
  }, [space, user]);

  return (
    <AppContext.Provider value={{ space, events, partnerProfile, loading, setSpace, loadSpace, createEvent }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
