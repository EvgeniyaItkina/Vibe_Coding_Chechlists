// auth.ts - Authentication and session management
import { User } from '../models/models.js';
import { registerUser as apiRegister, loginUser as apiLogin, setApiCurrentUser } from '../api/api.js';
import { updateUI, renderSidebar } from '../ui/ui.js';

const SESSION_KEY = 'todoAppSession';

export let currentUser: User | null = null;

/**
 * Saves the current user session to localStorage
 * @param user - User object to save
 */
export function saveSessionToStorage(user: User): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

/**
 * Loads the user session from localStorage
 * @returns User object if session exists, null otherwise
 */
export function loadSessionFromStorage(): User | null {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
}

/**
 * Clears the user session from localStorage
 */
export function clearSessionFromStorage(): void {
    localStorage.removeItem(SESSION_KEY);
}

/**
 * Registers a new user and updates the UI on success
 * @param name - User's name
 * @param phone - User's phone number
 */
export async function registerUser(name: string, phone: string): Promise<boolean> {
    const user = await apiRegister(name, phone);

    if (user) {
        // Keep all auth-related state in sync after successful registration.
        currentUser = user;
        setApiCurrentUser(user);
        saveSessionToStorage(user);
        updateUI();
        renderSidebar();
        showMessage('Success', 'Registration successful!');
        return true;
    } else {
        showMessage('Error', 'Registration failed');
        return false;
    }
}

/**
 * Logs in an existing user and updates the UI on success
 * @param name - User's name
 * @param phone - User's phone number
 */
export async function loginUser(name: string, phone: string): Promise<boolean> {
    const user = await apiLogin(name, phone);

    if (user) {
        // Keep all auth-related state in sync after successful login.
        currentUser = user;
        setApiCurrentUser(user);
        saveSessionToStorage(user);
        updateUI();
        renderSidebar();
        showMessage('Success', 'Login successful!');
        return true;
    } else {
        showMessage('Error', 'User not found. Please check your name and phone number or register a new account.');
        return false;
    }
}

/**
 * Logs out the current user and clears the session
 */
export function logoutUser(): void {
    currentUser = null;
    setApiCurrentUser(null);
    clearSessionFromStorage();
    updateUI();
}

/**
 * Displays a message modal to the user
 * @param title - Title of the message
 * @param text - Content of the message
 */
function showMessage(title: string, text: string): void {
    const titleEl = document.getElementById('messageTitle')!;
    const textEl = document.getElementById('messageText')!;
    titleEl.textContent = title;
    textEl.textContent = text;
    showModal('messageModal');
}

/**
 * Shows a modal dialog by adding the 'show' class
 * @param modalId - ID of the modal element to show
 */
function showModal(modalId: string): void {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
    }
}
export function restoreSession(): User | null {
    // Restore session once on app startup to keep the user logged in.
    const session = localStorage.getItem(SESSION_KEY);
    currentUser = session ? JSON.parse(session) : null;
    return currentUser;
}