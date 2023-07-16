export const formatSeconds = totalSeconds => {
    let seconds = String(Math.floor(totalSeconds % 60));
    let minutes = String(Math.floor(totalSeconds / 60));

    if(seconds.length === 1) {
        seconds = '0' + seconds;
    }

    if(minutes.length === 1) {
        minutes = '0' + minutes;
    }

    return minutes + ':' + seconds;
};

export const formatDateToHoursAndMinutes = date => {
    let hours = date.getHours().toString();
    let minutes = date.getMinutes().toString();

    if(hours.length === 1) {
        hours = '0' + hours;
    }
    if(minutes.length === 1) {
        minutes = '0' + minutes;
    }

    return hours + ':' + minutes;
};