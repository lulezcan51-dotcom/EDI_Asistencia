import { useEffect, useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable,
  ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { colors, radius, space, touch } from '../../theme/tokens';
import { type } from '../../theme/typography';
import type { Task, TaskPriority } from '../../types/task';
import { isValidTaskTitle } from '../../utils/taskValidation';
import { Icon } from '../ui/Icon';
import { Badge, Button, TextField } from '../ui/Primitives';

export type NewTaskDraft = { title: string; description: string; priority: TaskPriority };

type Props = {
  visible: boolean;
  busy?: boolean;
  initial?: Task | null;
  onClose: () => void;
  onSubmit: (draft: NewTaskDraft) => void | Promise<void>;
};

const tones: Record<TaskPriority, 'high' | 'mid' | 'low'> = { alta: 'high', media: 'mid', baja: 'low' };

export function AddTaskSheet({ visible, busy = false, initial, onClose, onSubmit }: Props) {
  const editing = Boolean(initial);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('media');
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setTitle(initial?.title ?? '');
      setDescription(initial?.description ?? '');
      setPriority(initial?.priority ?? 'media');
      setError('');
    }
  }, [visible, initial]);

  async function submit() {
    if (busy) return;
    if (!isValidTaskTitle(title)) {
      setError('El título no puede quedar vacío ni superar 200 bytes.');
      return;
    }
    await onSubmit({ title: title.trim(), description: description.trim(), priority });
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Cerrar formulario">
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
              <View style={styles.handle} />
              <View style={styles.header}>
                <View style={styles.icon}><Icon name="plus" size={19} color={colors.onAccent} /></View>
                <View style={styles.headerText}>
                  <Text style={styles.title}>{editing ? 'Editar tarea' : 'Nueva tarea'}</Text>
                  <Text style={styles.sub}>{editing ? 'Modificá los datos y guardá' : 'Completá los detalles'}</Text>
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel="Cerrar" hitSlop={touch.hitSlop} onPress={onClose} style={styles.close}>
                  <Icon name="close" size={17} color={colors.muted} />
                </Pressable>
              </View>

              <Text style={styles.fieldLabel}>Título</Text>
              <TextField value={title} onChangeText={(v) => { setTitle(v); setError(''); }} placeholder="Qué hay que hacer" label="Título de la tarea" testID="sheet-title-input" editable={!busy} />
              {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

              <Text style={[styles.fieldLabel, styles.spaced]}>Descripción <Text style={styles.optional}>opcional</Text></Text>
              <TextField value={description} onChangeText={setDescription} placeholder="Notas o pasos" label="Descripción" testID="sheet-description-input" editable={!busy} multiline />

              <Text style={[styles.fieldLabel, styles.spaced]}>Prioridad</Text>
              <View style={styles.priorities}>
                {(['alta', 'media', 'baja'] as TaskPriority[]).map((item) => (
                  <Pressable
                    key={item}
                    accessibilityRole="button"
                    accessibilityState={{ selected: priority === item }}
                    testID={`sheet-priority-${item}`}
                    hitSlop={touch.hitSlop}
                    disabled={busy}
                    onPress={() => setPriority(item)}
                    style={({ pressed }) => [styles.priority, priority === item && styles.priorityOn, pressed && styles.pressed]}
                  >
                    <Badge label={item.toUpperCase()} tone={tones[item]} />
                  </Pressable>
                ))}
              </View>

              <View style={styles.footer}>
                <View style={styles.cancel}><Button label="Cancelar" variant="ghost" onPress={onClose} disabled={busy} /></View>
                <View style={styles.submit}>
                  <Button label={busy ? '' : editing ? 'Guardar cambios' : 'Guardar tarea'} onPress={() => void submit()} disabled={busy} testID="sheet-submit-button" />
                  {busy ? <ActivityIndicator color={colors.onAccent} size="small" style={styles.spinner} /> : null}
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(20,20,19,0.42)', justifyContent: 'flex-end', alignItems: 'center' },
  sheet: {
    width: '100%', maxWidth: 520, backgroundColor: colors.surface,
    borderTopLeftRadius: radius.md, borderTopRightRadius: radius.md,
    paddingBottom: space.xl,
    ...Platform.select({ web: { margin: space.lg, borderRadius: radius.md } }),
  },
  scroll: { paddingHorizontal: space.xl, paddingTop: space.sm },
  handle: { width: 32, height: 3, borderRadius: 2, backgroundColor: colors.line, alignSelf: 'center', marginBottom: space.lg, marginTop: space.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.xl },
  icon: { width: 38, height: 38, borderRadius: radius.sm, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  title: { ...type.title, color: colors.ink, fontSize: 17 },
  sub: { ...type.meta, color: colors.muted, marginTop: 2 },
  close: { width: 34, height: 34, borderRadius: radius.xs, alignItems: 'center', justifyContent: 'center' },
  fieldLabel: { ...type.eyebrow, marginBottom: space.sm },
  spaced: { marginTop: space.xl },
  optional: { color: colors.faint, textTransform: 'none', letterSpacing: 0 },
  error: { ...type.meta, color: colors.highFg, marginTop: space.sm },
  priorities: { flexDirection: 'row', gap: space.sm },
  priority: { flex: 1, minHeight: 40, borderRadius: radius.xs, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  priorityOn: { borderColor: colors.ink, backgroundColor: colors.surfaceAlt },
  footer: { flexDirection: 'row', gap: space.sm, marginTop: space.xxl },
  cancel: { flex: 1 }, submit: { flex: 2 }, spinner: { position: 'absolute' },
  pressed: { opacity: 0.6 },
});
