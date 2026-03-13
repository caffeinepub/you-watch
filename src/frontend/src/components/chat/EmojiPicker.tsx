import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

const EMOJI_CATEGORIES = [
  {
    label: "😊",
    name: "Smileys",
    emojis: [
      "😀",
      "😃",
      "😄",
      "😁",
      "😆",
      "😅",
      "😂",
      "🤣",
      "😊",
      "😇",
      "🙂",
      "🙃",
      "😉",
      "😌",
      "😍",
      "🥰",
      "😘",
      "😗",
      "😙",
      "😚",
      "😋",
      "😛",
      "😝",
      "😜",
      "🤪",
      "🤨",
      "🧐",
      "🤓",
      "😎",
      "🥸",
    ],
  },
  {
    label: "👋",
    name: "People",
    emojis: [
      "👋",
      "🤚",
      "🖐️",
      "✋",
      "🖖",
      "👌",
      "🤌",
      "🤏",
      "✌️",
      "🤞",
      "🤟",
      "🤘",
      "👈",
      "👉",
      "👆",
      "👇",
      "☝️",
      "👍",
      "👎",
      "✊",
      "👊",
      "🤛",
      "🤜",
      "👏",
      "🙌",
      "👐",
      "🤲",
      "🤝",
      "🙏",
      "💪",
    ],
  },
  {
    label: "🌿",
    name: "Nature",
    emojis: [
      "🐶",
      "🐱",
      "🐭",
      "🐹",
      "🐰",
      "🦊",
      "🐻",
      "🐼",
      "🐨",
      "🐯",
      "🦁",
      "🐮",
      "🐷",
      "🐸",
      "🐵",
      "🌸",
      "🌺",
      "🌻",
      "🌹",
      "🌷",
      "🍀",
      "🌿",
      "🌱",
      "🌲",
      "🌳",
      "🌴",
      "🌵",
      "🎋",
      "🎍",
      "🍃",
    ],
  },
  {
    label: "🍕",
    name: "Food",
    emojis: [
      "🍕",
      "🍔",
      "🍟",
      "🌭",
      "🌮",
      "🌯",
      "🥪",
      "🥗",
      "🍜",
      "🍝",
      "🍣",
      "🍱",
      "🍛",
      "🍲",
      "🥘",
      "🍿",
      "🧁",
      "🎂",
      "🍰",
      "🍩",
      "🍦",
      "🍧",
      "🍨",
      "🍫",
      "🍬",
      "🍭",
      "🍮",
      "🥤",
      "☕",
      "🧃",
    ],
  },
  {
    label: "💡",
    name: "Symbols",
    emojis: [
      "❤️",
      "🧡",
      "💛",
      "💚",
      "💙",
      "💜",
      "🖤",
      "🤍",
      "💔",
      "💕",
      "💯",
      "🔥",
      "⭐",
      "✨",
      "💫",
      "🌟",
      "🎉",
      "🎊",
      "🎈",
      "🎁",
      "🏆",
      "🥇",
      "🎯",
      "🚀",
      "💡",
      "🔔",
      "🎵",
      "🎶",
      "👀",
      "💬",
    ],
  },
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export default function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [activeTab, setActiveTab] = useState("Smileys");

  return (
    <div className="w-72 bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full rounded-none border-b border-border bg-card h-10 px-1 gap-0">
          {EMOJI_CATEGORIES.map((cat) => (
            <TabsTrigger
              key={cat.name}
              value={cat.name}
              className="flex-1 text-base px-0 py-1 data-[state=active]:bg-muted rounded-md"
            >
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {EMOJI_CATEGORIES.map((cat) => (
          <TabsContent key={cat.name} value={cat.name} className="mt-0 p-2">
            <div className="grid grid-cols-8 gap-0.5">
              {cat.emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onSelect(emoji)}
                  className="w-8 h-8 flex items-center justify-center text-lg rounded hover:bg-muted transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
