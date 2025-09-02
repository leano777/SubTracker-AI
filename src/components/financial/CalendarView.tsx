/**
 * Calendar View Component
 * Monthly calendar showing daily transactions
 */

import React, { useState, useEffect } from 'react';
import { financialService } from '../../services/financialService';
import { CalendarTransaction } from '../../types/financialTransactions';

interface CalendarViewProps {
  month: number;
  year: number;
  onDateClick: (date: number, transactions: any[]) => void;
}

type FilterType = 'all' | 'subscription' | 'credit_card' | 'affirm_klarna' | 'rent' | 'utilities';

export const CalendarView: React.FC<CalendarViewProps> = ({ month, year, onDateClick }) => {
  const [calendarData, setCalendarData] = useState<CalendarTransaction[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [hoveredDate, setHoveredDate] = useState<number | null>(null);

  useEffect(() => {
    const data = financialService.getCalendarData(month, year);
    setCalendarData(data);
  }, [month, year]);

  const getDaysInMonth = (month: number, year: number): number => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number): number => {
    return new Date(year, month - 1, 1).getDay();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTransactionsForDay = (day: number): CalendarTransaction | null => {
    return calendarData.find(item => item.date === day) || null;
  };

  const filterTransactions = (transactions: any[]): any[] => {
    if (filter === 'all') return transactions;
    
    return transactions.filter(t => {
      switch (filter) {
        case 'subscription':
          return t.type === 'subscription';
        case 'credit_card':
          return t.type === 'debt' && t.name.toLowerCase().includes('credit');
        case 'affirm_klarna':
          return t.type === 'debt' && (t.name.toLowerCase().includes('affirm') || t.name.toLowerCase().includes('klarna'));
        case 'utilities':
          return t.type === 'utility';
        default:
          return true;
      }
    });
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'subscription':
        return 'bg-blue-500';
      case 'debt':
        return 'bg-red-500';
      case 'utility':
        return 'bg-yellow-500';
      case 'transport':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDayOfMonth(month, year);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                     'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="calendar-view">
      {/* Header with Filters */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-light text-white">
            {monthNames[month - 1]} {year}
          </h2>
        </div>

        {/* Filter Pills - Mobile Optimized */}
        <div className="flex flex-wrap gap-2 md:gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 md:px-4 py-2 rounded-full text-xs md:text-sm transition-all touch-manipulation active:scale-95 ${
              filter === 'all'
                ? 'bg-white text-black font-medium'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('subscription')}
            className={`px-3 md:px-4 py-2 rounded-full text-xs md:text-sm transition-all touch-manipulation active:scale-95 ${
              filter === 'subscription'
                ? 'bg-white text-black font-medium'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <span className="hidden sm:inline">Subscriptions</span>
            <span className="sm:hidden">Subs</span>
          </button>
          <button
            onClick={() => setFilter('credit_card')}
            className={`px-3 md:px-4 py-2 rounded-full text-xs md:text-sm transition-all touch-manipulation active:scale-95 ${
              filter === 'credit_card'
                ? 'bg-white text-black font-medium'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <span className="hidden sm:inline">Credit Cards</span>
            <span className="sm:hidden">Credit</span>
          </button>
          <button
            onClick={() => setFilter('affirm_klarna')}
            className={`px-3 md:px-4 py-2 rounded-full text-xs md:text-sm transition-all touch-manipulation active:scale-95 ${
              filter === 'affirm_klarna'
                ? 'bg-white text-black font-medium'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <span className="hidden sm:inline">Affirm/Klarna</span>
            <span className="sm:hidden">BNPL</span>
          </button>
          <button
            onClick={() => setFilter('utilities')}
            className={`px-4 py-2 rounded-full text-sm transition-all ${
              filter === 'utilities'
                ? 'bg-white text-black'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            Utilities
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm text-gray-400 font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: firstDay }, (_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dayData = getTransactionsForDay(day);
            const filteredTransactions = dayData ? filterTransactions(dayData.transactions) : [];
            const hasTransactions = filteredTransactions.length > 0;
            const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);

            return (
              <div
                key={day}
                onMouseEnter={() => setHoveredDate(day)}
                onMouseLeave={() => setHoveredDate(null)}
                onClick={() => hasTransactions && onDateClick(day, filteredTransactions)}
                className={`
                  aspect-square p-2 border border-gray-700 rounded-lg transition-all duration-200
                  ${hasTransactions 
                    ? 'cursor-pointer hover:border-white hover:bg-gray-800 hover:transform hover:scale-105' 
                    : 'hover:bg-gray-900'
                  }
                  ${hoveredDate === day ? 'z-10 shadow-xl' : ''}
                `}
              >
                <div className="h-full flex flex-col">
                  <div className="text-sm text-gray-400 mb-1">{day}</div>
                  
                  {hasTransactions && (
                    <>
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="text-xs text-white font-medium">
                          {formatCurrency(totalAmount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {filteredTransactions.length} items
                        </div>
                      </div>
                      
                      {/* Transaction type indicators */}
                      <div className="flex gap-1 mt-1">
                        {Array.from(new Set(filteredTransactions.map(t => t.type))).map(type => (
                          <div
                            key={type}
                            className={`w-2 h-2 rounded-full ${getTypeColor(type)}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-gray-400">Subscriptions</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-gray-400">Debt Payments</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-gray-400">Utilities</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500" />
          <span className="text-gray-400">Transportation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-500" />
          <span className="text-gray-400">Other</span>
        </div>
      </div>
    </div>
  );
};