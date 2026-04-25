// routes/items/items.ts - Item management routes
import express, { Request, Response } from 'express';
import { Item } from '../../models/types.js';
import { loadUser, saveUser } from '../../utils/fileUtils.js';

const router = express.Router();

/**
 * POST /items - Add a new item to a checklist
 * Body: { checklistId: string, userName: string, userPhone: string, text: string, done?: boolean }
 */
router.post('/', (req: Request, res: Response) => {
    const { checklistId, userName, userPhone, text, done } = req.body;

    if (!checklistId || !userName || !userPhone || !text) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const user = loadUser(userName, userPhone);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Resolve the target checklist for the current request.
    const checklist = user.checklists.find(cl => cl.id === checklistId);
    if (!checklist) {
        return res.status(404).json({ message: 'Checklist not found' });
    }

    // Create and append a new checklist item.
    const newItem: Item = {
        id: Date.now().toString(),
        text,
        done: done || false
    };

    checklist.items.push(newItem);
    saveUser(user);

    res.status(201).json({ message: 'Item added', item: newItem });
});

/**
 * PUT /items - Update an existing item
 * Body: { checklistId: string, itemId: string, userName: string, userPhone: string, text?: string, done?: boolean }
 */
router.put('/', (req: Request, res: Response) => {
    const { checklistId, itemId, userName, userPhone, text, done } = req.body;

    if (!checklistId || !itemId || !userName || !userPhone) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const user = loadUser(userName, userPhone);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Find the checklist and item that must be updated.
    const checklist = user.checklists.find(cl => cl.id === checklistId);
    if (!checklist) {
        return res.status(404).json({ message: 'Checklist not found' });
    }

    const item = checklist.items.find(i => i.id === itemId);
    if (!item) {
        return res.status(404).json({ message: 'Item not found' });
    }

    // Only overwrite fields that were provided by the client.
    item.text = text || item.text;
    item.done = done !== undefined ? done : item.done;

    saveUser(user);

    res.status(200).json({ message: 'Item updated', item: item });
});

/**
 * DELETE /items/:itemId - Delete an item from a checklist
 * Params: { itemId: string }
 * Query: { checklistId: string, name: string, phone: string }
 */
router.delete('/:itemId', (req: Request, res: Response) => {
    const { itemId } = req.params;
    const { checklistId, name: userName, phone: userPhone } = req.query;

    if (!checklistId || !userName || !userPhone) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const user = loadUser(userName as string, userPhone as string);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const checklist = user.checklists.find(cl => cl.id === checklistId);
    if (!checklist) {
        return res.status(404).json({ message: 'Checklist not found' });
    }

    const index = checklist.items.findIndex(item => item.id === itemId);
    if (index === -1) {
        return res.status(404).json({ message: 'Item not found' });
    }

    checklist.items.splice(index, 1);
    saveUser(user);

    res.status(200).json({ message: 'Item deleted' });
});

export default router;