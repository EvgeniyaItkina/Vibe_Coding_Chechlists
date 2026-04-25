// routes/auth/auth.ts - Authentication routes
import express from 'express';
import { User } from '../../models/types.js';
import { loadUser, saveUser } from '../../utils/fileUtils.js';

const router = express.Router();

/**
 * POST /register - Register a new user
 * Body: { name: string, phone: string }
 */
router.post('/register', (req: express.Request, res: express.Response) => {
    const { name, phone } = req.body;

    if (!name || !phone) {
        return res.status(400).json({ message: 'Name and phone are required' });
    }

    // Registration is blocked if a user file already exists.
    const existingUser = loadUser(name, phone);
    if (existingUser) {
        return res.status(409).json({ message: 'User already registered' });
    }

    // Use a timestamp as a lightweight unique identifier.
    const newUser: User = {
        id: Date.now().toString(),
        name,
        phone,
        checklists: []
    };

    saveUser(newUser);
    res.status(201).json({ message: 'User registered successfully', user: newUser });
});

/**
 * POST /login - Login an existing user
 * Body: { name: string, phone: string }
 */
router.post('/login', (req: express.Request, res: express.Response) => {
    const { name, phone } = req.body;

    if (!name || !phone) {
        return res.status(400).json({ message: 'Name and phone are required' });
    }

    // Login succeeds only when a matching user record is found.
    const user = loadUser(name, phone);
    if (!user) {
        return res.status(404).json({ message: 'User not registered' });
    }

    res.status(200).json({ message: 'Login successful', user });
});

export default router;