import { useState, useEffect } from 'react';
import {
  BookOpen,
  TrendingUp,
  Target,
  Eye,
  Calendar,
  CheckSquare,
  FileText,
  Tag,
  Plus,
  X,
  Star,
  AlertCircle,
  CheckCircle,
  Link as LinkIcon,
  Heart,
  Meh,
  Frown,
  Sparkles,
  ChevronDown,
  Clock,
  Square,
  Trash2,
  Edit,
  PlusCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { NotebookEntry } from '../../types/financial';

interface NotebookFormProps {
  notebook?: NotebookEntry;
  onSave: (data: NotebookEntry) => void;
  onCancel: () => void;
  mode?: 'create' | 'edit';
}

// Notebook templates for different financial documentation needs
const NOTEBOOK_TEMPLATES = [
  {
    title: 'Investment Thesis: Tech Stock Analysis',
    type: 'investment_thesis',
    content: '# Investment Thesis\n\n## Company Overview\n[Brief description of the company]\n\n## Investment Rationale\n- Key growth drivers\n- Competitive advantages\n- Market opportunity\n\n## Financial Analysis\n- Revenue trends\n- Profitability metrics\n- Valuation analysis\n\n## Risks & Concerns\n- Market risks\n- Company-specific risks\n- Regulatory concerns\n\n## Investment Timeline\n- Entry strategy\n- Target allocation\n- Exit criteria',
    tags: ['analysis', 'stocks', 'research'],
    confidenceLevel: 4,
    icon: TrendingUp,
  },
  {
    title: 'Monthly Financial Review',
    type: 'review',
    content: '# Monthly Review - [Month Year]\n\n## Financial Performance\n### Income\n- Salary: $\n- Side income: $\n- Investment returns: $\n\n### Expenses\n- Fixed costs: $\n- Variable expenses: $\n- Unexpected costs: $\n\n## Budget Analysis\n- Budget vs Actual spending\n- Savings rate achieved\n- Areas for improvement\n\n## Investment Updates\n- Portfolio performance\n- New positions\n- Rebalancing actions\n\n## Goals Progress\n- Emergency fund status\n- Investment goals\n- Debt reduction\n\n## Next Month Planning\n- Budget adjustments\n- Investment plans\n- Financial goals',
    tags: ['review', 'monthly', 'planning'],
    confidenceLevel: 3,
    icon: Calendar,
  },
  {
    title: 'Crypto Research Notes',
    type: 'research',
    content: '# Cryptocurrency Research\n\n## Project Overview\n- Token: [Name/Symbol]\n- Blockchain: [Network]\n- Market Cap: $\n- Current Price: $\n\n## Technology Analysis\n- Use case and problem solving\n- Technical innovation\n- Development activity\n- Partnerships and adoption\n\n## Tokenomics\n- Total supply\n- Circulating supply\n- Distribution model\n- Staking/rewards\n\n## Market Analysis\n- Price history\n- Trading volume\n- Market sentiment\n- Competitor analysis\n\n## Risk Assessment\n- Regulatory risks\n- Technical risks\n- Market risks\n- Team/governance risks\n\n## Investment Decision\n- Position size\n- Entry strategy\n- Target prices\n- Stop loss levels',
    tags: ['crypto', 'research', 'analysis'],
    confidenceLevel: 3,
    icon: Eye,
  },
  {
    title: 'Financial Goal Planning',
    type: 'plan',
    content: '# Financial Goal: [Goal Name]\n\n## Goal Definition\n- **Target Amount**: $\n- **Target Date**: \n- **Priority Level**: High/Medium/Low\n- **Category**: Emergency Fund/Investment/Purchase/Other\n\n## Current Status\n- **Current Amount**: $\n- **Monthly Contribution**: $\n- **Progress**: % Complete\n\n## Action Plan\n### Monthly Actions\n- [ ] Automate transfers\n- [ ] Review and adjust contribution\n- [ ] Track progress\n\n### Quarterly Reviews\n- [ ] Assess goal timeline\n- [ ] Adjust strategy if needed\n- [ ] Celebrate milestones\n\n## Potential Obstacles\n- Income changes\n- Unexpected expenses\n- Market conditions\n\n## Mitigation Strategies\n- Emergency fund buffer\n- Flexible timeline\n- Alternative income sources\n\n## Success Metrics\n- On-track percentage\n- Monthly contribution consistency\n- Timeline adherence',
    tags: ['goals', 'planning', 'strategy'],
    confidenceLevel: 4,
    icon: Target,
  },
];

const NOTEBOOK_TYPES = [
  { value: 'investment_thesis', label: 'Investment Thesis', icon: TrendingUp, description: 'Detailed investment analysis and rationale' },
  { value: 'strategy', label: 'Strategy', icon: Target, description: 'Financial planning and strategic thinking' },
  { value: 'research', label: 'Research', icon: Eye, description: 'Market research and analysis notes' },
  { value: 'plan', label: 'Plan', icon: Calendar, description: 'Action plans and goal setting' },
  { value: 'review', label: 'Review', icon: CheckSquare, description: 'Performance reviews and assessments' },
  { value: 'journal', label: 'Journal', icon: BookOpen, description: 'Daily thoughts and observations' },
  { value: 'other', label: 'Other', icon: FileText, description: 'General financial notes' },
];

const SENTIMENT_OPTIONS = [
  { value: 'positive', label: 'Positive', icon: Heart, color: 'text-green-600', description: 'Optimistic outlook' },
  { value: 'neutral', label: 'Neutral', icon: Meh, color: 'text-gray-600', description: 'Balanced perspective' },
  { value: 'negative', label: 'Negative', icon: Frown, color: 'text-red-600', description: 'Cautious or concerned' },
];

const CONFIDENCE_LEVELS = [
  { value: 1, label: 'Very Low', description: 'Speculative or uncertain' },
  { value: 2, label: 'Low', description: 'Limited confidence' },
  { value: 3, label: 'Medium', description: 'Moderate confidence' },
  { value: 4, label: 'High', description: 'Strong confidence' },
  { value: 5, label: 'Very High', description: 'Extremely confident' },
];

export const NotebookForm = ({
  notebook,
  onSave,
  onCancel,
  mode = 'create',
}: NotebookFormProps) => {
  const [formData, setFormData] = useState<Partial<NotebookEntry>>({
    title: '',
    content: '',
    type: 'other',
    category: '',
    tags: [],
    isPinned: false,
    isArchived: false,
    sentiment: undefined,
    confidenceLevel: undefined,
    tasks: [],
    linkedInvestments: [],
    linkedGoals: [],
    linkedSubscriptions: [],
    linkedBills: [],
    ...notebook,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [tagInput, setTagInput] = useState('');
  const [taskInput, setTaskInput] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  // Calculate content statistics
  const wordCount = formData.content?.split(/\s+/).filter(word => word.length > 0).length || 0;
  const charCount = formData.content?.length || 0;
  const readingTime = Math.ceil(wordCount / 200); // Approximate reading time

  const handleTemplateSelect = (template: typeof NOTEBOOK_TEMPLATES[0]) => {
    setFormData(prev => ({
      ...prev,
      title: template.title,
      type: template.type as NotebookEntry['type'],
      content: template.content,
      tags: template.tags,
      confidenceLevel: template.confidenceLevel as NotebookEntry['confidenceLevel'],
    }));
    setSelectedTemplate(template.title);
  };

  const handleAddTag = (e?: React.KeyboardEvent) => {
    if (e && e.key !== 'Enter') return;
    if (!tagInput.trim()) return;
    
    const newTag = tagInput.trim().toLowerCase();
    if (!formData.tags?.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag],
      }));
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || [],
    }));
  };

  const handleAddTask = () => {
    if (!taskInput.trim()) return;
    
    const newTask = {
      id: `task-${Date.now()}`,
      text: taskInput.trim(),
      completed: false,
      dueDate: newTaskDueDate || undefined,
    };
    
    setFormData(prev => ({
      ...prev,
      tasks: [...(prev.tasks || []), newTask],
    }));
    
    setTaskInput('');
    setNewTaskDueDate('');
  };

  const handleToggleTask = (taskId: string) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks?.map(task => 
        task.id === taskId 
          ? { ...task, completed: !task.completed, completedDate: !task.completed ? new Date().toISOString() : undefined }
          : task
      ) || [],
    }));
  };

  const handleRemoveTask = (taskId: string) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks?.filter(task => task.id !== taskId) || [],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const now = new Date().toISOString();
    
    const notebookData: NotebookEntry = {
      id: formData.id || `notebook-${Date.now()}`,
      title: formData.title || 'Untitled Notebook',
      content: formData.content || '',
      type: formData.type || 'other',
      category: formData.category,
      tags: formData.tags || [],
      createdDate: formData.createdDate || now,
      lastModified: now,
      isPinned: formData.isPinned || false,
      isArchived: formData.isArchived || false,
      sentiment: formData.sentiment,
      confidenceLevel: formData.confidenceLevel,
      tasks: formData.tasks || [],
      linkedInvestments: formData.linkedInvestments || [],
      linkedGoals: formData.linkedGoals || [],
      linkedSubscriptions: formData.linkedSubscriptions || [],
      linkedBills: formData.linkedBills || [],
    };

    onSave(notebookData);
  };

  const getTypeIcon = (type: string) => {
    const notebookType = NOTEBOOK_TYPES.find(t => t.value === type);
    const Icon = notebookType?.icon || FileText;
    return Icon;
  };

  const getSentimentIcon = (sentiment?: string) => {
    const sentimentOption = SENTIMENT_OPTIONS.find(s => s.value === sentiment);
    const Icon = sentimentOption?.icon || Meh;
    return Icon;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Quick Templates */}
      {mode === 'create' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <Label className="text-sm font-medium">Notebook Templates</Label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {NOTEBOOK_TEMPLATES.map((template) => {
              const Icon = template.icon;
              return (
                <Button
                  key={template.title}
                  type="button"
                  variant={selectedTemplate === template.title ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTemplateSelect(template)}
                  className="h-auto p-4 flex items-start gap-3 justify-start"
                >
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold text-sm">{template.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {template.tags.join(', ')}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Form Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Content</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="advanced">Links</TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Notebook Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Investment Analysis, Market Research, Monthly Review..."
                required
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Notebook Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  type: value as NotebookEntry['type']
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NOTEBOOK_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-muted-foreground">{type.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Custom Category</Label>
              <Input
                id="category"
                value={formData.category || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Tech Stocks, Real Estate, Budgeting..."
              />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Start writing your financial thoughts, analysis, or plans..."
              rows={12}
              className="font-mono text-sm"
              required
            />
            
            {/* Content Statistics */}
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{charCount} characters • {wordCount} words</span>
              <span>~{readingTime} min read</span>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTag(tag)}
                    className="h-auto w-auto p-0 hover:bg-transparent"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleAddTag}
                placeholder="Add tags (press Enter)"
                className="flex-1"
              />
              <Button type="button" onClick={() => handleAddTag()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <CheckSquare className="w-4 h-4" />
            <Label className="font-medium">Action Items & Tasks</Label>
          </div>

          {/* Add New Task */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Add New Task</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  placeholder="Task description..."
                  className="flex-1"
                />
                <Input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="w-40"
                />
                <Button type="button" onClick={handleAddTask}>
                  <PlusCircle className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Task List */}
          <div className="space-y-2">
            {formData.tasks?.map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleTask(task.id)}
                  className="p-0"
                >
                  {task.completed ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Square className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
                <div className="flex-1">
                  <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                    {task.text}
                  </span>
                  {task.dueDate && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveTask(task.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            {(!formData.tasks || formData.tasks.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckSquare className="w-8 h-8 mx-auto mb-2" />
                <p>No tasks added yet. Add action items to track progress.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Metadata Tab */}
        <TabsContent value="metadata" className="space-y-4">
          {/* Confidence Level */}
          <div className="space-y-3">
            <Label>Confidence Level</Label>
            <RadioGroup
              value={formData.confidenceLevel?.toString()}
              onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                confidenceLevel: parseInt(value) as NotebookEntry['confidenceLevel']
              }))}
            >
              {CONFIDENCE_LEVELS.map((level) => (
                <div key={level.value} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <RadioGroupItem value={level.value.toString()} />
                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < level.value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <div>
                      <span className="font-medium">{level.label}</span>
                      <p className="text-xs text-muted-foreground">{level.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Sentiment */}
          <div className="space-y-3">
            <Label>Sentiment</Label>
            <RadioGroup
              value={formData.sentiment || ''}
              onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                sentiment: value as NotebookEntry['sentiment']
              }))}
            >
              {SENTIMENT_OPTIONS.map((sentiment) => {
                const Icon = sentiment.icon;
                return (
                  <div key={sentiment.value} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <RadioGroupItem value={sentiment.value} />
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${sentiment.color}`} />
                      <div>
                        <span className="font-medium">{sentiment.label}</span>
                        <p className="text-xs text-muted-foreground">{sentiment.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {/* Pin & Archive */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-blue-500" />
                <div>
                  <Label className="font-medium">Pin Notebook</Label>
                  <p className="text-sm text-muted-foreground">
                    Pin for quick access in the notebooks list
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.isPinned}
                onCheckedChange={(checked) => setFormData(prev => ({ 
                  ...prev, 
                  isPinned: checked 
                }))}
              />
            </div>
          </div>
        </TabsContent>

        {/* Advanced/Links Tab */}
        <TabsContent value="advanced" className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            <LinkIcon className="w-8 h-8 mx-auto mb-2" />
            <h4 className="font-semibold mb-2">Linking System</h4>
            <p>Connect this notebook to investments, goals, and subscriptions</p>
            <p className="text-xs mt-2">(Advanced linking features coming soon)</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          <CheckCircle className="w-4 h-4 mr-2" />
          {mode === 'create' ? 'Create Notebook' : 'Update Notebook'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};