const AUTH_MESSAGES = [
  ['invalid login credentials', 'Грешен имейл или парола.'],
  ['email not confirmed', 'Имейлът не е потвърден. Проверете пощата си за линк за потвърждение.'],
  ['user already registered', 'Вече има профил с този имейл. Опитайте да влезете.'],
  ['password should be at least', 'Паролата е твърде кратка.'],
  ['unable to validate email', 'Имейлът е невалиден.'],
  ['email address', 'Имейлът е невалиден или не се приема.'],
  ['rate limit', 'Твърде много опити. Изчакайте малко и опитайте отново.'],
  ['failed to fetch', 'Няма връзка със сървъра. Проверете интернет връзката си.'],
  ['network', 'Няма връзка със сървъра. Проверете интернет връзката си.']
];

const DB_MESSAGES = {
  '23505': 'Вече съществува запис с това име.',
  '23503': 'Записът се използва на друго място и не може да бъде изтрит.',
  '23514': 'Някоя от стойностите е извън позволените граници.',
  '23502': 'Липсва задължително поле.',
  '42501': 'Нямате права за това действие.',
  'PGRST301': 'Сесията е изтекла. Влезте отново.'
};

export function translateError(error) {
  if (!error) {
    return '';
  }
  if (error.code && DB_MESSAGES[error.code]) {
    return DB_MESSAGES[error.code];
  }
  const text = String(error.message ?? error).toLowerCase();
  const match = AUTH_MESSAGES.find(([needle]) => text.includes(needle));
  if (match) {
    return match[1];
  }
  return 'Възникна неочаквана грешка. Опитайте отново.';
}
