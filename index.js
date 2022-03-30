'use strict';

/*
Flow
1. Input time in HH:MM:SS format
2. Convert time to seconds (Tsec)
3. Reduce the required time from Tsec
4. Convert the remaining seconds back to HH:MM:SS


## Sample Input
02:30 - Section 1
05:35 - Section 2
07:53 - Section 3
10:25 - Section 4
(15:24) Section 5
(20:22) - Section 6
(45:51): Section 7


RegEx
\d{0,2}:{0,1}\d{1,2}:\d{1,2}



// const times = [
//   '03:30',
//   '09:34',
//   '14:53',
//   '17:32',
//   '20:55',
//   '24:07',
//   '27:48',
//   '29:10',
//   '33:36',
//   '38:57',
//   '42:44',
//   '46:44',
//   '50:23',
//   '01:00:57',
//   '01:02:01',
//   '01:05:16',
//   '01:11:18',
//   '01:13:27',
//   '01:17:25',
// ];

*/

const inputTextEl = document.getElementById('input-text');
const timeAdjustEl = document.getElementById('time-to-adjust');
const outputTextEl = document.getElementById('output-text');
const buttonEl = document.getElementById('btn-adjust');

const loadSampleInput = function () {
  inputTextEl.value = `01:10 - Section 0
02:30 - Section 1
05:35 - Section 2
07:53 - Section 3
##HEADING CHANGE
10:25 - Section 4
(15:24) Section 5
(20:22) - Section 6
Section 7`;

  timeAdjustEl.value = '2:08';
};

const timeToSeconds = (time) => {
  //convert the HH:MM:SS time string to seconds
  const [HH, MM, SS] = time
    .split(':') // extract HH, MM and SS from the time string
    .reverse()
    .reduce(
      (acc, cur, i) => {
        acc[2 - i] = Number(cur);
        return acc;
      },
      [0, 0, 0]
    );
  return HH * 3600 + MM * 60 + SS;
};

const secondsToTime = (sec) => {
  let hours = Math.floor(sec / 3600); // get hours
  let minutes = Math.floor((sec - hours * 3600) / 60); // get minutes
  let seconds = sec - hours * 3600 - minutes * 60; //  get seconds

  [hours, minutes, seconds] = [hours, minutes, seconds].map(
    (time) => (time < 10 ? '0' + time : '' + time) //Add 0 at the start if time is less than 10
  );

  return hours === '00'
    ? minutes + ':' + seconds //Return MM:SS if HH is 00
    : hours + ':' + minutes + ':' + seconds; // Return in HH:MM:SS
};

const reduceTime = function (text, timeToSubtract) {
  const timestamps = text
    .split('\n')
    .map((line) => (line.match(/\d{0,2}:{0,1}\d{1,2}:\d{1,2}/) || [])[0]);

  return timestamps.reduce((arr, time) => {
    if (time) {
      const TTS = timeToSeconds(time);
      const STT =
        TTS < timeToSubtract ? 'XX:XX' : secondsToTime(TTS - timeToSubtract);
      arr.push({ old: time, new: STT });
    } else arr.push(null);
    return arr;
  }, []);
};

const modifyText = function (text, timestamps) {
  return text
    .split('\n')
    .map((line, i) => {
      if (timestamps[i])
        return line.replace(timestamps[i].old, timestamps[i].new);
      else return line;
    })
    .join('\n');
};

buttonEl.addEventListener('click', function (e) {
  e.preventDefault();
  const inputText = inputTextEl.value;
  const timeToSubtract = timeToSeconds(timeAdjustEl.value);
  const newTimestamps = reduceTime(inputText, timeToSubtract);
  const newText = modifyText(inputText, newTimestamps);
  outputTextEl.value = newText;
});

loadSampleInput();
