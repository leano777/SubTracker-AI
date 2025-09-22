import { Router } from 'express';
import { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Create category
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { name, description, color, icon, budgetLimit } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        error: 'Missing required field: name'
      });
    }

    // Check if category name already exists for this user
    const existingCategory = await prisma.category.findFirst({
      where: {
        userId: req.user.id,
        name
      }
    });

    if (existingCategory) {
      return res.status(409).json({
        error: 'Category with this name already exists'
      });
    }

    const category = await prisma.category.create({
      data: {
        name,
        description: description || null,
        color: color || '#3B82F6',
        icon: icon || 'folder',
        budgetLimit: budgetLimit ? parseFloat(budgetLimit) : 0.00,
        userId: req.user.id
      }
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Get all categories
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const categories = await prisma.category.findMany({
      where: { userId: req.user.id },
      include: {
        subscriptions: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            cost: true,
            billingCycle: true
          }
        },
        _count: {
          select: {
            subscriptions: {
              where: { isActive: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get category by ID
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const category = await prisma.category.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: {
        subscriptions: {
          where: { isActive: true },
          include: {
            payments: {
              orderBy: { paymentDate: 'desc' },
              take: 5
            }
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// Update category
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { name, description, color, icon, budgetLimit } = req.body;

    // Check if category exists and belongs to user
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if name is being changed and if it conflicts with another category
    if (name && name !== existingCategory.name) {
      const nameConflict = await prisma.category.findFirst({
        where: {
          userId: req.user.id,
          name,
          id: { not: req.params.id }
        }
      });

      if (nameConflict) {
        return res.status(409).json({
          error: 'Category with this name already exists'
        });
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (color !== undefined) updateData.color = color;
    if (icon !== undefined) updateData.icon = icon;
    if (budgetLimit !== undefined) updateData.budgetLimit = parseFloat(budgetLimit);

    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        subscriptions: {
          where: { isActive: true }
        }
      }
    });

    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if category exists and belongs to user
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: {
        subscriptions: true
      }
    });

    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if category has active subscriptions
    const activeSubscriptions = existingCategory.subscriptions.filter(sub => sub.isActive);
    if (activeSubscriptions.length > 0) {
      return res.status(409).json({
        error: 'Cannot delete category with active subscriptions. Please reassign or delete subscriptions first.',
        activeSubscriptions: activeSubscriptions.length
      });
    }

    await prisma.category.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;