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

// Create payment
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { subscriptionId, amount, paymentDate, paymentMethod, transactionId, status, notes, receiptUrl } = req.body;

    // Validate required fields
    if (!subscriptionId || !amount || !paymentDate) {
      return res.status(400).json({
        error: 'Missing required fields: subscriptionId, amount, paymentDate'
      });
    }

    // Verify subscription exists and belongs to user
    const subscription = await prisma.subscription.findFirst({
      where: {
        id: subscriptionId,
        userId: req.user.id
      }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({
        error: 'Amount must be greater than 0'
      });
    }

    // Validate status if provided
    if (status && !['pending', 'completed', 'failed', 'refunded', 'disputed'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status. Must be pending, completed, failed, refunded, or disputed'
      });
    }

    const payment = await prisma.payment.create({
      data: {
        subscriptionId,
        userId: req.user.id,
        amount: parseFloat(amount),
        paymentDate: new Date(paymentDate),
        paymentMethod: paymentMethod || null,
        transactionId: transactionId || null,
        status: status || 'completed',
        notes: notes || null,
        receiptUrl: receiptUrl || null
      },
      include: {
        subscription: {
          select: {
            id: true,
            name: true,
            provider: true
          }
        }
      }
    });

    res.status(201).json(payment);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// Get all payments
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { subscriptionId, status, limit = '50', offset = '0' } = req.query;

    const whereClause: any = {
      userId: req.user.id
    };

    if (subscriptionId) {
      whereClause.subscriptionId = subscriptionId as string;
    }

    if (status) {
      whereClause.status = status as string;
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        subscription: {
          select: {
            id: true,
            name: true,
            provider: true,
            category: {
              select: {
                id: true,
                name: true,
                color: true
              }
            }
          }
        }
      },
      orderBy: { paymentDate: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    // Get total count for pagination
    const totalCount = await prisma.payment.count({
      where: whereClause
    });

    res.json({
      payments,
      pagination: {
        total: totalCount,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: parseInt(offset as string) + parseInt(limit as string) < totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Get payment by ID
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const payment = await prisma.payment.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: {
        subscription: {
          include: {
            category: true
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

// Update payment
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { amount, paymentDate, paymentMethod, transactionId, status, notes, receiptUrl } = req.body;

    // Check if payment exists and belongs to user
    const existingPayment = await prisma.payment.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!existingPayment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Validate amount if provided
    if (amount !== undefined && amount <= 0) {
      return res.status(400).json({
        error: 'Amount must be greater than 0'
      });
    }

    // Validate status if provided
    if (status && !['pending', 'completed', 'failed', 'refunded', 'disputed'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status. Must be pending, completed, failed, refunded, or disputed'
      });
    }

    const updateData: any = {};
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (paymentDate !== undefined) updateData.paymentDate = new Date(paymentDate);
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (transactionId !== undefined) updateData.transactionId = transactionId;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (receiptUrl !== undefined) updateData.receiptUrl = receiptUrl;

    const payment = await prisma.payment.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        subscription: {
          include: {
            category: true
          }
        }
      }
    });

    res.json(payment);
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ error: 'Failed to update payment' });
  }
});

// Delete payment
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if payment exists and belongs to user
    const existingPayment = await prisma.payment.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!existingPayment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    await prisma.payment.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ error: 'Failed to delete payment' });
  }
});

// Get payment analytics
router.get('/analytics/summary', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { startDate, endDate } = req.query;

    const whereClause: any = {
      userId: req.user.id,
      status: 'completed'
    };

    if (startDate && endDate) {
      whereClause.paymentDate = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    // Get payment summary
    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        subscription: {
          include: {
            category: true
          }
        }
      }
    });

    // Calculate analytics
    const totalSpent = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const paymentCount = payments.length;
    const averagePayment = paymentCount > 0 ? totalSpent / paymentCount : 0;

    // Group by category
    const categorySpending = payments.reduce((acc, payment) => {
      const categoryName = payment.subscription.category?.name || 'Uncategorized';
      if (!acc[categoryName]) {
        acc[categoryName] = {
          total: 0,
          count: 0,
          color: payment.subscription.category?.color || '#6B7280'
        };
      }
      acc[categoryName].total += payment.amount;
      acc[categoryName].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number; color: string }>);

    // Group by month
    const monthlySpending = payments.reduce((acc, payment) => {
      const monthKey = payment.paymentDate.toISOString().slice(0, 7); // YYYY-MM
      if (!acc[monthKey]) {
        acc[monthKey] = {
          total: 0,
          count: 0
        };
      }
      acc[monthKey].total += payment.amount;
      acc[monthKey].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    res.json({
      summary: {
        totalSpent: Math.round(totalSpent * 100) / 100,
        paymentCount,
        averagePayment: Math.round(averagePayment * 100) / 100
      },
      categoryBreakdown: Object.entries(categorySpending).map(([name, data]) => ({
        category: name,
        total: Math.round(data.total * 100) / 100,
        count: data.count,
        color: data.color
      })),
      monthlyTrends: Object.entries(monthlySpending).map(([month, data]) => ({
        month,
        total: Math.round(data.total * 100) / 100,
        count: data.count
      })).sort((a, b) => a.month.localeCompare(b.month))
    });
  } catch (error) {
    console.error('Error fetching payment analytics:', error);
    res.status(500).json({ error: 'Failed to fetch payment analytics' });
  }
});

export default router;