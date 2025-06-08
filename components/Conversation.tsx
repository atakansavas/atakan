"use client";

import { useConversation } from "@elevenlabs/react";
import { Loader2, Mic, MicOff } from "lucide-react";
import { useCallback } from "react";

interface ConversationProps {
  email?: string;
  disabled?: boolean;
}

export function Conversation({ email, disabled = false }: ConversationProps) {
  const conversation = useConversation({
    onConnect: () => console.log("Bağlandı"),
    onDisconnect: () => console.log("Bağlantı kesildi"),
    onMessage: (message) => console.log("Mesaj:", message),
    onError: (error) => console.error("Hata:", error),
  });

  const startConversation = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: "agent_01jx4skjpmed7tzrb6w5fhd5wv",
        dynamicVariables: {
          user_email: email || "test@test.com",
        },
      });
    } catch (error) {
      console.error("Görüşme başlatılamadı:", error);
    }
  }, [conversation, email]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-6">
      <div
        className={`bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-gray-200 transition-all duration-300 ${
          disabled ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            {conversation.status === "connecting" ? (
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            ) : conversation.status === "connected" ? (
              <Mic className="w-12 h-12 text-white animate-pulse" />
            ) : (
              <MicOff className="w-12 h-12 text-white" />
            )}
          </div>

          <div className="text-center">
            <p className="text-lg font-medium text-gray-900 mb-1">
              {disabled
                ? "E-posta adresinizi girin"
                : conversation.status === "connected"
                ? "Sesli Asistan Dinliyor"
                : conversation.status === "connecting"
                ? "Bağlanıyor..."
                : "Sesli Asistan Kapalı"}
            </p>
            <p className="text-sm text-gray-500">
              {disabled
                ? "Görüşmeyi başlatmak için e-posta gerekli"
                : conversation.isSpeaking
                ? "Asistan konuşuyor..."
                : "Sizi dinliyorum..."}
            </p>
          </div>

          <button
            onClick={
              conversation.status === "connected"
                ? stopConversation
                : startConversation
            }
            className={`w-full py-3 px-6 rounded-xl text-white font-medium transition-all duration-200 ${
              disabled
                ? "bg-gray-400 cursor-not-allowed"
                : conversation.status === "connected"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-blue-500 hover:bg-blue-600"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={disabled || conversation.status === "connecting"}
          >
            {disabled
              ? "E-posta Gerekli"
              : conversation.status === "connected"
              ? "Görüşmeyi Bitir"
              : "Görüşmeyi Başlat"}
          </button>
        </div>
      </div>
    </div>
  );
}
