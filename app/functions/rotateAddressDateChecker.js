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

export {isMoreThan7DaysPast, getCurrentDateFormatted};
