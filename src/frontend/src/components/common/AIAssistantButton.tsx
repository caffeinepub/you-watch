import { useRouter } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";

export default function AIAssistantButton() {
  const router = useRouter();
  const [tapped, setTapped] = useState(false);

  function handleClick() {
    setTapped(true);
    setTimeout(() => {
      router.navigate({ to: "/ai-assistant" });
    }, 300);
  }

  return (
    <motion.button
      onClick={handleClick}
      data-ocid="ai_assistant.button"
      className="fixed z-50 right-5 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-card border border-border shadow-xl flex items-center justify-center cursor-pointer select-none"
      style={{ boxShadow: "0 8px 32px oklch(var(--primary) / 0.35)" }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.92 }}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      aria-label="Open AI Knowledge Assistant"
    >
      <span className="text-2xl leading-none select-none">
        {tapped ? "🤖" : "❔"}
      </span>
    </motion.button>
  );
}
