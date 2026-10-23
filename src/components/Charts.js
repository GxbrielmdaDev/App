import { useWindowDimensions, View, Text } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '../contexts/ThemeContext';
import { chartPalette, lossColor, profitColor } from '../theme/colors';
import { formatCurrency } from '../utils/format';

const polarToCartesian = (cx, cy, r, angleDeg) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
};

const describeArc = (cx, cy, r, startAngle, endAngle) => {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
};

function LegendRow({ color, label, value, colors }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: color }} />
      <Text style={{ color: colors.textSecondary, fontSize: 13.5, flex: 1 }}>{label}</Text>
      <Text style={{ color: colors.text, fontSize: 13.5, fontWeight: '700' }}>{formatCurrency(value)}</Text>
    </View>
  );
}

export function ProfitLossChart({ data }) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  const profit = Number(data?.lucro || 0);
  const loss = Number(data?.prejuizo || 0);
  const total = profit + loss;

  if (!data || total <= 0) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 24 }}>
        <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: 'center' }}>
          Nenhum dado de lucro/prejuízo disponível
        </Text>
      </View>
    );
  }

  const size = Math.min(Math.max(width - 150, 170), 240);
  const strokeWidth = 30;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const profitFraction = profit / total;

  return (
    <View style={{ alignItems: 'center', gap: 18 }}>
      <Svg width={size} height={size}>
        {loss <= 0 ? (
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={profitColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
        ) : profit <= 0 ? (
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={lossColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
        ) : (
          <>
            <Path
              d={describeArc(center, center, radius, 0, profitFraction * 360)}
              stroke={profitColor}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="butt"
            />
            <Path
              d={describeArc(center, center, radius, profitFraction * 360, 359.99)}
              stroke={lossColor}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="butt"
            />
          </>
        )}
      </Svg>

      <View style={{ width: '100%', gap: 10 }}>
        <LegendRow color={profitColor} label="Lucro" value={profit} colors={colors} />
        <LegendRow color={lossColor} label="Prejuízo" value={loss} colors={colors} />
      </View>
    </View>
  );
}

export function ProductsByCategoryChart({ data }) {
  const { colors } = useTheme();

  if (!data || data.length === 0) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 24 }}>
        <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: 'center' }}>
          Nenhum dado de categorias disponível
        </Text>
      </View>
    );
  }

  const maxQuantity = Math.max(...data.map((item) => Number(item.quantidade) || 0), 1);

  return (
    <View style={{ gap: 14 }}>
      {data.map((item, index) => {
        const quantity = Number(item.quantidade) || 0;
        const percentage = Math.max((quantity / maxQuantity) * 100, quantity > 0 ? 4 : 0);
        const color = chartPalette[index % chartPalette.length];

        return (
          <View key={`${item.categoria}-${index}`}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, gap: 10 }}>
              <Text numberOfLines={1} style={{ color: colors.text, fontSize: 13.5, flex: 1 }}>
                {item.categoria}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '600' }}>
                {quantity}
              </Text>
            </View>
            <View style={{ height: 10, borderRadius: 999, backgroundColor: colors.surface, overflow: 'hidden' }}>
              <View
                style={{
                  width: `${percentage}%`,
                  height: '100%',
                  borderRadius: 999,
                  backgroundColor: color,
                }}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}
