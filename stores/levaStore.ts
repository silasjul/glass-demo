import { create } from 'zustand';
import { GLASS_CARD_DEFAULTS, type GlassCardConfig } from '@/config/glassCardConfig';

type LevaStore = {
  glassCard: GlassCardConfig;
  setGlassCard: (config: GlassCardConfig) => void;
};

export const useLevaStore = create<LevaStore>((set) => ({
  glassCard: GLASS_CARD_DEFAULTS,
  setGlassCard: (glassCard) => set({ glassCard }),
}));
