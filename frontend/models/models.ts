// models.ts - Type definitions
export interface User {
    id: string;
    name: string;
    phone: string;
}

export interface Item {
    id: string;
    text: string;
    done: boolean;
}

export interface Checklist {
    id: string;
    name: string;
    items: Item[];
}