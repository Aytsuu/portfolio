const MONTH_INDEX: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

export interface ExperienceDuration {
  months: number;
  label: string;
  yearsDecimal: number;
}

const parseMonthYear = (value: string, now: Date): Date => {
  const trimmed = value.trim();
  if (trimmed.toLowerCase() === "present") {
    return now;
  }

  const match = trimmed.match(/^([A-Za-z]{3})\s+(\d{4})$/);
  if (!match) {
    return now;
  }

  const month = MONTH_INDEX[match[1].toLowerCase()];
  const year = Number.parseInt(match[2], 10);
  if (month === undefined || Number.isNaN(year)) {
    return now;
  }

  return new Date(year, month, 1);
};

const monthSpanInclusive = (start: Date, end: Date): number => {
  const normalizedEnd =
    end.getTime() < start.getTime()
      ? new Date(start.getFullYear(), end.getMonth(), 1)
      : end;

  return (
    (normalizedEnd.getFullYear() - start.getFullYear()) * 12 +
    (normalizedEnd.getMonth() - start.getMonth()) +
    1
  );
};

const LESS_THAN_A_YEAR = "Less than a year";

export const formatDurationYears = (months: number): string => {
  if (months < 12) {
    return LESS_THAN_A_YEAR;
  }

  const years = months / 12;
  return `${years.toFixed(1)} YRS`;
};

export const formatDurationLabel = (months: number): string => {
  if (months < 12) {
    return LESS_THAN_A_YEAR;
  }

  const years = Math.floor(months / 12);
  const remainder = months % 12;
  if (remainder === 0) {
    return `${years} YR`;
  }

  return `${years} YR ${remainder} MO`;
};

export const durationFromRange = (
  range: string,
  now = new Date(),
): ExperienceDuration => {
  const [startRaw, endRaw] = range.split(" - ").map((part) => part.trim());
  if (!startRaw || !endRaw) {
    return { months: 0, label: LESS_THAN_A_YEAR, yearsDecimal: 0 };
  }

  const start = parseMonthYear(startRaw, now);
  const end = parseMonthYear(endRaw, now);
  const months = Math.max(1, monthSpanInclusive(start, end));

  return {
    months,
    label: formatDurationLabel(months),
    yearsDecimal: months / 12,
  };
};

export interface ExperienceEntryLike {
  title: string;
  year: string;
  category?: "education" | "work";
}

export const isEducationExperience = (entry: ExperienceEntryLike): boolean =>
  entry.category === "education" ||
  /^bs\s/i.test(entry.title) ||
  /\b(bachelor|degree)\b/i.test(entry.title);

export const totalWorkExperienceMonths = (
  entries: ExperienceEntryLike[],
  now = new Date(),
): number =>
  entries
    .filter((entry) => !isEducationExperience(entry))
    .reduce((sum, entry) => sum + durationFromRange(entry.year, now).months, 0);
