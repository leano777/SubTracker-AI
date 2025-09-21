import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, DollarSign, Eye, EyeOff, AlertCircle, Grid3X3, List, Filter, Move, CheckCircle, CalendarDays, MousePointer2, Navigation } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from './ui/sheet';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Subscription, WeeklyBudget } from '../types/subscription';
import { getThursdayWeeksForMonth } from '../utils/weekCalculations';
import { parseStoredDate, formatDateForStorage, getCalendarDate, isSameDate, debugDateParsing } from '../utils/dateUtils';

interface CalendarViewProps {
  subscriptions: Subscription[];
  weeklyBudgets: WeeklyBudget[];
  onViewSubscription: (subscription: Subscription) => void;
  onUpdateSubscriptionDate?: (subscriptionId: string, newDate: Date) => void;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isThursday: boolean;
  subscriptions: Subscription[];
  weekNumber?: number;
}

interface DragState {
  isDragging: boolean;
  subscription: Subscription | null;
  originalDate: Date | null;
  currentPosition: { x: number; y: number };
  offset: { x: number; y: number };
}

export function CalendarView({ subscriptions, weeklyBudgets, onViewSubscription, onUpdateSubscriptionDate }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCancelledSubscriptions, setShowCancelledSubscriptions] = useState(true);
  const [showWatchlistItems, setShowWatchlistItems] = useState(true);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [dropTargetDate, setDropTargetDate] = useState<Date | null>(null);
  const [isMoveModeEnabled, setIsMoveModeEnabled] = useState(false);
  
  // Mouse-based drag state
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    subscription: null,
    originalDate: null,
    currentPosition: { x: 0, y: 0 },
    offset: { x: 0, y: 0 }
  });
  
  const dragElementRef = useRef<HTMLDivElement>(null);
  
  // Detect theme
  const isDarkMode = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const isStealthOps = typeof document !== 'undefined' && document.documentElement.classList.contains('stealth-ops');
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const isTablet = typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024;

  // Text colors
  const getTextColors = () => {
    if (isStealthOps) {
      return {
        primary: 'text-white',
        secondary: 'text-gray-300',
        muted: 'text-gray-400',
        accent: 'text-green-400'
      };
    }
    return {
      primary: isDarkMode ? 'text-gray-100' : 'text-gray-900',
      secondary: isDarkMode ? 'text-gray-300' : 'text-gray-700',
      muted: isDarkMode ? 'text-gray-400' : 'text-gray-600',
      accent: isDarkMode ? 'text-blue-400' : 'text-blue-600'
    };
  };

  const textColors = getTextColors();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Use centralized date utilities for consistent handling
  const formatDateForAttribute = (date: Date): string => {
    return formatDateForStorage(date);
  };

  const parseDateFromAttribute = (dateStr: string): Date => {
    return parseStoredDate(dateStr);
  };

  // Create a date key for comparison that's consistent
  const getDateKey = (date: Date): string => {
    return formatDateForStorage(date);
  };

  // Simple subscription occurrence calculation with FIXED date parsing
  const getSubscriptionsForDate = (targetDate: Date): Subscription[] => {
    const result: Subscription[] = [];
    const targetDateKey = getDateKey(targetDate);
    
    // Filter subscriptions based on user preferences
    const filteredSubscriptions = subscriptions.filter(sub => {
      if (sub.status === 'cancelled' && !showCancelledSubscriptions) return false;
      if (sub.status === 'watchlist' && !showWatchlistItems) return false;
      return true;
    });
    
    filteredSubscriptions.forEach(subscription => {
      // Use centralized date parsing for consistency
      const nextPaymentDate = parseStoredDate(subscription.nextPayment);
      
      console.log('🔍 [CALENDAR] Checking subscription:', subscription.name);
      console.log('🔍 [CALENDAR] Stored nextPayment:', subscription.nextPayment);
      console.log('🔍 [CALENDAR] Parsed nextPayment date:', nextPaymentDate.toDateString());
      console.log('🔍 [CALENDAR] Target date:', targetDate.toDateString());
      
      // Check if this subscription occurs on the target date
      // Use centralized date comparison to avoid timezone issues
      if (isSameDate(subscription.nextPayment, formatDateForStorage(targetDate))) {
        console.log('✅ [CALENDAR] Found match for subscription:', subscription.name);
        result.push(subscription);
        return;
      }
      
      // Check past occurrences (going backward)
      const pastDate = new Date(nextPaymentDate);
      for (let i = 0; i < 12; i++) { // Check up to 12 months back
        switch (subscription.billingCycle) {
          case 'monthly':
          case 'variable':
            pastDate.setMonth(pastDate.getMonth() - 1);
            break;
          case 'quarterly':
            pastDate.setMonth(pastDate.getMonth() - 3);
            break;
          case 'yearly':
            pastDate.setFullYear(pastDate.getFullYear() - 1);
            break;
        }
        
        if (isSameDate(formatDateForStorage(pastDate), formatDateForStorage(targetDate))) {
          result.push(subscription);
          return;
        }
        
        // Stop if we've gone too far back
        if (pastDate < new Date(targetDate.getTime() - 365 * 24 * 60 * 60 * 1000)) {
          break;
        }
      }
      
      // Check future occurrences (going forward)
      const futureDate = new Date(nextPaymentDate);
      for (let i = 0; i < 12; i++) { // Check up to 12 months forward
        switch (subscription.billingCycle) {
          case 'monthly':
          case 'variable':
            futureDate.setMonth(futureDate.getMonth() + 1);
            break;
          case 'quarterly':
            futureDate.setMonth(futureDate.getMonth() + 3);
            break;
          case 'yearly':
            futureDate.setFullYear(futureDate.getFullYear() + 1);
            break;
        }
        
        if (isSameDate(formatDateForStorage(futureDate), formatDateForStorage(targetDate))) {
          result.push(subscription);
          return;
        }
        
        // Stop if we've gone too far forward
        if (futureDate > new Date(targetDate.getTime() + 365 * 24 * 60 * 60 * 1000)) {
          break;
        }
      }
    });
    
    return result;
  };

  // Generate calendar days for month view with proper date handling
  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    const endDate = new Date(lastDay);
    
    // Start from Sunday of the week containing the first day
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    // End on Saturday of the week containing the last day
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    const days: CalendarDay[] = [];
    const currentDay = new Date(startDate);
    const today = new Date();
    
    // Get Thursday weeks for the month
    const thursdayWeeks = getThursdayWeeksForMonth(month, year);
    
    while (currentDay <= endDate) {
      const isCurrentMonth = currentDay.getMonth() === month;
      const isToday = isSameDate(formatDateForStorage(currentDay), formatDateForStorage(today));
      const isThursday = currentDay.getDay() === 4;
      
      // Get subscriptions for this date
      const daySubscriptions = getSubscriptionsForDate(currentDay);
      
      // Find week number if it's a Thursday
      let weekNumber: number | undefined;
      if (isThursday && isCurrentMonth) {
        const thursdayWeek = thursdayWeeks.find(week => 
          week.startDate.getDate() === currentDay.getDate() &&
          week.startDate.getMonth() === currentDay.getMonth()
        );
        weekNumber = thursdayWeek?.weekNumber;
      }
      
      days.push({
        date: new Date(currentDay),
        isCurrentMonth,
        isToday,
        isThursday,
        subscriptions: daySubscriptions,
        weekNumber
      });
      
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  // Generate week days for week view with proper date handling
  const generateWeekDays = (): CalendarDay[] => {
    const today = new Date();
    
    // Find the start of the week (Sunday) that contains currentDate
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const days: CalendarDay[] = [];
    const currentDay = new Date(startOfWeek);
    
    // Generate 7 days for the week
    for (let i = 0; i < 7; i++) {
      const isToday = isSameDate(formatDateForStorage(currentDay), formatDateForStorage(today));
      const isThursday = currentDay.getDay() === 4;
      const isCurrentMonth = currentDay.getMonth() === today.getMonth();
      
      // Get subscriptions for this date
      const daySubscriptions = getSubscriptionsForDate(currentDay);
      
      days.push({
        date: new Date(currentDay),
        isCurrentMonth: true, // In week view, all days are considered "current"
        isToday,
        isThursday,
        subscriptions: daySubscriptions,
        weekNumber: undefined
      });
      
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const calendarDays = viewMode === 'week' ? generateWeekDays() : generateCalendarDays();

  // COMPLETELY FIXED mouse-based drag handlers
  const handleMouseDown = (e: React.MouseEvent, subscription: Subscription, originalDate: Date) => {
    if (!onUpdateSubscriptionDate || !isMoveModeEnabled) {
      console.log('❌ No update handler available or move mode disabled');
      return;
    }

    console.log('🎯 Mouse down on subscription:', subscription.name, 'on date:', getDateKey(originalDate));
    
    // Prevent default to avoid text selection
    e.preventDefault();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const offset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    setDragState({
      isDragging: true,
      subscription,
      originalDate,
      currentPosition: { x: e.clientX, y: e.clientY },
      offset
    });

    toast.info(`Dragging ${subscription.name}`, {
      description: 'Drop on any date to reschedule',
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragState.isDragging) return;

    setDragState(prev => ({
      ...prev,
      currentPosition: { x: e.clientX, y: e.clientY }
    }));

    // Check what element we're over
    const elementUnder = document.elementFromPoint(e.clientX, e.clientY);
    const dateElement = elementUnder?.closest('[data-calendar-date]');
    
    if (dateElement) {
      const dateString = dateElement.getAttribute('data-calendar-date');
      if (dateString) {
        const date = parseDateFromAttribute(dateString);
        setDropTargetDate(date);
      }
    } else {
      setDropTargetDate(null);
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.subscription || !dragState.originalDate) {
      setDragState({
        isDragging: false,
        subscription: null,
        originalDate: null,
        currentPosition: { x: 0, y: 0 },
        offset: { x: 0, y: 0 }
      });
      setDropTargetDate(null);
      return;
    }

    console.log('🎯 Mouse up at position:', e.clientX, e.clientY);

    // Find the element under the mouse
    const elementUnder = document.elementFromPoint(e.clientX, e.clientY);
    const dateElement = elementUnder?.closest('[data-calendar-date]');
    
    if (dateElement && onUpdateSubscriptionDate) {
      const dateString = dateElement.getAttribute('data-calendar-date');
      if (dateString) {
        const targetDate = parseDateFromAttribute(dateString);
        
        console.log('📅 Original date key:', getDateKey(dragState.originalDate));
        console.log('📅 Target date key:', getDateKey(targetDate));
        console.log('📅 Target date object:', targetDate);
        console.log('📅 Target date ISO:', targetDate.toISOString());
        console.log('📅 Target date string:', targetDate.toDateString());
        
        // Check if dates are different using date keys to avoid timezone issues
        if (getDateKey(dragState.originalDate) !== getDateKey(targetDate)) {
          console.log('✅ Dates are different, calling update handler');
          console.log('✅ Calling update handler with:', {
            subscriptionId: dragState.subscription.id,
            subscriptionName: dragState.subscription.name,
            targetDate: targetDate,
            targetDateKey: getDateKey(targetDate)
          });
          
          onUpdateSubscriptionDate(dragState.subscription.id, targetDate);
          
          toast.success(`${dragState.subscription.name} rescheduled`, {
            description: `Next payment moved to ${targetDate.toLocaleDateString()}`,
          });
        } else {
          console.log('📅 Same date detected, no change needed');
          toast.info('Same date selected');
        }
      } else {
        console.log('❌ No date string found in data attribute');
      }
    } else {
      console.log('❌ No date element found or no update handler');
      toast.info('Drop cancelled');
    }

    // Reset drag state
    setDragState({
      isDragging: false,
      subscription: null,
      originalDate: null,
      currentPosition: { x: 0, y: 0 },
      offset: { x: 0, y: 0 }
    });
    setDropTargetDate(null);
  };

  // Setup global mouse event listeners
  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      };
    }
  }, [dragState.isDragging]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  const getDisplayTitle = () => {
    if (viewMode === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        return `${startOfWeek.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} ${startOfWeek.getDate()}-${endOfWeek.getDate()}`;
      } else {
        return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      }
    } else {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  const dayNames = isMobile ? ['S', 'M', 'T', 'W', 'T', 'F', 'S'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Month Grid View
  const MonthGridView = () => (
    <div className="grid grid-cols-7 gap-1">
      {/* Day headers */}
      {dayNames.map((day, index) => (
        <div 
          key={`header-${index}`}
          className={`p-2 text-center text-xs font-medium ${textColors.muted} ${
            isStealthOps ? 'font-mono tracking-wide' : ''
          }`}
        >
          {isStealthOps ? `[${day}]` : day}
        </div>
      ))}
      
      {/* Calendar days */}
      {calendarDays.map((day, index) => {
        const isDropTarget = dropTargetDate && getDateKey(dropTargetDate) === getDateKey(day.date);
        const isDragEnabled = !!onUpdateSubscriptionDate && isMoveModeEnabled;
        
        return (
          <div
            key={`day-${index}`}
            data-calendar-date={formatDateForAttribute(day.date)}
            className={`
              min-h-[100px] p-2 border-2 transition-all duration-200 relative overflow-hidden
              ${isStealthOps ? 'tactical-surface border-gray-600' : 'rounded-lg border-gray-200 dark:border-gray-700'}
              ${day.isCurrentMonth 
                ? (isStealthOps ? 'bg-black/80' : (isDarkMode ? 'bg-card/50' : 'bg-card/80'))
                : (isStealthOps ? 'bg-gray-900/40' : (isDarkMode ? 'bg-muted/20' : 'bg-muted/40'))
              }
              ${day.isToday 
                ? (isStealthOps ? 'ring-2 ring-green-400 tactical-glow' : 'ring-2 ring-primary shadow-md')
                : ''
              }
              ${day.isThursday && day.isCurrentMonth 
                ? (isStealthOps ? 'bg-blue-900/30 border-blue-400' : (isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'))
                : ''
              }
              ${isDropTarget ? 'ring-4 ring-green-500 bg-green-50/20 dark:bg-green-900/40 border-green-500 scale-[1.02]' : ''}
            `}
            style={isStealthOps ? { borderRadius: '0.125rem' } : undefined}
          >
            <div className="flex items-start justify-between mb-2">
              <span className={`
                text-sm font-semibold
                ${day.isCurrentMonth ? textColors.primary : textColors.muted}
                ${day.isToday ? (isStealthOps ? 'text-green-400 font-bold tactical-text-glow' : 'text-primary font-bold') : ''}
                ${isStealthOps ? 'font-mono tracking-wide' : ''}
              `}>
                {day.date.getDate()}
              </span>
              
              {/* Week number badge */}
              {day.isThursday && day.weekNumber && day.isCurrentMonth && (
                <Badge 
                  variant="secondary" 
                  className={`text-xs px-1 py-0 scale-75 ${
                    isStealthOps ? 'tactical-surface border border-blue-400 text-blue-400 font-mono tracking-wide' : ''
                  }`}
                  style={isStealthOps ? { borderRadius: '0.125rem' } : undefined}
                >
                  {isStealthOps ? `[W${day.weekNumber}]` : `W${day.weekNumber}`}
                </Badge>
              )}
            </div>
            
            {/* Drop indicator */}
            {isDropTarget && (
              <div className={`absolute inset-0 flex items-center justify-center z-30 ${
                isStealthOps ? 'tactical-surface border-2 border-green-400 bg-green-900/50' : 'bg-green-100/95 rounded-lg'
              }`}>
                <div className={`flex flex-col items-center gap-2 text-center ${
                  isStealthOps ? 'text-green-400 font-mono tracking-wide' : 'text-green-700'
                }`}>
                  <CheckCircle className="w-8 h-8 animate-bounce" />
                  <div className="text-xs font-bold">
                    {isStealthOps ? '[DROP HERE]' : 'Drop Here'}
                  </div>
                </div>
              </div>
            )}
            
            {/* Subscriptions */}
            <div className="space-y-1 relative z-10">
              {day.subscriptions.slice(0, isMobile ? 2 : 3).map((subscription, subIndex) => (
                <div 
                  key={`sub-${subscription.id}-${subIndex}`}
                  onMouseDown={isDragEnabled ? (e) => handleMouseDown(e, subscription, day.date) : undefined}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!dragState.isDragging && !isMoveModeEnabled) {
                      onViewSubscription(subscription);
                    }
                  }}
                  className={`
                    px-2 py-1.5 text-xs transition-all duration-200 select-none
                    ${isStealthOps ? 'tactical-surface font-mono tracking-wide' : 'rounded-lg'}
                    ${isDragEnabled ? 'cursor-grab hover:scale-105 active:cursor-grabbing hover:shadow-lg' : 
                      !isMoveModeEnabled ? 'cursor-pointer hover:scale-105 active:scale-95 hover:shadow-lg' : 'cursor-default'}
                    ${dragState.subscription?.id === subscription.id ? 'opacity-50' : ''}
                    ${subscription.status === 'cancelled' ? (
                      isStealthOps 
                        ? 'border border-red-400 text-red-400 hover:bg-red-500/10' 
                        : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300'
                    ) : subscription.status === 'watchlist' ? (
                      isStealthOps 
                        ? 'border border-yellow-400 text-yellow-400 hover:bg-yellow-500/10' 
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300'
                    ) : subIndex === 0 ? (
                      isStealthOps 
                        ? 'border border-green-400 text-green-400 hover:bg-green-500/10' 
                        : 'bg-primary/10 text-primary hover:bg-primary/20'
                    ) : (
                      isStealthOps 
                        ? 'border border-gray-600 text-gray-300 hover:bg-gray-700' 
                        : 'bg-secondary/80 text-secondary-foreground hover:bg-secondary'
                    )}
                  `}
                  style={isStealthOps ? { borderRadius: '0.125rem' } : undefined}
                >
                  <div className="flex items-center gap-1">
                    {isDragEnabled && (
                      <Move className="w-2 h-2 opacity-60 flex-shrink-0" />
                    )}
                    {subscription.logoUrl ? (
                      <ImageWithFallback
                        src={subscription.logoUrl}
                        alt={`${subscription.name} logo`}
                        className={`w-3 h-3 object-cover flex-shrink-0 ${
                          isStealthOps ? 'border border-green-400' : 'rounded-sm'
                        }`}
                        style={isStealthOps ? { borderRadius: '0.125rem' } : undefined}
                      />
                    ) : (
                      <DollarSign className="w-3 h-3 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className={`truncate font-medium text-xs ${
                        isStealthOps ? 'font-mono tracking-wide' : ''
                      }`}>
                        {isMobile ? subscription.name.substring(0, 8) + (subscription.name.length > 8 ? '...' : '') : subscription.name}
                      </div>
                      <div className={`text-xs opacity-75 ${isStealthOps ? 'font-mono tracking-wide' : ''}`}>
                        {formatCurrency(subscription.cost)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Show more indicator */}
              {day.subscriptions.length > (isMobile ? 2 : 3) && (
                <div 
                  className={`text-xs text-center p-1 transition-colors cursor-pointer ${
                    isStealthOps 
                      ? 'text-gray-400 hover:text-green-400 font-mono tracking-wide tactical-surface' 
                      : 'text-muted-foreground hover:text-foreground rounded'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (day.subscriptions.length > (isMobile ? 2 : 3)) {
                      onViewSubscription(day.subscriptions[isMobile ? 2 : 3]);
                    }
                  }}
                  style={isStealthOps ? { borderRadius: '0.125rem' } : undefined}
                >
                  {isStealthOps 
                    ? `[+${day.subscriptions.length - (isMobile ? 2 : 3)} MORE]`
                    : `+${day.subscriptions.length - (isMobile ? 2 : 3)} more`
                  }
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // Week Grid View - Responsive and Functional
  const WeekGridView = () => (
    <div className="space-y-4">
      {/* Week overview header */}
      <div className={`p-4 ${
        isStealthOps 
          ? 'tactical-surface border border-gray-600' 
          : 'rounded-lg bg-secondary/30'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`font-medium ${textColors.primary} ${
              isStealthOps ? 'font-mono tracking-wide' : ''
            }`}>
              {isStealthOps ? '[WEEK OVERVIEW]' : 'Week Overview'}
            </h3>
            <p className={`text-sm ${textColors.muted} ${
              isStealthOps ? 'font-mono tracking-wide' : ''
            }`}>
              {calendarDays.reduce((sum, day) => sum + day.subscriptions.length, 0)} payments • 
              {formatCurrency(calendarDays.reduce((sum, day) => 
                sum + day.subscriptions.reduce((daySum, sub) => daySum + sub.cost, 0), 0
              ))} total
            </p>
          </div>
        </div>
      </div>

      {/* Responsive week grid */}
      <div className={`grid gap-3 ${
        isMobile 
          ? 'grid-cols-1' 
          : isTablet 
            ? 'grid-cols-2' 
            : 'grid-cols-7'
      }`}>
        {calendarDays.map((day, index) => {
          const isDropTarget = dropTargetDate && getDateKey(dropTargetDate) === getDateKey(day.date);
          const isDragEnabled = !!onUpdateSubscriptionDate && isMoveModeEnabled;
          
          return (
            <Card
              key={`week-day-${index}`}
              data-calendar-date={formatDateForAttribute(day.date)}
              className={`transition-all duration-200 relative overflow-hidden ${
                isStealthOps ? 'tactical-surface' : ''
              } ${isDropTarget ? 'ring-4 ring-green-500 bg-green-50/20 dark:bg-green-900/40 scale-[1.02]' : ''}`}
            >
              <CardContent className={`p-3 ${isMobile ? 'min-h-[120px]' : 'min-h-[200px]'}`}>
                {/* Drop indicator */}
                {isDropTarget && (
                  <div className={`absolute inset-0 flex items-center justify-center z-30 ${
                    isStealthOps ? 'tactical-surface border-2 border-green-400 bg-green-900/50' : 'bg-green-100/95 rounded-lg'
                  }`}>
                    <div className={`flex flex-col items-center gap-2 text-center ${
                      isStealthOps ? 'text-green-400 font-mono tracking-wide' : 'text-green-700'
                    }`}>
                      <CheckCircle className="w-8 h-8 animate-bounce" />
                      <div className="text-sm font-bold">
                        {isStealthOps ? '[DROP HERE]' : 'Drop Here'}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Day header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="text-center">
                    <div className={`text-lg font-semibold ${
                      day.isToday ? (isStealthOps ? 'text-green-400 font-bold tactical-text-glow' : 'text-primary font-bold') : textColors.primary
                    } ${isStealthOps ? 'font-mono tracking-wide' : ''}`}>
                      {day.date.getDate()}
                    </div>
                    <div className={`text-xs ${textColors.muted} ${isStealthOps ? 'font-mono tracking-wide' : ''}`}>
                      {isStealthOps 
                        ? `[${day.date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}]`
                        : day.date.toLocaleDateString('en-US', { weekday: 'short' })
                      }
                    </div>
                  </div>
                  
                  {day.isToday && (
                    <Badge 
                      variant="default" 
                      className={`text-xs ${
                        isStealthOps ? 'tactical-surface border border-green-400 text-green-400 font-mono tracking-wide' : ''
                      }`}
                      style={isStealthOps ? { borderRadius: '0.125rem' } : undefined}
                    >
                      {isStealthOps ? '[TODAY]' : 'Today'}
                    </Badge>
                  )}
                </div>
                
                {/* Day total */}
                {day.subscriptions.length > 0 && (
                  <div className={`text-xs mb-3 p-2 ${
                    isStealthOps 
                      ? 'tactical-surface border border-gray-600 text-gray-300' 
                      : 'rounded bg-secondary/30 text-secondary-foreground'
                  }`}
                   style={isStealthOps ? { borderRadius: '0.125rem' } : undefined}
                  >
                    <div className={`font-medium ${isStealthOps ? 'font-mono tracking-wide' : ''}`}>
                      {formatCurrency(day.subscriptions.reduce((sum, sub) => sum + sub.cost, 0))}
                    </div>
                    <div className={`text-xs opacity-75 ${isStealthOps ? 'font-mono tracking-wide' : ''}`}>
                      {isStealthOps ? `[${day.subscriptions.length} SUB${day.subscriptions.length !== 1 ? 'S' : ''}]` : `${day.subscriptions.length} subscription${day.subscriptions.length !== 1 ? 's' : ''}`}
                    </div>
                  </div>
                )}
                
                {/* Subscriptions list */}
                <div className="space-y-2 relative z-10">
                  {day.subscriptions.slice(0, isMobile ? 5 : 8).map((subscription, subIndex) => (
                    <div 
                      key={`week-sub-${subscription.id}-${subIndex}`}
                      onMouseDown={isDragEnabled ? (e) => handleMouseDown(e, subscription, day.date) : undefined}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!dragState.isDragging) {
                          onViewSubscription(subscription);
                        }
                      }}
                      className={`
                        p-2 transition-all duration-200 select-none
                        ${isStealthOps ? 'tactical-surface font-mono tracking-wide' : 'rounded-lg'}
                        ${isDragEnabled ? 'cursor-grab hover:scale-[1.02] active:cursor-grabbing hover:shadow-lg' : 'cursor-pointer active:scale-95'}
                        ${dragState.subscription?.id === subscription.id ? 'opacity-50' : ''}
                        ${subscription.status === 'cancelled' ? (
                          isStealthOps 
                            ? 'border border-red-400 text-red-400 hover:bg-red-500/10' 
                            : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300'
                        ) : subscription.status === 'watchlist' ? (
                          isStealthOps 
                            ? 'border border-yellow-400 text-yellow-400 hover:bg-yellow-500/10' 
                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300'
                        ) : subIndex === 0 ? (
                          isStealthOps 
                            ? 'border border-green-400 text-green-400 hover:bg-green-500/10' 
                            : 'bg-primary/10 text-primary hover:bg-primary/20'
                        ) : (
                          isStealthOps 
                            ? 'border border-gray-600 text-gray-300 hover:bg-gray-700' 
                            : 'bg-secondary/80 text-secondary-foreground hover:bg-secondary'
                        )}
                      `}
                      style={isStealthOps ? { borderRadius: '0.125rem' } : undefined}
                    >
                      <div className="flex items-center gap-2">
                        {isDragEnabled && (
                          <Move className={`w-3 h-3 flex-shrink-0 ${isStealthOps ? 'text-green-400' : 'text-gray-500'}`} />
                        )}
                        {subscription.logoUrl ? (
                          <ImageWithFallback
                            src={subscription.logoUrl}
                            alt={`${subscription.name} logo`}
                            className={`w-4 h-4 object-cover flex-shrink-0 ${
                              isStealthOps ? 'border border-green-400' : 'rounded'
                            }`}
                            style={isStealthOps ? { borderRadius: '0.125rem' } : undefined}
                          />
                        ) : (
                          <div className={`w-4 h-4 flex items-center justify-center flex-shrink-0 ${
                            isStealthOps 
                              ? 'tactical-surface border border-green-400' 
                              : 'rounded bg-primary/10'
                          }`}
                           style={isStealthOps ? { borderRadius: '0.125rem' } : undefined}
                          >
                            <DollarSign className={`w-2 h-2 ${isStealthOps ? 'text-green-400' : 'text-primary'}`} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium text-xs truncate ${
                            isStealthOps ? 'font-mono tracking-wide' : ''
                          }`}>
                            {subscription.name}
                          </div>
                          <div className={`text-xs opacity-75 ${isStealthOps ? 'font-mono tracking-wide' : ''}`}>
                            {formatCurrency(subscription.cost)}
                          </div>
                        </div>
                        <Badge 
                          variant={subscription.status === 'active' ? 'default' : 
                                  subscription.status === 'cancelled' ? 'destructive' : 'secondary'}
                          className={`text-xs scale-75 ${
                            isStealthOps ? 'font-mono tracking-wide tactical-surface border' : ''
                          }`}
                          style={isStealthOps ? { 
                            borderRadius: '0.125rem',
                            borderColor: subscription.status === 'active' ? '#00ff00' : 
                                        subscription.status === 'cancelled' ? '#ff0000' : '#666666',
                            color: subscription.status === 'active' ? '#00ff00' : 
                                  subscription.status === 'cancelled' ? '#ff0000' : '#cccccc'
                          } : undefined}
                        >
                          {isStealthOps ? subscription.status.toUpperCase().charAt(0) : subscription.status.charAt(0).toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                  {/* Show more indicator */}
                  {day.subscriptions.length > (isMobile ? 5 : 8) && (
                    <div 
                      className={`text-xs text-center p-2 transition-colors cursor-pointer ${
                        isStealthOps 
                          ? 'text-gray-400 hover:text-green-400 font-mono tracking-wide tactical-surface' 
                          : 'text-muted-foreground hover:text-foreground rounded'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (day.subscriptions.length > (isMobile ? 5 : 8)) {
                          onViewSubscription(day.subscriptions[isMobile ? 5 : 8]);
                        }
                      }}
                      style={isStealthOps ? { borderRadius: '0.125rem' } : undefined}
                    >
                      {isStealthOps 
                        ? `[+${day.subscriptions.length - (isMobile ? 5 : 8)} MORE]`
                        : `+${day.subscriptions.length - (isMobile ? 5 : 8)} more`
                      }
                    </div>
                  )}
                </div>
                
                {/* Empty state for days with no subscriptions */}
                {day.subscriptions.length === 0 && (
                  <div className={`text-center py-6 ${textColors.muted}`}>
                    <CalendarIcon className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    <div className={`text-xs ${isStealthOps ? 'font-mono tracking-wide' : ''}`}>
                      {isStealthOps ? '[NO PAYMENTS]' : 'No payments'}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  // List View
  const ListView = () => {
    const daysWithSubscriptions = calendarDays
      .filter(day => day.isCurrentMonth && day.subscriptions.length > 0)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return (
      <div className="space-y-3">
        {daysWithSubscriptions.map((day) => {
          const isDropTarget = dropTargetDate && getDateKey(dropTargetDate) === getDateKey(day.date);
          const isDragEnabled = !!onUpdateSubscriptionDate;
          
          return (
            <Card 
              key={day.date.getTime()} 
              data-calendar-date={formatDateForAttribute(day.date)}
              className={`overflow-hidden transition-all duration-200 ${
                isStealthOps ? 'tactical-surface' : ''
              } ${isDropTarget ? 'ring-4 ring-green-500 bg-green-50/20 dark:bg-green-900/40 scale-[1.02]' : ''}`}
            >
              <CardContent className="p-4 relative">
                {/* Drop indicator for list */}
                {isDropTarget && (
                  <div className={`absolute inset-0 flex items-center justify-center z-30 ${
                    isStealthOps ? 'tactical-surface border-2 border-green-400 bg-green-900/50' : 'bg-green-100/95 rounded-lg'
                  }`}>
                    <div className={`flex items-center gap-3 ${
                      isStealthOps ? 'text-green-400 font-mono tracking-wide' : 'text-green-700'
                    }`}>
                      <CheckCircle className="w-8 h-8 animate-bounce" />
                      <div className="text-lg font-bold">
                        {isStealthOps ? '[DROP TO RESCHEDULE]' : 'Drop to Reschedule'}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`text-lg font-semibold ${
                      day.isToday 
                        ? (isStealthOps ? 'text-green-400 tactical-text-glow' : 'text-primary') 
                        : textColors.primary
                    } ${isStealthOps ? 'font-mono tracking-wide' : ''}`}>
                      {day.date.getDate()}
                    </div>
                    <div className={`text-sm ${textColors.muted} ${isStealthOps ? 'font-mono tracking-wide' : ''}`}>
                      {isStealthOps 
                        ? `[${day.date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()}]`
                        : day.date.toLocaleDateString('en-US', { weekday: 'long' })
                      }
                    </div>
                    {day.isToday && (
                      <Badge 
                        variant="default" 
                        className={`text-xs ${
                          isStealthOps ? 'tactical-surface border border-green-400 text-green-400 font-mono tracking-wide' : ''
                        }`}
                        style={isStealthOps ? { borderRadius: '0.125rem' } : undefined}
                      >
                        {isStealthOps ? '[TODAY]' : 'Today'}
                      </Badge>
                    )}
                  </div>
                  <div className={`text-sm font-medium ${textColors.primary} ${
                    isStealthOps ? 'font-mono tracking-wide tactical-text-glow' : ''
                  }`}>
                    {formatCurrency(day.subscriptions.reduce((sum, sub) => sum + sub.cost, 0))}
                  </div>
                </div>
                
                <div className="space-y-2 relative z-10">
                  {day.subscriptions.map((subscription, index) => (
                    <div
                      key={`list-${subscription.id}-${index}`}
                      onMouseDown={isDragEnabled ? (e) => handleMouseDown(e, subscription, day.date) : undefined}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!dragState.isDragging) {
                          onViewSubscription(subscription);
                        }
                      }}
                      className={`flex items-center gap-3 p-3 transition-all duration-200 ${
                        isDragEnabled ? 'cursor-grab hover:scale-[1.01] hover:shadow-lg active:cursor-grabbing' : 'cursor-pointer'
                      } ${
                        dragState.subscription?.id === subscription.id ? 'opacity-50' : ''
                      } ${
                        isStealthOps 
                          ? 'tactical-surface border border-gray-600 hover:border-green-400 hover:bg-gray-800' 
                          : 'rounded-lg bg-secondary/30 hover:bg-secondary/50'
                      }`}
                      style={isStealthOps ? { borderRadius: '0.125rem' } : undefined}
                    >
                      {isDragEnabled && (
                        <Move className={`w-4 h-4 flex-shrink-0 ${isStealthOps ? 'text-green-400' : 'text-gray-500'}`} />
                      )}
                      {subscription.logoUrl ? (
                        <ImageWithFallback
                          src={subscription.logoUrl}
                          alt={`${subscription.name} logo`}
                          className={`w-8 h-8 object-cover flex-shrink-0 ${
                            isStealthOps ? 'border border-green-400' : 'rounded-lg'
                          }`}
                          style={isStealthOps ? { borderRadius: '0.125rem' } : undefined}
                        />
                      ) : (
                        <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${
                          isStealthOps 
                            ? 'tactical-surface border border-green-400' 
                            : 'rounded-lg bg-primary/10'
                        }`}
                         style={isStealthOps ? { borderRadius: '0.125rem' } : undefined}
                        >
                          <DollarSign className={`w-4 h-4 ${isStealthOps ? 'text-green-400' : 'text-primary'}`} />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`font-medium truncate ${textColors.primary} ${
                            isStealthOps ? 'font-mono tracking-wide' : ''
                          }`}>
                            {subscription.name}
                          </div>
                          {subscription.status === 'cancelled' && (
                            <AlertCircle className={`w-3 h-3 ${isStealthOps ? 'text-red-400' : 'text-red-500'}`} />
                          )}
                          {subscription.status === 'watchlist' && (
                            <Eye className={`w-3 h-3 ${isStealthOps ? 'text-yellow-400' : 'text-yellow-500'}`} />
                          )}
                        </div>
                        <div className={`text-xs ${textColors.muted} ${isStealthOps ? 'font-mono tracking-wide' : ''}`}>
                          {isStealthOps 
                            ? `[${subscription.billingCycle.toUpperCase()} • ${subscription.category.toUpperCase()}]`
                            : `${subscription.billingCycle} • ${subscription.category}`
                          }
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`font-medium ${textColors.primary} ${
                          isStealthOps ? 'font-mono tracking-wide tactical-text-glow' : ''
                        }`}>
                          {formatCurrency(subscription.cost)}
                        </div>
                        <Badge 
                          variant={subscription.status === 'active' ? 'default' : 
                                  subscription.status === 'cancelled' ? 'destructive' : 'secondary'}
                          className={`text-xs ${
                            isStealthOps ? 'font-mono tracking-wide tactical-surface border' : ''
                          }`}
                          style={isStealthOps ? { 
                            borderRadius: '0.125rem',
                            borderColor: subscription.status === 'active' ? '#00ff00' : 
                                        subscription.status === 'cancelled' ? '#ff0000' : '#666666',
                            color: subscription.status === 'active' ? '#00ff00' : 
                                  subscription.status === 'cancelled' ? '#ff0000' : '#cccccc'
                          } : undefined}
                        >
                          {isStealthOps ? `[${subscription.status.toUpperCase()}]` : subscription.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {daysWithSubscriptions.length === 0 && (
          <Card className={isStealthOps ? 'tactical-surface' : ''}>
            <CardContent className="p-8 text-center">
              <CalendarIcon className={`w-12 h-12 mx-auto mb-3 ${textColors.muted} opacity-50`} />
              <p className={`${textColors.muted} ${isStealthOps ? 'font-mono tracking-wide' : ''}`}>
                {isStealthOps ? '[NO SUBSCRIPTIONS DUE THIS MONTH]' : 'No subscriptions due this month'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Calculate stats
  const monthlyStats = calendarDays
    .filter(day => viewMode === 'month' ? day.isCurrentMonth : true)
    .reduce((stats, day) => {
      day.subscriptions.forEach(sub => {
        stats.totalDue += sub.cost;
        stats.subscriptionCount++;
      });
      return stats;
    }, { totalDue: 0, subscriptionCount: 0 });

  return (
    <div className="space-y-4">
      {/* Floating drag element */}
      {dragState.isDragging && dragState.subscription && (
        <div
          className={`fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 ${
            isStealthOps ? 'tactical-surface border border-green-400' : 'rounded-lg shadow-lg'
          } px-3 py-2 text-sm bg-primary text-primary-foreground`}
          style={{
            left: dragState.currentPosition.x - dragState.offset.x,
            top: dragState.currentPosition.y - dragState.offset.y,
            borderRadius: isStealthOps ? '0.125rem' : undefined
          }}
        >
          <div className={`flex items-center gap-2 ${isStealthOps ? 'font-mono tracking-wide' : ''}`}>
            <Move className="w-3 h-3" />
            {dragState.subscription.name}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => viewMode === 'week' ? navigateWeek('prev') : navigateMonth('prev')}
              className={`h-8 w-8 p-0 ${
                isStealthOps 
                  ? 'tactical-button border-gray-600 hover:border-green-400 text-green-400' 
                  : ''
              }`}
              style={isStealthOps ? { borderRadius: '0.125rem' } : undefined}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <h3 className={`text-lg font-semibold ${textColors.primary} min-w-[200px] text-center ${
              isStealthOps ? 'font-mono tracking-wide tactical-text-glow' : ''
            }`}>
              {isStealthOps ? `[${getDisplayTitle().toUpperCase()}]` : getDisplayTitle()}
            </h3>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => viewMode === 'week' ? navigateWeek('next') : navigateMonth('next')}
              className={`h-8 w-8 p-0 ${
                isStealthOps 
                  ? 'tactical-button border-gray-600 hover:border-green-400 text-green-400' 
                  : ''
              }`}
              style={isStealthOps ? { borderRadius: '0.125rem' } : undefined}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className={`sm:hidden ${
              isStealthOps 
                ? 'tactical-button border-gray-600 hover:border-green-400 text-green-400 font-mono tracking-wide' 
                : ''
            }`}
            style={isStealthOps ? { borderRadius: '0.125rem' } : undefined}
          >
            {isStealthOps ? '[TODAY]' : 'Today'}
          </Button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className={`hidden sm:flex ${
              isStealthOps 
                ? 'tactical-button border-gray-600 hover:border-green-400 text-green-400 font-mono tracking-wide' 
                : ''
            }`}
            style={isStealthOps ? { borderRadius: '0.125rem' } : undefined}
          >
            {isStealthOps ? '[TODAY]' : 'Today'}
          </Button>

          {/* Enhanced View Toggle with Week View */}
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'month' | 'week' | 'list')}>
            <TabsList className={`${isStealthOps ? 'tactical-surface' : ''}`}>
              <TabsTrigger 
                value="month" 
                className={`flex items-center gap-1 ${
                  isStealthOps ? 'font-mono tracking-wide' : ''
                }`}
              >
                <Grid3X3 className="w-3 h-3" />
                <span className="hidden sm:inline">{isStealthOps ? '[MONTH]' : 'Month'}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="week" 
                className={`flex items-center gap-1 ${
                  isStealthOps ? 'font-mono tracking-wide' : ''
                }`}
              >
                <CalendarDays className="w-3 h-3" />
                <span className="hidden sm:inline">{isStealthOps ? '[WEEK]' : 'Week'}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="list" 
                className={`flex items-center gap-1 ${
                  isStealthOps ? 'font-mono tracking-wide' : ''
                }`}
              >
                <List className="w-3 h-3" />
                <span className="hidden sm:inline">{isStealthOps ? '[LIST]' : 'List'}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Mode Toggle Button */}
          {onUpdateSubscriptionDate && (
            <Button
              variant={isMoveModeEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setIsMoveModeEnabled(!isMoveModeEnabled)}
              className={`flex items-center gap-2 ${
                isStealthOps 
                  ? `tactical-button border-gray-600 hover:border-green-400 font-mono tracking-wide ${
                      isMoveModeEnabled ? 'bg-green-600 text-black border-green-400 tactical-glow' : 'text-green-400'
                    }` 
                  : ''
              }`}
              style={isStealthOps ? { borderRadius: '0.125rem' } : undefined}
            >
              {isMoveModeEnabled ? (
                <>
                  <Navigation className="w-4 h-4" />
                  <span className="hidden sm:inline">{isStealthOps ? '[MOVE MODE]' : 'Move Mode'}</span>
                </>
              ) : (
                <>
                  <MousePointer2 className="w-4 h-4" />
                  <span className="hidden sm:inline">{isStealthOps ? '[VIEW MODE]' : 'View Mode'}</span>
                </>
              )}
            </Button>
          )}

          {/* Filters */}
          <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={`h-8 w-8 p-0 ${
                  isStealthOps 
                    ? 'tactical-button border-gray-600 hover:border-green-400 text-green-400' 
                    : ''
                }`}
                style={isStealthOps ? { borderRadius: '0.125rem' } : undefined}
              >
                <Filter className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="right"
              className={`w-64 ${isStealthOps ? 'tactical-surface' : ''}`}
            >
              <SheetHeader>
                <SheetTitle className={`${textColors.primary} ${
                  isStealthOps ? 'font-mono tracking-wide tactical-text-glow' : ''
                }`}>
                  {isStealthOps ? '[CALENDAR FILTERS]' : 'Calendar Filters'}
                </SheetTitle>
                <SheetDescription className={`${textColors.muted} ${
                  isStealthOps ? 'font-mono tracking-wide' : ''
                }`}>
                  {isStealthOps 
                    ? '[CUSTOMIZE CALENDAR DISPLAY]' 
                    : 'Customize what appears on your calendar'
                  }
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div>
                  <h3 className={`font-medium mb-2 ${textColors.primary} ${
                    isStealthOps ? 'font-mono tracking-wide text-green-400 tactical-text-glow' : ''
                  }`}>
                    {isStealthOps ? '[VIEW OPTIONS]' : 'View Options'}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant={showCancelledSubscriptions ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowCancelledSubscriptions(!showCancelledSubscriptions)}
                      className={`flex-1 ${
                        isStealthOps 
                          ? 'tactical-button font-mono tracking-wide border-gray-600 hover:border-green-400' 
                          : ''
                      }`}
                      style={isStealthOps ? { borderRadius: '0.125rem' } : undefined}
                    >
                      {showCancelledSubscriptions ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                      {isStealthOps ? '[CANCELLED]' : 'Cancelled'}
                    </Button>
                    
                    <Button
                      variant={showWatchlistItems ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowWatchlistItems(!showWatchlistItems)}
                      className={`flex-1 ${
                        isStealthOps 
                          ? 'tactical-button font-mono tracking-wide border-gray-600 hover:border-green-400' 
                          : ''
                      }`}
                      style={isStealthOps ? { borderRadius: '0.125rem' } : undefined}
                    >
                      {showWatchlistItems ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                      {isStealthOps ? '[WATCHLIST]' : 'Watchlist'}
                    </Button>
                  </div>
                </div>

                {onUpdateSubscriptionDate && (
                  <div className={`p-3 border rounded-lg ${
                    isStealthOps 
                      ? `tactical-surface ${isMoveModeEnabled ? 'border-green-400 bg-green-900/20' : 'border-blue-400 bg-blue-900/20'}` 
                      : `${isMoveModeEnabled ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'}`
                  }`}>
                    <div className={`text-sm font-medium ${
                      isStealthOps 
                        ? `font-mono tracking-wide ${isMoveModeEnabled ? 'text-green-400' : 'text-blue-400'}` 
                        : `${isMoveModeEnabled ? 'text-green-700 dark:text-green-300' : 'text-blue-700 dark:text-blue-300'}`
                    }`}>
                      {isStealthOps 
                        ? `[${isMoveModeEnabled ? 'MOVE MODE ACTIVE' : 'VIEW MODE ACTIVE'}]`
                        : `${isMoveModeEnabled ? 'Move Mode Active' : 'View Mode Active'}`
                      }
                    </div>
                    <div className={`text-xs mt-1 ${
                      isStealthOps 
                        ? `font-mono tracking-wide ${isMoveModeEnabled ? 'text-green-300' : 'text-blue-300'}` 
                        : `${isMoveModeEnabled ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`
                    }`}>
                      {isStealthOps 
                        ? `[${isMoveModeEnabled ? 'DRAG SUBSCRIPTIONS TO RESCHEDULE' : 'CLICK SUBSCRIPTIONS TO VIEW DETAILS'}]`
                        : `${isMoveModeEnabled ? 'Drag subscriptions to reschedule payments' : 'Click subscriptions to view details'}`
                      }
                    </div>
                  </div>
                )}

                {viewMode === 'week' && (
                  <div className={`p-3 border rounded-lg ${
                    isStealthOps 
                      ? 'tactical-surface border-purple-400 bg-purple-900/20' 
                      : 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
                  }`}>
                    <div className={`text-sm font-medium ${
                      isStealthOps ? 'text-purple-400 font-mono tracking-wide' : 'text-purple-700 dark:text-purple-300'
                    }`}>
                      {isStealthOps ? '[WEEK VIEW ACTIVE]' : 'Week View Active'}
                    </div>
                    <div className={`text-xs mt-1 ${
                      isStealthOps ? 'text-purple-300 font-mono tracking-wide' : 'text-purple-600 dark:text-purple-400'
                    }`}>
                      {isStealthOps 
                        ? '[SHOWING ALL SUBSCRIPTIONS WITH FULL DETAILS]' 
                        : 'Showing all subscriptions with full details'
                      }
                    </div>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Stats Bar */}
      <div className={`flex items-center justify-between p-3 ${
        isStealthOps 
          ? 'tactical-surface border border-gray-600' 
          : 'rounded-lg bg-secondary/30'
      }`}>
        <div className={`text-sm ${textColors.secondary} ${
          isStealthOps ? 'font-mono tracking-wide' : ''
        }`}>
          {isStealthOps 
            ? `[${monthlyStats.subscriptionCount} PAYMENTS • TOTAL: ${formatCurrency(monthlyStats.totalDue)}]`
            : `${monthlyStats.subscriptionCount} payments • Total: ${formatCurrency(monthlyStats.totalDue)}`
          }
        </div>
        {dragState.isDragging && (
          <div className={`text-sm font-medium animate-pulse ${
            isStealthOps ? 'text-green-400 font-mono tracking-wide tactical-text-glow' : 'text-blue-600'
          }`}>
            {isStealthOps ? '[DRAGGING...]' : 'Dragging...'}
          </div>
        )}
      </div>

      {/* Enhanced Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded space-y-1">
          <div>Drag enabled: {!!onUpdateSubscriptionDate ? 'YES' : 'NO'}</div>
          <div>Dragging: {dragState.isDragging ? dragState.subscription?.name || 'Unknown' : 'None'}</div>
          <div>Drop target: {dropTargetDate ? getDateKey(dropTargetDate) : 'None'}</div>
          <div>View: {viewMode}</div>
          <div>Data attribute format test: {formatDateForAttribute(new Date())}</div>
          <div>Parse test: {parseDateFromAttribute('2024-12-15').toDateString()}</div>
        </div>
      )}

      {/* Calendar Display */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'month' | 'week' | 'list')}>
        <TabsContent value="month" className="mt-0">
          <MonthGridView />
        </TabsContent>
        
        <TabsContent value="week" className="mt-0">
          <WeekGridView />
        </TabsContent>
        
        <TabsContent value="list" className="mt-0">
          <ListView />
        </TabsContent>
      </Tabs>
    </div>
  );
}