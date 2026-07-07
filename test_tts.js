const { EdgeTTS } = require('node-edge-tts');

async function test() {
    const tts = new EdgeTTS({
        voice: 'en-IN-NeerjaNeural',
        lang: 'en-IN',
        outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
    });
    
    try {
        await tts.ttsPromise('Hello! This is a test of the Neerja neural voice.', 'test.mp3');
        console.log('Success! Saved to test.mp3');
    } catch (e) {
        console.error(e);
    }
}

test();
