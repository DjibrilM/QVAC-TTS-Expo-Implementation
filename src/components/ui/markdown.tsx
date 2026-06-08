import React from "react";
import { StyleSheet } from "react-native";
import MarkdownDisplay from "react-native-markdown-display";

interface MarkdownProps {
  children: string;
}

export function Markdown({ children }: MarkdownProps) {
  return (
    <MarkdownDisplay style={styles}>
      {children}
    </MarkdownDisplay>
  );
}

const styles = StyleSheet.create({
  body: {
    color: "#ffffff",
    fontSize: 15,
    lineHeight: 22,
    fontFamily: "System",
  },
  paragraph: {
    marginTop: 4,
    marginBottom: 8,
    color: "#e5e5e5",
  },
  heading1: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "800",
    marginTop: 16,
    marginBottom: 8,
  },
  heading2: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 14,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#262626",
    paddingBottom: 4,
  },
  heading3: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 6,
  },
  strong: {
    fontWeight: "700",
    color: "#ffffff",
  },
  em: {
    fontStyle: "italic",
  },
  hr: {
    backgroundColor: "#262626",
    height: 1,
    marginVertical: 16,
  },
  code_inline: {
    backgroundColor: "#171717",
    color: "#009393", // Highlight code inline with Tether Green
    borderWidth: 1,
    borderColor: "#262626",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    fontSize: 13,
    fontFamily: "Courier",
  },
  code_block: {
    backgroundColor: "#0a0a0a",
    color: "#e5e5e5",
    borderWidth: 1,
    borderColor: "#262626",
    borderRadius: 6,
    padding: 12,
    fontSize: 13,
    fontFamily: "Courier",
    marginVertical: 6,
  },
  fence: {
    backgroundColor: "#0a0a0a",
    color: "#e5e5e5",
    borderWidth: 1,
    borderColor: "#262626",
    borderRadius: 6,
    padding: 12,
    fontSize: 13,
    fontFamily: "Courier",
    marginVertical: 6,
  },
  bullet_list: {
    marginVertical: 4,
  },
  ordered_list: {
    marginVertical: 4,
  },
  list_item: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 2,
  },
  bullet_list_icon: {
    color: "#009393", // Tether Green bullet
    fontSize: 15,
    marginRight: 8,
  },
  ordered_list_icon: {
    color: "#009393", // Tether Green list number
    fontSize: 14,
    marginRight: 8,
    fontWeight: "bold",
  },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: "#009393", // Tether Green border for quote
    backgroundColor: "#0a0a0a",
    paddingLeft: 12,
    paddingVertical: 6,
    marginVertical: 8,
    borderRadius: 2,
  },
  link: {
    color: "#009393",
    textDecorationLine: "underline",
  },
});
