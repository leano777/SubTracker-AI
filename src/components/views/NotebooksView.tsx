import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Calendar, CheckSquare, FileText, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface Note {
  id: string;
  title: string;
  content: string;
  category: 'Investment Thesis' | 'Strategy' | 'Research' | 'Plans' | 'Reviews';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  tasks: Task[];
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
}

export const NotebooksView: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Investment Thesis',
    tags: ''
  });

  useEffect(() => {
    // Load notes from localStorage or initialize with demo data
    const localDataKey = `subtracker_notebooks_local-user-001`;
    const storedNotes = localStorage.getItem(localDataKey);
    
    if (storedNotes) {
      setNotes(JSON.parse(storedNotes));
    } else {
      // Initialize with demo notes
      const demoNotes: Note[] = [
        {
          id: '1',
          title: 'Q4 2025 Investment Strategy',
          content: `## Market Analysis
- Tech stocks showing strong momentum
- Interest rates stabilizing
- Crypto market recovering

## Action Items
1. Increase allocation to growth stocks
2. Consider adding more crypto exposure
3. Review and rebalance portfolio monthly

## Risk Management
- Keep 20% in cash reserves
- Set stop losses at 10%
- Diversify across sectors`,
          category: 'Strategy',
          tags: ['quarterly-review', 'portfolio', 'risk-management'],
          createdAt: '2025-08-01',
          updatedAt: '2025-08-20',
          tasks: [
            { id: '1', text: 'Review tech stock allocations', completed: true },
            { id: '2', text: 'Research emerging crypto projects', completed: false, dueDate: '2025-09-01' },
            { id: '3', text: 'Schedule quarterly portfolio review', completed: false, dueDate: '2025-09-30' }
          ]
        },
        {
          id: '2',
          title: 'Apple Stock Analysis',
          content: `## Investment Thesis
Apple continues to show strong fundamentals with:
- Growing services revenue
- Strong iPhone 15 sales
- Vision Pro creating new market

## Valuation
- Current P/E: 32
- Target price: $220
- Current price: $195

## Risks
- China market slowdown
- Regulatory challenges
- Competition in AI space`,
          category: 'Investment Thesis',
          tags: ['AAPL', 'tech', 'long-term'],
          createdAt: '2025-08-10',
          updatedAt: '2025-08-15',
          tasks: [
            { id: '1', text: 'Monitor Q3 earnings report', completed: false, dueDate: '2025-10-30' },
            { id: '2', text: 'Track Vision Pro adoption metrics', completed: false }
          ]
        },
        {
          id: '3',
          title: 'Subscription Optimization Plan',
          content: `## Current Analysis
Total monthly spend: $247
- Essential: $120
- Nice-to-have: $127

## Optimization Strategy
1. Cancel unused subscriptions
2. Negotiate annual plans for discounts
3. Share family plans where possible

## Potential Savings
- Switch to annual plans: Save $30/month
- Cancel 2 unused services: Save $25/month
- Total potential savings: $55/month ($660/year)`,
          category: 'Plans',
          tags: ['subscriptions', 'budgeting', 'savings'],
          createdAt: '2025-08-05',
          updatedAt: '2025-08-18',
          tasks: [
            { id: '1', text: 'Cancel Hulu subscription', completed: true },
            { id: '2', text: 'Switch Adobe to annual plan', completed: false, dueDate: '2025-09-01' },
            { id: '3', text: 'Setup Netflix family sharing', completed: false }
          ]
        }
      ];
      
      setNotes(demoNotes);
      localStorage.setItem(localDataKey, JSON.stringify(demoNotes));
    }
  }, []);

  const handleAddNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: formData.title,
      content: formData.content,
      category: formData.category as Note['category'],
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      tasks: []
    };

    const updated = [...notes, newNote];
    setNotes(updated);
    localStorage.setItem(`subtracker_notebooks_local-user-001`, JSON.stringify(updated));
    
    setShowAddForm(false);
    setFormData({
      title: '',
      content: '',
      category: 'Investment Thesis',
      tags: ''
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Investment Thesis': return 'bg-blue-100 text-blue-800';
      case 'Strategy': return 'bg-green-100 text-green-800';
      case 'Research': return 'bg-purple-100 text-purple-800';
      case 'Plans': return 'bg-yellow-100 text-yellow-800';
      case 'Reviews': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Notebooks</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Document your investment strategies, research, and financial plans
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </Button>
      </div>

      {/* Add Note Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Note</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Note Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="Investment Thesis">Investment Thesis</option>
                <option value="Strategy">Strategy</option>
                <option value="Research">Research</option>
                <option value="Plans">Plans</option>
                <option value="Reviews">Reviews</option>
              </select>
              <textarea
                placeholder="Note Content (supports markdown)"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg h-32"
              />
              <input
                type="text"
                placeholder="Tags (comma separated)"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <div className="flex gap-2">
                <Button onClick={handleAddNote}>Create Note</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Notes List */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">All Notes</h3>
          {notes.map((note) => (
            <Card 
              key={note.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedNote(note)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold">{note.title}</h4>
                  <Badge className={getCategoryColor(note.category)}>
                    {note.category}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                  {note.content.substring(0, 100)}...
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 flex-wrap">
                    {note.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {note.tasks.length > 0 && (
                      <div className="flex items-center gap-1">
                        <CheckSquare className="w-3 h-3" />
                        <span>{note.tasks.filter(t => t.completed).length}/{note.tasks.length}</span>
                      </div>
                    )}
                    <span>{note.updatedAt}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected Note Detail */}
        {selectedNote && (
          <Card className="h-fit">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle>{selectedNote.title}</CardTitle>
                <Badge className={getCategoryColor(selectedNote.category)}>
                  {selectedNote.category}
                </Badge>
              </div>
              <div className="flex gap-1 flex-wrap mt-2">
                {selectedNote.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap font-sans">{selectedNote.content}</pre>
              </div>
              
              {selectedNote.tasks.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4" />
                    Tasks
                  </h4>
                  <div className="space-y-2">
                    {selectedNote.tasks.map(task => (
                      <div key={task.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          className="rounded"
                          readOnly
                        />
                        <span className={task.completed ? 'line-through text-gray-500' : ''}>
                          {task.text}
                        </span>
                        {task.dueDate && (
                          <Badge variant="outline" className="text-xs ml-auto">
                            <Calendar className="w-3 h-3 mr-1" />
                            {task.dueDate}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-6 pt-6 border-t text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Created: {selectedNote.createdAt}</span>
                  <span>Updated: {selectedNote.updatedAt}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NotebooksView;