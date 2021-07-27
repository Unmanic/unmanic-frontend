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
  printTimeAsHoursMinsSeconds(timestamp) {
    timestamp = Number(timestamp);
    let hours = Math.floor(timestamp / 3600);
    let minutes = Math.floor(timestamp % 3600 / 60);
    let seconds = Math.floor(timestamp % 3600 % 60);

    let hDisplay = hours > 0 ? hours + (hours == 1 ? " hour, " : " hours, ") : "";
    let mDisplay = minutes > 0 ? minutes + (minutes == 1 ? " minute, " : " minutes, ") : "";
    let sDisplay = seconds > 0 ? seconds + (seconds == 1 ? " second" : " seconds") : "";
    return hDisplay + mDisplay + sDisplay;
  },
  printDateTimeString(dateTime) {
    let d = new Date(0);
    d.setUTCSeconds(dateTime);
    return date.formatDate(d, 'YYYY-MM-DD HH:mm:ss')
  }
}
