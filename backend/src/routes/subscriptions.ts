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

// Create subscription
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { name, cost, billingCycle, nextBillingDate, description, categoryId } = req.body;

    // Validate required fields
    if (!name || !cost || !billingCycle || !nextBillingDate) {
      return res.status(400).json({
        error: 'Missing required fields: name, cost, billingCycle, nextBillingDate'
      });
    }

    // Validate billing cycle
    if (!['weekly', 'monthly', 'quarterly', 'semi_annually', 'annually'].includes(billingCycle)) {
      return res.status(400).json({
        error: 'Invalid billing cycle. Must be weekly, monthly, quarterly, semi_annually, or annually'
      });
    }

    // Validate cost
    if (cost <= 0) {
      return res.status(400).json({
        error: 'Cost must be greater than 0'
      });
    }

    const subscription = await prisma.subscription.create({
      data: {
        name,
        cost: parseFloat(cost),
        billingCycle,
        nextBillingDate: new Date(nextBillingDate),
        startDate: new Date(), // Set start date to now
        description: description || null,
        categoryId: categoryId || null,
        userId: req.user.id,
        provider: name // Use name as provider for now
      },
      include: {
        category: true
      }
    });

    res.status(201).json(subscription);
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// Get all subscriptions
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const subscriptions = await prisma.subscription.findMany({
      where: { userId: req.user.id },
      include: {
        category: true,
        payments: {
          orderBy: { paymentDate: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(subscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// Get upcoming bills
router.get('/upcoming', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const days = parseInt(req.query.days as string) || 30;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const upcomingBills = await prisma.subscription.findMany({
      where: {
        userId: req.user.id,
        isActive: true,
        nextBillingDate: {
          lte: futureDate
        }
      },
      include: {
        category: true
      },
      orderBy: { nextBillingDate: 'asc' }
    });

    res.json(upcomingBills);
  } catch (error) {
    console.error('Error fetching upcoming bills:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming bills' });
  }
});

// Get dashboard data
router.get('/dashboard', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const subscriptions = await prisma.subscription.findMany({
      where: { userId: req.user.id },
      include: {
        category: true
      }
    });

    const activeSubscriptions = subscriptions.filter(sub => sub.isActive);

    // Calculate monthly spending
    const totalMonthlySpending = activeSubscriptions.reduce((total, sub) => {
      let monthlyCost = sub.cost;
      switch (sub.billingCycle) {
        case 'weekly':
          monthlyCost = sub.cost * 4.33;
          break;
        case 'quarterly':
          monthlyCost = sub.cost / 3;
          break;
        case 'semi_annually':
          monthlyCost = sub.cost / 6;
          break;
        case 'annually':
          monthlyCost = sub.cost / 12;
          break;
        default: // monthly
          monthlyCost = sub.cost;
      }
      return total + monthlyCost;
    }, 0);

    // Get upcoming bills (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingBills = activeSubscriptions.filter(sub =>
      sub.nextBillingDate <= nextWeek
    );

    res.json({
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: activeSubscriptions.length,
      totalMonthlySpending: Math.round(totalMonthlySpending * 100) / 100,
      upcomingBills: upcomingBills.length,
      recentSubscriptions: subscriptions.slice(0, 5),
      nextBills: upcomingBills
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get subscription by ID
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: {
        category: true,
        payments: {
          orderBy: { paymentDate: 'desc' }
        }
      }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json(subscription);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// Update subscription
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { name, cost, billingCycle, nextBillingDate, description, categoryId, isActive } = req.body;

    // Check if subscription exists and belongs to user
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!existingSubscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // Validate billing cycle if provided
    if (billingCycle && !['weekly', 'monthly', 'quarterly', 'semi_annually', 'annually'].includes(billingCycle)) {
      return res.status(400).json({
        error: 'Invalid billing cycle. Must be weekly, monthly, quarterly, semi_annually, or annually'
      });
    }

    // Validate cost if provided
    if (cost !== undefined && cost <= 0) {
      return res.status(400).json({
        error: 'Cost must be greater than 0'
      });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (cost !== undefined) updateData.cost = parseFloat(cost);
    if (billingCycle !== undefined) updateData.billingCycle = billingCycle;
    if (nextBillingDate !== undefined) updateData.nextBillingDate = new Date(nextBillingDate);
    if (description !== undefined) updateData.description = description;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (isActive !== undefined) updateData.isActive = isActive;

    const subscription = await prisma.subscription.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        category: true,
        payments: true
      }
    });

    res.json(subscription);
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

// Delete subscription
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if subscription exists and belongs to user
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!existingSubscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    await prisma.subscription.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting subscription:', error);
    res.status(500).json({ error: 'Failed to delete subscription' });
  }
});

export default router;