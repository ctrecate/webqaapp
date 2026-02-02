import { PrioritySummary } from '@/types';

export function generateNextSteps(
  rating: 'excellent' | 'good' | 'fair' | 'poor',
  prioritySummary: PrioritySummary
): string[] {
  const steps: string[] = [];

  // Critical issues first
  if (prioritySummary.critical.length > 0) {
    steps.push(
      `🚨 Immediately address ${prioritySummary.critical.length} critical issue(s) before site launch or promotion`
    );
  }

  // High priority
  if (prioritySummary.high.length > 0) {
    steps.push(
      `⚠️ Schedule fixes for ${prioritySummary.high.length} high-priority item(s) within one week`
    );
  }

  // Rating-specific steps
  if (rating === 'poor') {
    steps.push('📋 Conduct comprehensive site review with development team');
    steps.push('📅 Create detailed remediation timeline with milestones');
  } else if (rating === 'fair') {
    steps.push('🔍 Prioritize and assign issues to development team');
  }

  // Medium priority
  if (prioritySummary.medium.length > 0) {
    steps.push(
      `📌 Plan sprint for ${prioritySummary.medium.length} medium-priority improvement(s)`
    );
  }

  // Low priority (if applicable)
  if (prioritySummary.low.length > 0 && rating !== 'poor') {
    steps.push(
      `💡 Add ${prioritySummary.low.length} low-priority item(s) to backlog for future iterations`
    );
  }

  // Always include these
  steps.push('👥 Assign tasks to team members with clear completion dates');
  steps.push('🔄 Schedule follow-up QA review after fixes are implemented');

  // Excellent rating bonus
  if (rating === 'excellent') {
    steps.push('🚀 Site is ready for launch - proceed with deployment plan');
  }

  return steps;
}

