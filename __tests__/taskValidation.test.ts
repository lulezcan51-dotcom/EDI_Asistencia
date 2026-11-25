import { isValidTaskDescription, isValidTaskTitle, MAX_TITLE_BYTES } from '../src/utils/taskValidation';

describe('isValidTaskTitle', () => {
  it('rechaza un título vacío', () => {
    expect(isValidTaskTitle('')).toBe(false);
  });
  it('rechaza un título compuesto solo de espacios', () => {
    expect(isValidTaskTitle('   ')).toBe(false);
  });
  it('acepta un título que contiene palabras', () => {
    expect(isValidTaskTitle('  Preparar la entrega  ')).toBe(true);
  });
  it('mide bytes UTF-8, no caracteres', () => {
    expect(isValidTaskTitle('á'.repeat(MAX_TITLE_BYTES / 2 + 1))).toBe(false);
    expect(isValidTaskTitle('a'.repeat(MAX_TITLE_BYTES))).toBe(true);
  });
});

describe('isValidTaskDescription', () => {
  it('acepta una descripción vacía', () => {
    expect(isValidTaskDescription('')).toBe(true);
  });
  it('rechaza más de 10000 bytes UTF-8', () => {
    expect(isValidTaskDescription('🙂'.repeat(2501))).toBe(false);
  });
});
