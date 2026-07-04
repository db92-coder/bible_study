import MDEditor from '@uiw/react-md-editor';
import type { ChatMessage } from '../../stores/useChatStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { SourceCitations } from './SourceCitations';

export function MessageBubble({ message, streaming }: { message: ChatMessage; streaming?: boolean }) {
  const dark = useThemeStore((s) => s.dark);

  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-teal px-4 py-2.5 text-sm leading-relaxed text-white dark:bg-gold dark:text-parchment-900">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <div className="max-w-[92%] rounded-2xl rounded-bl-sm border border-parchment-300 bg-white px-4 py-3 dark:border-parchment-700 dark:bg-parchment-800">
        <div
          data-color-mode={dark ? 'dark' : 'light'}
          className="[&_.wmde-markdown]:bg-transparent [&_.wmde-markdown]:font-sans [&_.wmde-markdown]:text-sm [&_.wmde-markdown]:leading-relaxed"
        >
          <MDEditor.Markdown source={message.content || (streaming ? '…' : '')} />
        </div>
        {!streaming && <SourceCitations text={message.content} />}
      </div>
    </div>
  );
}
