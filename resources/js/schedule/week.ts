export function startOfWeek(date: Date): Date {
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const weekday = start.getDay();
    const distanceFromMonday = weekday === 0 ? 6 : weekday - 1;

    start.setDate(start.getDate() - distanceFromMonday);

    return start;
}

export function addDays(date: Date, days: number): Date {
    const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    next.setDate(next.getDate() + days);

    return next;
}

export function formatIsoDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${date.getFullYear()}-${month}-${day}`;
}

export function isSameDay(left: Date, right: Date): boolean {
    return formatIsoDate(left) === formatIsoDate(right);
}

export function weekDates(weekStart: Date): Date[] {
    return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
}

export function startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, months: number): Date {
    const day = date.getDate();
    const next = new Date(date.getFullYear(), date.getMonth() + months, 1);
    const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();

    next.setDate(Math.min(day, lastDay));

    return next;
}

export function monthDates(monthStart: Date): Date[] {
    const start = startOfMonth(monthStart);
    const count = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();

    return Array.from({ length: count }, (_, index) => addDays(start, index));
}

export function formatMonthTitle(monthStart: Date): string {
    const name = monthsNominative[monthStart.getMonth()];

    return `${name.charAt(0).toLocaleUpperCase('ru-RU')}${name.slice(1)} ${monthStart.getFullYear()}`;
}

export function formatWeekTitle(weekStart: Date): string {
    const weekEnd = addDays(weekStart, 6);
    const startMonth = monthName(weekStart);
    const endMonth = monthName(weekEnd);

    if (weekStart.getFullYear() !== weekEnd.getFullYear()) {
        return `${weekStart.getDate()} ${startMonth} ${weekStart.getFullYear()} – ${weekEnd.getDate()} ${endMonth} ${weekEnd.getFullYear()}`;
    }

    if (weekStart.getMonth() !== weekEnd.getMonth()) {
        return `${weekStart.getDate()} ${startMonth} – ${weekEnd.getDate()} ${endMonth} ${weekEnd.getFullYear()}`;
    }

    return `${weekStart.getDate()}–${weekEnd.getDate()} ${endMonth} ${weekEnd.getFullYear()}`;
}

export function weekdayShort(date: Date): string {
    const label = date.toLocaleDateString('ru-RU', { weekday: 'short' }).replace('.', '');

    return label.charAt(0).toLocaleUpperCase('ru-RU') + label.slice(1);
}

export function dayLabel(date: Date): string {
    return date.toLocaleDateString('ru-RU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });
}

const monthsNominative = [
    'январь',
    'февраль',
    'март',
    'апрель',
    'май',
    'июнь',
    'июль',
    'август',
    'сентябрь',
    'октябрь',
    'ноябрь',
    'декабрь',
];

const monthsGenitive = [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря',
];

function monthName(date: Date): string {
    return monthsGenitive[date.getMonth()];
}
