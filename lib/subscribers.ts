export const SUBSCRIBERS_PAGE_SIZE = 10;
export const MIN_SEARCH_LENGTH = 2;
export const SEARCH_DEBOUNCE_MS = 300;

export type SubscriberRow = {
  id: string;
  email: string;
  created_at: string;
};

const MONTH_LABELS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "maj",
  "jun",
  "jul",
  "avg",
  "sep",
  "okt",
  "nov",
  "dec",
] as const;

export function normalizeNewsletterEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function formatSubscriberDate(iso: string): string {
  const date = new Date(iso);
  const day = date.getDate();
  const month = MONTH_LABELS[date.getMonth()] ?? "jan";
  const year = date.getFullYear();

  return `${day}.${month}.${year}.`;
}

export function isSearchActive(query: string): boolean {
  return query.trim().length >= MIN_SEARCH_LENGTH;
}

export function sortSubscribersBySearch(
  rows: SubscriberRow[],
  query: string
): SubscriberRow[] {
  const normalizedQuery = query.trim().toLowerCase();

  return [...rows].sort((left, right) => {
    const leftEmail = left.email.toLowerCase();
    const rightEmail = right.email.toLowerCase();
    const leftPosition = leftEmail.indexOf(normalizedQuery);
    const rightPosition = rightEmail.indexOf(normalizedQuery);

    if (leftPosition !== rightPosition) {
      return leftPosition - rightPosition;
    }

    return (
      new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
    );
  });
}

export function isDuplicateSubscriberError(error: { code?: string } | null) {
  return error?.code === "23505";
}
