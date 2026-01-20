import { create } from 'zustand';

interface ReservationState {
  selectedDate: string | null;
  selectedTime: string | null;
  setSelectedDate: (date: string | null) => void;
  setSelectedTime: (time: string | null) => void;
  resetSelection: () => void;
}

export const useReservationStore = create<ReservationState>((set) => ({
  selectedDate: null,
  selectedTime: null,
  setSelectedDate: (date) => set({ selectedDate: date, selectedTime: null }),
  setSelectedTime: (time) => set({ selectedTime: time }),
  resetSelection: () => set({ selectedDate: null, selectedTime: null }),
}));
