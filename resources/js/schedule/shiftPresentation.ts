import type { Shift, ShiftTone } from '@/types/schedule';

const tonesByTemplate: Record<string, ShiftTone> = {
    Утро: 'morning',
    День: 'day',
    Вечер: 'evening',
};

export function templateTone(name: string): ShiftTone {
    return tonesByTemplate[name] ?? 'solid';
}

export function shiftTone(shift: Shift): ShiftTone {
    if (shift.template === null || shift.template === undefined) {
        return 'solid';
    }

    return templateTone(shift.template.name);
}

export function shiftTimeLabel(shift: Shift): string {
    return `${clockFace(shift.start_time)} - ${clockFace(shift.end_time)}`;
}

export function hoursLabel(start: string, end: string): string {
    const minutes = durationMinutes(start, end);
    const hours = minutes / 60;
    const text = Number.isInteger(hours) ? String(hours) : hours.toFixed(1).replace('.', ',');

    return `${text} ч`;
}

export function shiftHoursLabel(shift: Shift): string {
    return hoursLabel(shift.start_time, shift.end_time);
}

function clockFace(value: string): string {
    const [hours, minutes] = value.split(':');

    if (minutes === '00') {
        return hours;
    }

    return `${hours}:${minutes}`;
}

function durationMinutes(start: string, end: string): number {
    const startMinutes = clockMinutes(start);
    const endMinutes = clockMinutes(end);
    const duration = endMinutes - startMinutes;

    return duration >= 0 ? duration : duration + 24 * 60;
}

function clockMinutes(value: string): number {
    const [hours, minutes] = value.split(':').map((part) => Number(part));

    return hours * 60 + minutes;
}
