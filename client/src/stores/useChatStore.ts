import { create } from 'zustand';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatState {
  open: boolean;
  messages: ChatMessage[];
  streaming: boolean;
  setOpen: (open: boolean) => void;
  setStreaming: (streaming: boolean) => void;
  append: (message: ChatMessage) => void;
  appendToLast: (delta: string) => void;
  clear: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  open: false,
  messages: [],
  streaming: false,
  setOpen: (open) => set({ open }),
  setStreaming: (streaming) => set({ streaming }),
  append: (message) => set((s) => ({ messages: [...s.messages, message] })),
  appendToLast: (delta) =>
    set((s) => {
      const messages = [...s.messages];
      const last = messages[messages.length - 1];
      if (last?.role === 'assistant') {
        messages[messages.length - 1] = { ...last, content: last.content + delta };
      }
      return { messages };
    }),
  clear: () => set({ messages: [] }),
}));
