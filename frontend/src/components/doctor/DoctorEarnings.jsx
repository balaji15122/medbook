import React, { useState } from 'react';
import { DollarSign, Calendar, TrendingUp } from 'lucide-react';

export const DoctorEarnings = ({ stats }) => {
  const [hoveredBar, setHoveredBar] = useState(null);

  if (!stats) return null;

  const {
    dailyEarnings = 0,
    monthlyEarnings = 0,
    yearlyEarnings = 0,
    earningsChartData = [],
  } = stats;

  // Calculate chart max amount (with a minimum baseline of 1000 for proper scaling)
  const maxAmount = Math.max(...earningsChartData.map((d) => d.amount), 1000);

  // SVG Chart Dimensions & Configuration
  const svgWidth = 600;
  const svgHeight = 240;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;
  const barWidth = 32;

  // Y-axis tick calculations
  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 1.25rem' }}>
        Earnings & Practice Growth
      </h2>

      {/* Grid of Earnings Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.5rem',
        }}
      >
        {/* Daily Earnings */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: '#ffffff' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(37, 99, 235, 0.1)',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <DollarSign size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Daily Income</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.1rem 0 0', color: 'var(--text-primary)' }}>
              ₹{dailyEarnings.toLocaleString('en-IN')}
            </h3>
          </div>
        </div>

        {/* Monthly Earnings */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: '#ffffff' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(13, 148, 136, 0.1)',
              color: '#0d9488',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Calendar size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Monthly Income</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.1rem 0 0', color: 'var(--text-primary)' }}>
              ₹{monthlyEarnings.toLocaleString('en-IN')}
            </h3>
          </div>
        </div>

        {/* Yearly Earnings */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: '#ffffff' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(99, 102, 241, 0.1)',
              color: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingUp size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Yearly Income</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.1rem 0 0', color: 'var(--text-primary)' }}>
              ₹{yearlyEarnings.toLocaleString('en-IN')}
            </h3>
          </div>
        </div>
      </div>

      {/* SVG Growth Chart Card */}
      <div className="card" style={{ padding: '1.75rem', background: '#ffffff', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Practice Revenue History
            </h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Comparison of growth over last 6 months</span>
          </div>
        </div>

        {/* Responsive Chart Wrapper */}
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <div style={{ minWidth: '550px', position: 'relative' }}>
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" height={svgHeight} style={{ overflow: 'visible' }}>
              {/* Y-Axis Grid Lines & Labels */}
              {yTicks.map((tick, idx) => {
                const yVal = paddingTop + chartHeight - tick * chartHeight;
                const priceLabel = Math.round(tick * maxAmount);
                return (
                  <g key={idx}>
                    <line
                      x1={paddingLeft}
                      y1={yVal}
                      x2={svgWidth - paddingRight}
                      y2={yVal}
                      stroke="rgba(226, 232, 240, 0.8)"
                      strokeWidth={1}
                      strokeDasharray="4 4"
                    />
                    <text
                      x={paddingLeft - 10}
                      y={yVal + 4}
                      fill="var(--text-muted)"
                      fontSize={10}
                      textAnchor="end"
                      fontWeight={500}
                    >
                      ₹{priceLabel >= 1000 ? `${(priceLabel / 1000).toFixed(1)}k` : priceLabel}
                    </text>
                  </g>
                );
              })}

              {/* Bars and X-Axis Labels */}
              {earningsChartData.map((data, index) => {
                // Calculate position for each column
                const xVal =
                  paddingLeft +
                  (index * chartWidth) / earningsChartData.length +
                  chartWidth / (earningsChartData.length * 2) -
                  barWidth / 2;

                // Calculate height of the bar based on the value ratio
                const valRatio = data.amount / maxAmount;
                const barHeight = Math.max(valRatio * chartHeight, 4); // minimum 4px bar height for visibility
                const yVal = paddingTop + chartHeight - barHeight;

                const isHovered = hoveredBar === index;

                return (
                  <g
                    key={index}
                    onMouseEnter={() => setHoveredBar(index)}
                    onMouseLeave={() => setHoveredBar(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Hover Glow Effect */}
                    {isHovered && (
                      <rect
                        x={xVal - 4}
                        y={paddingTop}
                        width={barWidth + 8}
                        height={chartHeight + 6}
                        fill="rgba(13, 148, 136, 0.04)"
                        rx={6}
                      />
                    )}

                    {/* The Data Bar */}
                    <rect
                      x={xVal}
                      y={yVal}
                      width={barWidth}
                      height={barHeight}
                      fill={isHovered ? 'url(#barGradientHover)' : 'url(#barGradient)'}
                      rx={4}
                      style={{ transition: 'all 0.25s ease' }}
                    />

                    {/* Bottom Label (Month Name) */}
                    <text
                      x={xVal + barWidth / 2}
                      y={paddingTop + chartHeight + 20}
                      fill={isHovered ? 'var(--secondary)' : 'var(--text-muted)'}
                      fontSize={11}
                      fontWeight={isHovered ? 700 : 500}
                      textAnchor="middle"
                    >
                      {data.label.split(' ')[0]} {/* Short Month Name (e.g. "Aug") */}
                    </text>
                  </g>
                );
              })}

              {/* Chart Definitions (gradients) */}
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0d9488" />
                  <stop offset="100%" stopColor="#2dd4bf" />
                </linearGradient>
                <linearGradient id="barGradientHover" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0f766e" />
                  <stop offset="100%" stopColor="#0d9488" />
                </linearGradient>
              </defs>
            </svg>

            {/* Hover Tooltip Overlay (HTML based tooltips) */}
            {hoveredBar !== null && (
              <div
                style={{
                  position: 'absolute',
                  top: `${paddingTop + 10}px`,
                  left: `${
                    paddingLeft +
                    (hoveredBar * chartWidth) / earningsChartData.length +
                    chartWidth / (earningsChartData.length * 2) -
                    60
                  }px`,
                  background: 'rgba(15, 23, 42, 0.95)',
                  color: '#ffffff',
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
                  pointerEvents: 'none',
                  zIndex: 10,
                  textAlign: 'center',
                  transition: 'all 0.15s ease',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase' }}>
                  {earningsChartData[hoveredBar].label}
                </div>
                <div>₹{earningsChartData[hoveredBar].amount.toLocaleString('en-IN')}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorEarnings;
