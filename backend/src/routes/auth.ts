import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/database';
import { User, CreateUserDto, LoginDto } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// JWT secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

// Generate JWT token
const generateToken = (user: User): string => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      username: user.username 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY } as any
  );
};

// Login
router.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError('Validation failed', 400, 'VALIDATION_ERROR', errors.array());
    }

    const { email, password }: LoginDto = req.body;

    // For demo, accept any password for demo@example.com
    if (email === 'demo@example.com') {
      const user = await db.getUserByEmail(email);
      if (user) {
        const token = generateToken(user);
        const { passwordHash, ...userWithoutPassword } = user;
        
        res.json({
          user: userWithoutPassword,
          token,
        });
        return;
      }
    }

    throw new ApiError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  })
);

// Register
router.post('/register',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('username').isAlphanumeric().isLength({ min: 3, max: 20 }),
  body('name').notEmpty().trim(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError('Validation failed', 400, 'VALIDATION_ERROR', errors.array());
    }

    const createDto: CreateUserDto = req.body;

    // Check if user exists
    const existingUser = await db.getUserByEmail(createDto.email);
    if (existingUser) {
      throw new ApiError('Email already registered', 400, 'EMAIL_EXISTS');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(createDto.password, 10);

    // Create user
    const user: User = {
      id: uuidv4(),
      email: createDto.email,
      username: createDto.username,
      name: createDto.name,
      passwordHash,
      preferences: {
        theme: 'system',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          inApp: true,
        },
        privacy: {
          profileVisibility: 'public',
          showEmail: false,
          showActivity: true,
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const created = await db.createUser(user);
    const token = generateToken(created);
    const { passwordHash: _, ...userWithoutPassword } = created;

    res.status(201).json({
      user: userWithoutPassword,
      token,
    });
  })
);

// Get current user
router.get('/me',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = await db.getUserById(req.user!.id);
    
    if (!user) {
      throw new ApiError('User not found', 404, 'NOT_FOUND');
    }

    const { passwordHash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  })
);

// Refresh token
router.post('/refresh',
  asyncHandler(async (req, res) => {
    // In production, verify refresh token
    const userId = 'user-1';
    const user = await db.getUserById(userId);
    
    if (!user) {
      throw new ApiError('User not found', 404, 'NOT_FOUND');
    }

    const token = generateToken(user);
    res.json({ token });
  })
);

// Logout
router.post('/logout',
  asyncHandler(async (req, res) => {
    // In production, invalidate token/session
    res.json({ message: 'Logged out successfully' });
  })
);

export default router;