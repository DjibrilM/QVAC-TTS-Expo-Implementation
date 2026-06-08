import React from "react";
import { View, TextInput, Keyboard } from "react-native";
import { SymbolView } from "expo-symbols";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  isGenerating?: boolean;
}

export function ChatInput({
  value,
  onChangeText,
  onSubmit,
  isGenerating = false,
}: ChatInputProps) {
  const isDisabled = !value.trim() || isGenerating;

  const handleKeyPress = (e: any) => {
    // On web, allow Enter to submit, and Shift+Enter to newline
    if (e.nativeEvent.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isDisabled) {
        onSubmit();
      }
    }
  };

  return (
    <View className="flex-row items-end gap-2 border border-border/80 bg-card rounded-2xl p-2 shadow-md">
      {/* TextInput */}
      <TextInput
        placeholder="Message Chatbot..."
        placeholderTextColor="#737373"
        value={value}
        onChangeText={onChangeText}
        multiline
        onKeyPress={handleKeyPress}
        className="flex-1 text-sm text-foreground bg-transparent px-3 py-2 max-h-32 text-left align-top leading-relaxed outline-none"
        editable={!isGenerating}
      />

      {/* Action Button */}
      <Button
        variant="default"
        size="icon"
        disabled={isDisabled}
        onPress={() => {
          onSubmit();
          Keyboard.dismiss();
        }}
        className={`h-8 w-8 rounded-full items-center justify-center transition-all ${
          isDisabled ? "bg-secondary opacity-40" : "bg-primary active:opacity-90"
        }`}
      >
        {isGenerating ? (
          <SymbolView
            name={{ ios: "ellipsis", android: "more_horiz", web: "more_horiz" }}
            tintColor="#ffffff"
            size={16}
          />
        ) : (
          <SymbolView
            name={{ ios: "arrow.up", android: "arrow_upward", web: "arrow_upward" }}
            tintColor={isDisabled ? "#737373" : "#ffffff"}
            size={16}
          />
        )}
      </Button>
    </View>
  );
}
