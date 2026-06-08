import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { SymbolView } from "expo-symbols";
import { View } from "react-native";

interface ModelLoaderProps {
  onDownload: () => void;
  isDownloading: boolean;
  progress: number; // 0 to 1
}

export function ModelLoader({
  onDownload,
  isDownloading,
  progress,
}: ModelLoaderProps) {
  const percentage = Math.round(progress * 100);
  const totalSize = 450; // MB
  const downloadedSize = (progress * totalSize).toFixed(1);

  return (
    <View className="flex-1 justify-center items-center bg-background px-6">
      <View className="w-full max-w-sm p-6 bg-card rounded-2xl shadow-lg">
        {/* Header Icon */}

        <View className="items-center mb-6 gap-3">
          <View className="w-12 h-12 rounded-full bg-secondary border border-border/40 items-center justify-center shadow-inner">
            <SymbolView
              name={{
                ios: "icloud.and.arrow.down",
                android: "cloud_download",
                web: "cloud_download",
              }}
              tintColor="#009393"
              size={24}
            />
          </View>
          <Text className="text-xl font-bold tracking-tight text-center text-foreground">
            Initialize Local LLM
          </Text>

          <Text className="text-sm text-muted-foreground text-center leading-relaxed">
            Download the offline AI model parameters to start chatting
            completely offline. This is a one-time setup.
          </Text>
        </View>

        {isDownloading ? (
          <View className="gap-4">
            {/* Progress Bar Container */}
            <View className="w-full h-2 bg-secondary border border-border/20 rounded-full overflow-hidden">
              <View
                style={{ width: `${percentage}%` }}
                className="h-full bg-primary rounded-full"
              />
            </View>

            {/* Progress Details */}
            <View className="flex-row justify-between items-center px-1">
              <Text className="text-xs font-mono text-muted-foreground">
                {percentage === 100 ? "Finalizing..." : "Downloading model..."}
              </Text>
              <Text className="text-xs font-mono font-bold text-primary">
                {downloadedSize} MB / {totalSize} MB ({percentage}%)
              </Text>
            </View>
          </View>
        ) : (
          <Button
            variant="default"
            onPress={onDownload}
            className="w-full  bg-primary active:opacity-90 rounded-xl items-center justify-center border border-border/30"
          >
            <View className="flex-row items-center gap-2">
              <SymbolView
                name={{
                  ios: "arrow.down.circle.fill",
                  android: "arrow_circle_down",
                  web: "arrow_circle_down",
                }}
                tintColor="#ffffff"
                size={16}
              />
              <Text className="text-primary-foreground font-semibold text-sm">
                Download Model
              </Text>
            </View>
          </Button>
        )}

        {/* Footer info */}
        <View className="flex-row justify-center items-center gap-1.5 mt-6 border-t border-border/10 pt-4">
          <SymbolView
            name={{ ios: "lock.shield", android: "lock", web: "lock" }}
            tintColor="#737373"
            size={12}
          />
          <Text className="text-[10px] text-muted-foreground/80 font-sans">
            100% private, on-device processing.
          </Text>
        </View>
      </View>
    </View>
  );
}
