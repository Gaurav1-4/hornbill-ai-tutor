import { NextResponse } from 'next/server';
import { EdgeTTS } from 'node-edge-tts';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const tts = new EdgeTTS({
      voice: 'en-IN-NeerjaNeural',
      lang: 'en-IN',
      outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
    });

    const tempFilePath = path.join(os.tmpdir(), `tts-${Date.now()}.mp3`);
    
    // Generate the audio and save it to the temp file
    await tts.ttsPromise(text, tempFilePath);

    // Read the generated audio file
    const audioBuffer = await fs.readFile(tempFilePath);
    
    // Clean up the temp file
    await fs.unlink(tempFilePath).catch(console.error);

    // Return the audio buffer as an MP3 response
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('TTS Error:', error);
    return NextResponse.json({ error: 'Failed to generate speech' }, { status: 500 });
  }
}
