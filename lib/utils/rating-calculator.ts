import { ChecklistCategory, PrioritySummary } from '@/types';

export function calculateOverallRating(
  checklistData: ChecklistCategory[],
  prioritySummary: PrioritySummary
): 'excellent' | 'good' | 'fair' | 'poor' {
  const uncheckedCount = countUncheckedItems(checklistData);
  const criticalCount = prioritySummary.critical.length;

  if (uncheckedCount === 0 && criticalCount === 0) return 'excellent';
  if (uncheckedCount <= 3 && criticalCount === 0) return 'good';
  if (uncheckedCount <= 10 && criticalCount <= 2) return 'fair';
  return 'poor';
}

export function countUncheckedItems(checklistData: ChecklistCategory[]): number {
  let count = 0;
  checklistData.forEach(category => {
    category.sections.forEach(section => {
      section.items.forEach(item => {
        if (!item.checked) count++;
      });
    });
  });
  return count;
}

export function getUncheckedItems(checklistData: ChecklistCategory[]) {
  const unchecked: Array<{
    category: string;
    section: string;
    items: string[];
    issuesFound: { text: string; images: string[] };
  }> = [];

  checklistData.forEach(category => {
    category.sections.forEach(section => {
      const uncheckedInSection = section.items.filter(item => !item.checked);
      if (uncheckedInSection.length > 0) {
        unchecked.push({
          category: category.category,
          section: section.sectionTitle,
          items: uncheckedInSection.map(item => item.text),
          issuesFound: section.issuesFound,
        });
      }
    });
  });

  return unchecked;
}

export function calculateProgress(checklistData: ChecklistCategory[]): number {
  let totalItems = 0;
  let checkedItems = 0;

  checklistData.forEach(category => {
    category.sections.forEach(section => {
      totalItems += section.items.length;
      checkedItems += section.items.filter(item => item.checked).length;
    });
  });

  return totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
}

export function getRatingColor(rating: 'excellent' | 'good' | 'fair' | 'poor'): string {
  const colors = {
    excellent: 'bg-green-100 text-green-800 border-green-300',
    good: 'bg-blue-100 text-blue-800 border-blue-300',
    fair: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    poor: 'bg-red-100 text-red-800 border-red-300',
  };
  return colors[rating];
}

export function getRatingExplanation(
  rating: 'excellent' | 'good' | 'fair' | 'poor',
  uncheckedCount: number,
  criticalCount: number
): string {
  switch (rating) {
    case 'excellent':
      return 'All checklist items passed with no critical issues. Site is ready for launch.';
    case 'good':
      return `${uncheckedCount} minor issue(s) found. Site is in good shape with minor improvements needed.`;
    case 'fair':
      return `${uncheckedCount} issue(s) found${criticalCount > 0 ? ` including ${criticalCount} critical issue(s)` : ''}. Several improvements recommended before launch.`;
    case 'poor':
      return `${uncheckedCount} issue(s) found${criticalCount > 0 ? ` including ${criticalCount} critical issue(s)` : ''}. Significant work needed before launch.`;
  }
}

