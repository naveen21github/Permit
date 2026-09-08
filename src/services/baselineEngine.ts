import { PermitApplication, PermitType } from '../types';

export interface BaselineApplicationResult {
  id: string;
  permitType: PermitType;
  totalCalendarDays: number;
  isOwnerVisible: boolean;
  isDelayReasonRecorded: boolean;
  freeTextStatus: string;
  handoffsCount: number;
  delaysCount: number;
  finalDecision: 'APPROVED' | 'REJECTED';
}

/**
 * Simulates processing a synthetic application under the Manual Baseline Process.
 * Baseline Characteristics:
 * - Shared department queue (no designated individual owner)
 * - Free-text status ("pending intake", "in review bucket", "waiting on team")
 * - No mandatory current-owner field
 * - Delays not categorized with accountable delay reasons
 * - Manual follow-up overhead adding 2.5 - 4.5 days per handoff stage
 */
export function simulateBaselineProcessing(
  appId: string,
  permitType: PermitType,
  seed: number
): BaselineApplicationResult {
  // Deterministic pseudo-randomness based on seed
  const rng = (offset: number) => {
    const x = Math.sin(seed + offset) * 10000;
    return x - Math.floor(x);
  };

  // Base processing times (days) for manual steps
  const intakeDays = 2.5 + rng(1) * 3; // 2.5 - 5.5 days
  const handoffDelayDays = 3.0 + rng(2) * 4; // 3 - 7 days spent in unassigned queue
  const reviewDays = 5.0 + rng(3) * 6; // 5 - 11 days review
  const followUpDelayDays = rng(4) > 0.4 ? 4.5 + rng(5) * 5 : 0; // 40% chance of untracked delay

  const totalCalendarDays = Math.round((intakeDays + handoffDelayDays + reviewDays + followUpDelayDays) * 10) / 10;

  // In manual baseline, current responsibility visibility is low (~30% chance visible in spreadsheet)
  const isOwnerVisible = rng(6) < 0.32;

  // Delay reasons are free-text or unrecorded (~15% chance recorded as generic text)
  const isDelayReasonRecorded = rng(7) < 0.15;

  const statuses = [
    'Submitted to inbox',
    'Shared Queue - Pending Review',
    'Forwarded to traffic team',
    'In progress (manual file)',
    'Awaiting internal feedback'
  ];
  const freeTextStatus = statuses[Math.floor(rng(8) * statuses.length)];

  return {
    id: appId,
    permitType,
    totalCalendarDays,
    isOwnerVisible,
    isDelayReasonRecorded,
    freeTextStatus,
    handoffsCount: Math.floor(1 + rng(9) * 3),
    delaysCount: followUpDelayDays > 0 ? 1 : 0,
    finalDecision: rng(10) > 0.15 ? 'APPROVED' : 'REJECTED'
  };
}
