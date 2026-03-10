import { create } from 'zustand';

const useAuthStore = create((set) => ({
  // Initialize state from localStorage if it exists
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,

  // Action to log in a user
  login: (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    set({ user: userData, token });
  },

  // Action to log out a user
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null });
  }
}));

export default useAuthStore;