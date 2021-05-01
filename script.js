// script.js

const img = new Image(); // used to load image from <input> and draw to canvas
const canvas = document.getElementById('user-image');
const ctx = canvas.getContext('2d');
const form = document.querySelector("form");
const submit = document.querySelector("button[type=submit]");
const clear = document.querySelector("button[type=reset]");
const read = document.querySelector("button[type=button]");
const imgInput = document.querySelector("#image-input");
const volume = document.getElementById('volume-group');
const volRange = document.querySelector("input[type=range]");

var top = document.getElementById("text-top");
var bottom = document.getElementById("text-bottom");
var voiceSelect = document.getElementById('voice-selection');
var synth = window.speechSynthesis;
var voices = [];

function populateVoiceList() {
  voiceSelect.remove(0);
  voices = synth.getVoices();
  voiceSelect.disabled = false;

  for (var i = 0; i < voices.length; i++) {
    var option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

    if(voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    voiceSelect.appendChild(option);
  }
}

populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {

  // toggle buttons
  submit.disabled = false;
  clear.disabled = true;
  read.disabled = true;

  // clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // fill canvas with black
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // get dimensions
  var dim = getDimmensions(canvas.width,canvas.height,img.width,img.height);
  ctx.drawImage(img, dim.startX, dim.startY, dim.width, dim.height);
  
  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected
});

imgInput.addEventListener('change', () => {
  const imgURL = URL.createObjectURL(imgInput.files[0])
  img.src = imgURL;
  img.alt = imgInput.files[0].name;
});

form.addEventListener('submit', function(e) {
  
  // prevent reloading
  e.preventDefault();

  // set text
  ctx.font = "35px Helvetica";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText(top.value, canvas.width / 2, 50);
  ctx.fillText(bottom.value, canvas.width / 2, 375);

  // toggle buttons
  submit.disabled = true;
  clear.disabled = false;
  read.disabled = false;
});

clear.addEventListener('click', () => {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // toggle buttons
  submit.disabled = false;
  clear.disabled = true;
  read.disabled = true;

});

read.addEventListener('click', function(e) {
  
  // prevent reloading
  e.preventDefault();

  var utteranceTop = new SpeechSynthesisUtterance(top.value);
  var utteranceBot = new SpeechSynthesisUtterance(bottom.value);
  var selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
  for (var i = 0; i < voices.length; i++) {
    if (voices[i].name === selectedOption) {
      utteranceTop.voice = voices[i];
      utteranceBot.voice = voices[i];
    }
  }

  utteranceTop.volume = volRange.value / 100;
  utteranceBot.volume = volRange.value / 100;
  speechSynthesis.speak(utteranceTop);
  speechSynthesis.speak(utteranceBot);
});

volume.addEventListener('input', () => {

  const scroll = document.querySelector('#volume-group img');

  if (volRange.value == 0) {
    scroll.src = 'icons/volume-level-0.svg';
  }
  else if (volRange.value <= 33) {
    scroll.src = 'icons/volume-level-1.svg';
  }
  else if (volRange.value <= 66) {
    scroll.src = 'icons/volume-level-2.svg';
  }
  else {
    scroll.src = 'icons/volume-level-3.svg';
  }
});

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}