/**
 * Timing konstanter for meldekort-rad animasjoner
 * Alle verdier er i millisekunder
 */

// Hvor lenge highlight-effekten varer
export const HIGHLIGHT_DURATION_MS = 3600;

// Delay før scroll starter etter navigering
export const SCROLL_DELAY_MS = 100;

// Delay før highlight vises (etter at scroll er i gang)
export const HIGHLIGHT_DELAY_MS = 800;

// Delay før fokus settes på toggle-knapp (etter highlight)
export const FOCUS_DELAY_MS = 1800;

// Total tid før highlight fjernes (highlight_delay + highlight_duration)
export const REMOVE_HIGHLIGHT_DELAY_MS = HIGHLIGHT_DELAY_MS + HIGHLIGHT_DURATION_MS;
