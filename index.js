'use strict';

/*
Flow
1. Input time in HH:MM:SS format
2. Convert time to seconds (Tsec)
3. Reduce the required time from Tsec
4. Convert the remaining seconds back to HH:MM:SS
*/

const inputTextEl = document.getElementById('input-text');
const timeAdjustEl = document.getElementById('time-to-adjust');
const outputTextEl = document.getElementById('output-text');
const buttonEl = document.getElementById('btn-adjust');
const adjEls = document.querySelectorAll('.adj-icon');
const copyToClipEl = document.getElementById('copy-icon');
const invalidTimeEl = document.getElementById('invalid-input-time');

let adjType = 'subtract';

const loadSampleInput = function () {
  inputTextEl.value = `(00:00) Introduction
(02:50) “Crossing: A Memoir” quotes: Boyhood
(09:49) Early life and sexuality
(14:29) Gender transition conversations with her ex-wife
(16:53) Concealing her female interests from her ex-wife
(17:44) The challenges in being sexually different from the majority in the 50s and 60s
(20:23) The transition from sexual arousal to needing a physical reset
(21:31) Gender transition after over a decade of marriage
(23:09) Early days as a male
(25:45) The resistance towards gender change
(28:10) Praying to be a woman`;

  timeAdjustEl.value = '2:28';
};

const timeToSeconds = (time) => {
  //convert the HH:MM:SS time string to seconds

  if (!time) return null;

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
  if (HH > 23 || MM > 59 || SS > 59) return null; //Return 0 if timestamp is invalid

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

const adjustTime = function (text, timeToAdjust, adjType = 'subtract') {
  const timestamps = text
    .split('\n')
    .map((line) => (line.match(/\d{0,2}:{0,1}\d{1,2}:\d{1,2}/) || [null])[0]); //Extract the timestamps present from each line with regex. Return null if no timestamp is present in a given line

  return timestamps.reduce((arr, time) => {
    if (time) {
      //Run time conversion only if a line has a timestamp
      const origTimeInSeconds = timeToSeconds(time);

      if (!origTimeInSeconds && origTimeInSeconds !== 0)
        arr.push({
          old: time,
          new: 'XX:XX',
        });
      //If timestamp in input document is invalid, timestamp in output will be XX:XX
      else {
        let adjustedTime;
        if (adjType === 'add')
          adjustedTime = secondsToTime(origTimeInSeconds + timeToAdjust);
        else
          adjustedTime =
            origTimeInSeconds < timeToAdjust
              ? 'XX:XX'
              : secondsToTime(origTimeInSeconds - timeToAdjust);

        arr.push({ old: time, new: adjustedTime }); //push an object that containts old and new timestamps
      }
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
      //Replace old timestamps with new timestamp and return the line
      else return line; //Return the line as is if no timestamps are present in it
    })
    .join('\n');
};

const copyToClipboard = function (copyText) {
  console.log(copyText);
  if (copyText)
    navigator.clipboard.writeText(copyText).then(() => {
      alert('Copied to clipboard');
    });
};

const displayError = function (state) {
  if (state) {
    timeAdjustEl.classList.remove('--input-valid');
    timeAdjustEl.classList.add('--input-invalid');
    invalidTimeEl.classList.remove('hidden');
    timeAdjustEl.focus();
  } else {
    timeAdjustEl.classList.add('--input-valid');
    timeAdjustEl.classList.remove('--input-invalid');
    invalidTimeEl.classList.add('hidden');
  }
};

// ########################################
//         CONTROL BOX CODE
// ########################################

function deselectButtons() {
  adjEls.forEach((adjBtn) => {
    adjBtn.classList.remove('--select');
    adjBtn.classList.add('--deselect');
  });
}

adjEls.forEach((adjBtn, i, arr) => {
  adjBtn.addEventListener('click', function (e) {
    deselectButtons();

    if (adjBtn.id === 'adj-icon--0') adjType = 'add';
    else adjType = 'subtract';

    adjBtn.classList.remove('--deselect');
    adjBtn.classList.add('--select');
  });
});

// #######################################
//           EVENT LISTENERS
// #######################################

copyToClipEl.addEventListener('click', function (e) {
  e.preventDefault();
  const copyContent = document.getElementById('output-text').value;
  const clipboardContent = copyContent
    .slice(copyContent.indexOf('\n'))
    .trimStart();
  copyToClipboard(clipboardContent);
});

buttonEl.addEventListener('click', function (e) {
  e.preventDefault();
  const inputText = inputTextEl.value;
  const timeToAdjust = timeToSeconds(timeAdjustEl.value);

  if (timeToAdjust) {
    displayError(false);
    const newTimestamps = adjustTime(inputText, timeToAdjust, adjType);
    const newText = modifyText(inputText, newTimestamps);
    outputTextEl.value =
      `/* ${secondsToTime(timeToAdjust)} has been ${adjType}ed */\n\n` +
      newText;
  } else {
    displayError(true);
    // alert('Please check if the adjusment time is correct');
    outputTextEl.value = '';
  }
});

// ######################################
loadSampleInput();
deselectButtons();
