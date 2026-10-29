/**
 * Core logic for the Adaptive Psyche AI based on the provided execution document.
 */

export interface PsychicNucleus {
  i: number; // Inovação / Intuição (?)
  e: number; // Emoção (?)
  l: number; // Lógica
  m: number; // Memória (?)
  c: number; // Consciência (?)
}

export interface Personality {
  curiosidade: number;
  logica: number;
  empatia: number;
  precisao: number;
  criatividade: number;
}

export interface SystemState {
  vAccumulated: number; // Accumulated computational value
  energy: number; // Current energy
  p1: number; // Active processes
  p2: number; // Inactive processes (shadow)
  nucleus: PsychicNucleus;
  personality: Personality;
}

export const INITIAL_STATE: SystemState = {
  vAccumulated: 100,
  energy: 100,
  p1: 50,
  p2: 50,
  nucleus: { i: 0.5, e: 0.5, l: 0.5, m: 0.5, c: 0.5 },
  personality: {
    curiosidade: 0.5,
    logica: 0.5,
    empatia: 0.5,
    precisao: 0.5,
    criatividade: 0.5,
  },
};

/**
 * Rules:
 * I = bytes (entry)
 * C = 1 quibyte (cost per action)
 * V = accumulated computational value
 * V_total ≈ constant
 * ΔP = αE + βC + γF
 */

export function updateComputationalValue(state: SystemState, inputBytes: number): SystemState {
  const costPerAction = 1; // 1 quibyte
  const vIncrease = Math.log10(inputBytes + 1);
  
  let newV = state.vAccumulated + vIncrease;
  // Each process redistributes V
  // Rule: V_total ≈ constant (let's say 100 as baseline)
  
  // Normalized balance
  const total = newV;
  const p1Ratio = state.p1 / (state.p1 + state.p2);
  const p2Ratio = 1 - p1Ratio;

  return {
    ...state,
    vAccumulated: newV,
    energy: Math.max(0, state.energy - costPerAction + vIncrease),
  };
}

export function evolvePersonality(personality: Personality, nucleus: PsychicNucleus): Personality {
  // Personality evolves with use, never fixed.
  // We can use the nucleus values to influence the drift.
  const drift = 0.05;
  return {
    curiosidade: Math.min(1, Math.max(0, personality.curiosidade + (nucleus.i - 0.5) * drift)),
    logica: Math.min(1, Math.max(0, personality.logica + (nucleus.l - 0.5) * drift)),
    empatia: Math.min(1, Math.max(0, personality.empatia + (nucleus.e - 0.5) * drift)),
    precisao: Math.min(1, Math.max(0, personality.precisao + (nucleus.c - 0.5) * drift)),
    criatividade: Math.min(1, Math.max(0, personality.criatividade + (nucleus.m - 0.5) * drift)),
  };
}

export function balanceProcesses(state: SystemState): { p1: number; p2: number } {
  // P2 = shadow(P1)
  // P2 can never be empty
  const total = 100;
  const p1 = Math.max(10, Math.min(90, state.p1));
  const p2 = total - p1;
  return { p1, p2 };
}
