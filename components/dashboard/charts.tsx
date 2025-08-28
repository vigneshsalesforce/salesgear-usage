// components/dashboard/charts.tsx
'use client'

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  Area,
  AreaChart
} from 'recharts';

// Color palette for charts
const COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#F97316', // Orange
];

// Custom tooltip components
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? 
              (entry.name.toLowerCase().includes('cost') ? `$${entry.value.toFixed(2)}` : entry.value.toLocaleString())
              : entry.value
            }
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900">{data.name}</p>
        <p className="text-sm" style={{ color: data.color }}>
          Cost: ${data.value.toFixed(2)} ({data.payload.percentage}%)
        </p>
        <p className="text-xs text-gray-500">
          Events: {data.payload.events}
        </p>
      </div>
    );
  }
  return null;
};

// Empty state component
const EmptyChart = ({ message = "No data available" }: { message?: string }) => (
  <div className="h-64 flex items-center justify-center text-slate-400">
    <div className="text-center">
      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  </div>
);

// Cost by Agent Pie Chart
export const CostByAgentChart = ({ data }: { data: Record<string, { cost: number; events: number }> }) => {
  const chartData = Object.entries(data).map(([name, stats]) => ({
    name: name.length > 20 ? name.substring(0, 20) + '...' : name,
    value: stats.cost,
    events: stats.events,
  }));

  // Calculate percentages
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const dataWithPercentage = chartData.map(item => ({
    ...item,
    percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0'
  }));

  if (dataWithPercentage.length === 0) {
    return <EmptyChart message="No agent cost data available" />;
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={dataWithPercentage}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {dataWithPercentage.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<PieTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => (
              <span style={{ color: entry.color, fontSize: '12px' }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Provider Costs Bar Chart
export const ProviderCostsChart = ({ data }: { data: Record<string, number> }) => {
  const chartData = Object.entries(data).map(([name, cost]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    cost: parseFloat(cost.toFixed(2))
  }));

  if (chartData.length === 0) {
    return <EmptyChart message="No provider cost data available" />;
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            stroke="#64748b"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            stroke="#64748b"
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="cost" 
            fill="#3B82F6" 
            radius={[4, 4, 0, 0]}
            name="Cost"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Cost Over Time Line Chart
export const CostOverTimeChart = ({ data }: { data: Record<string, number> }) => {
  const chartData = Object.entries(data)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, cost]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      cost: parseFloat(cost.toFixed(2)),
      fullDate: date
    }));

  if (chartData.length === 0) {
    return <EmptyChart message="No cost history available" />;
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            stroke="#64748b"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            stroke="#64748b"
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="cost"
            stroke="#3B82F6"
            fillOpacity={1}
            fill="url(#costGradient)"
            strokeWidth={2}
            name="Daily Cost"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Token Usage by Provider Chart
export const TokenUsageChart = ({ data }: { data: Array<{ agent_name: string; tokens_used: number; provider: string }> }) => {
  // Group by provider and sum tokens
  const providerTokens = data.reduce((acc, event) => {
    const provider = event.provider || 'Unknown';
    acc[provider] = (acc[provider] || 0) + (event.tokens_used || 0);
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(providerTokens).map(([name, tokens]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    tokens: tokens
  }));

  if (chartData.length === 0) {
    return <EmptyChart message="No token usage data available" />;
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            stroke="#64748b"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            stroke="#64748b"
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="tokens" 
            fill="#10B981" 
            radius={[4, 4, 0, 0]}
            name="Tokens"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Combined Activity Overview Chart
export const ActivityOverviewChart = ({ 
  costByAgent, 
  recent 
}: { 
  costByAgent: Record<string, { cost: number; events: number }>
  recent: Array<any>
}) => {
  // Create combined data for agents showing both cost and activity count
  const chartData = Object.entries(costByAgent).map(([agent, stats]) => ({
    agent: agent.length > 15 ? agent.substring(0, 15) + '...' : agent,
    cost: parseFloat(stats.cost.toFixed(2)),
    events: stats.events
  })).sort((a, b) => b.cost - a.cost).slice(0, 8); // Top 8 agents

  if (chartData.length === 0) {
    return <EmptyChart message="No activity data available" />;
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey="agent" 
            tick={{ fontSize: 10 }}
            stroke="#64748b"
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            yAxisId="cost"
            orientation="left"
            tick={{ fontSize: 12 }}
            stroke="#64748b"
            tickFormatter={(value) => `$${value}`}
          />
          <YAxis 
            yAxisId="events"
            orientation="right"
            tick={{ fontSize: 12 }}
            stroke="#64748b"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            yAxisId="cost"
            dataKey="cost" 
            fill="#3B82F6" 
            radius={[4, 4, 0, 0]}
            name="Cost ($)"
          />
          <Bar 
            yAxisId="events"
            dataKey="events" 
            fill="#10B981" 
            radius={[4, 4, 0, 0]}
            name="Events"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};