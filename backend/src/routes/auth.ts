import express from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController, authValidation } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Rate limiting for auth endpoints
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    error: 'Too many authentication attempts',
    message: 'Please try again in 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    error: 'Too many requests',
    message: 'Please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes (with rate limiting)
router.post('/register', authRateLimit, authValidation.register, AuthController.register);
router.post('/login', authRateLimit, authValidation.login, AuthController.login);

// Protected routes
router.get('/profile', generalRateLimit, authenticateToken, AuthController.getProfile);
router.post('/logout', generalRateLimit, authenticateToken, AuthController.logout);
router.post('/refresh', generalRateLimit, authenticateToken, AuthController.refreshToken);

// Health check for auth service
router.get('/health', (req, res) => {
  res.status(200).json({
    service: 'Authentication Service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      public: ['/register', '/login'],
      protected: ['/profile', '/logout', '/refresh']
    }
  });
});

export default router;