import { useState, useMemo } from 'react';
import {
  PiggyBank,
  Car,
  Home,
  UtensilsCrossed,
  CreditCard,
  Shield,
  Heart,
  Lightbulb,
  Plus,
  Settings,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Calendar,
  Target,
  ArrowUpRight,
  ArrowDownLeft,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Switch } from '../../../components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import { ScrollArea } from '../../../components/ui/scroll-area';
import type { BudgetPod, IncomeSource, PaycheckAllocation, PayCycleSummary } from '../../../types/financial';
import { BudgetPodForm } from '../../../components/forms/BudgetPodForm';
import { IncomeAllocation } from './IncomeAllocation';

interface BudgetPodsProps {
  budgetPods: BudgetPod[];
  incomeSources: IncomeSource[];
  paycheckAllocations: PaycheckAllocation[];
  payCycleSummary?: PayCycleSummary;
  onAddPod: (pod: Omit<BudgetPod, 'id' | 'createdDate' | 'lastModified'>) => void;
  onUpdatePod: (id: string, updates: Partial<BudgetPod>) => void;
  onDeletePod: (id: string) => void;
  onAddFunds: (id: string, amount: number, note?: string) => void;
  onWithdrawFunds: (id: string, amount: number, reason: string) => void;
  // Income management
  onAddIncomeSource: (source: Omit<IncomeSource, 'id' | 'createdDate' | 'lastModified'>) => void;
  onUpdateIncomeSource: (id: string, updates: Partial<IncomeSource>) => void;
  onDeleteIncomeSource: (id: string) => void;
  onCreatePaycheckAllocation: (allocation: Omit<PaycheckAllocation, 'id'>) => void;
  onUpdatePaycheckAllocation: (id: string, updates: Partial<PaycheckAllocation>) => void;
}

const POD_ICONS = {
  vehicle: Car,
  rent: Home,
  food: UtensilsCrossed,
  subscriptions: CreditCard,
  emergency: Shield,
  entertainment: Heart,
  health: Heart,
  utilities: Lightbulb,
  custom: PiggyBank,
};

const POD_COLORS = {
  vehicle: 'bg-blue-500',
  rent: 'bg-green-500',
  food: 'bg-orange-500',
  subscriptions: 'bg-purple-500',
  emergency: 'bg-red-500',
  entertainment: 'bg-pink-500',
  health: 'bg-teal-500',
  utilities: 'bg-yellow-500',
  custom: 'bg-gray-500',
};

