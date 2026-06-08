import { useState, useEffect } from "react";
import {
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import {
  loadModel,
  textToSpeech,
  downloadAsset,
  TTS_EN_SUPERTONIC_Q8_0,
  getModelInfo,
  type ModelProgressUpdate,
  unloadModel,
} from "@qvac/sdk";
import { createAudioPlayer } from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";
import { saveAudioToDevice } from "@/lib/utils";
import { TtsModelLoader } from "@/components/tts-model-loader";
import { AudioPlayer } from "@/components/audio-player";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

const SUPERTONIC_SAMPLE_RATE = 44100;

// Global model reference to persist the loaded model across screen mounts/navigation
let globalModelId: string | null = null;

type TtsStatus =
  | { phase: "idle" }
  | { phase: "synthesizing" }
  | { phase: "done"; audioUri: string }
  | { phase: "error"; message: string };

export default function TextToVoiceScreen() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<TtsStatus>({ phase: "idle" });

  // Model loader states
  const [isModelLoaded, setIsModelLoaded] = useState(!!globalModelId);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0); // 0 to 1

  const isBusy = status.phase === "synthesizing";

  // Check if the model is already downloaded when the component mounts.
  // If it is, load it immediately into memory so the user doesn't have to download it again.
  useEffect(() => {
    async function checkAndAutoLoad() {
      if (globalModelId) return;
      try {
        const info = await getModelInfo({ name: TTS_EN_SUPERTONIC_Q8_0.name });
        if (info.isCached) {
          setIsDownloading(true);
          setDownloadProgress(1); // Already cached, progress is 100%

          const modelId = await loadModel({
            modelSrc: TTS_EN_SUPERTONIC_Q8_0,
            modelConfig: {
              ttsEngine: "supertonic",
              language: "en",
              voice: "F1",
              ttsSpeed: 1.05,
              ttsNumInferenceSteps: 5,
            },
          });

          globalModelId = modelId;
          setIsModelLoaded(true);
          setIsDownloading(false);
        }
      } catch (err: unknown) {
        console.warn("Failed to auto-load cached model on mount:", err);
        setIsDownloading(false);
      }
    }

    checkAndAutoLoad();
  }, []);

  const handleDownloadModel = async () => {
    if (isDownloading || isModelLoaded) return;

    try {
      setIsDownloading(true);
      setDownloadProgress(0);

      // 1. Download model file using downloadAsset
      await downloadAsset({
        assetSrc: TTS_EN_SUPERTONIC_Q8_0,
        onProgress: (p: ModelProgressUpdate) => {
          setDownloadProgress(p.percentage / 100);
        },
      });

      setDownloadProgress(1);

      // 2. Load the downloaded model into memory
      const modelId = await loadModel({
        modelSrc: TTS_EN_SUPERTONIC_Q8_0,
        modelConfig: {
          ttsEngine: "supertonic",
          language: "en",
          voice: "F1",
          ttsSpeed: 1.05,
          ttsNumInferenceSteps: 5,
        },
      });

      globalModelId = modelId;
      setIsModelLoaded(true);
      setIsDownloading(false);
    } catch (err: unknown) {
      console.error("Failed to download or load model:", err);
      setIsDownloading(false);
      setStatus({
        phase: "error",
        message: err instanceof Error ? err.message : String(err),
      });
      setIsModelLoaded(false);
    }
  };

  const handleSubmit = async () => {
    if (!text.trim() || isBusy || !globalModelId) return;

    try {
      // 1. Unload and reload the model to reset its state and clear the KV cache.
      // This prevents the "noisy/repeated voices" bug caused by state accumulation across generations.
      if (globalModelId) {
        await unloadModel({ modelId: globalModelId });
      }

      globalModelId = await loadModel({
        modelSrc: TTS_EN_SUPERTONIC_Q8_0,
        modelConfig: {
          ttsEngine: "supertonic",
          language: "en",
          voice: "F1",
          ttsSpeed: 1.05,
          ttsNumInferenceSteps: 5,
        },
      });

      // 2. Synthesize text to raw PCM samples
      setStatus({ phase: "synthesizing" });

      const result = textToSpeech({
        modelId: globalModelId,
        text: text.trim(),
        inputType: "text",
        stream: false,
      });

      const audioBuffer = await result.buffer;

      // 2. Package and save WAV file using our local util
      const samplesInt16 = new Int16Array(audioBuffer);
      const wavUri = await saveAudioToDevice(
        samplesInt16,
        SUPERTONIC_SAMPLE_RATE,
      );

      // 3. Show player
      setStatus({ phase: "done", audioUri: wavUri });
    } catch (err: unknown) {
      console.error("TTS error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setStatus({ phase: "error", message: msg });
    }
  };

  const buttonLabel = (() => {
    switch (status.phase) {
      case "synthesizing":
        return "Synthesizing…";
      default:
        return "Synthesize Speech";
    }
  })();

  // If the model hasn't been initialized/loaded yet, show the model downloader
  if (!isModelLoaded) {
    return (
      <TtsModelLoader
        onDownload={handleDownloadModel}
        isDownloading={isDownloading}
        progress={downloadProgress}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-black"
    >
      <ScrollView contentContainerClassName="flex-grow p-6 justify-center">
        <Card className="border border-border bg-card max-w-md w-full mx-auto">
          <CardHeader>
            <CardTitle variant="h3" className="text-white text-center">
              Text to Voice
            </CardTitle>
            <CardDescription className="text-center mt-1">
              Type or paste your content to synthesize speech
            </CardDescription>
          </CardHeader>

          <CardContent className="gap-6">
            <TextInput
              className="bg-muted text-white border border-border rounded-lg p-4 h-48 text-base leading-6"
              multiline
              numberOfLines={8}
              placeholder="Type your message here..."
              placeholderTextColor="#666"
              value={text}
              onChangeText={setText}
              style={{ textAlignVertical: "top" }}
              editable={!isBusy}
            />

            {status.phase === "error" && (
              <Text className="text-destructive text-sm text-center">
                {status.message}
              </Text>
            )}

            {status.phase === "done" && <AudioPlayer uri={status.audioUri} />}

            <Button
              onPress={handleSubmit}
              className="w-full h-12 rounded-xl"
              disabled={!text.trim() || isBusy}
            >
              <Text className="font-semibold text-lg">{buttonLabel}</Text>
            </Button>
          </CardContent>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
