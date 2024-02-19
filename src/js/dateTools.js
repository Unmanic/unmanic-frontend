import { date } from 'quasar';

export default {
  printSecondsAsDuration(timestamp) {
    timestamp = Number(timestamp);

    const days = Math.floor(timestamp / 3600 / 24);
    const hours = Math.floor((timestamp / 3600) % 24);
    const minutes = Math.floor((timestamp % 3600) / 60);
    const seconds = Math.floor((timestamp % 3600) % 60);

    const dDisplay = days > 0 ? days + (days == 1 ? " day, " : " days, ") : "";
    const hDisplay = hours > 0 ? hours + (hours == 1 ? " hour, " : " hours, ") : "";
    const mDisplay = minutes > 0 ? minutes + (minutes == 1 ? " minute, " : " minutes, ") : "";
    const sDisplay = seconds > 0 ? seconds + (seconds == 1 ? " second" : " seconds") : "";

    let duration = dDisplay + hDisplay + mDisplay + sDisplay;

    return duration.replace(/, $/, '');
  },
  printDateTimeString(dateTime) {
    let d = new Date(0);
    d.setUTCSeconds(dateTime);
    return date.formatDate(d, 'YYYY-MM-DD HH:mm:ss')
  }
}
