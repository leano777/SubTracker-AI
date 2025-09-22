import { Request, Response, NextFunction } from 'express';
import { AuthUtils, JWTPayload } from '../utils/auth';
import prisma from '../lib/prisma';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
      };
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = AuthUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'No token provided'
      });
      return;
    }

    // Verify token
    const payload: JWTPayload = AuthUtils.verifyToken(token);

    // Check if user exists and is active
    const user = await prisma.user.findFirst({
      where: {
        id: payload.userId,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        emailVerified: true
      }
    });

    if (!user) {
      res.status(401).json({
        error: 'Authentication failed',
        message: 'User not found or inactive'
      });
      return;
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);

    if (error instanceof Error && error.message === 'Invalid token') {
      res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid or expired token'
      });
      return;
    }

    res.status(500).json({
      error: 'Authentication error',
      message: 'Internal server error during authentication'
    });
  }
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = AuthUtils.extractTokenFromHeader(authHeader);

    if (token) {
      try {
        const payload: JWTPayload = AuthUtils.verifyToken(token);

        const user = await prisma.user.findFirst({
          where: {
            id: payload.userId,
            isActive: true
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        });

        if (user) {
          req.user = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          };
        }
      } catch (error) {
        // Token is invalid, but continue without authentication
        console.log('Optional auth failed:', error);
      }
    }

    next();
  } catch (error) {
    // Don't fail on optional auth errors
    console.error('Optional authentication error:', error);
    next();
  }
};

export const requireEmailVerification = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'User not authenticated'
    });
    return;
  }

  // For now, we'll skip email verification check
  // In production, you'd check user.emailVerified
  next();
};

// Rate limiting for auth endpoints
export const authRateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    error: 'Too many authentication attempts',
    message: 'Please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
};