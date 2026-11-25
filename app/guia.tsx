import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, space, touch } from '../src/theme/tokens';
import { type } from '../src/theme/typography';
import { Icon } from '../src/components/ui/Icon';

const missions = [
  'Reproducir los errores antes de cambiar el código.',
  'Examinar las variables con DevTools, consola o breakpoints.',
  'Corregir al menos cuatro incidencias con cambios mínimos.',
  'Ejecutar pruebas automatizadas y explicar sus resultados.',
  'Documentar causa raíz, corrección y prueba de regresión.',
  'Crear un commit con los cambios y defender las decisiones.',
];

export default function GuiaScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver al gestor"
          hitSlop={touch.hitSlop}
          onPress={() => router.back()}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
        >
          <Icon name="arrowLeft" size={17} color={colors.ink} />
          <Text style={styles.backText}>Volver</Text>
        </Pressable>

        <Text style={type.eyebrow}>Guía de trabajo</Text>
        <Text style={styles.display}>Investigar antes de corregir</Text>
        <Text style={styles.intro}>
          No se trata de encontrar el código correcto en Internet, sino de demostrar
          cómo se detecta una falla, cómo se explica y cómo se evita que reaparezca.
        </Text>

        <View style={styles.callout}>
          <Text style={styles.calloutLabel}>Misión de la clase</Text>
          <Text style={styles.calloutText}>Corregir al menos cuatro fallos y entregar un informe técnico verificable.</Text>
        </View>

        {missions.map((mission, index) => (
          <View key={mission} style={styles.mission}>
            <Text style={styles.number}>{String(index + 1).padStart(2, '0')}</Text>
            <Text style={styles.missionText}>{mission}</Text>
          </View>
        ))}

        <Text style={styles.note}>Usá la plantilla INFORME_INCIDENTES.md del proyecto para registrar las evidencias.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 48 },
  back: { flexDirection: 'row', alignItems: 'center', gap: space.sm, alignSelf: 'flex-start', paddingVertical: space.sm, marginBottom: space.xl },
  backText: { ...type.meta, color: colors.ink },
  pressed: { opacity: 0.6 },
  display: { ...type.display, color: colors.ink, marginTop: space.md },
  intro: { ...type.body, color: colors.muted, marginTop: space.lg, marginBottom: space.xl, maxWidth: 520 },
  callout: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.line, paddingVertical: space.lg, marginBottom: space.xl },
  calloutLabel: { ...type.eyebrow },
  calloutText: { ...type.title, color: colors.ink, marginTop: space.sm },
  mission: { flexDirection: 'row', gap: space.lg, backgroundColor: colors.surface, padding: space.lg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, marginBottom: space.sm },
  number: { ...type.mono, color: colors.muted },
  missionText: { ...type.body, flex: 1, color: colors.inkSoft },
  note: { ...type.body, color: colors.muted, marginTop: space.xxl, fontStyle: 'italic' },
});
