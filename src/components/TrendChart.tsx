import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Path, Stop } from 'react-native-svg';
import { colors } from '../theme';

function buildPath(rawValues: number[], width: number, height: number, padding = 8) {
  const safeValues = rawValues.length > 0 ? rawValues : [0];
  const values = safeValues.length > 1 ? safeValues : [...safeValues, ...safeValues];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = (width - padding * 2) / (values.length - 1);

  const points = values.map((v, i) => {
    const x = padding + i * stepX;
    const y = height - padding - ((v - min) / range) * (height - padding * 2);
    return { x, y };
  });

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const area = `${line} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
  return { line, area, last: points[points.length - 1] };
}

export function TrendChart({ values, width = 300, height = 120 }: { values: number[]; width?: number; height?: number }) {
  const { line, area, last } = buildPath(values, width, height);

  return (
    <View>
      <Svg width={width} height={height}>
        <Defs>
          <SvgGradient id="fill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.gold} stopOpacity={0.35} />
            <Stop offset="1" stopColor={colors.gold} stopOpacity={0} />
          </SvgGradient>
        </Defs>
        <Path d={area} fill="url(#fill)" />
        <Path d={line} stroke={colors.gold} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx={last.x} cy={last.y} r={4} fill={colors.goldLight} />
      </Svg>
    </View>
  );
}
