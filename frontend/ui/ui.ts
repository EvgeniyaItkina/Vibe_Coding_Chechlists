// ui.ts - UI rendering and interaction functions
import { Checklist, Item } from '../models/models.js';
import { copyTemplatesToUser, getChecklists, getTemplates, getTemplateById, updateItem, deleteChecklist, deleteItem } from '../api/api.js';
import { currentUser } from '../auth/auth.js';

let currentChecklist: Checklist | null = null;
let checklistSearchQuery = '';
let currentStockTemplateId: string | null = null;

function setMainView(mode: 'welcome' | 'checklist' | 'stock') {
    const welcome = document.getElementById('welcome');
    const checklistView = document.getElementById('checklistView');
    const stockView = document.getElementById('stockView');

    if (!welcome || !checklistView || !stockView) return;

    welcome.style.display = mode === 'welcome' ? 'block' : 'none';
    checklistView.style.display = mode === 'checklist' ? 'block' : 'none';
    stockView.style.display = mode === 'stock' ? 'block' : 'none';
}

/**
 * Updates the in-memory search query and refreshes the sidebar list.
 * @param query - Raw search input entered by the user
 */
export async function setChecklistSearchQuery(query: string) {
    checklistSearchQuery = query;
    await renderSidebar();
}

/**
 * Updates the UI based on the current user authentication state
 * Shows/hides appropriate buttons and displays user information
 */
export function updateUI() {
    const checklistSearch = document.getElementById('checklistSearch') as HTMLInputElement | null;

    if (currentUser) {
        document.getElementById('registerBtn')!.style.display = 'none';
        document.getElementById('loginBtn')!.style.display = 'none';
        document.getElementById('logoutBtn')!.style.display = 'inline-block';
        document.getElementById('userInfo')!.textContent = `${currentUser.name}`;
        document.getElementById('newChecklistBtn')!.style.display = 'block';
        document.getElementById('checklistsStockBtn')!.style.display = 'block';
        if (checklistSearch) {
            checklistSearch.style.display = 'block';
        }
        setMainView('welcome');
        document.getElementById('welcome')!.innerHTML = 'Create a new checklist or select from existing ones';
    } else {
        currentChecklist = null;
        currentStockTemplateId = null;
        document.getElementById('registerBtn')!.style.display = 'inline-block';
        document.getElementById('loginBtn')!.style.display = 'inline-block';
        document.getElementById('logoutBtn')!.style.display = 'none';
        document.getElementById('userInfo')!.textContent = '';
        document.getElementById('newChecklistBtn')!.style.display = 'none';
        document.getElementById('checklistsStockBtn')!.style.display = 'none';
        if (checklistSearch) {
            checklistSearch.style.display = 'none';
            checklistSearch.value = '';
        }
        checklistSearchQuery = '';
        setMainView('welcome');
        document.getElementById('welcome')!.innerHTML = 'Please register or login to start.';
    }
}

/**
 * Renders the sidebar with the list of user's checklists
 * Includes edit and delete icons for each checklist
 */
export async function renderSidebar() {
    if (!currentUser) return;
    const sidebar = document.getElementById('checklistList')!;
    sidebar.innerHTML = '';
    const checklists = await getChecklists();
    const normalizedQuery = checklistSearchQuery.trim().toLowerCase();
    const filteredChecklists = normalizedQuery
        ? checklists.filter((cl) => cl.name.toLowerCase().includes(normalizedQuery))
        : checklists;

    // Hide stale detail panel when selected checklist is outside current filtered list.
    if (
        currentChecklist &&
        !filteredChecklists.some((cl) => cl.id === currentChecklist!.id)
    ) {
        currentChecklist = null;
        setMainView('welcome');
    }

    if (!filteredChecklists.length) {
        const emptyState = document.createElement('li');
        emptyState.textContent = 'No matching checklists';
        emptyState.style.cursor = 'default';
        emptyState.style.opacity = '0.7';
        sidebar.appendChild(emptyState);
        return;
    }

    filteredChecklists.forEach((cl, index) => {
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.alignItems = 'center';

        const nameSpan = document.createElement('span');
        nameSpan.textContent = cl.name;
        li.appendChild(nameSpan);

        // Open checklist only when the click was not on action icons.
        li.addEventListener('click', (e) => {
            if (!e.target || !(e.target as HTMLElement).closest('.edit-icon, .delete-icon')) {
                showChecklist(index, filteredChecklists);
            }
        });

        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.gap = '0.5rem';

        const editIcon = document.createElement('span');
        editIcon.textContent = '✏️';
        editIcon.className = 'edit-icon';
        editIcon.addEventListener('click', () => editChecklistName(cl.id, cl.name));
        buttonsContainer.appendChild(editIcon);

        const deleteIcon = document.createElement('span');
        deleteIcon.textContent = '❌';
        deleteIcon.className = 'delete-icon';

        deleteIcon.addEventListener('click', async (e) => {
            e.stopPropagation();

            await deleteChecklist(cl.id);

            // If the currently opened checklist was removed, reset the detail panel.
            if (currentChecklist && currentChecklist.id === cl.id) {
                currentChecklist = null;
                setMainView('welcome');
            }

            await renderSidebar();
        });

        buttonsContainer.appendChild(deleteIcon);

        li.appendChild(buttonsContainer);
        sidebar.appendChild(li);
    });
}

