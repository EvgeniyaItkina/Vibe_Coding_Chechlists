// api.ts - API communication functions
import { User, Checklist, Item } from '../models/models.js';


// Central API base URL for all frontend requests.
const API_URL = '/api';

export interface TemplateSummary {
    id: string;
    name: string;
    itemCount: number;
}

/**
 * Registers a new user with the backend API
 * @param name - User's name
 * @param phone - User's phone number
 * @returns Promise<User | null> - User object if registration successful, null otherwise
 */
export async function registerUser(name: string, phone: string): Promise<User | null> {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone })
        });

        if (!response.ok) {
        return null;
        }

        const data = await response.json();
        return data.user;

    } catch (error) {
        console.error('Registration error:', error);
        return null;
    }
}

/**
 * Logs in an existing user with the backend API
 * @param name - User's name
 * @param phone - User's phone number
 * @returns Promise<User | null> - User object if login successful, null otherwise
 */
export async function loginUser(name: string, phone: string): Promise<User | null> {
    
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone })
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data.user;
    } catch (error) {
        console.error('Login error:', error);
        return null;
    }
}

/**
 * Retrieves all checklists for the current user
 * @returns Promise<Checklist[]> - Array of user's checklists
 */
export async function getChecklists(): Promise<Checklist[]> {
    // Avoid network calls when the session is not initialized.
    if (!currentUser) return [];
    try {
        const response = await fetch(`${API_URL}/checklists?name=${currentUser.name}&phone=${currentUser.phone}`);
        if (response.ok) {
            return await response.json();
        }
        return [];
    } catch (error) {
        console.error('Get checklists error:', error);
        return [];
    }
}

/**
 * Creates a new checklist for the current user
 * @param name - Name of the new checklist
 * @throws Error if creation fails
 */
export async function createChecklist(name: string): Promise<void> {
    if (!currentUser) return;
    try {
        // Send user identity with each request because backend is file-based.
        const response = await fetch(`${API_URL}/checklists`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, userName: currentUser.name, userPhone: currentUser.phone })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create checklist');
        }
    } catch (error) {
        console.error('Create checklist error:', error);
        throw error;
    }
}

/**
 * Deletes a checklist for the current user
 * @param checklistId - ID of the checklist to delete
 * @throws Error if deletion fails
 */
export async function deleteChecklist(checklistId: string): Promise<void> {
    if (!currentUser) return;
    try {
        const response = await fetch(`${API_URL}/checklists/${checklistId}?name=${currentUser.name}&phone=${currentUser.phone}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete checklist');
        }
    } catch (error) {
        console.error('Delete checklist error:', error);
        throw error;
    }
}

/**
 * Updates the name of an existing checklist
 * @param index - Index of the checklist in the user's checklist array
 * @param newName - New name for the checklist
 * @throws Error if update fails
 */
export async function updateChecklistName(checklistId: string, newName: string): Promise<void> {
    if (!currentUser) return;
    try {
        const response = await fetch(`${API_URL}/checklists/${checklistId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                newName, 
                userName: currentUser.name, 
                userPhone: currentUser.phone 
            })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update checklist name');
        }
    } catch (error) {
        console.error('Update checklist name error:', error);
        throw error;
    }
}

/**
 * Adds a new item to a checklist
 * @param checklistId - ID of the checklist to add item to
 * @throws Error if addition fails
 */
export async function addItem(checklistId: string, text: string): Promise<Item | null> {
    if (!currentUser) return null;

    try {
        // New items are created as incomplete by default.
        const response = await fetch(`${API_URL}/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                checklistId,
                text,
                done: false,
                userName: currentUser.name,
                userPhone: currentUser.phone
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to add item');
        }

        const data = await response.json();
        return data.item;
    } catch (error) {
        console.error('Add item error:', error);
        throw error;
    }
    
}

/**
 * Updates an existing item in a checklist
 * @param checklistId - ID of the checklist containing the item
 * @param itemId - ID of the item in the checklist
 * @param text - New text for the item
 * @param done - New completion status for the item
 * @throws Error if update fails
 */
export async function updateItem(checklistId: string, itemId: string, text: string, done: boolean): Promise<void> {
    if (!currentUser) return;
    try {
        const response = await fetch(`${API_URL}/items`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ checklistId, itemId, text, done, userName: currentUser.name, userPhone: currentUser.phone })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update item');
        }
    } catch (error) {
        console.error('Update item error:', error);
        throw error;
    }
}

/**
 * Deletes an item from a checklist
 * @param checklistId - ID of the checklist containing the item
 * @param itemId - ID of the item to delete
 * @throws Error if deletion fails
 */
export async function deleteItem(checklistId: string, itemId: string): Promise<void> {
    if (!currentUser) return;
    try {
        const response = await fetch(`${API_URL}/items/${itemId}?checklistId=${checklistId}&name=${currentUser.name}&phone=${currentUser.phone}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete item');
        }
    } catch (error) {
        console.error('Delete item error:', error);
        throw error;
    }
}

export async function getTemplates(): Promise<TemplateSummary[]> {
    try {
        const response = await fetch(`${API_URL}/templates`);
        if (!response.ok) {
            return [];
        }

        return await response.json();
    } catch (error) {
        console.error('Get templates error:', error);
        return [];
    }
}

export async function getTemplateById(id: string): Promise<Checklist | null> {
    try {
        const response = await fetch(`${API_URL}/templates/${id}`);
        if (!response.ok) {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Get template by id error:', error);
        return null;
    }
}

export async function copyTemplatesToUser(templateIds: string[]): Promise<Checklist[]> {
    if (!currentUser || !templateIds.length) return [];

    try {
        const response = await fetch(`${API_URL}/templates/checklists`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                templateIds,
                userName: currentUser.name,
                userPhone: currentUser.phone
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to copy templates');
        }

        const data = await response.json();
        return data.copiedChecklists ?? [];
    } catch (error) {
        console.error('Copy templates error:', error);
        throw error;
    }
}

export function setApiCurrentUser(user: User | null): void {
    currentUser = user;
}

// Shared in-memory session used by all API helper methods.
export let currentUser: User | null = null;