import type { Employee, Shift, ShiftTemplate } from '@/types/schedule';

export type ShiftCell = {
    employee_id: number;
    date: string;
};

type Collection<T> = {
    data: T[];
};

export class ScheduleApiError extends Error {
    constructor(message = 'Не удалось загрузить график') {
        super(message);
        this.name = 'ScheduleApiError';
    }
}

async function getCollection<T>(url: string): Promise<T[]> {
    const response = await fetch(url, {
        headers: {
            Accept: 'application/json',
        },
    });

    if (!response.ok) {
        throw new ScheduleApiError();
    }

    const body = (await response.json()) as Collection<T>;

    return body.data;
}

export function fetchEmployees(): Promise<Employee[]> {
    return getCollection<Employee>('/api/employees');
}

export function fetchShifts(from: string, to: string): Promise<Shift[]> {
    const params = new URLSearchParams({ from, to });

    return getCollection<Shift>(`/api/shifts?${params.toString()}`);
}

export function fetchTemplates(): Promise<ShiftTemplate[]> {
    return getCollection<ShiftTemplate>('/api/templates');
}

export function assignTemplate(templateId: number, cells: ShiftCell[]): Promise<Shift[]> {
    return postShifts({
        template_id: templateId,
        cells,
    });
}

export function assignCustom(startTime: string, endTime: string, cells: ShiftCell[]): Promise<Shift[]> {
    return postShifts({
        start_time: startTime,
        end_time: endTime,
        cells,
    });
}

export async function transferShift(id: number, employeeId: number, date: string): Promise<Shift> {
    let response: Response;

    try {
        response = await fetch(`/api/shifts/${id}/transfer`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                employee_id: employeeId,
                date,
            }),
        });
    } catch {
        throw new ScheduleApiError('Не удалось перенести смену');
    }

    if (!response.ok) {
        throw new ScheduleApiError('Не удалось перенести смену');
    }

    const payload = (await response.json()) as { data: Shift };

    return payload.data;
}

export async function deleteShift(id: number): Promise<void> {
    let response: Response;

    try {
        response = await fetch(`/api/shifts/${id}`, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
            },
        });
    } catch {
        throw new ScheduleApiError('Не удалось снять смену');
    }

    if (!response.ok) {
        throw new ScheduleApiError('Не удалось снять смену');
    }
}

async function postShifts(body: Record<string, unknown>): Promise<Shift[]> {
    let response: Response;

    try {
        response = await fetch('/api/shifts', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
    } catch {
        throw new ScheduleApiError('Не удалось назначить смену');
    }

    if (!response.ok) {
        throw new ScheduleApiError('Не удалось назначить смену');
    }

    const payload = (await response.json()) as Collection<Shift>;

    return payload.data;
}