/**
 * Initiates editing of a checklist name by showing the edit modal
 * @param index - Index of the checklist in the sidebar
 * @param currentName - Current name of the checklist
 */
function editChecklistName(checklistId: string, currentName: string) {
    const input = document.getElementById('editChecklistName') as HTMLInputElement;
    const form = document.getElementById('editChecklistForm') as HTMLFormElement;

    input.value = currentName;
    form.dataset.checklistId = checklistId;

    showModal('editChecklistModal');
}

/**
 * Displays a specific checklist in the main view
 * @param checklistId - ID of the checklist to display
 * @param checklists - Array of all user's checklists
 */
export function showChecklist(index: number, checklists: Checklist[]) {
    // Keep selected checklist in module state for item operations.
    currentChecklist = checklists[index];
    const titleElement = document.getElementById('checklistTitle')!;
    titleElement.dataset.checklistId = currentChecklist.id;
    titleElement.innerHTML = '';
    titleElement.style.display = 'flex';
    titleElement.style.alignItems = 'center';
    titleElement.style.justifyContent = 'space-between';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = currentChecklist.name;
    titleElement.appendChild(nameSpan);

    const iconsContainer = document.createElement('div');
    iconsContainer.style.display = 'flex';
    iconsContainer.style.gap = '0.5rem';

    const editIcon = document.createElement('span');
    editIcon.textContent = '✏️';
    editIcon.className = 'edit-icon';
    editIcon.addEventListener('click', () => editChecklistName(currentChecklist!.id, currentChecklist!.name));
    iconsContainer.appendChild(editIcon);

    const deleteIcon = document.createElement('span');
    deleteIcon.textContent = '❌';
    deleteIcon.className = 'delete-icon';
    deleteIcon.addEventListener('click', async () => {
        await deleteChecklist(currentChecklist!.id);

        currentChecklist = null;
        setMainView('welcome');

        await renderSidebar();
    });

    iconsContainer.appendChild(deleteIcon);

    titleElement.appendChild(iconsContainer);

    renderItems();
    setMainView('checklist');
}

export async function showStockView() {
    if (!currentUser) return;

    currentChecklist = null;
    setMainView('stock');
    await renderStockTemplates();
}

async function renderStockTemplates() {
    const stockList = document.getElementById('stockList');
    const stockItemsPreview = document.getElementById('stockItemsPreview');
    const stockPreviewTitle = document.getElementById('stockPreviewTitle');
    const addBtn = document.getElementById('addStockToMyChecklistsBtn') as HTMLButtonElement | null;

    if (!stockList || !stockItemsPreview || !stockPreviewTitle || !addBtn) return;

    stockList.innerHTML = '';
    stockItemsPreview.innerHTML = '';
    currentStockTemplateId = null;
    stockPreviewTitle.textContent = 'Template Items Preview';

    addBtn.disabled = true;

    const templates = await getTemplates();
    if (!templates.length) {
        const empty = document.createElement('li');
        empty.textContent = 'No stock templates available.';
        stockList.appendChild(empty);
        return;
    }

    templates.forEach((template) => {
        const li = document.createElement('li');
        li.className = 'stock-template-card';

        const row = document.createElement('div');
        row.className = 'stock-template-row';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = template.id;
        checkbox.className = 'stock-template-checkbox';
        checkbox.addEventListener('change', () => {
            addBtn.disabled = getSelectedStockTemplateIds().length === 0;
        });
        row.appendChild(checkbox);

        const name = document.createElement('span');
        name.textContent = template.name;
        name.className = 'stock-template-name';
        name.addEventListener('click', async () => {
            currentStockTemplateId = template.id;
            setActiveStockTemplateCard(template.id);
            await renderTemplatePreview(template.id);
        });
        row.appendChild(name);

        li.appendChild(row);

        const meta = document.createElement('div');
        meta.className = 'stock-template-meta';
        meta.textContent = `${template.itemCount} items`;
        li.appendChild(meta);

        stockList.appendChild(li);
    });
}

function getSelectedStockTemplateIds(): string[] {
    return Array.from(
        document.querySelectorAll<HTMLInputElement>('.stock-template-checkbox:checked')
    ).map((input) => input.value);
}

export async function copySelectedStockTemplates() {
    const selectedTemplateIds = getSelectedStockTemplateIds();
    const addBtn = document.getElementById('addStockToMyChecklistsBtn') as HTMLButtonElement | null;

    if (!selectedTemplateIds.length) {
        showMessage('Info', 'Select at least one stock checklist.');
        return;
    }

    if (addBtn) addBtn.disabled = true;

    try {
        const copied = await copyTemplatesToUser(selectedTemplateIds);
        await renderSidebar();
        await renderStockTemplates();
        showMessage('Success', `Added ${copied.length} checklist(s) to your account.`);
    } catch (error) {
        showMessage('Error', 'Failed to add stock checklists. Please try again.');
        if (addBtn) {
            addBtn.disabled = false;
        }
    }
}

