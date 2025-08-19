import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Target,
  TrendingUp,
  AlertTriangle,
  Calendar,
  ChevronRight,
  Tag,
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Archive
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import type { Investment } from '../../types/financial';

export interface InvestmentThesis {
  id: string;
  investmentId: string;
  investmentSymbol: string;
  investmentName: string;
  createdDate: string;
  lastUpdated: string;
  status: 'draft' | 'active' | 'review' | 'archived';
  
  // Core thesis
  thesis: string;
  bullCase: string;
  bearCase: string;
  conviction: 'low' | 'medium' | 'high' | 'very_high';
  timeHorizon: '< 1 month' | '1-3 months' | '3-12 months' | '1-3 years' | '> 3 years';
  
  // Entry and exit criteria
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  entryRationale: string;
  exitCriteria: string[];
  
  // Risk assessment
  riskLevel: 'low' | 'medium' | 'high' | 'very_high';
  risks: string[];
  mitigationStrategies: string[];
  
  // Catalysts and milestones
  catalysts: {
    id: string;
    description: string;
    expectedDate?: string;
    impact: 'low' | 'medium' | 'high';
    occurred: boolean;
  }[];
  
  milestones: {
    id: string;
    description: string;
    targetDate?: string;
    achieved: boolean;
    achievedDate?: string;
  }[];
  
  // Review and updates
  reviewNotes: {
    id: string;
    date: string;
    note: string;
    priceAtReview: number;
    actionTaken?: 'hold' | 'buy_more' | 'trim' | 'sell';
  }[];
  
  // Tags for organization
  tags: string[];
  
  // Performance tracking
  performanceVsThesis: 'on_track' | 'outperforming' | 'underperforming' | 'thesis_broken';
}

interface InvestmentThesisProps {
  investments: Investment[];
  theses: InvestmentThesis[];
  onAddThesis: (thesis: InvestmentThesis) => void;
  onUpdateThesis: (id: string, updates: Partial<InvestmentThesis>) => void;
  onDeleteThesis: (id: string) => void;
}

