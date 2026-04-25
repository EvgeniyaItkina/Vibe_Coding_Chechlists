// utils/fileUtils.ts - File system utilities for user data management
import * as fs from 'fs';
import * as path from 'path';
import { User, TemplateData, Checklist } from '../models/types.js';
import { USER_DATA_DIR } from '../config/config.js';

// Ensure user_data directory exists
if (!fs.existsSync(USER_DATA_DIR)) {
    fs.mkdirSync(USER_DATA_DIR, { recursive: true });
}

/**
 * Generates the file path for a user's data file
 * @param name - User's name
 * @param phone - User's phone number
 * @returns The full path to the user's data file
 */
export function getUserFilePath(name: string, phone: string): string {
    const fileName = `${name}_${phone.replace(/\D/g, '')}.json`;
    return path.join(USER_DATA_DIR, fileName);
}

/**
 * Loads user data from the file system
 * @param name - User's name
 * @param phone - User's phone number
 * @returns User object if found, null otherwise
 */
export function loadUser(name: string, phone: string): User | null {
    const filePath = getUserFilePath(name, phone);
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading user:', error);
    }
    return null;
}

/**
 * Saves user data to the file system
 * @param user - User object to save
 */
export function saveUser(user: User): void {
    const filePath = getUserFilePath(user.name, user.phone);
    try {
        fs.writeFileSync(filePath, JSON.stringify(user, null, 2));
    } catch (error) {
        console.error('Error saving user:', error);
    }
}

function getTemplatesFilePath(): string {
    return path.join(USER_DATA_DIR, 'templates.json');
}

export function loadTemplates(): Checklist[] {
    const filePath = getTemplatesFilePath();
    try {
        if (!fs.existsSync(filePath)) {
            return [];
        }

        const data = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(data) as TemplateData;

        if (!parsed || !Array.isArray(parsed.checklists)) {
            return [];
        }

        return parsed.checklists;
    } catch (error) {
        console.error('Error loading templates:', error);
        return [];
    }
}