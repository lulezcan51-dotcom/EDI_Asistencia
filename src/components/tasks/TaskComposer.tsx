import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, space, touch } from '../../theme/tokens';
import { type } from '../../theme/typography';
import { useEntrance, useReduceMotion, usePress } from '../../theme/motion';
import { Button, TextField } from '../ui/Primitives';

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onOpenSheet: () => void;
  saving: boolean;
  feedback?: string;
};

export function TaskComposer({ value, onChange, onSubmit, onOpenSheet, saving, feedback }: Props) {
  const reduce = useReduceMotion();
  const entrance = useEntrance(1, reduce);
  const link = usePress(reduce, 0.97);

  return (
    <Animated.View style={entrance}>
      <Text style={styles.label}>Nueva tarea</Text>
      <View style={styles.row}>
        <View style={styles.inputWrap}>
          <TextField
            value={value}
            onChangeText={onChange}
            placeholder="Qué hay que hacer"
            label="Nombre de la nueva tarea"
            testID="new-task-input"
            editable={!saving}
            onSubmitEditing={onSubmit}
          />
        </View>
        <Button label={saving ? '' : 'Agregar'} onPress={onSubmit} disabled={saving} testID="add-task-button" />
      </View>
      <Animated.View style={{ transform: [{ scale: link.scale }] }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir formulario detallado"
          testID="open-add-sheet"
          disabled={saving}
          hitSlop={touch.hitSlop}
          onPressIn={link.onPressIn}
          onPressOut={link.onPressOut}
          onPress={onOpenSheet}
          style={styles.more}
        >
          <Text style={styles.moreText}>Agregar con detalles</Text>
        </Pressable>
      </Animated.View>
      {feedback ? <Text accessibilityLiveRegion="polite" style={styles.feedback}>{feedback}</Text> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  label: { ...type.eyebrow, marginBottom: space.md },
  row: { flexDirection: 'row', gap: space.sm },
  inputWrap: { flex: 1 },
  more: { alignSelf: 'flex-start', paddingVertical: space.sm, marginTop: 2 },
  moreText: { ...type.meta, color: colors.ink, textDecorationLine: 'underline' },
  feedback: { ...type.meta, color: colors.muted, marginTop: space.sm },
});
