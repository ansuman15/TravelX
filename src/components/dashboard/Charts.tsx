'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
} from 'recharts';

// ============================================
// REVENUE CHART
// ============================================
interface RevenueChartProps {
    data: { name: string; value: number }[];
    title?: string;
}

export function RevenueChart({ data, title = 'Revenue Overview' }: RevenueChartProps) {
    return (
        <div className="card">
            <div className="card-header">
                <div>
                    <h3 className="card-title">{title}</h3>
                </div>
                <div className="chart-toggle">
                    <button className="chart-toggle-btn active">Weekly</button>
                    <button className="chart-toggle-btn">Monthly</button>
                </div>
            </div>
            <div className="card-body">
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-light)',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                }}
                                labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="var(--primary-500)"
                                strokeWidth={2}
                                dot={{ fill: 'var(--primary-500)', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, fill: 'var(--primary-600)' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

// ============================================
// DESTINATIONS DONUT CHART
// ============================================
interface DestinationData {
    name: string;
    value: number;
    color: string;
    participants?: number;
}

interface DestinationsChartProps {
    data: DestinationData[];
    title?: string;
}

const DESTINATION_COLORS = [
    '#3F83F8',
    '#0E9F6E',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
    '#EC4899',
];

export function DestinationsChart({ data, title = 'Top Destinations' }: DestinationsChartProps) {
    // Transform data for Recharts
    const chartData = data.map(item => ({ name: item.name, value: item.value }));

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">{title}</h3>
                <div className="chart-toggle">
                    <button className="chart-toggle-btn active">This Month</button>
                </div>
            </div>
            <div className="card-body">
                <div className="flex gap-6">
                    {/* Donut Chart */}
                    <div style={{ width: '160px', height: '160px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={data[index]?.color || DESTINATION_COLORS[index % DESTINATION_COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border-light)',
                                        borderRadius: '8px',
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend */}
                    <div className="donut-legend" style={{ flex: 1 }}>
                        {data.map((item, index) => (
                            <div key={item.name} className="donut-legend-item">
                                <div
                                    className="donut-legend-color"
                                    style={{
                                        background: item.color || DESTINATION_COLORS[index % DESTINATION_COLORS.length]
                                    }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div className="donut-legend-label">{item.name}</div>
                                    {item.participants && (
                                        <div className="text-xs text-tertiary">
                                            {item.participants.toLocaleString()} Participants
                                        </div>
                                    )}
                                </div>
                                <div className="donut-legend-value">{item.value}%</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================
// BAR CHART (FOR COMPARISONS)
// ============================================
interface BarChartData {
    name: string;
    current: number;
    previous?: number;
}

interface ComparisonBarChartProps {
    data: BarChartData[];
    title?: string;
}

export function ComparisonBarChart({ data, title = 'Comparison' }: ComparisonBarChartProps) {
    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">{title}</h3>
            </div>
            <div className="card-body">
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-light)',
                                    borderRadius: '8px',
                                }}
                            />
                            {data[0]?.previous !== undefined && (
                                <Bar dataKey="previous" fill="var(--gray-300)" radius={[4, 4, 0, 0]} />
                            )}
                            <Bar dataKey="current" fill="var(--primary-500)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

// ============================================
// TRIPS PROGRESS WIDGET
// ============================================
interface TripStats {
    total: number;
    done: number;
    booked: number;
    cancelled: number;
}

interface TripsProgressProps {
    stats: TripStats;
}

export function TripsProgress({ stats }: TripsProgressProps) {
    const { total, done, booked, cancelled } = stats;
    const donePercent = (done / total) * 100;
    const bookedPercent = (booked / total) * 100;
    const cancelledPercent = (cancelled / total) * 100;

    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
                <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'var(--primary-100)',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <span style={{ fontSize: 'var(--font-lg)' }}>✈️</span>
                </div>
                <div>
                    <div className="text-sm text-secondary">Total Trips</div>
                    <div className="text-2xl font-bold">{total.toLocaleString()}</div>
                </div>
            </div>

            <div style={{ flex: 1 }}>
                <div className="progress-segmented">
                    <div
                        className="progress-segment"
                        style={{ width: `${donePercent}%`, background: 'var(--success-500)' }}
                    />
                    <div
                        className="progress-segment"
                        style={{ width: `${bookedPercent}%`, background: 'var(--primary-500)' }}
                    />
                    <div
                        className="progress-segment"
                        style={{ width: `${cancelledPercent}%`, background: 'var(--gray-300)' }}
                    />
                </div>
                <div className="flex gap-4 mt-2">
                    <div className="flex items-center gap-2">
                        <span style={{ width: '8px', height: '8px', background: 'var(--success-500)', borderRadius: '50%' }} />
                        <span className="text-xs text-secondary">Done {done}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span style={{ width: '8px', height: '8px', background: 'var(--primary-500)', borderRadius: '50%' }} />
                        <span className="text-xs text-secondary">Booked {booked}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span style={{ width: '8px', height: '8px', background: 'var(--gray-300)', borderRadius: '50%' }} />
                        <span className="text-xs text-secondary">Cancelled {cancelled}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
