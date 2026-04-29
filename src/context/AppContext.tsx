import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { Space, subscribeToUserSpaces, subscribeToEvents, Event, getUserProfile, UserProfile } from '../lib/api';

interface AppContextType {
  space: Space | null;
  events: Event[];
  partnerProfile: UserProfile | null;
  loading: boolean;
  setSpace: (space: Space | null) => void;
  loadSpace: () => void;
}

const AppContext = createContext<AppContextType>({ space: null, events: [], partnerProfile: null, loading: true, setSpace: () => {}, loadSpace: () => {} });

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [space, setSpace] = useState<Space | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [partnerProfile, setPartnerProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // We actually don't need loadSpace anymore as it's real-time, 
  // but keep it to satisfy interface just in case.
  const loadSpace = () => {};

  useEffect(() => {
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
    <AppContext.Provider value={{ space, events, partnerProfile, loading, setSpace, loadSpace }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
