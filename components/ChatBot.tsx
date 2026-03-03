"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  UserCircle,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import {
  getPatientMedicalContext,
  getDoctorPatientsList,
} from "@/lib/actions/medassist.actions";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface PatientOption {
  id: string;
  nom: string;
  numeroDossier: string;
  alertesActives: number;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [patientContext, setPatientContext] = useState<any>(null);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Load patients list when chat opens
  useEffect(() => {
    if (isOpen && patients.length === 0) {
      loadPatients();
    }
  }, [isOpen]);

  const loadPatients = async () => {
    try {
      const result = await getDoctorPatientsList();
      if (result.success && result.patients) {
        setPatients(result.patients);
      }
    } catch (error) {
      console.error("Error loading patients:", error);
    }
  };

  const handlePatientSelect = async (patientId: string) => {
    setSelectedPatient(patientId);
    setShowPatientDropdown(false);
    setIsLoading(true);

    try {
      const result = await getPatientMedicalContext(patientId);
      if (result.success && result.context) {
        setPatientContext(result.context);

        // Add system message indicating patient context loaded
        const patientName = result.context.patient.nom;
        const contextMessage: Message = {
          role: "assistant",
          content: `✅ Contexte médical chargé pour ${patientName}. Je peux maintenant vous assister avec ce dossier patient.`,
          timestamp: new Date(),
        };
        setMessages([contextMessage]);
      }
    } catch (error) {
      console.error("Error loading patient context:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages
            .concat(userMessage)
            .map(({ role, content }) => ({ role, content })),
          patientContext: patientContext, // Send patient context
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content:
          "Désolé, je rencontre un problème technique. Veuillez réessayer dans un moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const welcomeMessage =
    "Bonjour! 👋 Je suis MedAssist AI, votre assistant médical intelligent. Sélectionnez un patient pour que je puisse accéder à son dossier médical et vous assister avec l'analyse de ses données cliniques.";

  const selectedPatientData = patients.find((p) => p.id === selectedPatient);

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 group h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
          aria-label="Open MedAssist AI"
        >
          <div className="relative">
            <Bot
              size={24}
              className="group-hover:scale-110 transition-transform"
            />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="flex flex-col bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Bot size={20} className="text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-400 border-2 border-white"></div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">MedAssist AI</h3>
                    <Sparkles
                      size={14}
                      className="text-yellow-300 animate-pulse"
                    />
                  </div>
                  <p className="text-xs text-blue-100">
                    Assistant médical intelligent
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-white hover:bg-white/20 transition-colors"
                aria-label="Close chat"
              >
                <X size={20} />
              </button>
            </div>

            {/* Patient Selector */}
            <div className="px-4 pb-3">
              <div className="relative">
                <button
                  onClick={() => setShowPatientDropdown(!showPatientDropdown)}
                  className="w-full flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 text-white hover:bg-white/20 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <UserCircle size={16} />
                    <span className="text-sm font-medium">
                      {selectedPatientData
                        ? selectedPatientData.nom
                        : "Sélectionner un patient"}
                    </span>
                  </div>
                  <ChevronDown size={16} />
                </button>

                {/* Dropdown */}
                {showPatientDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto z-10">
                    {patients.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        Aucun patient disponible
                      </div>
                    ) : (
                      patients.map((patient) => (
                        <button
                          key={patient.id}
                          onClick={() => handlePatientSelect(patient.id)}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-0"
                        >
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {patient.nom}
                            </div>
                            <div className="text-xs text-gray-500">
                              {patient.numeroDossier}
                            </div>
                          </div>
                          {patient.alertesActives > 0 && (
                            <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                              <AlertCircle size={12} />
                              {patient.alertesActives}
                            </span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {/* Welcome Message */}
            {messages.length === 0 && (
              <div className="flex gap-3 items-start animate-fade-in">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="flex-1 bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {welcomeMessage}
                  </p>
                </div>
              </div>
            )}

            {/* Chat Messages */}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 items-start animate-slide-up ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                    message.role === "user"
                      ? "bg-gray-900"
                      : "bg-gradient-to-r from-blue-500 to-purple-500"
                  }`}
                >
                  {message.role === "user" ? (
                    <User size={16} className="text-white" />
                  ) : (
                    <Bot size={16} className="text-white" />
                  )}
                </div>
                <div
                  className={`flex-1 rounded-2xl p-4 shadow-sm ${
                    message.role === "user"
                      ? "bg-gray-900 text-white rounded-tr-none"
                      : "bg-white text-gray-700 border border-gray-100 rounded-tl-none"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p
                    className={`text-xs mt-2 ${
                      message.role === "user"
                        ? "text-gray-400"
                        : "text-gray-400"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Loading */}
            {isLoading && (
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="flex-1 bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-blue-600" />
                    <span className="text-sm text-gray-500">
                      Analyse en cours...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            {!selectedPatient && (
              <div className="mb-3 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2">
                <AlertCircle size={14} />
                <span>Sélectionnez un patient pour commencer</span>
              </div>
            )}
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  selectedPatient
                    ? "Posez votre question médicale..."
                    : "Sélectionnez d'abord un patient..."
                }
                className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[44px] max-h-32"
                rows={1}
                disabled={isLoading || !selectedPatient}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || !selectedPatient}
                className="flex-shrink-0 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-2.5 text-white hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              MedAssist AI - Assistance médicale basée sur les données
            </p>
          </div>
        </div>
      )}
    </>
  );
}
