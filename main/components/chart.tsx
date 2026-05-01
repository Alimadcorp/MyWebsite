import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
interface ModrinthChartProps {
  label: string;
  data: number[];
  total?: string | number;
  className?: string;
}
const ModrinthAnalytics = ({ label, data, total, className = "" }: ModrinthChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const displayValue = useMemo(() => {
    if (total !== undefined) return total;
    return data.reduce((acc, val) => acc + val, 0).toLocaleString();
  }, [data, total]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const paths = useMemo(() => {
    if (dimensions.width === 0 || data.length < 2) return { line: "", area: "" };
    const max = Math.max(...data, 1);
    const padding = 2;
    const chartHeight = dimensions.height;
    const chartWidth = dimensions.width;


    const points = data.map((val, i) => ({
      x: (i / (data.length - 1)) * chartWidth,
      y: chartHeight - ((val / max) * (chartHeight - padding)) - padding,
    }));

    let d = `M ${points[0].x},${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? i : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return {
      line: d,
      area: `${d} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`
    };
  }, [data, dimensions]);
  return (
    <div className={`group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#111111] transition-all hover:bg-[#161616] ${className}`}>
      {/* Top Content */}
      <div className="relative z-20 p-5 pb-0 pointer-events-none">
        <h1 className="text-2xl font-bold text-white origin-left">
          {displayValue}
        </h1>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-1">
          {label}
        </p>
      </div>
      {/* Chart Area - Auto Scale */}
      <div ref={containerRef} className="relative flex-grow min-h-[60px] w-full mt-4">
        <svg
          width={dimensions.width}
          height={dimensions.height}
          className="absolute inset-0 block"
        >
          <defs>
            <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Area Fill */}
          <motion.path
            d={paths.area}
            fill={`url(#grad-${label})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          />
          {/* Glowing Line */}
          <motion.path
            d={paths.line}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </svg>
      </div>
      {/* Interaction Overlay (Select Border) */}
      <div className="absolute inset-0 z-30 rounded-xl border-2 border-transparent group-active:border-[var(--color-accent)] transition-colors pointer-events-none" />
    </div>
  );
};
export default ModrinthAnalytics;