export const formatSeconds = totalSeconds => {
    let seconds = String(totalSeconds % 60);
    let minutes = String(Math.floor(totalSeconds / 60));

    if(seconds.length === 1) {
        seconds = '0' + seconds;
    }

    if(minutes.length === 1) {
        minutes = '0' + minutes;
    }

    return minutes + ':' + seconds;
};