import React, { useState, useEffect } from "react";
import { View, Alert, ActivityIndicator, Clipboard, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  useAudioRecorder,
  RecordingPresets,
  setAudioModeAsync,
  requestRecordingPermissionsAsync,
} from "expo-audio";
import {
  loadModel,
  transcribe,
  WHISPER_TINY,
  type ModelProgressUpdate,
} from "@qvac/sdk";

import { WhisperModelLoader } from "@/components/whisper-model-loader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

// Global model reference to persist the loaded model across screen mounts/navigation
let globalWhisperModelId: string | null = null;

export default function VoiceToTextScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);

  // Model loader states
  const [isModelLoaded, setIsModelLoaded] = useState(!!globalWhisperModelId);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0); // 0 to 1

  // Transcription states
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<string | null>(null);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  useEffect(() => {
    (async () => {
      try {
        const { granted } = await requestRecordingPermissionsAsync();
        if (!granted) {
          Alert.alert(
            "Permission Required",
            "Microphone access is required to use voice to text features. Please enable it in your system settings."
          );
          return;
        }
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
      } catch (error) {
        console.error("Failed to initialize audio permissions / mode:", error);
      }
    })();
  }, []);

  const handleDownloadModel = async () => {
    if (isDownloading || isModelLoaded) return;

    try {
      setIsDownloading(true);
      setDownloadProgress(0);

      const modelId = await loadModel({
        modelSrc: WHISPER_TINY,
        modelType: "whisper",
        modelConfig: {
          audio_format: "f32le",
          strategy: "greedy",
        },
        onProgress: (p: ModelProgressUpdate) => {
          setDownloadProgress(p.percentage / 100);
        },
      });

      globalWhisperModelId = modelId;
      setIsModelLoaded(true);
      setIsDownloading(false);
    } catch (err: unknown) {
      console.error("Failed to download Whisper model:", err);
      setIsDownloading(false);
      setIsModelLoaded(false);
      Alert.alert(
        "Download Error",
        err instanceof Error ? err.message : String(err)
      );
    }
  };

  const transcribeAudio = async (uri: string) => {
    if (!globalWhisperModelId) {
      Alert.alert("Error", "Model not loaded. Please download the model first.");
      return;
    }

    setIsTranscribing(true);
    setTranscriptionResult(null);

    try {
      // Normalize the URI path to be read by QVAC C++ native worker
      const normalizedPath = uri.startsWith("file://") ? uri.substring(7) : uri;
      console.log("Transcribing audio from path:", normalizedPath);

      const text = await transcribe({
        modelId: globalWhisperModelId,
        audioChunk: normalizedPath,
      });

      console.log("Transcription successful:", text);
      setTranscriptionResult(text || "No speech detected.");
    } catch (err: unknown) {
      console.error("Transcription failed:", err);
      Alert.alert(
        "Transcription Failed",
        err instanceof Error ? err.message : String(err)
      );
    } finally {
      setIsTranscribing(false);
    }
  };

  const handlePressIn = async () => {
    // Reset any previous states when starting a new recording
    setTranscriptionResult(null);
    setRecordingUri(null);
    setIsRecording(true);

    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        setIsRecording(false);
        Alert.alert(
          "Permission Required",
          "Microphone access is required to use voice to text features. Please enable it in your system settings."
        );
        return;
      }

      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (error) {
      console.error("Failed to start recording:", error);
      setIsRecording(false);
      Alert.alert("Error", "Could not start recording.");
    }
  };

  const handlePressOut = async () => {
    if (!isRecording) return;
    setIsRecording(false);

    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      setRecordingUri(uri);

      if (!uri) {
        Alert.alert("Error", "Could not save recording URI.");
        return;
      }

      Alert.alert(
        "Confirm Recording",
        "Are you sure you want to process this recording?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Confirm",
            onPress: () => {
              transcribeAudio(uri);
            },
          },
        ]
      );
    } catch (error) {
      console.error("Failed to stop recording:", error);
      Alert.alert("Error", "Could not stop recording.");
    }
  };

  const copyToClipboard = () => {
    if (transcriptionResult) {
      Clipboard.setString(transcriptionResult);
      Alert.alert("Copied", "Transcription copied to clipboard!");
    }
  };

  // If the model hasn't been initialized/loaded yet, show the model downloader
  if (!isModelLoaded) {
    return (
      <WhisperModelLoader
        onDownload={handleDownloadModel}
        isDownloading={isDownloading}
        progress={downloadProgress}
      />
    );
  }

  return (
    <View className="flex-1 bg-black justify-center items-center p-6">
      <Card className="w-full max-w-md mx-auto bg-card border border-border p-6">
        <CardHeader className="items-center">
          <CardTitle variant="h3" className="text-center text-white">
            Voice to Text
          </CardTitle>

          <CardDescription className="text-center mt-1">
            Tap and hold the button below to start transcribing speech to text
          </CardDescription>
        </CardHeader>

        <CardContent className="items-center mt-6 gap-10">
          <View className="h-48 justify-center items-center w-full">
            {isRecording ? (
              <View className="flex-row items-center px-5 py-3 rounded-full border border-destructive/20 bg-destructive/10">
                <View className="w-3 h-3 rounded-full bg-destructive mr-3 animate-pulse" />
                <Text className="text-destructive text-lg font-semibold">
                  Recording...
                </Text>
              </View>
            ) : isTranscribing ? (
              <View className="items-center gap-3">
                <ActivityIndicator size="large" color="#009393" />
                <Text className="text-primary font-semibold text-lg animate-pulse">
                  Transcribing speech...
                </Text>
              </View>
            ) : transcriptionResult ? (
              <View className="w-full gap-3 items-center">
                <View className="w-full bg-secondary/40 border border-border rounded-xl p-4 h-32">
                  <ScrollView nestedScrollEnabled className="flex-1">
                    <Text className="text-white text-base leading-6 selection:bg-primary/30">
                      {transcriptionResult}
                    </Text>
                  </ScrollView>
                </View>
                <Button
                  onPress={copyToClipboard}
                  variant="outline"
                  className="flex-row items-center gap-2 border-border"
                >
                  <MaterialCommunityIcons
                    name="content-copy"
                    size={16}
                    color="#A3A3A3"
                  />
                  <Text className="text-neutral-400 font-medium text-xs">Copy Text</Text>
                </Button>
              </View>
            ) : recordingUri ? (
              <View className="items-center gap-2">
                <View className="flex-row items-center px-5 py-3 rounded-full border border-green-500/20 bg-green-500/10">
                  <View className="w-3 h-3 rounded-full bg-green-500 mr-3" />
                  <Text className="text-green-500 text-lg font-semibold">
                    Recording saved
                  </Text>
                </View>
                <Text className="text-muted-foreground text-xs max-w-xs text-center truncate mt-2">
                  {recordingUri}
                </Text>
              </View>
            ) : (
              <Text className="text-muted-foreground italic text-center">
                Ready to record
              </Text>
            )}
          </View>

          <View className="items-center gap-4">
            <Button
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              variant={isRecording ? "destructive" : "default"}
              className="w-28 h-28 rounded-full border-4 border-border items-center justify-center shadow-xl"
              style={{
                transform: [{ scale: isRecording ? 1.08 : 1 }],
              }}
            >
              <MaterialCommunityIcons
                name="microphone"
                size={42}
                color="#FFFFFF"
              />
            </Button>

            <Text className="text-sm font-medium text-muted-foreground mt-2">
              {isRecording ? "Release to Finish" : "Hold to Record"}
            </Text>
          </View>
        </CardContent>
      </Card>
    </View>
  );
}