const BudgetPodCard = ({ 
  pod, 
  onUpdate, 
  onDelete, 
  onAddFunds, 
  onWithdrawFunds,
  onEdit
}: {
  pod: BudgetPod;
  onUpdate: (updates: Partial<BudgetPod>) => void;
  onDelete: () => void;
  onAddFunds: (amount: number, note?: string) => void;
  onWithdrawFunds: (amount: number, reason: string) => void;
  onEdit?: (pod: BudgetPod) => void;
}) => {
  const [showTransactionDialog, setShowTransactionDialog] = useState<'add' | 'withdraw' | null>(null);
  const [transactionAmount, setTransactionAmount] = useState('');
  const [transactionNote, setTransactionNote] = useState('');

  const Icon = POD_ICONS[pod.type];
  const colorClass = POD_COLORS[pod.type];
  
  const progressPercentage = pod.targetAmount 
    ? (pod.currentAmount / pod.targetAmount) * 100
    : (pod.currentAmount / pod.monthlyAmount) * 100;

  const isAtRisk = pod.warningThreshold && pod.currentAmount < pod.warningThreshold;
  const isOverTarget = pod.targetAmount && pod.currentAmount >= pod.targetAmount;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleTransaction = (type: 'add' | 'withdraw') => {
    const amount = parseFloat(transactionAmount);
    if (!amount || amount <= 0) return;

    if (type === 'add') {
      onAddFunds(amount, transactionNote || undefined);
    } else {
      onWithdrawFunds(amount, transactionNote || 'Manual withdrawal');
    }

    setTransactionAmount('');
    setTransactionNote('');
    setShowTransactionDialog(null);
  };

  return (
    <Card className={`relative transition-all hover:shadow-lg ${isAtRisk ? 'border-red-300' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`${colorClass} p-2 rounded-lg text-white`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{pod.name}</CardTitle>
              {pod.description && (
                <CardDescription className="text-sm">{pod.description}</CardDescription>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(pod)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Pod
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdate({ isActive: !pod.isActive })}>
                {pod.isActive ? 'Pause Pod' : 'Activate Pod'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowTransactionDialog('add')}>
                Add Funds
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowTransactionDialog('withdraw')}>
                Withdraw Funds
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={onDelete}>
                Delete Pod
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status Badges */}
        <div className="flex items-center gap-2 mt-2">
          {!pod.isActive && <Badge variant="secondary">Paused</Badge>}
          {pod.autoTransfer && <Badge variant="outline">Auto-Transfer</Badge>}
          {isOverTarget && <Badge className="bg-green-500">Target Reached</Badge>}
          {isAtRisk && <Badge variant="destructive">Low Balance</Badge>}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Balance and Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold">{formatCurrency(pod.currentAmount)}</span>
            <span className="text-sm text-muted-foreground">
              {pod.targetAmount ? `/ ${formatCurrency(pod.targetAmount)}` : `Monthly: ${formatCurrency(pod.monthlyAmount)}`}
            </span>
          </div>
          
          <Progress 
            value={Math.min(progressPercentage, 100)} 
            className="h-2"
          />
          
          <div className="text-xs text-muted-foreground text-center">
            {Math.round(progressPercentage)}% of {pod.targetAmount ? 'target' : 'monthly goal'}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">Monthly Target</p>
            <p className="font-semibold">{formatCurrency(pod.monthlyAmount)}</p>
          </div>
          <div className="text-center p-2 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">Priority</p>
            <div className="flex justify-center">
              {Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full mx-0.5 ${
                    i < pod.priority ? 'bg-yellow-400' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowTransactionDialog('add')}
            disabled={!pod.isActive}
          >
            <ArrowUpRight className="w-3 h-3 mr-1" />
            Add
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowTransactionDialog('withdraw')}
            disabled={!pod.isActive || pod.currentAmount <= 0}
          >
            <ArrowDownLeft className="w-3 h-3 mr-1" />
            Withdraw
          </Button>
        </div>
      </CardContent>

      {/* Transaction Dialogs */}
      <Dialog open={showTransactionDialog === 'add'} onOpenChange={() => setShowTransactionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Funds to {pod.name}</DialogTitle>
            <DialogDescription>
              Add money to this budget pod
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={transactionAmount}
                onChange={(e) => setTransactionAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="note">Note (optional)</Label>
              <Textarea
                id="note"
                value={transactionNote}
                onChange={(e) => setTransactionNote(e.target.value)}
                placeholder="Reason for adding funds..."
                rows={2}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowTransactionDialog(null)}>
                Cancel
              </Button>
              <Button onClick={() => handleTransaction('add')}>
                Add {transactionAmount ? formatCurrency(parseFloat(transactionAmount)) : 'Funds'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showTransactionDialog === 'withdraw'} onOpenChange={() => setShowTransactionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw from {pod.name}</DialogTitle>
            <DialogDescription>
              Current balance: {formatCurrency(pod.currentAmount)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={transactionAmount}
                onChange={(e) => setTransactionAmount(e.target.value)}
                placeholder="0.00"
                max={pod.currentAmount}
              />
            </div>
            <div>
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={transactionNote}
                onChange={(e) => setTransactionNote(e.target.value)}
                placeholder="What is this withdrawal for?"
                rows={2}
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowTransactionDialog(null)}>
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={() => handleTransaction('withdraw')}
                disabled={!transactionNote.trim()}
              >
                Withdraw {transactionAmount ? formatCurrency(parseFloat(transactionAmount)) : 'Funds'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

// TODO(human): Implement the main BudgetPods component logic
// The component should:
// 1. Show summary stats (total pods, monthly allocation, current balances)
// 2. Display pod cards in a responsive grid
// 3. Handle creating new pods with the pod creation form
// 4. Show recent transactions across all pods
// 5. Provide pod management actions (edit, delete, pause/resume)

export const BudgetPods = ({
  budgetPods,
  incomeSources,
  paycheckAllocations,
  payCycleSummary,
  onAddPod,
  onUpdatePod,
  onDeletePod,
  onAddFunds,
  onWithdrawFunds,
  onAddIncomeSource,
  onUpdateIncomeSource,
  onDeleteIncomeSource,
  onCreatePaycheckAllocation,
  onUpdatePaycheckAllocation,
}: BudgetPodsProps) => {
  const [showPodForm, setShowPodForm] = useState(false);
  const [editingPod, setEditingPod] = useState<BudgetPod | null>(null);

  // Calculate summary statistics
  const summary = useMemo(() => {
    const activePods = budgetPods.filter(p => p.isActive);
    return {
      totalPods: budgetPods.length,
      activePods: activePods.length,
      totalMonthlyAllocation: activePods.reduce((sum, pod) => sum + pod.monthlyAmount, 0),
      totalCurrentBalance: activePods.reduce((sum, pod) => sum + pod.currentAmount, 0),
      podsAtRisk: activePods.filter(p => p.warningThreshold && p.currentAmount < p.warningThreshold).length,
      podsOnTarget: activePods.filter(p => p.targetAmount && p.currentAmount >= p.targetAmount).length,
    };
  }, [budgetPods]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Handle pod form actions
  const handlePodSave = (podData: Omit<BudgetPod, 'id' | 'createdDate' | 'lastModified'>) => {
    if (editingPod) {
      onUpdatePod(editingPod.id, podData);
    } else {
      onAddPod(podData);
    }
    setShowPodForm(false);
    setEditingPod(null);
  };

  const handlePodCancel = () => {
    setShowPodForm(false);
    setEditingPod(null);
  };

  const handleAddNew = () => {
    setEditingPod(null);
    setShowPodForm(true);
  };

  const handleEditPod = (pod: BudgetPod) => {
    setEditingPod(pod);
    setShowPodForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Budget Pods</h2>
          <p className="text-muted-foreground">
            Organize your money into targeted savings buckets
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="w-4 h-4 mr-2" />
          Create Pod
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{summary.totalPods}</div>
            <p className="text-xs text-muted-foreground">Total Pods</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{formatCurrency(summary.totalCurrentBalance)}</div>
            <p className="text-xs text-muted-foreground">Total Balance</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{formatCurrency(summary.totalMonthlyAllocation)}</div>
            <p className="text-xs text-muted-foreground">Monthly Target</p>
          </CardContent>
        </Card>
        
        <Card className={summary.podsAtRisk > 0 ? 'border-red-300' : ''}>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{summary.podsAtRisk}</div>
            <p className="text-xs text-muted-foreground">At Risk</p>
          </CardContent>
        </Card>
        
        <Card className={summary.podsOnTarget > 0 ? 'border-green-300' : ''}>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{summary.podsOnTarget}</div>
            <p className="text-xs text-muted-foreground">On Target</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="pods" className="w-full">
        <TabsList>
          <TabsTrigger value="pods">My Pods</TabsTrigger>
          <TabsTrigger value="income">Income Mapping</TabsTrigger>
          <TabsTrigger value="transactions">Recent Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pods" className="space-y-4">
          {budgetPods.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <PiggyBank className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Budget Pods Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first budget pod to start organizing your savings
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Pod
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Your First Budget Pod</DialogTitle>
                    </DialogHeader>
                    <div className="text-center py-4 text-muted-foreground">
                      Pod creation form coming soon...
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {budgetPods.map((pod) => (
                <BudgetPodCard
                  key={pod.id}
                  pod={pod}
                  onUpdate={(updates) => onUpdatePod(pod.id, updates)}
                  onDelete={() => onDeletePod(pod.id)}
                  onAddFunds={(amount, note) => onAddFunds(pod.id, amount, note)}
                  onWithdrawFunds={(amount, reason) => onWithdrawFunds(pod.id, amount, reason)}
                  onEdit={handleEditPod}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Income Mapping Tab */}
        <TabsContent value="income" className="space-y-4">
          <IncomeAllocation
            incomeSources={incomeSources}
            paycheckAllocations={paycheckAllocations}
            budgetPods={budgetPods}
            payCycleSummary={payCycleSummary}
            onAddIncomeSource={onAddIncomeSource}
            onUpdateIncomeSource={onUpdateIncomeSource}
            onDeleteIncomeSource={onDeleteIncomeSource}
            onCreatePaycheckAllocation={onCreatePaycheckAllocation}
            onUpdatePaycheckAllocation={onUpdatePaycheckAllocation}
          />
        </TabsContent>
        
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Transaction History</h3>
              <p className="text-muted-foreground">
                Recent activity across all your budget pods will appear here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Budget Pod Form Modal */}
      <Dialog open={showPodForm} onOpenChange={setShowPodForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPod ? 'Edit Budget Pod' : 'Create New Budget Pod'}
            </DialogTitle>
            <DialogDescription>
              {editingPod 
                ? 'Update your budget pod settings and configuration' 
                : 'Set up a new savings pod for organized budget management'
              }
            </DialogDescription>
          </DialogHeader>
          <BudgetPodForm
            pod={editingPod || undefined}
            onSave={handlePodSave}
            onCancel={handlePodCancel}
            mode={editingPod ? 'edit' : 'create'}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};