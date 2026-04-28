export function getBudgetProgressColor(percentage: number): string {
  if (percentage >= 100) return "bg-red-500";
  if (percentage >= 80) return "bg-orange-500";
  if (percentage >= 60) return "bg-yellow-500";
  return "bg-green-500";
}

export function getBudgetTextColor(percentage: number): string {
  if (percentage >= 100) return "text-red-600";
  if (percentage >= 80) return "text-orange-600";
  if (percentage >= 60) return "text-yellow-600";
  return "text-green-600";
}

export function computeBudgetPercentage(spent: number, limit: number): number {
  return limit > 0 ? Math.round((spent / limit) * 100) : 0;
}
