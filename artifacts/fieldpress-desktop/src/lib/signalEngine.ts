/**
 * FieldPress Signal Score & Credibility Calculator
 * Peer-validated metric replacement for impressions & algorithmic vanity.
 */

export interface ReactionCounts {
  signal: number;
  heat: number;
  iconic: number;
  forks: number;
}

export const SIGNAL_WEIGHTS = {
  signal: 5,   // Peer verification of factual signal
  heat: 2,     // High situational urgency or breaking status
  iconic: 10,  // Exemplary journalism or watershed local coverage
  fork: 15,    // Downstream verification fork awarded to root creator
} as const;

export function calculateSignalScore(counts: ReactionCounts): number {
  return (
    counts.signal * SIGNAL_WEIGHTS.signal +
    counts.heat * SIGNAL_WEIGHTS.heat +
    counts.iconic * SIGNAL_WEIGHTS.iconic +
    counts.forks * SIGNAL_WEIGHTS.fork
  );
}

export type BadgeType = 'frontline_scout' | 'proof_of_scene' | 'fact_anchor' | 'bureau_pillar';

export interface BadgeRuleCheck {
  isFirstOnScene?: boolean;
  hasOriginalPhoto?: boolean;
  hasCitations?: boolean;
  bureauDispatchesCount?: number;
}

export function evaluateEligibleBadges(rules: BadgeRuleCheck): BadgeType[] {
  const eligible: BadgeType[] = [];

  if (rules.isFirstOnScene) {
    eligible.push('frontline_scout');
  }
  if (rules.hasOriginalPhoto) {
    eligible.push('proof_of_scene');
  }
  if (rules.hasCitations) {
    eligible.push('fact_anchor');
  }
  if (rules.bureauDispatchesCount && rules.bureauDispatchesCount >= 25) {
    eligible.push('bureau_pillar');
  }

  return eligible;
}
