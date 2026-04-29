import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Toaster } from 'react-hot-toast';
import { SignIn } from './pages/SignIn';
import { Setup } from './pages/Setup';
import { Timeline } from './pages/Timeline';
import { JoinSpace } from './pages/JoinSpace';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center font-medium text-[#8C7E7E]">Loading...</div>;
  if (!user) return <Navigate to="/signin" />;
  if (!profile) return <Navigate to="/setup" />;
  return <>{children}</>;
}

function SpaceRoute({ children }: { children: React.ReactNode }) {
  const { space, loading } = useApp();
  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-medium text-slate-500">Loading Data...</div>;
  if (!space) return <Navigate to="/join" />;
  return <>{children}</>;
}

function JoinRoute({ children }: { children: React.ReactNode }) {
  const { space, loading } = useApp();
  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-medium text-slate-500">Loading Data...</div>;
  if (space) return <Navigate to="/" />;
  return <>{children}</>;
}

function Main() {
  const { user, profile, loading: authLoading } = useAuth();

  if (authLoading) return <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center font-medium text-[#8C7E7E]">Loading...</div>;

  return (
    <Routes>
      <Route path="/signin" element={user && profile ? <Navigate to="/" /> : user ? <Navigate to="/setup" /> : <SignIn />} />
      <Route path="/setup" element={user && profile ? <Navigate to="/" /> : user ? <Setup /> : <Navigate to="/signin" />} />
      <Route path="/join" element={<ProtectedRoute><JoinRoute><JoinSpace /></JoinRoute></ProtectedRoute>} />
      <Route path="/" element={<ProtectedRoute><SpaceRoute><Timeline /></SpaceRoute></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <div className="mx-auto max-w-md w-full bg-[#FAF8F5] min-h-screen shadow-2xl overflow-x-hidden text-[#5C4E4E] font-sans border-x border-[#EFE8E0] flex flex-col">
            <Main />
            <Toaster position="bottom-center" />
          </div>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
