import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export const formatDate = (date) => dayjs(date).format('DD MMM YYYY');
export const formatShortDate = (date) => dayjs(date).format('DD MMM');
export const formatFull = (date) => dayjs(date).format('DD MMM YYYY, hh:mm A');
export const today = () => dayjs().startOf('day');
export const now = () => dayjs();

export const getDateRange = (filter, customStart, customEnd) => {
  const end = dayjs().endOf('day');
  switch (filter) {
    case 'today':
      return { start: dayjs().startOf('day'), end };
    case 'yesterday':
      return { start: dayjs().subtract(1, 'day').startOf('day'), end: dayjs().subtract(1, 'day').endOf('day') };
    case '7days':
      return { start: dayjs().subtract(6, 'day').startOf('day'), end };
    case 'month':
      return { start: dayjs().subtract(1, 'month').startOf('day'), end };
    case '6months':
      return { start: dayjs().subtract(6, 'month').startOf('day'), end };
    case 'custom':
      return {
        start: dayjs(customStart).startOf('day'),
        end: dayjs(customEnd).endOf('day'),
      };
    default:
      return { start: dayjs().subtract(6, 'day').startOf('day'), end };
  }
};

export const isInRange = (date, start, end) => {
  const d = dayjs(date);
  return d.isSameOrAfter(start) && d.isSameOrBefore(end);
};

export const getLast7DayLabels = () => {
  return Array.from({ length: 7 }, (_, i) =>
    dayjs().subtract(6 - i, 'day').format('ddd')
  );
};

export const getLast7DayValues = (entries, field = 'amount') => {
  return Array.from({ length: 7 }, (_, i) => {
    const day = dayjs().subtract(6 - i, 'day');
    return entries
      .filter((e) => dayjs(e.date).isSame(day, 'day'))
      .reduce((sum, e) => sum + (parseFloat(e[field]) || 0), 0);
  });
};

export const isSameOrAfterDate = (date, ref) => dayjs(date).isSameOrAfter(ref);
export const isSameOrBeforeDate = (date, ref) => dayjs(date).isSameOrBefore(ref);
