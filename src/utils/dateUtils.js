export const getISOWeekString = (dateObj) => {
  if (!dateObj) return '';
  const date = new Date(dateObj.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  const weekNumber = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  return `${date.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
};

export const parseDDMMYYYY = (dateStr) => {
  if (!dateStr) return new Date();
  const parts = dateStr.split('-');
  if (parts.length !== 3) return new Date();
  const [day, month, year] = parts;
  return new Date(year, month - 1, day);
};

export const getTuesdayWeekDetails = (dateString) => {
  const dateObj = dateString ? new Date(dateString) : new Date();
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  
  // Find preceding Tuesday
  let prevTuesday = new Date(dateObj);
  // getDay() -> 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
  const dayOfWeek = prevTuesday.getDay();
  // distance to previous Tuesday
  const diff = dayOfWeek >= 2 ? dayOfWeek - 2 : dayOfWeek + 5;
  prevTuesday.setDate(prevTuesday.getDate() - diff);
  
  const tuesdayWeekStartDate = `${prevTuesday.getFullYear()}-${String(prevTuesday.getMonth() + 1).padStart(2, '0')}-${String(prevTuesday.getDate()).padStart(2, '0')}`;
  
  // Calculate week number (1 to 52) based on the tuesday week start date for consistency
  const startOfYear = new Date(year, 0, 1);
  const diffTime = prevTuesday - startOfYear;
  const weekNumber = Math.ceil((diffTime / (1000 * 60 * 60 * 24) + startOfYear.getDay() + 1) / 7);

  return {
    tuesdayWeekStartDate,
    weekNumber,
    month,
    year
  };
};
