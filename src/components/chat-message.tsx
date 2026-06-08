import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/ui/markdown";
import { Text } from "@/components/ui/text";
import { SymbolView } from "expo-symbols";
import { View } from "react-native";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatMessageProps {
  message: Message;
  onCopy?: (text: string) => void;
}

export function ChatMessage({ message, onCopy }: ChatMessageProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <View className="self-end  mr-10 max-w-[85%] bg-secondary border border-border/40 px-4 py-2.5 rounded-2xl rounded-tr-sm my-2 shadow-sm">
        <Text className="text-sm text-foreground selection:bg-primary/30 leading-relaxed">
          {message.content}
        </Text>

        <Text>click me</Text>
      </View>
    );
  }

  return (
    <View className="self-start w-full flex-row gap-4 py-6 px-3 border-b border-border/20 my-1 bg-black/20">
      {/* Bot Avatar */}
      <View className="w-8 h-8 rounded-full bg-primary items-center justify-center border border-border/20 shadow-sm shadow-primary/20">
        <SymbolView
          name={{
            ios: "sparkles",
            android: "auto_awesome",
            web: "auto_awesome",
          }}
          tintColor="#ffffff"
          size={16}
        />
      </View>

      {/* Bot Content */}
      <View className="flex-1 gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-mono text-primary font-bold uppercase tracking-wider">
            Tether Bot
          </Text>
          {onCopy && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md active:bg-secondary"
              onPress={() => onCopy(message.content)}
            >
              <SymbolView
                name={{
                  ios: "doc.on.doc",
                  android: "content_copy",
                  web: "content_copy",
                }}
                tintColor="#a3a3a3"
                size={14}
              />
            </Button>
          )}
        </View>

        <Markdown>{message.content}</Markdown>
      </View>
    </View>
  );
}
