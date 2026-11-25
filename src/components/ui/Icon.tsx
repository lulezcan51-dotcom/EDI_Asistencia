import { Svg, Circle, Line, Path, Rect } from 'react-native-svg';
import { colors } from '../../theme/tokens';

export type IconName =
  | 'check' | 'plus' | 'minus' | 'search' | 'trash' | 'sliders'
  | 'reload' | 'alert' | 'chevron' | 'arrowUpRight' | 'calendar'
  | 'close' | 'arrowLeft' | 'inbox';

type Props = {
  name: IconName;
  size?: number;
  color?: string;
};

/** Geometric line icons. Uniform 1.7 stroke, no emoji glyphs. */
export function Icon({ name, size = 18, color = colors.ink }: Props) {
  const common = {
    stroke: color,
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none' as const,
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false}>
      {name === 'check' && <Path d="M5 12.5l4.5 4.5L19 7.5" {...common} />}
      {name === 'plus' && <Path d="M12 5v14M5 12h14" {...common} />}
      {name === 'minus' && <Path d="M5 12h14" {...common} />}
      {name === 'search' && (
        <>
          <Circle cx={10.5} cy={10.5} r={6.5} {...common} />
          <Path d="M15.5 15.5L21 21" {...common} />
        </>
      )}
      {name === 'trash' && (
        <>
          <Path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13" {...common} />
          <Path d="M10 11v5M14 11v5" {...common} />
        </>
      )}
      {name === 'sliders' && (
        <>
          <Path d="M4 7h10M18 7h2M4 17h2M10 17h10" {...common} />
          <Circle cx={16} cy={7} r={2} {...common} />
          <Circle cx={8} cy={17} r={2} {...common} />
        </>
      )}
      {name === 'reload' && (
        <>
          <Path d="M20 11a8 8 0 1 0-2.3 5.7" {...common} />
          <Path d="M20 4v7h-7" {...common} />
        </>
      )}
      {name === 'alert' && (
        <>
          <Path d="M12 3.5L22 20H2L12 3.5z" {...common} />
          <Path d="M12 9v5M12 17.2v.1" {...common} />
        </>
      )}
      {name === 'chevron' && <Path d="M6 9l6 6 6-6" {...common} />}
      {name === 'arrowUpRight' && <Path d="M7 17L17 7M8 7h9v9" {...common} />}
      {name === 'calendar' && (
        <>
          <Rect x={3.5} y={5.5} width={17} height={15} rx={2} {...common} />
          <Path d="M3.5 10h17M8 3.5v4M16 3.5v4" {...common} />
        </>
      )}
      {name === 'close' && <Path d="M6 6l12 12M18 6L6 18" {...common} />}
      {name === 'arrowLeft' && <Path d="M20 12H4M10 6l-6 6 6 6" {...common} />}
      {name === 'inbox' && (
        <>
          <Path d="M3 13l3-8h12l3 8v6H3v-6z" {...common} />
          <Path d="M3 13h5l1 3h6l1-3h5" {...common} />
        </>
      )}
    </Svg>
  );
}
