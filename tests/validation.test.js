import { describe, expect, it } from 'vitest';
import {
  validateEmail,
  validateExercise,
  validateGoal,
  validateLogin,
  validatePassword,
  validateRegistration,
  validateWorkoutSet
} from '../src/js/validation.js';

describe('validateEmail', () => {
  it('приема валиден имейл', () => {
    expect(validateEmail('ivan@example.com')).toBeNull();
  });

  it('отхвърля празен имейл', () => {
    expect(validateEmail('   ')).toBe('Въведете имейл.');
  });

  it('отхвърля имейл без домейн', () => {
    expect(validateEmail('ivan@')).not.toBeNull();
  });
});

describe('validatePassword', () => {
  it('изисква поне 8 символа', () => {
    expect(validatePassword('abc12')).toMatch('8 символа');
  });

  it('изисква буква и цифра', () => {
    expect(validatePassword('abcdefgh')).not.toBeNull();
    expect(validatePassword('12345678')).not.toBeNull();
  });

  it('приема парола с кирилица и цифра', () => {
    expect(validatePassword('трениров1')).toBeNull();
  });
});

describe('validateLogin', () => {
  it('връща грешки за празни полета', () => {
    const { valid, errors } = validateLogin({ email: '', password: '' });
    expect(valid).toBe(false);
    expect(Object.keys(errors)).toEqual(['email', 'password']);
  });
});

describe('validateRegistration', () => {
  const base = { displayName: 'Иван', email: 'ivan@example.com', password: 'sport2026', confirmPassword: 'sport2026' };

  it('приема коректни данни', () => {
    expect(validateRegistration(base).valid).toBe(true);
  });

  it('открива несъвпадащи пароли', () => {
    const { errors } = validateRegistration({ ...base, confirmPassword: 'sport2027' });
    expect(errors.confirmPassword).toBe('Паролите не съвпадат.');
  });

  it('отхвърля твърде кратко име', () => {
    const { errors } = validateRegistration({ ...base, displayName: ' И ' });
    expect(errors.displayName).toBeDefined();
  });
});

describe('validateExercise', () => {
  it('приема име и позната категория', () => {
    expect(validateExercise({ name: 'Клек', category: 'strength' }).valid).toBe(true);
  });

  it('отхвърля непозната категория', () => {
    expect(validateExercise({ name: 'Клек', category: 'magic' }).errors.category).toBeDefined();
  });

  it('отхвърля име над 60 символа', () => {
    expect(validateExercise({ name: 'а'.repeat(61), category: 'cardio' }).errors.name).toBeDefined();
  });
});

describe('validateWorkoutSet', () => {
  it('изисква повторения или продължителност', () => {
    expect(validateWorkoutSet({}).errors.repetitions).toBeDefined();
  });

  it('приема серия само с продължителност', () => {
    expect(validateWorkoutSet({ durationMinutes: '20' }).valid).toBe(true);
  });

  it('отхвърля отрицателна тежест и дробни повторения', () => {
    const { errors } = validateWorkoutSet({ repetitions: '8.5', weightKg: '-5' });
    expect(errors.repetitions).toBe('Въведете цяло число.');
    expect(errors.weightKg).toMatch('поне 0');
  });
});

describe('validateGoal', () => {
  const today = new Date(2026, 10, 12);

  it('приема коректна цел', () => {
    expect(validateGoal({ title: '3 тренировки', targetValue: '3', unit: 'бр.', dueDate: '2026-12-01' }, today).valid).toBe(true);
  });

  it('отхвърля нулева целева стойност', () => {
    expect(validateGoal({ title: 'Цел', targetValue: '0', unit: 'kg' }, today).errors.targetValue).toBeDefined();
  });

  it('отхвърля срок в миналото', () => {
    expect(validateGoal({ title: 'Цел', targetValue: '5', unit: 'km', dueDate: '2026-11-01' }, today).errors.dueDate).toBeDefined();
  });

  it('приема срок днес', () => {
    expect(validateGoal({ title: 'Цел', targetValue: '5', unit: 'km', dueDate: '2026-11-12' }, today).valid).toBe(true);
  });
});