const ThesisCard: React.FC<{
  thesis: InvestmentThesis;
  investment?: Investment;
  onEdit: () => void;
  onDelete: () => void;
  onAddReview: (note: string) => void;
}> = ({ thesis, investment, onEdit, onDelete, onAddReview }) => {
  const [showFullThesis, setShowFullThesis] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  const getStatusColor = (status: InvestmentThesis['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getPerformanceColor = (performance: InvestmentThesis['performanceVsThesis']) => {
    switch (performance) {
      case 'outperforming': return 'text-green-500';
      case 'on_track': return 'text-blue-500';
      case 'underperforming': return 'text-yellow-500';
      case 'thesis_broken': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const currentPrice = investment?.currentPrice || 0;
  const priceVsTarget = currentPrice ? ((currentPrice - thesis.entryPrice) / (thesis.targetPrice - thesis.entryPrice)) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{thesis.investmentSymbol}</CardTitle>
              <Badge className={getStatusColor(thesis.status)}>
                {thesis.status}
              </Badge>
              <Badge variant="outline">
                {thesis.conviction} conviction
              </Badge>
            </div>
            <CardDescription>{thesis.investmentName}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Thesis Summary */}
        <div>
          <h4 className="text-sm font-medium mb-2">Investment Thesis</h4>
          <p className={`text-sm text-muted-foreground ${!showFullThesis ? 'line-clamp-3' : ''}`}>
            {thesis.thesis}
          </p>
          {thesis.thesis.length > 150 && (
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto"
              onClick={() => setShowFullThesis(!showFullThesis)}
            >
              {showFullThesis ? 'Show less' : 'Read more'}
            </Button>
          )}
        </div>

        {/* Price Targets */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Entry Price</p>
            <p className="font-medium">${thesis.entryPrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Current Price</p>
            <p className="font-medium">${currentPrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Target Price</p>
            <p className="font-medium text-green-500">${thesis.targetPrice.toFixed(2)}</p>
          </div>
        </div>

        {/* Progress to Target */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Progress to Target</span>
            <span className="font-medium">{priceVsTarget.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, priceVsTarget))}%` }}
            />
          </div>
        </div>

        {/* Catalysts */}
        {thesis.catalysts.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Key Catalysts</h4>
            <div className="space-y-1">
              {thesis.catalysts.slice(0, 2).map((catalyst) => (
                <div key={catalyst.id} className="flex items-center gap-2">
                  {catalyst.occurred ? (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  ) : (
                    <Clock className="w-3 h-3 text-yellow-500" />
                  )}
                  <span className="text-xs">{catalyst.description}</span>
                  {catalyst.expectedDate && !catalyst.occurred && (
                    <span className="text-xs text-muted-foreground">
                      ({catalyst.expectedDate})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance vs Thesis */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Performance:</span>
            <span className={`text-sm font-medium ${getPerformanceColor(thesis.performanceVsThesis)}`}>
              {thesis.performanceVsThesis.replace('_', ' ')}
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowReviewDialog(true)}
          >
            Add Review
          </Button>
        </div>

        {/* Tags */}
        {thesis.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {thesis.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Review Note</DialogTitle>
            <DialogDescription>
              Document your thoughts on {thesis.investmentSymbol}'s performance
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Review Note</Label>
              <Textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="How is the investment performing relative to your thesis?"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              onAddReview(reviewNote);
              setReviewNote('');
              setShowReviewDialog(false);
            }}>
              Save Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export const InvestmentThesisManager: React.FC<InvestmentThesisProps> = ({
  investments,
  theses,
  onAddThesis,
  onUpdateThesis,
  onDeleteThesis
}) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingThesis, setEditingThesis] = useState<InvestmentThesis | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter theses
  const filteredTheses = theses.filter(thesis => {
    const matchesStatus = filterStatus === 'all' || thesis.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      thesis.investmentSymbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thesis.investmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thesis.thesis.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Group theses by status
  const activeTheses = filteredTheses.filter(t => t.status === 'active');
  const reviewTheses = filteredTheses.filter(t => t.status === 'review');
  const draftTheses = filteredTheses.filter(t => t.status === 'draft');

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2 w-full md:w-auto">
              <Input
                placeholder="Search theses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64"
              />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-1" />
              New Thesis
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Thesis Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Theses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{activeTheses.length}</p>
            <p className="text-xs text-muted-foreground">Currently monitoring</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Need Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-500">{reviewTheses.length}</p>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              High Conviction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {theses.filter(t => t.conviction === 'high' || t.conviction === 'very_high').length}
            </p>
            <p className="text-xs text-muted-foreground">Strong beliefs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Outperforming
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-500">
              {theses.filter(t => t.performanceVsThesis === 'outperforming').length}
            </p>
            <p className="text-xs text-muted-foreground">Beating expectations</p>
          </CardContent>
        </Card>
      </div>

      {/* Theses List */}
      <div className="space-y-4">
        {filteredTheses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No investment theses found</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowAddDialog(true)}
              >
                Create your first thesis
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredTheses.map((thesis) => {
              const investment = investments.find(inv => inv.id === thesis.investmentId);
              return (
                <ThesisCard
                  key={thesis.id}
                  thesis={thesis}
                  investment={investment}
                  onEdit={() => setEditingThesis(thesis)}
                  onDelete={() => onDeleteThesis(thesis.id)}
                  onAddReview={(note) => {
                    const newReview = {
                      id: Date.now().toString(),
                      date: new Date().toISOString(),
                      note,
                      priceAtReview: investment?.currentPrice || 0
                    };
                    onUpdateThesis(thesis.id, {
                      reviewNotes: [...thesis.reviewNotes, newReview]
                    });
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Investment Ideas Section */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Ideas & Research</CardTitle>
          <CardDescription>
            Track potential investments and research notes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <FileText className="w-4 h-4" />
            <AlertDescription>
              Use investment theses to document your reasoning before making trades. 
              This helps you stick to your strategy and learn from both wins and losses.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};