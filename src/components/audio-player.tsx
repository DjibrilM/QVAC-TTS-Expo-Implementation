import { useState, useRef, useEffect } from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { Play, Pause } from "lucide-react-native";
import { Waveform, type IWaveformRef } from "@simform_solutions/react-native-audio-waveform";
import { Text } from "@/components/ui/text";

interface AudioPlayerProps {
  uri: string;
}

export function AudioPlayer({ uri }: AudioPlayerProps) {
  const ref = useRef<IWaveformRef>(null);
  const [playerState, setPlayerState] = useState<"playing" | "paused" | "stopped">("stopped");
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<1.0 | 1.5 | 2.0>(1.0);

  useEffect(() => {
    // Unmount cleanup
    return () => {
      ref.current?.stopPlayer();
    };
  }, []);

  const togglePlayback = async () => {
    if (!isReady) return;
    
    if (playerState === "playing") {
      await ref.current?.pausePlayer();
      setPlayerState("paused");
    } else if (playerState === "paused") {
      await ref.current?.resumePlayer();
      setPlayerState("playing");
    } else {
      await ref.current?.startPlayer({});
      setPlayerState("playing");
    }
  };

  const toggleSpeed = () => {
    const nextSpeed = playbackSpeed === 1.0 ? 1.5 : playbackSpeed === 1.5 ? 2.0 : 1.0;
    setPlaybackSpeed(nextSpeed);
    // If playing, we need to update the native module's playback speed.
    // However, the Waveform component accepts playbackSpeed as a prop and should react to it.
  };

  const isPlaying = playerState === "playing";

  const formatTime = (ms: number) => {
    if (isNaN(ms) || ms <= 0) return "0:00";
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View className="flex-row items-center bg-secondary/50 rounded-full p-2 px-4 space-x-3 w-full">
      <TouchableOpacity 
        onPress={togglePlayback}
        className="w-10 h-10 bg-primary rounded-full items-center justify-center shrink-0"
        disabled={!isReady}
      >
        {!isReady ? (
          <ActivityIndicator size="small" color="#000" />
        ) : isPlaying ? (
          <Pause size={20} color="#000" fill="#000" />
        ) : (
          <Play size={20} color="#000" fill="#000" className="ml-1" />
        )}
      </TouchableOpacity>

      <View className="flex-1 flex-row items-center h-8 overflow-hidden pl-2">
        <Waveform
          mode="static"
          ref={ref}
          path={uri}
          candleSpace={2}
          candleWidth={4}
          scrubColor="#ffffff"
          waveColor="#545454"
          playbackSpeed={playbackSpeed}
          containerStyle={{ flex: 1, height: 32 }}
          onPlayerStateChange={(state) => {
            setPlayerState(state as "playing" | "paused" | "stopped");
          }}
          onChangeWaveformLoadState={(state) => {
            setIsReady(!state); 
          }}
          onCurrentProgressChange={(current, total) => {
            setCurrentTime(current);
            setDuration(total);
          }}
          onError={(error) => {
            console.error("Waveform Error:", error);
          }}
        />
      </View>

      <TouchableOpacity onPress={toggleSpeed} className="shrink-0 bg-secondary px-2 py-1 rounded-full">
        <Text className="text-xs font-semibold">{playbackSpeed}x</Text>
      </TouchableOpacity>

      <Text className="text-xs text-muted-foreground font-medium shrink-0 w-20 text-right">
        {formatTime(currentTime)} / {formatTime(duration)}
      </Text>
    </View>
  );
}
