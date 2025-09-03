import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Rectangle } from 'recharts';
import type { OhlcvData } from '../types';

interface StockChartProps {
  data: OhlcvData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-[#0B0F14]/80 p-2 border border-white/20 rounded-lg text-sm">
                <p className="label">{`Date : ${label}`}</p>
                <p className="text-[#00E5FF]">{`Close : ₹${data.close.toFixed(2)}`}</p>
                {data.ema20 && <p className="text-[#FFC400]">{`EMA 20 : ₹${data.ema20.toFixed(2)}`}</p>}
                {data.ema50 && <p className="text-[#A78BFA]">{`EMA 50 : ₹${data.ema50.toFixed(2)}`}</p>}
            </div>
        );
    }
    return null;
};

// A custom layer for the "Volume-Price Nexus" shockwave
const VolumeNexus = ({ data, ...props }: any) => {
    const { xScale, yScale } = props;
    if (!xScale || !yScale || !data.length) return null;

    const breakoutPoints = data.filter(d => d.isBreakout);

    return (
        <g>
            {breakoutPoints.map((point, i) => {
                const cx = xScale(point.date);
                const cy = yScale(point.close);
                const volumeMultiplier = point.breakoutVolumeMultiplier || 1;
                
                const initialRadius = 10 * Math.sqrt(volumeMultiplier);
                const color = volumeMultiplier > 2 ? '#00E5FF' : '#FFC400';

                return (
                    <circle
                        key={`shockwave-${i}`}
                        cx={cx}
                        cy={cy}
                        r={initialRadius}
                        fill={color}
                        className="animate-shockwave"
                    />
                );
            })}
        </g>
    );
};

// A custom layer for "Fibonacci Energy Levels"
const FibonacciEnergyLevels = ({ data, ...props }: any) => {
    const { xScale, yScale, width } = props;
    if (!xScale || !yScale || !data.length) return null;

    const prices = data.map(d => d.close);
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    const range = high - low;

    const fibLevels = [0, 0.236, 0.382, 0.618, 0.786, 1];
    const colors = [
        'rgba(0, 229, 255, 0.05)',
        'rgba(0, 208, 132, 0.05)',
        'rgba(255, 196, 0, 0.05)',
        'rgba(0, 208, 132, 0.05)',
        'rgba(0, 229, 255, 0.05)',
    ];

    return (
        <g>
            {fibLevels.slice(0, -1).map((level, i) => {
                const nextLevel = fibLevels[i + 1];
                const y1 = yScale(low + range * nextLevel);
                const y2 = yScale(low + range * level);
                return (
                    <Rectangle
                        key={i}
                        x={0}
                        y={y1}
                        width={width}
                        height={y2 - y1}
                        fill={colors[i % colors.length]}
                        stroke="rgba(255, 255, 255, 0.1)"
                        strokeDasharray="2 2"
                    />
                );
            })}
        </g>
    );
};


export const StockChart: React.FC<StockChartProps> = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
                <XAxis dataKey="date" stroke="#A0AEC0" fontSize={12} tickFormatter={(str) => {
                    const date = new Date(str);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                }} />
                <YAxis stroke="#A0AEC0" fontSize={12} domain={['dataMin - 10', 'dataMax + 10']} tickFormatter={(val) => `₹${Number(val).toFixed(0)}`} />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Custom Layers for futuristic UI */}
                <CustomLayer data={data} layer={FibonacciEnergyLevels} />
                <CustomLayer data={data} layer={VolumeNexus} />

                <Line type="monotone" dataKey="ema20" stroke="#FFC400" strokeWidth={1.5} dot={false} name="EMA 20" />
                <Line type="monotone" dataKey="ema50" stroke="#A78BFA" strokeWidth={1.5} dot={false} name="EMA 50" />
                <Line type="monotone" dataKey="close" stroke="#00E5FF" strokeWidth={2} dot={false} name="Close Price" className="glow-accent" />
            </LineChart>
        </ResponsiveContainer>
    </div>
  );
};

// Wrapper to pass Recharts props to custom layer components
const CustomLayer = ({ layer: LayerComponent, ...props }: any) => {
  return <LayerComponent {...props} />;
};