import { date } from 'quasar';

export default {
  printTimeSinceDate(startDate) {
    let date_now = new Date();

    let seconds = Math.floor((date_now - (startDate)) / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    let days = Math.floor(hours / 24);

    hours = hours - (days * 24);
    minutes = minutes - (days * 24 * 60) - (hours * 60);
    seconds = seconds - (days * 24 * 60 * 60) - (hours * 60 * 60) - (minutes * 60);

    return "Days: " + days + " Hours: " + hours + " Minutes: " + minutes + " Seconds: " + seconds;
  },
  printDateTimeString(dateTime) {
    let d = new Date(0);
    d.setUTCSeconds(dateTime);
    return date.formatDate(d, 'YYYY-MM-DD HH:mm:ss')
  }
}
