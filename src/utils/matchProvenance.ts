import { MatchReason } from '../types/school';

export interface FormattedMatchExplanation {
  category: 'preference' | 'fact' | 'confirmation';
  tag: 'Matches your preference' | 'Verified factual information' | 'Information requiring confirmation';
  prefixLabel: string;
  tagBadgeClass: string;
  tagIconClass: string;
  title: string;
  detail?: string;
  actionAdvice?: string;
}

/**
 * Formats match reasons to clearly distinguish between:
 * 1. matched from user preferences (e.g., "Matches your preference: Montessori")
 * 2. verified factual information (e.g., "Listed fee: ₹80K/year")
 * 3. information requiring confirmation (e.g., "Confirm current fee with the institution.")
 */
export function formatMatchReason(reason: MatchReason): FormattedMatchExplanation {
  const isConfirm =
    reason.sourceType === 'needs_confirmation' ||
    reason.type === 'partial' ||
    reason.type === 'unverified' ||
    Boolean(reason.confirmationAction);

  const isPreference =
    reason.sourceType === 'preference' ||
    (!reason.sourceType &&
      (reason.matchedCriteria === 'budget' ||
        reason.matchedCriteria === 'distance' ||
        reason.matchedCriteria === 'curriculum' ||
        reason.matchedCriteria === 'philosophy'));

  if (isConfirm) {
    return {
      category: 'confirmation',
      tag: 'Information requiring confirmation',
      prefixLabel: 'Requires confirmation',
      tagBadgeClass: 'bg-amber-50 text-amber-950 border-amber-300',
      tagIconClass: 'text-amber-700',
      title: reason.title,
      detail: reason.description,
      actionAdvice:
        reason.confirmationAction ||
        (reason.matchedCriteria === 'budget'
          ? 'Confirm current fee circular with the school administration.'
          : reason.matchedCriteria === 'transport'
          ? 'Verify morning bus pickup and stop availability for your exact residence.'
          : 'Confirm this requirement directly with the institution.'),
    };
  }

  if (isPreference) {
    return {
      category: 'preference',
      tag: 'Matches your preference',
      prefixLabel: 'Matches your preference',
      tagBadgeClass: 'bg-teal-50 text-teal-950 border-teal-300',
      tagIconClass: 'text-teal-700',
      title: reason.title,
      detail: reason.description,
    };
  }

  return {
    category: 'fact',
    tag: 'Verified factual information',
    prefixLabel: 'Factual information',
    tagBadgeClass: 'bg-stone-100 text-stone-900 border-stone-300',
    tagIconClass: 'text-stone-600',
    title: reason.title,
    detail: reason.description,
  };
}
