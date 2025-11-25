import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
  role?: "user" | "admin";
  referralCode: string;
  credits: number;
  token?: string;
};

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: "coursely" }
  )
);

