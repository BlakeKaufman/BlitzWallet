function isMoreThan7DaysPast(date) {
  // Get today's date and set time to midnight for accurate comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Set the time of the input date to midnight for accurate comparison
  const inputDate = new Date(date);
  inputDate.setHours(0, 0, 0, 0);

  // Calculate the difference in time between today and the input date
  const timeDifference = today - inputDate;

  // Convert the time difference from milliseconds to days
  const daysDifference = timeDifference / (1000 * 60 * 60 * 24);

  // Return true if the difference is greater than 7 days

  return Math.abs(daysDifference) > 7;
}

function getCurrentDateFormatted() {
  const today = new Date();

  const year = today.getFullYear();

  // getMonth() returns the month index (0 for January, 11 for December)
  const month = String(today.getMonth() + 1).padStart(2, '0');

  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function isMoreThanADayOld(date) {
  // Get today's date and set time to midnight for accurate comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Set the time of the input date to midnight for accurate comparison
  const inputDate = new Date(date);
  inputDate.setHours(0, 0, 0, 0);

  // Calculate the difference in time between today and the input date
  const timeDifference = today - inputDate;

  // Convert the time difference from milliseconds to days
  const daysDifference = timeDifference / (1000 * 60 * 60 * 24);

  // Return true if the difference is greater than 1 days

  return Math.abs(daysDifference) > 1;
}
function isMoreThan21Days(date) {
  try {
    // Get today's date and set time to midnight for accurate comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Set the time of the input date to midnight for accurate comparison
    const inputDate = new Date(date);
    inputDate.setHours(0, 0, 0, 0);

    // Calculate the difference in time between today and the input date
    const timeDifference = today - inputDate;

    // Convert the time difference from milliseconds to days
    const daysDifference = timeDifference / (1000 * 60 * 60 * 24);

    // Return true if the difference is greater than 7 days

    if (isNaN(daysDifference)) {
      return true;
    }

    return Math.abs(daysDifference) > 21;
  } catch (err) {
    return true;
  }
}
function isMoreThan40MinOld(date) {
  try {
    const oneHour = 60 * 40 * 1000; // 1 hour in ms
    const now = new Date().getTime(); // current time in ms
    const diff = now - new Date(date).getTime(); // diff in ms
    return diff > oneHour;
  } catch (err) {
    return true;
  }
}

export {
  isMoreThan7DaysPast,
  getCurrentDateFormatted,
  isMoreThanADayOld,
  isMoreThan21Days,
  isMoreThan40MinOld,
};
