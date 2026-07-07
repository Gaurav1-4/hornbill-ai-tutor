const { EdgeTTS } = require('node-edge-tts');
const tts = new EdgeTTS({ voice: 'en-IN-NeerjaNeural' });
console.log(Object.keys(tts));
console.log(Object.getPrototypeOf(tts));
