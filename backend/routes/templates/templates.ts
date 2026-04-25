import express, { Request, Response } from 'express';
import { Checklist, Item } from '../../models/types.js';
import { loadTemplates, loadUser, saveUser } from '../../utils/fileUtils.js';

const router = express.Router();

router.get('/', (_req: Request, res: Response) => {
    const templates = loadTemplates();
    const summary = templates.map((template) => ({
        id: template.id,
        name: template.name,
        itemCount: template.items.length
    }));

    res.status(200).json(summary);
});

router.get('/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const templates = loadTemplates();
    const template = templates.find((checklist) => checklist.id === id);

    if (!template) {
        return res.status(404).json({ message: 'Template not found' });
    }

    res.status(200).json(template);
});

router.post('/checklists', (req: Request, res: Response) => {
    const { templateIds, userName, userPhone } = req.body as {
        templateIds?: string[];
        userName?: string;
        userPhone?: string;
    };

    if (!Array.isArray(templateIds) || !templateIds.length || !userName || !userPhone) {
        return res.status(400).json({ message: 'templateIds, userName and userPhone are required' });
    }

    const user = loadUser(userName, userPhone);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const templates = loadTemplates();
    const templatesToCopy = templates.filter((template) => templateIds.includes(template.id));

    if (!templatesToCopy.length) {
        return res.status(404).json({ message: 'No matching templates found' });
    }

    const now = Date.now();
    const copiedChecklists: Checklist[] = templatesToCopy.map((template, templateIndex) => ({
        id: `${now}_${templateIndex}`,
        name: template.name,
        sourceTemplateId: template.id,
        items: template.items.map((item: Item, itemIndex: number) => ({
            id: `${now}_${templateIndex}_${itemIndex}`,
            text: item.text,
            done: false
        }))
    }));

    user.checklists.push(...copiedChecklists);
    saveUser(user);

    return res.status(201).json({
        message: 'Templates copied to user checklists',
        copiedChecklists
    });
});

export default router;
