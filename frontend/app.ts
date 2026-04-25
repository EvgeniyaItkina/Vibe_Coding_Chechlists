// app.ts - Main application entry point
import { registerUser, loginUser, logoutUser, restoreSession } from './auth/auth.js';
import { createChecklist, addItem, setApiCurrentUser, updateChecklistName, updateItem } from './api/api.js';
import {
    updateUI,
    renderSidebar,
    renderItems,
    showStockView,
    copySelectedStockTemplates,
    updateCurrentItemText,
    addItemToCurrentChecklist,
    updateCurrentChecklistName,
    setChecklistSearchQuery
} from './ui/ui.js';

function initializeApp() {
    // Restore persisted session before rendering any protected UI.
    const savedUser = restoreSession();

    setApiCurrentUser(savedUser);
    updateUI();

    if (savedUser) {
        renderSidebar();
    }
}

function showModal(modalId: string) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
    }
}

function closeModal(modalId: string) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

function showMessage(title: string, text: string) {
    const titleEl = document.getElementById('messageTitle');
    const textEl = document.getElementById('messageText');

    if (titleEl && textEl) {
        titleEl.textContent = title;
        textEl.textContent = text;
        showModal('messageModal');
    }
}

function setupModalCloseButtons() {
    // Attach close handlers for all modal "x" buttons.
    document.querySelectorAll('.modal .close').forEach((btn) => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal') as HTMLElement | null;
            if (modal?.id) {
                closeModal(modal.id);
            }
        });
    });

    document.getElementById('messageOkBtn')?.addEventListener('click', () => {
        closeModal('messageModal');
    });
}

function setupAuthButtons() {
    // Open auth dialogs from header controls.
    document.getElementById('loginBtn')?.addEventListener('click', () => {
        showModal('loginModal');
    });

    document.getElementById('registerBtn')?.addEventListener('click', () => {
        showModal('registerModal');
    });

    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        logoutUser();
    });
}

function setupAuthForms() {
    // Wire login form submission to API authentication.
    document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = (document.getElementById('loginName') as HTMLInputElement).value.trim();
        const phone = (document.getElementById('loginPhone') as HTMLInputElement).value.trim();

        if (!name || !phone) return;

        const isSuccess = await loginUser(name, phone);
        if (isSuccess) {
            closeModal('loginModal');
        }
    });

    // Wire registration form submission to API registration.
    document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = (document.getElementById('registerName') as HTMLInputElement).value.trim();
        const phone = (document.getElementById('registerPhone') as HTMLInputElement).value.trim();

        if (!name || !phone) return;

        try {
            const isSuccess = await registerUser(name, phone);
            if (isSuccess) {
                closeModal('registerModal');
            }
        } catch (error: any) {
            showMessage('Error', error.message);
        }
    });
}

function setupChecklistActions() {
    // New checklist flow.
    document.getElementById('newChecklistBtn')?.addEventListener('click', () => {
        showModal('newChecklistModal');
    });

    document.getElementById('checklistsStockBtn')?.addEventListener('click', async () => {
        await showStockView();
    });

    document.getElementById('addStockToMyChecklistsBtn')?.addEventListener('click', async () => {
        await copySelectedStockTemplates();
    });

    document.getElementById('newChecklistForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const checklistNameInput = document.getElementById('checklistName') as HTMLInputElement;
        const name = checklistNameInput.value.trim();

        if (!name) return;

        try {
            await createChecklist(name);
            checklistNameInput.value = '';
            closeModal('newChecklistModal');
            await renderSidebar();
        } catch (error) {
            showMessage('Error', 'Failed to create checklist. Please try again.');
        }
    });

    // Existing checklist rename flow.
    document.getElementById('editChecklistForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const form = e.currentTarget as HTMLFormElement;
        const checklistId = form.dataset.checklistId;
        const input = document.getElementById('editChecklistName') as HTMLInputElement;
        const newName = input.value.trim();

        if (!checklistId || !newName) return;

        try {
            await updateChecklistName(checklistId, newName);
            updateCurrentChecklistName(checklistId, newName);

            input.value = '';
            closeModal('editChecklistModal');
            await renderSidebar();
        } catch (error) {
            showMessage('Error', 'Failed to rename checklist. Please try again.');
        }
    });

    // New checklist item flow.
    document.getElementById('addItemBtn')?.addEventListener('click', () => {
        showModal('newItemModal');
    });

    // Existing checklist item edit flow.
    document.getElementById('editItemForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const form = e.currentTarget as HTMLFormElement;
        const itemId = form.dataset.itemId;

        const checklistTitle = document.getElementById('checklistTitle');
        const checklistId = checklistTitle?.dataset.checklistId;

        const text = (document.getElementById('editItemText') as HTMLInputElement).value.trim();

        if (!checklistId || !itemId || !text) return;

        try {
            await updateItem(checklistId, itemId, text, false);
            updateCurrentItemText(itemId, text);

            closeModal('editItemModal');
            await renderSidebar();
            renderItems();
        } catch (error) {
            showMessage('Error', 'Failed to update item. Please try again.');
        }
    });

    document.getElementById('newItemForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const checklistTitle = document.getElementById('checklistTitle');
        const checklistId = checklistTitle?.dataset.checklistId;

        const input = document.getElementById('newItemText') as HTMLInputElement;
        const text = input.value.trim();

        if (!checklistId || !text) return;

        try {
            const newItem = await addItem(checklistId, text);
            if (!newItem) return;

            addItemToCurrentChecklist(newItem);

            input.value = '';
            closeModal('newItemModal');
            await renderSidebar();
        } catch (error) {
            showMessage('Error', 'Failed to add item. Please try again.');
        }
    });

    // Filter sidebar checklists by name on each input change.
    document.getElementById('checklistSearch')?.addEventListener('input', async (e) => {
        const input = e.currentTarget as HTMLInputElement;
        await setChecklistSearchQuery(input.value);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupModalCloseButtons();
    setupAuthButtons();
    setupAuthForms();
    setupChecklistActions();
});


