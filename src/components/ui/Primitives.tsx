import { Animated, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, space, touch } from '../../theme/tokens';
import { type } from '../../theme/typography';
import { usePress, useReduceMotion } from '../../theme/motion';
import { Icon, type IconName } from './Icon';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'quiet';
  icon?: IconName;
  disabled?: boolean;
  testID?: string;
  flex?: boolean;
};

export function Button({ label, onPress, variant = 'primary', icon, disabled, testID, flex }: ButtonProps) {
  const reduce = useReduceMotion();
  const press = usePress(reduce);
  return (
    <Animated.View style={[{ flex: flex ? 1 : undefined }, { transform: [{ scale: press.scale }] }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        testID={testID}
        disabled={disabled}
        hitSlop={touch.hitSlop}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          variant === 'primary' && styles.primary,
          variant === 'ghost' && styles.ghost,
          variant === 'quiet' && styles.quiet,
          disabled && styles.disabled,
          pressed && styles.pressed,
        ]}
      >
        {icon ? <Icon name={icon} size={16} color={variant === 'primary' ? colors.onAccent : colors.ink} /> : null}
        <Text style={[styles.buttonText, variant === 'primary' && styles.primaryText]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

type IconButtonProps = {
  name: IconName;
  label: string;
  onPress: () => void;
  testID?: string;
  disabled?: boolean;
  active?: boolean;
};

export function IconButton({ name, label, onPress, testID, disabled, active }: IconButtonProps) {
  const reduce = useReduceMotion();
  const press = usePress(reduce);
  return (
    <Animated.View style={{ transform: [{ scale: press.scale }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected: active }}
        testID={testID}
        disabled={disabled}
        hitSlop={touch.hitSlop}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        onPress={onPress}
        style={({ pressed }) => [styles.iconButton, active && styles.iconButtonActive, pressed && styles.pressed]}
      >
        <Icon name={name} size={18} color={active ? colors.onAccent : colors.inkSoft} />
      </Pressable>
    </Animated.View>
  );
}

type TextFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  label: string;
  testID?: string;
  multiline?: boolean;
  editable?: boolean;
  onSubmitEditing?: () => void;
  leading?: IconName;
};

export function TextField({
  value, onChangeText, placeholder, label, testID, multiline, editable = true, onSubmitEditing, leading,
}: TextFieldProps) {
  return (
    <View style={[styles.field, multiline && styles.fieldMultiline]}>
      {leading ? <View style={styles.leading}><Icon name={leading} size={17} color={colors.muted} /></View> : null}
      <TextInput
        testID={testID}
        accessibilityLabel={label}
        placeholder={placeholder}
        placeholderTextColor={colors.faint}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        multiline={multiline}
        onSubmitEditing={onSubmitEditing}
        returnKeyType="done"
        style={[styles.input, multiline && styles.inputMultiline, leading && styles.inputWithLeading]}
      />
    </View>
  );
}

type BadgeTone = 'high' | 'mid' | 'low' | 'neutral' | 'done';

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: BadgeTone }) {
  return (
    <View style={[styles.badge, tone === 'high' && styles.badgeHigh, tone === 'mid' && styles.badgeMid, tone === 'low' && styles.badgeLow, tone === 'done' && styles.badgeDone]}>
      <Text style={[styles.badgeText, tone === 'high' && styles.badgeTextHigh, tone === 'mid' && styles.badgeTextMid, tone === 'low' && styles.badgeTextLow, tone === 'done' && styles.badgeTextDone]}>
        {label}
      </Text>
    </View>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  button: {
    minHeight: touch.minTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    paddingHorizontal: space.lg,
    borderRadius: radius.sm,
  },
  primary: { backgroundColor: colors.ink },
  ghost: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.lineStrong },
  quiet: { backgroundColor: 'transparent', paddingHorizontal: space.sm },
  buttonText: { ...type.meta, color: colors.ink, fontSize: 12, fontWeight: '600' },
  primaryText: { color: colors.onAccent },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.8 },
  iconButton: {
    width: 34, height: 34, borderRadius: radius.sm,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.line,
  },
  iconButtonActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  field: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: touch.minTarget,
  },
  fieldMultiline: { alignItems: 'flex-start', paddingVertical: space.md },
  leading: { paddingLeft: space.md },
  input: {
    flex: 1, color: colors.ink, fontSize: 14, fontFamily: 'Outfit',
    paddingHorizontal: space.md, paddingVertical: space.md, minWidth: 0,
  },
  inputWithLeading: { paddingLeft: space.sm },
  inputMultiline: { minHeight: 84, textAlignVertical: 'top', lineHeight: 21 },
  badge: { paddingHorizontal: space.sm, paddingVertical: 3, borderRadius: 999 },
  badgeText: { ...type.meta, fontSize: 9, fontWeight: '600', letterSpacing: 0.8 },
  badgeHigh: { backgroundColor: colors.highBg },
  badgeMid: { backgroundColor: colors.midBg },
  badgeLow: { backgroundColor: colors.lowBg },
  badgeDone: { backgroundColor: colors.ink },
  badgeTextHigh: { color: colors.highFg },
  badgeTextMid: { color: colors.midFg },
  badgeTextLow: { color: colors.lowFg },
  badgeTextDone: { color: colors.onAccent },
  divider: { height: 1, backgroundColor: colors.line },
});
