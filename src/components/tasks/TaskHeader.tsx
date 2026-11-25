import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, space, touch } from '../../theme/tokens';
import { type } from '../../theme/typography';
import { useEntrance, useReduceMotion } from '../../theme/motion';
import { Icon } from '../ui/Icon';

type Props = {
  total: number;
  completed: number;
  onGuide: () => void;
};

export function TaskHeader({ total, completed, onGuide }: Props) {
  const reduce = useReduceMotion();
  const entrance = useEntrance(0, reduce);

  return (
    <Animated.View style={entrance}>
      <View style={styles.top}>
        <Text style={type.eyebrow}>LABORATORIO · REACT NATIVE</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir guía de trabajo"
          hitSlop={touch.hitSlop}
          onPress={onGuide}
          style={({ pressed }) => [styles.guide, pressed && styles.pressed]}
        >
          <Text style={styles.guideText}>Guía</Text>
          <Icon name="arrowUpRight" size={13} color={colors.ink} />
        </Pressable>
      </View>

      <Text style={styles.display}>Gestor de tareas</Text>
      <Text style={styles.subtitle}>Tareas compartidas, sincronizadas con la API.</Text>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Total</Text>
          <Text style={styles.statValue}>{String(total).padStart(2, '0')}</Text>
        </View>
        <View style={[styles.stat, styles.statBorder]}>
          <Text style={styles.statLabel}>Completadas</Text>
          <Text style={styles.statValue}>{String(completed).padStart(2, '0')}</Text>
        </View>
        <View style={[styles.stat, styles.statBorder]}>
          <Text style={styles.statLabel}>Pendientes</Text>
          <Text style={styles.statValue}>{String(total - completed).padStart(2, '0')}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  guide: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: space.sm, paddingHorizontal: space.sm, borderRadius: radius.xs },
  guideText: { ...type.meta, color: colors.ink },
  pressed: { opacity: 0.6 },
  display: { ...type.display, color: colors.ink, marginTop: space.lg },
  subtitle: { ...type.body, color: colors.muted, marginTop: space.sm, marginBottom: space.xl },
  stats: { flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.line, paddingVertical: space.lg, marginBottom: space.xl },
  stat: { flex: 1 },
  statBorder: { borderLeftWidth: 1, borderLeftColor: colors.line, paddingLeft: space.lg },
  statLabel: { ...type.meta, color: colors.muted, fontSize: 10 },
  statValue: { ...type.stat, color: colors.ink, marginTop: 4 },
});
