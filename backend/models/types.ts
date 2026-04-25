// models/types.ts - Type definitions for the application
export interface User {
    id: string;
    name: string;
    phone: string;
    checklists: Checklist[];
}

export interface Checklist {
    id: string;
    name: string;
    items: Item[];
    sourceTemplateId?: string;
}

export interface Item {
    id: string;
    text: string;
    done: boolean;
}

export interface TemplateData {
    checklists: Checklist[];
}