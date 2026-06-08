import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Buffer } from "buffer";
import * as FileSystem from "expo-file-system/legacy";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Creates a WAV header for 16-bit PCM audio (Expo-compatible)
 */
export function createWavHeader(dataLength: number, sampleRate: number): Buffer {
  const buffer = Buffer.alloc(44);
  const channels = 1; // Mono
  const byteRate = sampleRate * channels * 2; // 16-bit audio
  const blockAlign = channels * 2;

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size
  buffer.writeUInt16LE(1, 20); // AudioFormat (PCM)
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // BitsPerSample
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataLength, 40);

  return buffer;
}

/**
 * Converts the raw Int16Array samples from QVAC to a binary Buffer
 */
export function int16ArrayToBuffer(int16Array: Int16Array): Buffer {
  const buffer = Buffer.alloc(int16Array.length * 2);
  for (let i = 0; i < int16Array.length; i++) {
    buffer.writeInt16LE(int16Array[i] ?? 0, i * 2);
  }
  return buffer;
}

/**
 * Main function to package and save the file to local mobile storage
 */
export async function saveAudioToDevice(audioBuffer: Int16Array, sampleRate: number): Promise<string> {
  try {
    // 1. Convert the raw PCM samples into a binary buffer
    const audioData = int16ArrayToBuffer(audioBuffer);

    // 2. Generate the 44-byte WAV header configuration
    const wavHeader = createWavHeader(audioData.length, sampleRate);

    // 3. Concatenate the header and audio data into a complete WAV file structure
    const finalWavBuffer = Buffer.concat([wavHeader, audioData]);

    // 4. Crucial Step: Convert the raw binary buffer into a Base64 string
    const base64Data = finalWavBuffer.toString("base64");

    // 5. Define a path in the app's sandboxed document directory
    const filename = `tts-speech-${Date.now()}.wav`;
    const fileUri = `${FileSystem.documentDirectory}${filename}`;

    // 6. Write the file to device storage using Base64 encoding
    await FileSystem.writeAsStringAsync(fileUri, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log(`✅ File saved locally at: ${fileUri}`);

    // Return the local URI so you can pass it directly to an audio player
    return fileUri;
  } catch (error) {
    console.error("❌ Failed to save audio file locally:", error);
    throw error;
  }
}
