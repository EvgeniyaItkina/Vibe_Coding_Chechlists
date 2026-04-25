// routes/checklists/checklists.ts - Checklist management routes
import express from 'express';
import { Checklist } from '../../models/types.js';
import { loadUser, saveUser } from '../../utils/fileUtils.js';

const router = express.Router();

/**
 * GET /checklists - Get all checklists for a user
 * Query: { name: string, phone: string }
 */
router.get('/', (req: express.Request, res: express.Response) => {
    const { name, phone } = req.query;

    if (!name || !phone) {
        return res.status(400).json({ message: 'Name and phone are required' });
    }

    const user = loadUser(name as string, phone as string);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user.checklists);
});

/**
 * POST /checklists - Create a new checklist
 * Body: { name: string, userName: string, userPhone: string }
 */
router.post('/', (req: express.Request, res: express.Response) => {
    const { name, userName, userPhone } = req.body;

    if (!name || !userName || !userPhone) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const user = loadUser(userName, userPhone);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Create a new checklist for the authenticated user.
    const newChecklist: Checklist = {
        id: Date.now().toString(),
        name,
        items: []
    };

    user.checklists.push(newChecklist);
    saveUser(user);

    res.status(201).json({ message: 'Checklist created', checklist: newChecklist });
});

/**
 * DELETE /checklists/:id - Delete a checklist
 * Params: { id: string }
 * Query: { name: string, phone: string }
 */
router.delete('/:id', (req: express.Request, res: express.Response) => {
    const { id } = req.params;
    
    const { name: userName, phone: userPhone } = req.query;

    if (!userName || !userPhone) {
        return res.status(400).json({ message: 'User name and phone are required' });
    }

    const user = loadUser(userName as string, userPhone as string);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Locate checklist by id before deleting it.
    const index = user.checklists.findIndex(cl => cl.id === id);
    if (index === -1) {
        return res.status(404).json({ message: 'Checklist not found' });
    }

    user.checklists.splice(index, 1);
    saveUser(user);

    res.status(200).json({ message: 'Checklist deleted' });
});

/**
 * PUT /checklists/:id - Update checklist name
 * Params: { id: string }
 * Body: { newName: string, userName: string, userPhone: string }
 */
router.put('/:id', (req: express.Request, res: express.Response) => {
    const { id } = req.params;
    const { newName, userName, userPhone } = req.body;

    if (!newName || !userName || !userPhone) {
        return res.status(400).json({ message: 'New name, user name and phone are required' });
    }

    const user = loadUser(userName, userPhone);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const checklist = user.checklists.find(cl => cl.id === id);
    if (!checklist) {
        return res.status(404).json({ message: 'Checklist not found' });
    }

    // Prevent duplicate checklist names within the same account.
    if (user.checklists.some(cl => cl.name === newName && cl.id !== id)) {
        return res.status(400).json({ message: 'Checklist with this name already exists' });
    }

    checklist.name = newName;
    saveUser(user);

    res.status(200).json({ message: 'Checklist name updated' });
});

export default router;