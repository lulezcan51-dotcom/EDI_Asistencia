import { useEffect, useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View,
} from 'react-native';
import { colors, radius, space, touch, type as typeTokens } from '../theme/tokens';
import type { TaskPriority } from '../types/task';
import { isValidTaskTitle } from '../utils/taskValidation';

export type NewTaskDraft = {
  title: string;
  description: string;
  priority: TaskPriority;
};

type Props = {
  visible: boolean;
  busy?: boolean;
  onClose: () => void;
  onSubmit: (draft: NewTaskDraft) => void | Promise<void>;
};

const priorities: { key: TaskPriority; label: string; emoji: string; hint: string }[] = [
  { key: 'alta', label: 'Alta', emoji: '▲', hint: 'Urgente' },
  { key: 'media', label: 'Media', emoji: '●', hint: 'Normal' },
  { key: 'baja', label: 'Baja', emoji: '▼', hint: 'Cuando puedas' },
];

const priorityTone: Record<TaskPriority, { bg: string; fg: string; border: string }> = {
  alta: { bg: colors.destructiveSoft, fg: colors.destructive, border: colors.destructive },
  media: { bg: colors.warningSoft, fg: colors.warning, border: colors.warning },
  baja: { bg: colors.primarySoft, fg: colors.primary, border: colors.primary },
};

export function AddTaskSheet({ visible, busy = false, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('media');
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setTitle('');
      setDescription('');
      setPriority('media');
      setError('');
    }
  }, [visible]);

  async function handleSubmit() {
    if (busy) return;
    if (!isValidTaskTitle(title)) {
      setError('El título no puede quedar vacío.');
      return;
    }
    await onSubmit({ title: title.trim(), description: description.trim(), priority });
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Cerrar formulario">
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
              <View style={styles.handle} />
              <View style={styles.header}>
                <View style={styles.headerIcon}><Text style={styles.headerIconText}>＋</Text></View>
                <View style={styles.headerText}>
                  <Text style={styles.sheetTitle}>Nueva tarea</Text>
                  <Text style={styles.sheetSubtitle}>Completá los detalles para crearla</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar"
                  hitSlop={touch.hitSlop}
                  onPress={onClose}
                  style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
                >
                  <Text style={styles.closeText}>✕</Text>
                </Pressable>
              </View>

              <Text style={styles.fieldLabel}>TÍTULO <Text style={styles.required}>*</Text></Text>
              <TextInput
                testID="sheet-title-input"
                accessibilityLabel="Título de la tarea"
                placeholder="Ej.: Revisar documentación"
                placeholderTextColor={colors.textSubtle}
                value={title}
                onChangeText={(value) => { setTitle(value); setError(''); }}
                editable={!busy}
                style={[styles.input, error ? styles.inputError : null]}
                autoFocus
              />
              {error ? <Text accessibilityRole="alert" style={styles.fieldError}>{error}</Text> : null}

              <Text style={[styles.fieldLabel, styles.fieldSpaced]}>DESCRIPCIÓN <Text style={styles.optional}>(opcional)</Text></Text>
              <TextInput
                testID="sheet-description-input"
                accessibilityLabel="Descripción de la tarea"
                placeholder="Agregá notas o pasos para esta tarea..."
                placeholderTextColor={colors.textSubtle}
                value={description}
                onChangeText={setDescription}
                editable={!busy}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={styles.textarea}
              />

              <Text style={[styles.fieldLabel, styles.fieldSpaced]}>PRIORIDAD</Text>
              <View style={styles.priorityRow}>
                {priorities.map((item) => {
                  const tone = priorityTone[item.key];
                  const active = priority === item.key;
                  return (
                    <Pressable
                      key={item.key}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      testID={`sheet-priority-${item.key}`}
                      hitSlop={touch.hitSlop}
                      onPress={() => setPriority(item.key)}
                      style={({ pressed }) => [
                        styles.priorityCard,
                        { borderColor: active ? tone.border : colors.borderSoft },
                        active && { backgroundColor: tone.bg },
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={[styles.priorityEmoji, { color: tone.fg }]}>{item.emoji}</Text>
                      <Text style={[styles.priorityLabel, active && { color: tone.fg }]}>{item.label}</Text>
                      <Text style={styles.priorityHint}>{item.hint}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.footer}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Cancelar"
                  testID="sheet-cancel-button"
                  hitSlop={touch.hitSlop}
                  onPress={onClose}
                  style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
                >
                  <Text style={styles.cancelText}>Cancelar</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Guardar tarea"
                  testID="sheet-submit-button"
                  disabled={busy}
                  hitSlop={touch.hitSlop}
                  onPress={() => void handleSubmit()}
                  style={({ pressed }) => [styles.submitButton, busy && styles.disabled, pressed && styles.pressed]}
                >
                  {busy ? (
                    <ActivityIndicator color={colors.onPrimary} size="small" />
                  ) : (
                    <Text style={styles.submitText}>Guardar tarea</Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 30, 40, 0.55)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  sheet: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: space.xl,
    ...Platform.select({
      web: { marginBottom: 0, borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl, margin: space.lg },
    }),
  },
  scroll: { paddingHorizontal: space.xl, paddingTop: space.sm },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderSoft,
    alignSelf: 'center',
    marginBottom: space.lg,
    marginTop: space.sm,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.xl },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconText: { color: colors.onPrimary, fontSize: 24, fontWeight: '800', lineHeight: 26 },
  headerText: { flex: 1 },
  sheetTitle: { color: colors.foreground, fontSize: 18, fontWeight: '800' },
  sheetSubtitle: { color: colors.textSubtle, fontSize: 12, marginTop: 2 },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { color: colors.textMuted, fontSize: 16, fontWeight: '800' },
  fieldLabel: { ...typeTokens.eyebrow, color: colors.foreground, marginBottom: space.sm },
  fieldSpaced: { marginTop: space.lg },
  required: { color: colors.destructive },
  optional: { color: colors.textSubtle, fontWeight: '600', letterSpacing: 0, textTransform: 'none' },
  input: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    fontSize: 14,
    color: colors.text,
    minHeight: touch.minTarget,
  },
  inputError: { borderColor: colors.destructive, backgroundColor: colors.destructiveSoft },
  fieldError: { color: colors.destructive, fontSize: 12, marginTop: space.xs, fontWeight: '600' },
  textarea: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    fontSize: 14,
    color: colors.text,
    minHeight: 88,
    lineHeight: 20,
  },
  priorityRow: { flexDirection: 'row', gap: space.sm },
  priorityCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.md,
    borderRadius: radius.md,
    borderWidth: 2,
    backgroundColor: colors.surface,
    minHeight: 76,
  },
  priorityEmoji: { fontSize: 18, fontWeight: '800' },
  priorityLabel: { color: colors.textMuted, fontWeight: '800', fontSize: 13, marginTop: 4 },
  priorityHint: { color: colors.textSubtle, fontSize: 10, marginTop: 2 },
  footer: { flexDirection: 'row', gap: space.sm, marginTop: space.xxl },
  cancelButton: {
    flex: 1,
    minHeight: touch.minTarget,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { color: colors.textMuted, fontWeight: '800', fontSize: 13 },
  submitButton: {
    flex: 2,
    minHeight: touch.minTarget,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: { color: colors.onPrimary, fontWeight: '800', fontSize: 13 },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.6 },
});
