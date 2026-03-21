import { create } from 'zustand'

const useThemeStore = create((set) => ({
  theme: localStorage.getItem("zentro-theme") || "coffee",
  setTheme: (theme) => {
    localStorage.setItem("zentro-theme", theme);
    set({ theme })},
})); 

export default useThemeStore 