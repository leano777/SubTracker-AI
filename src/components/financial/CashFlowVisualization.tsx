/**
 * Interactive Cash Flow Visualization Component
 * Real-time cash flow projections with interactive charts
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { financialIntelligenceService } from '../../services/financialIntelligenceService';
import type { CashFlowProjection } from '../../services/financialIntelligenceService';

interface CashFlowVisualizationProps {
  className?: string;
  days?: 30 | 60 | 90;
  showConfidenceBounds?: boolean;
  interactive?: boolean;
}

export const CashFlowVisualization: React.FC<CashFlowVisualizationProps> = ({
  className = '',
  days = 30,
  showConfidenceBounds = true,
  interactive = true
}) => {
  const [projections, setProjections] = useState<CashFlowProjection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<CashFlowProjection | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'chart' | 'table' | 'summary'>('chart');
  const [projectionDays, setProjectionDays] = useState(days);

  useEffect(() => {
    loadProjections();
  }, [projectionDays]);

  const loadProjections = async () => {
    setLoading(true);
    try {
      const data = await financialIntelligenceService.generateCashFlowProjections(projectionDays);
      setProjections(data);
    } catch (error) {
      console.error('Error loading cash flow projections:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Calculate chart dimensions and scaling
  const chartData = useMemo(() => {
    if (projections.length === 0) return null;

    const minValue = Math.min(
      ...projections.map(p => Math.min(p.lowerBound, p.projectedBalance))
    );
    const maxValue = Math.max(
      ...projections.map(p => Math.max(p.upperBound, p.projectedBalance))
    );

    const range = maxValue - minValue;
    const padding = range * 0.1;
    const adjustedMin = minValue - padding;
    const adjustedMax = maxValue + padding;

    return {
      minValue: adjustedMin,
      maxValue: adjustedMax,
      range: adjustedMax - adjustedMin
    };
  }, [projections]);

  const getYPosition = (value: number): number => {
    if (!chartData) return 50;
    const percentage = ((value - chartData.minValue) / chartData.range) * 100;
    return 100 - percentage; // Invert for SVG coordinates
  };

  const getTrendColor = (projection: CashFlowProjection): string => {
    if (projection.projectedBalance > 0) return 'text-green-500';
    if (projection.projectedBalance < -1000) return 'text-red-500';
    return 'text-yellow-500';
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 80) return 'text-green-500';
    if (confidence >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const renderChart = () => {
    if (!chartData || projections.length === 0) return null;

    const svgWidth = 800;
    const svgHeight = 400;
    const margin = { top: 20, right: 20, bottom: 40, left: 80 };
    const chartWidth = svgWidth - margin.left - margin.right;
    const chartHeight = svgHeight - margin.top - margin.bottom;

    // Create path data for main projection line
    const mainPath = projections
      .map((p, i) => {
        const x = (i / (projections.length - 1)) * chartWidth;
        const y = (getYPosition(p.projectedBalance) / 100) * chartHeight;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

    // Create path data for confidence bounds
    const upperPath = projections
      .map((p, i) => {
        const x = (i / (projections.length - 1)) * chartWidth;
        const y = (getYPosition(p.upperBound) / 100) * chartHeight;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

    const lowerPath = projections
      .map((p, i) => {
        const x = (i / (projections.length - 1)) * chartWidth;
        const y = (getYPosition(p.lowerBound) / 100) * chartHeight;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

    // Create confidence area path
    const confidenceArea = upperPath + ' ' + 
      projections
        .slice()
        .reverse()
        .map((p, i) => {
          const realIndex = projections.length - 1 - i;
          const x = (realIndex / (projections.length - 1)) * chartWidth;
          const y = (getYPosition(p.lowerBound) / 100) * chartHeight;
          return `L ${x} ${y}`;
        })
        .join(' ') + ' Z';

    return (
      <div className="relative">
        <svg width={svgWidth} height={svgHeight} className="w-full h-auto">
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map(percent => {
              const y = (percent / 100) * chartHeight;
              const value = chartData.maxValue - (percent / 100) * chartData.range;
              return (
                <g key={percent}>
                  <line
                    x1={0}
                    y1={y}
                    x2={chartWidth}
                    y2={y}
                    stroke="currentColor"
                    strokeOpacity={0.1}
                    className="text-gray-400"
                  />
                  <text
                    x={-10}
                    y={y}
                    textAnchor="end"
                    alignmentBaseline="middle"
                    className="text-xs text-gray-500 fill-current"
                  >
                    {formatCurrency(value)}
                  </text>
                </g>
              );
            })}

            {/* Zero line */}
            {chartData.minValue < 0 && chartData.maxValue > 0 && (
              <line
                x1={0}
                y1={(getYPosition(0) / 100) * chartHeight}
                x2={chartWidth}
                y2={(getYPosition(0) / 100) * chartHeight}
                stroke="currentColor"
                strokeOpacity={0.3}
                strokeDasharray="4 4"
                className="text-gray-400"
              />
            )}

            {/* Confidence bounds area */}
            {showConfidenceBounds && (
              <path
                d={confidenceArea}
                fill="currentColor"
                fillOpacity={0.1}
                className="text-blue-500"
              />
            )}

            {/* Confidence bound lines */}
            {showConfidenceBounds && (
              <>
                <path
                  d={upperPath}
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity={0.3}
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  className="text-blue-500"
                />
                <path
                  d={lowerPath}
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity={0.3}
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  className="text-blue-500"
                />
              </>
            )}

            {/* Main projection line */}
            <path
              d={mainPath}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="text-blue-600"
            />

            {/* Interactive points */}
            {interactive && projections.map((projection, index) => {
              const x = (index / (projections.length - 1)) * chartWidth;
              const y = (getYPosition(projection.projectedBalance) / 100) * chartHeight;
              const isHovered = hoveredIndex === index;

              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 6 : 4}
                    fill="currentColor"
                    className={`text-blue-600 cursor-pointer transition-all ${
                      isHovered ? 'text-blue-700' : ''
                    }`}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => setSelectedDay(projection)}
                  />
                  
                  {/* Tooltip on hover */}
                  {isHovered && (
                    <g>
                      <rect
                        x={x - 60}
                        y={y - 40}
                        width={120}
                        height={30}
                        fill="black"
                        fillOpacity={0.8}
                        rx={4}
                      />
                      <text
                        x={x}
                        y={y - 25}
                        textAnchor="middle"
                        className="text-xs text-white fill-current"
                      >
                        {formatDate(projection.date)}
                      </text>
                      <text
                        x={x}
                        y={y - 10}
                        textAnchor="middle"
                        className="text-xs text-white fill-current font-semibold"
                      >
                        {formatCurrency(projection.projectedBalance)}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* X-axis labels */}
            {projections
              .filter((_, i) => i % Math.ceil(projections.length / 6) === 0 || i === projections.length - 1)
              .map((projection, _, filtered) => {
                const index = projections.indexOf(projection);
                const x = (index / (projections.length - 1)) * chartWidth;
                return (
                  <text
                    key={index}
                    x={x}
                    y={chartHeight + 20}
                    textAnchor="middle"
                    className="text-xs text-gray-500 fill-current"
                  >
                    {formatDate(projection.date)}
                  </text>
                );
              })}
          </g>
        </svg>
      </div>
    );
  };

  const renderTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left py-2 text-gray-400">Date</th>
            <th className="text-right py-2 text-gray-400">Projected Balance</th>
            <th className="text-right py-2 text-gray-400">Confidence</th>
            <th className="text-right py-2 text-gray-400">Range</th>
            <th className="text-right py-2 text-gray-400">Daily Change</th>
          </tr>
        </thead>
        <tbody>
          {projections.map((projection, index) => (
            <tr
              key={index}
              className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-colors"
              onClick={() => setSelectedDay(projection)}
            >
              <td className="py-2 text-gray-300">
                {formatDate(projection.date)}
              </td>
              <td className={`text-right py-2 font-medium ${getTrendColor(projection)}`}>
                {formatCurrency(projection.projectedBalance)}
              </td>
              <td className={`text-right py-2 ${getConfidenceColor(projection.confidence)}`}>
                {projection.confidence}%
              </td>
              <td className="text-right py-2 text-gray-400 text-xs">
                {formatCurrency(projection.lowerBound)} - {formatCurrency(projection.upperBound)}
              </td>
              <td className="text-right py-2 text-gray-400">
                {formatCurrency(
                  projection.factors.recurringIncome - 
                  projection.factors.recurringExpenses - 
                  projection.factors.averageVariableExpenses
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderSummary = () => {
    if (projections.length === 0) return null;

    const final = projections[projections.length - 1];
    const midpoint = projections[Math.floor(projections.length / 2)];
    const avgConfidence = projections.reduce((sum, p) => sum + p.confidence, 0) / projections.length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-200">
              {projectionDays}-Day Projection
            </h3>
            {final.projectedBalance > 0 ? (
              <ArrowTrendingUpIcon className="w-6 h-6 text-green-500" />
            ) : (
              <ArrowTrendingDownIcon className="w-6 h-6 text-red-500" />
            )}
          </div>
          <div className={`text-3xl font-bold ${getTrendColor(final)}`}>
            {formatCurrency(final.projectedBalance)}
          </div>
          <div className="text-sm text-gray-400 mt-2">
            Range: {formatCurrency(final.lowerBound)} to {formatCurrency(final.upperBound)}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-200">Midpoint Check</h3>
            <CalendarDaysIcon className="w-6 h-6 text-blue-500" />
          </div>
          <div className={`text-3xl font-bold ${getTrendColor(midpoint)}`}>
            {formatCurrency(midpoint.projectedBalance)}
          </div>
          <div className="text-sm text-gray-400 mt-2">
            At day {Math.floor(projections.length / 2)} of {projectionDays}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-200">Confidence Level</h3>
            {avgConfidence >= 70 ? (
              <CheckCircleIcon className="w-6 h-6 text-green-500" />
            ) : (
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />
            )}
          </div>
          <div className={`text-3xl font-bold ${getConfidenceColor(avgConfidence)}`}>
            {Math.round(avgConfidence)}%
          </div>
          <div className="text-sm text-gray-400 mt-2">
            Average projection confidence
          </div>
        </div>

        {/* Daily Breakdown */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 lg:col-span-3">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Daily Cash Flow Factors</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-400">Recurring Income</div>
              <div className="text-xl font-semibold text-green-500">
                +{formatCurrency(final.factors.recurringIncome)}/day
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Recurring Expenses</div>
              <div className="text-xl font-semibold text-red-500">
                -{formatCurrency(final.factors.recurringExpenses)}/day
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Variable Expenses</div>
              <div className="text-xl font-semibold text-orange-500">
                -{formatCurrency(final.factors.averageVariableExpenses)}/day
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Seasonal Adjustment</div>
              <div className="text-xl font-semibold text-blue-500">
                {(final.factors.seasonalAdjustment * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <ChartBarIcon className="w-12 h-12 text-gray-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-500">Generating cash flow projections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`cash-flow-visualization ${className}`}>
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-200">Cash Flow Projections</h2>
        
        <div className="flex flex-wrap gap-2">
          {/* Projection Period Selector */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            {[30, 60, 90].map(d => (
              <button
                key={d}
                onClick={() => setProjectionDays(d as 30 | 60 | 90)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  projectionDays === d
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {d} Days
              </button>
            ))}
          </div>

          {/* View Mode Selector */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            {(['chart', 'table', 'summary'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded text-sm capitalize transition-colors ${
                  viewMode === mode
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Confidence Bounds Toggle */}
          {viewMode === 'chart' && (
            <button
              onClick={() => setShowConfidenceBounds(!showConfidenceBounds)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                showConfidenceBounds
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Confidence Bounds
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        {viewMode === 'chart' && renderChart()}
        {viewMode === 'table' && renderTable()}
        {viewMode === 'summary' && renderSummary()}
      </div>

      {/* Selected Day Details */}
      {selectedDay && (
        <div className="mt-4 bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-200">
                {formatDate(selectedDay.date)} Projection Details
              </h3>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-sm text-gray-400">Projected Balance</span>
                  <div className={`text-xl font-bold ${getTrendColor(selectedDay)}`}>
                    {formatCurrency(selectedDay.projectedBalance)}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Confidence</span>
                  <div className={`text-xl font-bold ${getConfidenceColor(selectedDay.confidence)}`}>
                    {selectedDay.confidence}%
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Upper Bound</span>
                  <div className="text-xl font-bold text-gray-300">
                    {formatCurrency(selectedDay.upperBound)}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Lower Bound</span>
                  <div className="text-xl font-bold text-gray-300">
                    {formatCurrency(selectedDay.lowerBound)}
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashFlowVisualization;