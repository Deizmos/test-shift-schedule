export type Employee = {
    id: number;
    name: string;
    position: string;
    weekly_hours: number;
    avatar_url: string | null;
};

export type ShiftTemplate = {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
    color: string;
};

export type Shift = {
    id: number;
    employee_id: number;
    date: string;
    start_time: string;
    end_time: string;
    template_id: number | null;
    template?: ShiftTemplate | null;
};

export type ShiftTone = 'morning' | 'day' | 'evening' | 'solid';
