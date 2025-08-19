import { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Star,
  Calendar,
  Tag,
  Link as LinkIcon,
  TrendingUp,
  Target,
  CreditCard,
  FileText,
  Edit,
  Trash2,
  Pin,
  Archive,
  Clock,
  CheckSquare,
  Square,
  MoreVertical,
  Eye,
  Share
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import type { NotebookEntry } from '../../types/financial';
import { NotebookForm } from '../forms/NotebookForm';

interface FinancialNotebooksProps {
  notebooks: NotebookEntry[];
  onAddNotebook: (notebook: NotebookEntry) => void;
  onUpdateNotebook: (id: string, updates: Partial<NotebookEntry>) => void;
  onDeleteNotebook: (id: string) => void;
}

const NOTEBOOK_TYPE_ICONS = {
  investment_thesis: TrendingUp,
  strategy: Target,
  research: Eye,
  plan: Calendar,
  review: CheckSquare,
  journal: BookOpen,
  other: FileText,
};

const NOTEBOOK_TYPE_COLORS = {
  investment_thesis: 'bg-blue-500',
  strategy: 'bg-purple-500',
  research: 'bg-green-500',
  plan: 'bg-orange-500',
  review: 'bg-pink-500',
  journal: 'bg-indigo-500',
  other: 'bg-gray-500',
};

const CONFIDENCE_COLORS = {
  1: 'text-red-600',
  2: 'text-orange-600',
  3: 'text-yellow-600',
  4: 'text-blue-600',
  5: 'text-green-600',
};

const NotebookCard = ({ 
  notebook, 
  onUpdate, 
  onDelete,
  onEdit
}: {
  notebook: NotebookEntry;
  onUpdate: (updates: Partial<NotebookEntry>) => void;
  onDelete: () => void;
  onEdit?: (notebook: NotebookEntry) => void;
}) => {
  const [showFullView, setShowFullView] = useState(false);
  
  const Icon = NOTEBOOK_TYPE_ICONS[notebook.type];
  const colorClass = NOTEBOOK_TYPE_COLORS[notebook.type];
  
  const completedTasks = notebook.tasks?.filter(task => task.completed).length || 0;
  const totalTasks = notebook.tasks?.length || 0;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  return (
    <Card className={`transition-all hover:shadow-lg ${notebook.isPinned ? 'ring-2 ring-blue-200' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className={`${colorClass} p-2 rounded-lg text-white`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{notebook.title}</CardTitle>
                {notebook.isPinned && <Pin className="w-4 h-4 text-blue-500" />}
                {notebook.isArchived && <Archive className="w-4 h-4 text-gray-500" />}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {notebook.type.replace('_', ' ')}
                </Badge>
                {notebook.confidenceLevel && (
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < notebook.confidenceLevel! 
                            ? CONFIDENCE_COLORS[notebook.confidenceLevel!]?.replace('text-', 'bg-') || 'bg-gray-300'
                            : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowFullView(true)}>
                <Eye className="w-4 h-4 mr-2" />
                View Full
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdate({ isPinned: !notebook.isPinned })}>
                <Pin className="w-4 h-4 mr-2" />
                {notebook.isPinned ? 'Unpin' : 'Pin'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(notebook)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdate({ isArchived: !notebook.isArchived })}>
                <Archive className="w-4 h-4 mr-2" />
                {notebook.isArchived ? 'Unarchive' : 'Archive'}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={onDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Content Preview */}
        <div className="text-sm text-muted-foreground">
          {truncateContent(notebook.content)}
        </div>

        {/* Tags */}
        {notebook.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {notebook.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {notebook.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{notebook.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Tasks Progress */}
        {totalTasks > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <CheckSquare className="w-4 h-4 text-muted-foreground" />
            <span>{completedTasks}/{totalTasks} tasks completed</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Linked Items */}
        {(notebook.linkedInvestments?.length || notebook.linkedGoals?.length || notebook.linkedSubscriptions?.length) && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <LinkIcon className="w-3 h-3" />
            <span>
              Linked to {(notebook.linkedInvestments?.length || 0) + (notebook.linkedGoals?.length || 0) + (notebook.linkedSubscriptions?.length || 0)} items
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>
            <Clock className="w-3 h-3 inline mr-1" />
            {formatDate(notebook.lastModified)}
          </span>
          {notebook.sentiment && (
            <Badge 
              variant="outline" 
              className={`text-xs ${
                notebook.sentiment === 'positive' ? 'text-green-600' :
                notebook.sentiment === 'negative' ? 'text-red-600' : 'text-gray-600'
              }`}
            >
              {notebook.sentiment}
            </Badge>
          )}
        </div>
      </CardContent>

      {/* Full View Modal */}
      <Dialog open={showFullView} onOpenChange={setShowFullView}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon className="w-5 h-5" />
              {notebook.title}
            </DialogTitle>
            <DialogDescription>
              Created {formatDate(notebook.createdDate)} • Last modified {formatDate(notebook.lastModified)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Full Content */}
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap bg-muted p-4 rounded-lg">
                {notebook.content}
              </div>
            </div>

            {/* Tasks */}
            {notebook.tasks && notebook.tasks.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Tasks ({completedTasks}/{totalTasks})</h4>
                <div className="space-y-2">
                  {notebook.tasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-2">
                      {task.completed ? (
                        <CheckSquare className="w-4 h-4 text-green-500" />
                      ) : (
                        <Square className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                        {task.text}
                      </span>
                      {task.dueDate && (
                        <Badge variant="outline" className="text-xs">
                          Due {formatDate(task.dueDate)}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {notebook.tags.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {notebook.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Linked Items */}
            {(notebook.linkedInvestments?.length || notebook.linkedGoals?.length || notebook.linkedSubscriptions?.length) && (
              <div>
                <h4 className="font-semibold mb-2">Linked Items</h4>
                <div className="text-sm text-muted-foreground">
                  {notebook.linkedInvestments?.length && (
                    <p>🏦 {notebook.linkedInvestments.length} investments</p>
                  )}
                  {notebook.linkedGoals?.length && (
                    <p>🎯 {notebook.linkedGoals.length} goals</p>
                  )}
                  {notebook.linkedSubscriptions?.length && (
                    <p>💳 {notebook.linkedSubscriptions.length} subscriptions</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export const FinancialNotebooks = ({
  notebooks,
  onAddNotebook,
  onUpdateNotebook,
  onDeleteNotebook,
}: FinancialNotebooksProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('lastModified');
  const [showArchived, setShowArchived] = useState(false);
  const [showNotebookForm, setShowNotebookForm] = useState(false);
  const [editingNotebook, setEditingNotebook] = useState<NotebookEntry | null>(null);

  // Filter and sort notebooks
  const filteredNotebooks = useMemo(() => {
    let filtered = notebooks.filter(notebook => {
      const matchesSearch = 
        notebook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notebook.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notebook.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = filterType === 'all' || notebook.type === filterType;
      const matchesArchived = showArchived || !notebook.isArchived;
      
      return matchesSearch && matchesType && matchesArchived;
    });

    // Sort notebooks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'lastModified':
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
        case 'created':
          return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

    // Put pinned items first
    return [...filtered.filter(n => n.isPinned), ...filtered.filter(n => !n.isPinned)];
  }, [notebooks, searchTerm, filterType, sortBy, showArchived]);

  const pinnedNotebooks = notebooks.filter(n => n.isPinned && !n.isArchived);
  const totalTasks = notebooks.reduce((sum, n) => sum + (n.tasks?.length || 0), 0);
  const completedTasks = notebooks.reduce((sum, n) => sum + (n.tasks?.filter(t => t.completed).length || 0), 0);

  // Handle notebook form actions
  const handleNotebookSave = (notebookData: NotebookEntry) => {
    if (editingNotebook) {
      onUpdateNotebook(editingNotebook.id, notebookData);
    } else {
      onAddNotebook(notebookData);
    }
    setShowNotebookForm(false);
    setEditingNotebook(null);
  };

  const handleNotebookCancel = () => {
    setShowNotebookForm(false);
    setEditingNotebook(null);
  };

  const handleAddNew = () => {
    setEditingNotebook(null);
    setShowNotebookForm(true);
  };

  const handleEditNotebook = (notebook: NotebookEntry) => {
    setEditingNotebook(notebook);
    setShowNotebookForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Financial Notebooks</h2>
          <p className="text-muted-foreground">
            Document your investment ideas, strategies, and financial planning
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="w-4 h-4 mr-2" />
          New Notebook
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{notebooks.length}</div>
            <p className="text-xs text-muted-foreground">Total Notebooks</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{pinnedNotebooks.length}</div>
            <p className="text-xs text-muted-foreground">Pinned</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{completedTasks}/{totalTasks}</div>
            <p className="text-xs text-muted-foreground">Tasks Done</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {notebooks.filter(n => n.type === 'investment_thesis').length}
            </div>
            <p className="text-xs text-muted-foreground">Investment Ideas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search notebooks, content, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="investment_thesis">Investment Thesis</SelectItem>
            <SelectItem value="strategy">Strategy</SelectItem>
            <SelectItem value="research">Research</SelectItem>
            <SelectItem value="plan">Plan</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="journal">Journal</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lastModified">Last Modified</SelectItem>
            <SelectItem value="created">Date Created</SelectItem>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="type">Type</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center space-x-2">
          <Switch
            id="show-archived"
            checked={showArchived}
            onCheckedChange={setShowArchived}
          />
          <Label htmlFor="show-archived" className="text-sm">
            Show Archived
          </Label>
        </div>
      </div>

      {/* Notebooks Content */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Notebooks</TabsTrigger>
          <TabsTrigger value="pinned">Pinned</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {filteredNotebooks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Notebooks Found</h3>
                <p className="text-muted-foreground mb-4">
                  {notebooks.length === 0 
                    ? "Start documenting your financial journey with your first notebook"
                    : "No notebooks match your current filters"
                  }
                </p>
                <Button onClick={handleAddNew}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Notebook
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredNotebooks.map((notebook) => (
                <NotebookCard
                  key={notebook.id}
                  notebook={notebook}
                  onUpdate={(updates) => onUpdateNotebook(notebook.id, updates)}
                  onDelete={() => onDeleteNotebook(notebook.id)}
                  onEdit={handleEditNotebook}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="pinned" className="space-y-4">
          {pinnedNotebooks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Pin className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Pinned Notebooks</h3>
                <p className="text-muted-foreground">
                  Pin important notebooks for quick access
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {pinnedNotebooks.map((notebook) => (
                <NotebookCard
                  key={notebook.id}
                  notebook={notebook}
                  onUpdate={(updates) => onUpdateNotebook(notebook.id, updates)}
                  onDelete={() => onDeleteNotebook(notebook.id)}
                  onEdit={handleEditNotebook}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="recent" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {notebooks
              .filter(n => !n.isArchived)
              .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
              .slice(0, 6)
              .map((notebook) => (
                <NotebookCard
                  key={notebook.id}
                  notebook={notebook}
                  onUpdate={(updates) => onUpdateNotebook(notebook.id, updates)}
                  onDelete={() => onDeleteNotebook(notebook.id)}
                  onEdit={handleEditNotebook}
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Notebook Form Modal */}
      <Dialog open={showNotebookForm} onOpenChange={setShowNotebookForm}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingNotebook ? 'Edit Financial Notebook' : 'Create New Notebook'}
            </DialogTitle>
            <DialogDescription>
              {editingNotebook 
                ? 'Update your financial documentation and analysis' 
                : 'Document your investment ideas, strategies, and financial planning'
              }
            </DialogDescription>
          </DialogHeader>
          <NotebookForm
            notebook={editingNotebook || undefined}
            onSave={handleNotebookSave}
            onCancel={handleNotebookCancel}
            mode={editingNotebook ? 'edit' : 'create'}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};