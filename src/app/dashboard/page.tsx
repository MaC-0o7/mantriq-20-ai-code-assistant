"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Send, 
  Terminal,
  Loader2
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function Dashboard() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: "MANTRIQ 2.0 AI Code Assistant initialized. Type your request below.\nAvailable modes: /explain, /debug, /generate, /optimize, /review"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const detectMode = (text: string): string => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes("/explain")) return "explain";
    if (lowerText.includes("/debug")) return "debug";
    if (lowerText.includes("/generate")) return "generate";
    if (lowerText.includes("/optimize")) return "optimize";
    if (lowerText.includes("/review")) return "review";
    return "explain";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userInput = input.trim();
    const mode = detectMode(userInput);
    const cleanedInput = userInput.replace(/\/(explain|debug|generate|optimize|review)\s*/i, "");

    setMessages((prev) => [...prev, {
      role: "user",
      content: userInput,
    }]);
    
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, code: cleanedInput }),
      });

      const data = await response.json();

      setMessages((prev) => [...prev, {
        role: "assistant",
        content: data.response,
      }]);
    } catch (error) {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "ERROR: Failed to process request. Please try again.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const quickCommands = [
    { label: "/explain", desc: "Explain code" },
    { label: "/debug", desc: "Debug code" },
    { label: "/generate", desc: "Generate code" },
    { label: "/optimize", desc: "Optimize code" },
    { label: "/review", desc: "Review code" },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />

      <main className="flex-1 pt-20 flex flex-col">
        <div className="container mx-auto max-w-5xl flex flex-col h-[calc(100vh-80px)] p-4">
          {/* Terminal Window */}
          <div className="flex-1 flex flex-col terminal-border overflow-hidden">
            {/* Terminal Header */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white">
              <Terminal className="w-4 h-4" />
              <span className="text-xs">MANTRIQ 2.0 - Interactive Terminal</span>
              <div className="ml-auto flex gap-2">
                <div className="w-3 h-3 border border-white"></div>
                <div className="w-3 h-3 border border-white"></div>
                <div className="w-3 h-3 border border-white bg-white"></div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-sm">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="whitespace-pre-wrap"
                >
                  {message.role === "system" && (
                    <div className="text-gray-400">
                      <span className="text-white">[SYSTEM]</span> {message.content}
                    </div>
                  )}
                  {message.role === "user" && (
                    <div>
                      <span className="text-gray-400">$ </span>
                      <span className="text-white">{message.content}</span>
                    </div>
                  )}
                  {message.role === "assistant" && (
                    <div className="text-gray-300 ml-2 border-l border-white pl-3">
                      {message.content}
                    </div>
                  )}
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-gray-400"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Commands Bar */}
            <div className="border-t border-white px-4 py-2 flex flex-wrap gap-2 text-xs">
              {quickCommands.map((cmd) => (
                <button
                  key={cmd.label}
                  onClick={() => setInput(cmd.label + " ")}
                  className="px-2 py-1 border border-white hover:bg-white hover:text-black transition-colors"
                  title={cmd.desc}
                >
                  {cmd.label}
                </button>
              ))}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="border-t border-white p-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">$</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type command or paste code... (e.g., /explain function add(a,b) { return a+b; })"
                  className="flex-1 bg-transparent border-none outline-none text-white text-sm font-mono placeholder:text-gray-600"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="px-3 py-1 border border-white hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}