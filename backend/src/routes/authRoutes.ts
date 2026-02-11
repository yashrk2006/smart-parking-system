import { Router } from 'express';
import { query } from '../config/db';

const router = Router();

// Login (Mock implementation for prototype)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // HARDCODED DEMO CREDENTIALS (Bypass DB for reliability in demo)
    if (email === 'admin' || email === 'admin@mcd.gov.in') {
        return res.json({
            token: 'mock-token-admin',
            user: { id: 'u1', username: 'Administrator', email: 'admin@mcd.gov.in', role: 'admin', department: 'IT' }
        });
    }
    if (email === 'officer' || email === 'officer@mcd.gov.in') {
        return res.json({
            token: 'mock-token-officer',
            user: { id: 'u2', username: 'Rajesh Kumar', email: 'officer@mcd.gov.in', role: 'officer', department: 'Enforcement' }
        });
    }
    if (email === 'vendor' || email === 'contractor' || email === 'vendor@mcd.gov.in') {
        return res.json({
            token: 'mock-token-vendor',
            user: { id: 'u3', username: 'SecurePark Ltd', email: 'vendor@mcd.gov.in', role: 'contractor', department: 'Operations' }
        });
    }

    // Check database for user
    try {
        const result = await query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            // No user found — for demo, allow any credentials as admin
            return res.json({
                token: 'mock-token-demo',
                user: { id: 'demo-1', username: email.split('@')[0] || 'Demo User', email, role: 'admin', department: 'Demo' }
            });
        }

        const user = result.rows[0] as any;

        // In production: use bcrypt.compare(password, user.password_hash)
        // For demo: accept any password for existing DB users
        const token = 'mock-jwt-token-' + user.id;

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                department: user.department
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/me', async (req, res) => {
    // Mock current user
    res.json({
        id: 'admin-id',
        username: 'admin',
        email: 'admin@mcd.gov.in',
        role: 'admin',
        department: 'Infrastructure'
    });
});

export default router;
