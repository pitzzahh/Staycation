"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Phone,
  Video,
  Info,
  Send,
  Plus,
  Image as ImageIcon,
  Smile,
  X,
} from "lucide-react";

interface MessagePageProps {
  onClose?: () => void;
}

type ConversationId = "c1" | "c2" | "c3";

interface Conversation {
  id: ConversationId;
  name: string;
  subtitle: string;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  online?: boolean;
}

interface ChatMessage {
  id: string;
  conversationId: ConversationId;
  from: "me" | "them";
  text: string;
  time: string;
}

const conversations: Conversation[] = [
  {
    id: "c1",
    name: "Emily Brown",
    subtitle: "Guest",
    lastMessage: "Could you confirm if my receipt was sent to the right email?",
    lastTime: "5m",
    unreadCount: 2,
    online: true,
  },
  {
    id: "c2",
    name: "Facility Team",
    subtitle: "Internal",
    lastMessage: "Can CSR confirm the postponed maintenance visit is approved?",
    lastTime: "32m",
    unreadCount: 0,
  },
  {
    id: "c3",
    name: "Michael Cruz",
    subtitle: "Guest",
    lastMessage: "Arriving past midnight—can I still get concierge support?",
    lastTime: "1h",
    unreadCount: 1,
  },
];

const initialMessages: ChatMessage[] = [
  {
    id: "m1",
    conversationId: "c1",
    from: "them",
    text: "Hello! Could you confirm if my receipt was sent to the right email?",
    time: "2:10 PM",
  },
  {
    id: "m2",
    conversationId: "c1",
    from: "me",
    text: "Hi Emily — sure. Can you share the email you used for the booking?",
    time: "2:12 PM",
  },
  {
    id: "m3",
    conversationId: "c1",
    from: "them",
    text: "It’s emily.b@email.com",
    time: "2:13 PM",
  },
  {
    id: "m4",
    conversationId: "c2",
    from: "them",
    text: "Urgent: Room 204 maintenance verification. Can CSR confirm approval?",
    time: "1:40 PM",
  },
  {
    id: "m5",
    conversationId: "c2",
    from: "me",
    text: "Acknowledged. I’ll confirm with the booking owner and update you shortly.",
    time: "1:42 PM",
  },
  {
    id: "m6",
    conversationId: "c3",
    from: "them",
    text: "Hey team, arriving past midnight—may I still get full concierge support?",
    time: "1:05 PM",
  },
];

export default function MessagePage({ onClose }: MessagePageProps) {
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<ConversationId>("c1");
  const [draft, setDraft] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialMessages);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? conversations[0],
    [activeId]
  );

  const filteredConversations = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return conversations;
    return conversations.filter((c) => {
      return (
        c.name.toLowerCase().includes(term) ||
        c.lastMessage.toLowerCase().includes(term) ||
        c.subtitle.toLowerCase().includes(term)
      );
    });
  }, [search]);

  const thread = useMemo(() => {
    return chatMessages.filter((m) => m.conversationId === activeId);
  }, [activeId, chatMessages]);

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;
    setChatMessages((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        conversationId: activeId,
        from: "me",
        text,
        time: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
      },
    ]);
    setDraft("");
  };

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Messages</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Review and respond to guest and internal chat updates.</p>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr]">
          <div className="border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col h-[72vh]">
            <div className="h-16 px-4 flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-brand-primaryLighter to-white dark:from-gray-900 dark:to-gray-900">
              <p className="text-base font-bold text-gray-900 dark:text-gray-100">Chats</p>
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  className="p-2 rounded-full hover:bg-brand-primaryLighter transition-colors"
                  title="New message"
                >
                  <Plus className="w-5 h-5 text-gray-600" />
                </button>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-brand-primaryLighter transition-colors"
                    title="Close"
                    type="button"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search Messenger"
                  className="w-full pl-10 pr-3 py-2.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary/30"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((c) => {
                const isActive = c.id === activeId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveId(c.id)}
                    className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                      isActive
                        ? "bg-brand-primaryLighter dark:bg-gray-800"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    <div className="relative">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-primary to-brand-primaryDark text-white font-bold flex items-center justify-center">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      {c.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{c.name}</p>
                        <span className="text-xs text-gray-400">•</span>
                        <p className="text-xs text-gray-400 whitespace-nowrap">{c.lastTime}</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{c.lastMessage}</p>
                    </div>

                    {c.unreadCount > 0 && (
                      <div className="w-6 flex justify-end">
                        <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-brand-primary text-white text-xs font-bold">
                          {c.unreadCount}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 flex flex-col h-[72vh]">
            <div className="h-16 px-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-primaryDark text-white font-bold flex items-center justify-center flex-shrink-0">
                  {activeConversation.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{activeConversation.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{activeConversation.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" className="p-2 rounded-full hover:bg-brand-primaryLighter transition-colors" title="Call">
                  <Phone className="w-5 h-5 text-brand-primary" />
                </button>
                <button type="button" className="p-2 rounded-full hover:bg-brand-primaryLighter transition-colors" title="Video">
                  <Video className="w-5 h-5 text-brand-primary" />
                </button>
                <button type="button" className="p-2 rounded-full hover:bg-brand-primaryLighter transition-colors" title="Info">
                  <Info className="w-5 h-5 text-brand-primary" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 px-4 py-4 space-y-3">
              {thread.map((m) => {
                const isMe = m.from === "me";
                return (
                  <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          isMe
                            ? "bg-gradient-to-r from-brand-primary to-brand-primaryDark text-white rounded-br-md"
                            : "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800 rounded-bl-md"
                        }`}
                      >
                        {m.text}
                      </div>
                      <span className="text-[11px] text-gray-400">{m.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3">
              <div className="flex items-end gap-2">
                <button type="button" className="p-2 rounded-full hover:bg-brand-primaryLighter transition-colors" title="Add">
                  <Plus className="w-5 h-5 text-brand-primary" />
                </button>
                <button type="button" className="p-2 rounded-full hover:bg-brand-primaryLighter transition-colors" title="Attach">
                  <ImageIcon className="w-5 h-5 text-brand-primary" />
                </button>
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-2 flex items-center gap-2 border border-gray-100 dark:border-gray-800 focus-within:bg-white dark:focus-within:bg-gray-900 focus-within:border-brand-primary/30 focus-within:ring-2 focus-within:ring-brand-primary/20">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Aa"
                    className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                  />
                  <button type="button" className="p-1.5 rounded-full hover:bg-brand-primaryLighter transition-colors" title="Emoji">
                    <Smile className="w-5 h-5 text-brand-primary" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={sendMessage}
                  className="p-2 rounded-full hover:bg-brand-primaryLighter transition-colors"
                  title="Send"
                >
                  <Send className="w-5 h-5 text-brand-primary" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}