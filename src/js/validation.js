const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const CATEGORIES = ['strength', 'cardio', 'flexibility', 'other'];

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
    return 'Въведете число.';
  }
  if (integer && !Number.isInteger(number)) {
    return 'Въведете цяло число.';
  }
  if (number < min) {
    return `Стойността трябва да е поне ${min}.`;
  }
  if (number > max) {
    return `Стойността трябва да е най-много ${max}.`;
  }
  return null;
}

export function validateEmail(email) {
  if (isBlank(email)) {
    return 'Въведете имейл.';
  }
  if (!EMAIL_PATTERN.test(String(email).trim())) {
    return 'Имейлът не е във валиден формат.';
  }
  return null;
}

export function validatePassword(password) {
  const value = String(password ?? '');
  if (value.length === 0) {
    return 'Въведете парола.';
  }
  if (value.length < 8) {
    return 'Паролата трябва да е поне 8 символа.';
  }
  if (!/[A-Za-zА-Яа-я]/.test(value) || !/\d/.test(value)) {
    return 'Паролата трябва да съдържа поне една буква и една цифра.';
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
    errors.password = 'Въведете парола.';
  }
  return result(errors);
}

export function validateRegistration({ displayName, email, password, confirmPassword }) {
  const errors = {};
  const nameLength = textLength(displayName);
  if (nameLength < 2 || nameLength > 50) {
    errors.displayName = 'Името трябва да е между 2 и 50 символа.';
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
    errors.confirmPassword = 'Паролите не съвпадат.';
  }
  return result(errors);
}

export function validateExercise({ name, category }) {
  const errors = {};
  const nameLength = textLength(name);
  if (nameLength < 2 || nameLength > 60) {
    errors.name = 'Името трябва да е между 2 и 60 символа.';
  }
  if (!CATEGORIES.includes(category)) {
    errors.category = 'Изберете категория.';
  }
  return result(errors);
}

export function validateWorkoutSet({ repetitions, weightKg, durationMinutes }) {
  const errors = {};
  const hasReps = !isBlank(repetitions);
  const hasDuration = !isBlank(durationMinutes);
  if (!hasReps && !hasDuration) {
    errors.repetitions = 'Въведете повторения или продължителност.';
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
    errors.title = 'Заглавието трябва да е между 2 и 80 символа.';
  }
  if (isBlank(targetValue)) {
    errors.targetValue = 'Въведете целева стойност.';
  } else {
    const targetError = checkNumber(targetValue, { min: 0.01, max: 100000 });
    if (targetError) {
      errors.targetValue = targetError;
    }
  }
  const unitLength = textLength(unit);
  if (unitLength < 1 || unitLength > 20) {
    errors.unit = 'Въведете мерна единица (до 20 символа).';
  }
  if (!isBlank(dueDate)) {
    const due = new Date(`${dueDate}T23:59:59`);
    if (Number.isNaN(due.getTime())) {
      errors.dueDate = 'Невалидна дата.';
    } else if (due < today) {
      errors.dueDate = 'Крайният срок не може да е в миналото.';
    }
  }
  return result(errors);
}
