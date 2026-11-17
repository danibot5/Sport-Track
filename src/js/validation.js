import { t } from './i18n.js';
import { CATEGORIES } from './format.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function result(errors) {
  return { valid: Object.keys(errors).length === 0, errors };
}

function textLength(value) {
  return String(value ?? '').trim().length;
}

function isBlank(value) {
  return value === null || value === undefined || String(value).trim() === '';
}

function checkNumber(value, { min, max, integer = false }) {
  const number = Number(value);
  if (isBlank(value) || !Number.isFinite(number)) {
    return t('val.number');
  }
  if (integer && !Number.isInteger(number)) {
    return t('val.integer');
  }
  if (number < min) {
    return t('val.min', { n: min });
  }
  if (number > max) {
    return t('val.max', { n: max });
  }
  return null;
}

export function validateEmail(email) {
  if (isBlank(email)) {
    return t('val.emailRequired');
  }
  if (!EMAIL_PATTERN.test(String(email).trim())) {
    return t('val.emailInvalid');
  }
  return null;
}

export function validatePassword(password) {
  const value = String(password ?? '');
  if (value.length === 0) {
    return t('val.passwordRequired');
  }
  if (value.length < 8) {
    return t('val.passwordShort');
  }
  if (!/[A-Za-zА-Яа-я]/.test(value) || !/\d/.test(value)) {
    return t('val.passwordWeak');
  }
  return null;
}

export function validateLogin({ email, password }) {
  const errors = {};
  const emailError = validateEmail(email);
  if (emailError) {
    errors.email = emailError;
  }
  if (isBlank(password)) {
    errors.password = t('val.passwordRequired');
  }
  return result(errors);
}

export function validateRegistration({ displayName, email, password, confirmPassword }) {
  const errors = {};
  const nameLength = textLength(displayName);
  if (nameLength < 2 || nameLength > 50) {
    errors.displayName = t('val.displayName');
  }
  const emailError = validateEmail(email);
  if (emailError) {
    errors.email = emailError;
  }
  const passwordError = validatePassword(password);
  if (passwordError) {
    errors.password = passwordError;
  }
  if (!passwordError && password !== confirmPassword) {
    errors.confirmPassword = t('val.passwordMismatch');
  }
  return result(errors);
}

export function validateExercise({ name, category }) {
  const errors = {};
  const nameLength = textLength(name);
  if (nameLength < 2 || nameLength > 60) {
    errors.name = t('val.exerciseName');
  }
  if (!CATEGORIES.includes(category)) {
    errors.category = t('val.category');
  }
  return result(errors);
}

export function validateWorkoutSet({ repetitions, weightKg, durationMinutes }) {
  const errors = {};
  const hasReps = !isBlank(repetitions);
  const hasDuration = !isBlank(durationMinutes);
  if (!hasReps && !hasDuration) {
    errors.repetitions = t('val.repsOrDuration');
  }
  if (hasReps) {
    const error = checkNumber(repetitions, { min: 0, max: 1000, integer: true });
    if (error) {
      errors.repetitions = error;
    }
  }
  if (!isBlank(weightKg)) {
    const error = checkNumber(weightKg, { min: 0, max: 1000 });
    if (error) {
      errors.weightKg = error;
    }
  }
  if (hasDuration) {
    const error = checkNumber(durationMinutes, { min: 0, max: 600, integer: true });
    if (error) {
      errors.durationMinutes = error;
    }
  }
  return result(errors);
}

export function validateGoal({ title, targetValue, unit, dueDate }, today = new Date()) {
  const errors = {};
  const titleLength = textLength(title);
  if (titleLength < 2 || titleLength > 80) {
    errors.title = t('val.goalTitle');
  }
  if (isBlank(targetValue)) {
    errors.targetValue = t('val.targetRequired');
  } else {
    const targetError = checkNumber(targetValue, { min: 0.01, max: 100000 });
    if (targetError) {
      errors.targetValue = targetError;
    }
  }
  const unitLength = textLength(unit);
  if (unitLength < 1 || unitLength > 20) {
    errors.unit = t('val.unit');
  }
  if (!isBlank(dueDate)) {
    const due = new Date(`${dueDate}T23:59:59`);
    if (Number.isNaN(due.getTime())) {
      errors.dueDate = t('val.dateInvalid');
    } else if (due < today) {
      errors.dueDate = t('val.datePast');
    }
  }
  return result(errors);
}
