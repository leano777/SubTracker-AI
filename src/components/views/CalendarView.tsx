import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, DollarSign, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import type { FullSubscription } from '../../types/subscription';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface CalendarViewProps {
  subscriptions: FullSubscription[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ subscriptions }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Get all payment dates for the selected month
  const getPaymentsForMonth = () => {
    return subscriptions
      .filter(sub => sub.status === 'active')
      .map(sub => {
        const paymentDate = new Date(sub.nextPayment);
        return {
          ...sub,
          paymentDate,
          day: paymentDate.getDate(),
          isCurrentMonth: paymentDate.getMonth() === selectedMonth && paymentDate.getFullYear() === selectedYear
        };
      })
      .filter(sub => sub.isCurrentMonth)
      .sort((a, b) => a.day - b.day);
  };

  const payments = getPaymentsForMonth();
  const totalMonthlyPayments = payments.reduce((sum, payment) => {
    if (payment.billingCycle === 'monthly') return sum + payment.cost;
    if (payment.billingCycle === 'yearly') return sum + (payment.cost / 12);
    return sum;
  }, 0);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
  const days = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add all days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Calendar</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          View all your subscription payments in a calendar format
        </p>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (selectedMonth === 0) {
                setSelectedMonth(11);
                setSelectedYear(selectedYear - 1);
              } else {
                setSelectedMonth(selectedMonth - 1);
              }
            }}
            className="px-3 py-1 border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Previous
          </button>
          <button
            onClick={() => {
              if (selectedMonth === 11) {
                setSelectedMonth(0);
                setSelectedYear(selectedYear + 1);
              } else {
                setSelectedMonth(selectedMonth + 1);
              }
            }}
            className="px-3 py-1 border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Next
          </button>
        </div>
        <h3 className="text-lg font-semibold">
          {monthNames[selectedMonth]} {selectedYear}
        </h3>
        <div className="text-right">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total this month</p>
          <p className="text-xl font-bold">{formatCurrency(totalMonthlyPayments)}</p>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 p-2">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {days.map((day, index) => {
              const dayPayments = day ? payments.filter(p => p.day === day) : [];
              const isToday = day === new Date().getDate() && 
                             selectedMonth === new Date().getMonth() && 
                             selectedYear === new Date().getFullYear();
              
              return (
                <div
                  key={index}
                  className={`
                    min-h-[80px] border rounded p-1
                    ${day ? 'hover:bg-gray-50 dark:hover:bg-gray-800' : ''}
                    ${isToday ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' : 'border-gray-200 dark:border-gray-700'}
                  `}
                >
                  {day && (
                    <>
                      <p className={`text-sm font-medium ${isToday ? 'text-blue-600' : ''}`}>
                        {day}
                      </p>
                      <div className="space-y-1 mt-1">
                        {dayPayments.slice(0, 2).map((payment, i) => (
                          <div key={i} className="text-xs bg-blue-100 dark:bg-blue-800 rounded px-1 py-0.5">
                            <p className="truncate font-medium">{payment.name}</p>
                            <p className="text-blue-700 dark:text-blue-300">
                              {formatCurrency(payment.cost)}
                            </p>
                          </div>
                        ))}
                        {dayPayments.length > 2 && (
                          <p className="text-xs text-gray-500">+{dayPayments.length - 2} more</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Payments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Payments This Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No payments scheduled for this month</p>
          ) : (
            <div className="space-y-2">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">{monthNames[selectedMonth].slice(0, 3)}</p>
                      <p className="text-lg font-bold">{payment.day}</p>
                    </div>
                    <div>
                      <p className="font-medium">{payment.name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <Badge variant="outline">{payment.category}</Badge>
                        <span>{payment.billingCycle}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(payment.cost)}</p>
                    {payment.day === new Date().getDate() && (
                      <p className="text-xs text-orange-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Due today
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarView;