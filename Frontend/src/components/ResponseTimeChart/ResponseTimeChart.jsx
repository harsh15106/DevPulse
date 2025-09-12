import React, { useState, useRef, useMemo } from 'react';
import './ResponseTimeChart.css';

const Tooltip = ({ data, position }) => {
    if (!data || !position) return null;
    return (
        <div className="chart-tooltip" style={{ top: `${position.y}px`, left: `${position.x}px` }}>
            <div className="tooltip-time">{data.time}</div>
            <div className="tooltip-value">{data.ms}ms</div>
        </div>
    );
};

export default function ResponseTimeChart({ data }) {
    const [tooltipData, setTooltipData] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState(null);
    const svgRef = useRef(null);

    const chartDimensions = { width: 500, height: 200, padding: 20 };

    const { maxMs, points, yAxisLabels, gridLines } = useMemo(() => {
        if (!data || data.length === 0) return { maxMs: 0, points: '', yAxisLabels: [], gridLines: [] };

        const maxVal = Math.max(...data.map(d => d.ms));
        const maxMs = Math.ceil(maxVal / 50) * 50; // Round up to the nearest 50

        const points = data
            .map((d, i) => {
                const x = chartDimensions.padding + (i / (data.length - 1)) * (chartDimensions.width - chartDimensions.padding * 2);
                const y = chartDimensions.height - chartDimensions.padding - (d.ms / maxMs) * (chartDimensions.height - chartDimensions.padding * 2);
                return `${x},${y}`;
            })
            .join(' ');
        
        const yAxisLabels = [0, maxMs / 2, maxMs].map(label => ({
            value: label,
            y: chartDimensions.height - chartDimensions.padding - (label / maxMs) * (chartDimensions.height - chartDimensions.padding * 2),
        }));

        const gridLines = yAxisLabels.map(label => `M${chartDimensions.padding},${label.y} H${chartDimensions.width - chartDimensions.padding}`);

        return { maxMs, points, yAxisLabels, gridLines };
    }, [data]);

    const handleMouseMove = (e) => {
        if (!svgRef.current || !data || data.length === 0) return;
        const svgRect = svgRef.current.getBoundingClientRect();
        const x = e.clientX - svgRect.left;

        const chartAreaWidth = chartDimensions.width - chartDimensions.padding * 2;
        const index = Math.round(((x - chartDimensions.padding) / chartAreaWidth) * (data.length - 1));

        if (index >= 0 && index < data.length) {
            const pointData = data[index];
            const pointX = chartDimensions.padding + (index / (data.length - 1)) * chartAreaWidth;
            const pointY = chartDimensions.height - chartDimensions.padding - (pointData.ms / maxMs) * (chartDimensions.height - chartDimensions.padding * 2);
            
            setTooltipData(pointData);
            setTooltipPosition({ x: pointX, y: pointY - 10 }); // Position tooltip above the point
        }
    };

    const handleMouseLeave = () => {
        setTooltipData(null);
        setTooltipPosition(null);
    };

    if (!data || data.length === 0) {
        return (
            <div className="dashboard-card">
                <h3>Response Time (Last 24h)</h3>
                <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                    No data available
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-card">
            <h3>Response Time (Last 24h)</h3>
            <div className="chart-wrapper" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
                <Tooltip data={tooltipData} position={tooltipPosition} />
                <svg ref={svgRef} viewBox={`0 0 ${chartDimensions.width} ${chartDimensions.height}`} preserveAspectRatio="xMidYMid meet">
                    <g className="y-axis">
                        {yAxisLabels.map(label => (
                            <text key={label.value} x={chartDimensions.padding - 5} y={label.y + 3} textAnchor="end">
                                {label.value}ms
                            </text>
                        ))}
                    </g>
                    <g className="grid-lines">
                        {gridLines.map((d, i) => (
                            <path key={i} d={d} />
                        ))}
                    </g>
                    <defs>
                        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: 'var(--accent-color)', stopOpacity: 0.4 }} />
                            <stop offset="100%" style={{ stopColor: 'var(--accent-color)', stopOpacity: 0 }} />
                        </linearGradient>
                    </defs>
                    <polyline className="chart-area" points={points} />
                    <polyline className="chart-line" points={points} />
                </svg>
            </div>
        </div>
    );
}