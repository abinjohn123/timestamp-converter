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



TODO
1. Add validation for input time in both document and control box (2:80 should not be valid))
1.a. Develop test cases for validating input -- DONE
1.b. Time adjustment should only run if control box input time is valid -- DONE
1.c. Instead of alert box, make the alert display under the adjustment time box and add visual cues

2. Add toggle to add / delete time from original timestamps -- Done

3. Stylize scrollbar for textareas

4. Add feature to highlight adjusted timestamps marked in XX:XX

5. Display time in the comment text of the output screen in proper HH:MM:SS format
*/

const inputTextEl = document.getElementById('input-text');
const outputTextEl = document.getElementById('output-text');
const inputTimeEl0 = document.getElementById('time-to-adjust-0');
const inputTimeEl1 = document.getElementById('time-to-adjust-1');
const adjustButtonEl = document.getElementById('btn-adjust');
const adjEls = document.querySelectorAll('.adj-icon');
const copyToClipEl = document.getElementById('copy-icon');

const loadSampleInput = function () {
  inputTextEl.value = `01:10 - Section 0
02:30 - Section 1
115:35 - Section 2
07:53 - Section 3
##HEADING CHANGE
10:25 - Section 4
(15:24) Section 5
(20:22) - Section 6
Section 7`;

  inputTimeEl0.value = '2:08';
  inputTimeEl1.value = '3:08';
  // timeAdjustEl.value = '99:99:99';
};

const timeToSeconds = time => {
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
  if (HH > 23 || MM > 59 || SS > 59) return null; //Return null if timestamp is invalid

  return HH * 3600 + MM * 60 + SS;
};

const secondsToTime = sec => {
  let hours = Math.floor(sec / 3600); // get hours
  let minutes = Math.floor((sec - hours * 3600) / 60); // get minutes
  let seconds = sec - hours * 3600 - minutes * 60; //  get seconds

  [hours, minutes, seconds] = [hours, minutes, seconds].map(
    time => (time < 10 ? '0' + time : '' + time) //Add 0 at the start if time is less than 10
  );

  return hours === '00'
    ? minutes + ':' + seconds //Return MM:SS if HH is 00
    : hours + ':' + minutes + ':' + seconds; // Return in HH:MM:SS
};

const adjustTime = function (text, timeToAdjust, adjType = 'subtract') {
  const timestamps = text
    .split('\n')
    .map(line => (line.match(/\d{0,2}:{0,1}\d{1,2}:\d{1,2}/) || [null])[0]); //Extract the timestamps present from each line with regex. Return null if no timestamp is present in a given line

  return timestamps.reduce((arr, time) => {
    if (time) {
      //Run time conversion only if a line has a timestamp
      const origTimeInSeconds = timeToSeconds(time);

      if (!origTimeInSeconds)
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

const displayError = function (element, index, flag) {
  if (flag) {
    element.classList.remove('--input-valid');
    element.classList.add('--input-invalid');
    document.getElementById(`invalid-hint-${index}`).classList.remove('hidden');
    element.focus();
  } else {
    element.classList.add('--input-valid');
    element.classList.remove('--input-invalid');
    document.getElementById(`invalid-hint-${index}`).classList.add('hidden');
  }
};

const calcAdjustmentTime = function (...timeEls) {
  // const time1InSeconds = timeToSeconds(timeEl1.value);
  // const time2InSeconds = timeToSeconds(timeEl2.value);

  const [time1InSeconds, time2InSeconds] = timeEls.map((timeEl, index) => {
    const timeInSeconds = timeToSeconds(timeEl.value);

    if (!timeInSeconds) {
      displayError(timeEl, index, true);
      return null;
    }
    displayError(timeEl, index, false);
    return timeInSeconds;
  });

  return time1InSeconds && time2InSeconds && time1InSeconds - time2InSeconds; //Return null if any of the times is null. Else return the difference
};

// ########################################
//         CONTROL BOX CODE
// ########################################

function deselectButtons() {
  adjEls.forEach(adjBtn => {
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
    .slice(copyContent.indexOf('*/') + 2)
    .trimStart();
  copyToClipboard(clipboardContent);
});

adjustButtonEl.addEventListener('click', function (e) {
  e.preventDefault();
  const inputText = inputTextEl.value;
  const timeToAdjust = calcAdjustmentTime(inputTimeEl0, inputTimeEl1);

  const adjType = timeToAdjust < 0 ? 'add' : 'subtract';

  if (timeToAdjust) {
    const newTimestamps = adjustTime(
      inputText,
      Math.abs(timeToAdjust),
      adjType
    );
    const newText = modifyText(inputText, newTimestamps);
    outputTextEl.value =
      `/* ${secondsToTime(
        Math.abs(timeToAdjust)
      )} has been ${adjType}ed.\nInvalid timestamps are marked as XX:XX */\n\n` +
      newText;
  } else {
    outputTextEl.value = '';
  }
});

inputTextEl.addEventListener('input', function (e) {
  e.preventDefault();

  const [firstTimestamp, ...rest] = inputTextEl.value
    .split('\n')
    .map(line => (line.match(/\d{0,2}:{0,1}\d{1,2}:\d{1,2}/) || [null])[0])
    .filter(stamp => stamp);

  inputTimeEl0.value = secondsToTime(timeToSeconds(firstTimestamp));
});

// ######################################
loadSampleInput();
deselectButtons();