async function renderTemplatePreview(templateId: string) {
    const stockItemsPreview = document.getElementById('stockItemsPreview');
    const stockPreviewTitle = document.getElementById('stockPreviewTitle');
    if (!stockItemsPreview || !stockPreviewTitle) return;

    stockItemsPreview.innerHTML = '';
    const template = await getTemplateById(templateId);

    if (!template) {
        stockPreviewTitle.textContent = 'Template Items Preview';
        const empty = document.createElement('li');
        empty.textContent = 'Failed to load template preview.';
        stockItemsPreview.appendChild(empty);
        return;
    }

    stockPreviewTitle.textContent = `Template: ${template.name}`;

    template.items.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = item.text;
        stockItemsPreview.appendChild(li);
    });
}

function setActiveStockTemplateCard(templateId: string) {
    const checkboxes = document.querySelectorAll<HTMLInputElement>('.stock-template-checkbox');
    checkboxes.forEach((checkbox) => {
        const card = checkbox.closest('li');
        if (!card) return;

        if (checkbox.value === templateId) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
}

/**
 * Initiates editing of an item text by showing the edit modal
 * @param index - Index of the item in the checklist
 * @param currentText - Current text of the item
 */
function editItemText(itemId: string, currentText: string) {
    const input = document.getElementById('editItemText') as HTMLInputElement;
    const form = document.getElementById('editItemForm') as HTMLFormElement;

    input.value = currentText;
    form.dataset.itemId = itemId;

    showModal('editItemModal');
}

/**
 * Renders the items of the currently selected checklist
 * Includes checkboxes, edit and delete icons for each item
 */
export function renderItems() {
    const itemsList = document.getElementById('itemsList')!;
    itemsList.innerHTML = '';
    if (currentChecklist) {
        currentChecklist.items.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'item' + (item.done ? ' done' : '');
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';

            const leftContainer = document.createElement('div');
            leftContainer.style.display = 'flex';
            leftContainer.style.alignItems = 'center';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = item.done;
            // Toggle completion both in API and local state.
            checkbox.addEventListener('change', async () => {
                const nextDone = !item.done;
                item.done = nextDone;
                renderItems();

                try {
                    await updateItem(currentChecklist!.id, item.id, item.text, nextDone);
                } catch (error) {
                    item.done = !nextDone;
                    renderItems();
                }
            });
            leftContainer.appendChild(checkbox);

            const textSpan = document.createElement('span');
            textSpan.textContent = item.text;
            textSpan.className = 'item-text';
            leftContainer.appendChild(textSpan);

            li.appendChild(leftContainer);

            const buttonsContainer = document.createElement('div');
            buttonsContainer.style.display = 'flex';
            buttonsContainer.style.gap = '0.5rem';

            // Editing is disabled for completed items.
            if (!item.done) {
                const editIcon = document.createElement('span');
                editIcon.textContent = '✏️';
                editIcon.className = 'edit-icon';
                editIcon.addEventListener('click', () => editItemText(item.id, item.text));
                buttonsContainer.appendChild(editIcon);
            }

            const deleteIcon = document.createElement('span');
            deleteIcon.textContent = '❌';
            deleteIcon.className = 'delete-icon';
            deleteIcon.addEventListener('click', async () => {
                await deleteItem(currentChecklist!.id, item.id);

                if (currentChecklist) {
                    currentChecklist.items = currentChecklist.items.filter(i => i.id !== item.id);
                }

                renderItems();
            });
            buttonsContainer.appendChild(deleteIcon);

            li.appendChild(buttonsContainer);
            itemsList.appendChild(li);
        });
    }
}

export function updateCurrentItemText(itemId: string, newText: string) {
    if (!currentChecklist) return;

    // Update local cached checklist item text after API success.
    const item = currentChecklist.items.find(i => i.id === itemId);
    if (item) {
        item.text = newText;
    }

    renderItems();
}

export function addItemToCurrentChecklist(item: Item) {
    if (!currentChecklist) return;

    // Keep UI responsive by updating local state immediately.
    currentChecklist.items.push(item);
    renderItems();
}

export function updateCurrentChecklistName(checklistId: string, newName: string) {
    if (!currentChecklist || currentChecklist.id !== checklistId) return;

    currentChecklist.name = newName;

    const titleElement = document.getElementById('checklistTitle');
    const nameSpan = titleElement?.querySelector('span');
    if (nameSpan) {
        nameSpan.textContent = newName;
    }
}

// Modal functions

/**
 * Shows a modal dialog by adding the 'show' class
 * @param modalId - ID of the modal element to show
 */
function showModal(modalId: string) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
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

