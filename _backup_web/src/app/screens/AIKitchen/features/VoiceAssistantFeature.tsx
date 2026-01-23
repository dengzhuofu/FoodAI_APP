import { ArrowLeft, Mic, Loader } from 'lucide-react';
import { useState } from 'react';

interface VoiceAssistantFeatureProps {
  onBack: () => void;
}

export default function VoiceAssistantFeature({ onBack }: VoiceAssistantFeatureProps) {
  const [isListening, setIsListening] = useState(false);
  const [conversation, setConversation] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);

  const startListening = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      const userMessage = '下一步怎么做？';
      const assistantMessage = '现在把切好的食材放入热油中，中火翻炒2-3分钟至变色。';
      setConversation([...conversation, { role: 'user', text: userMessage }, { role: 'assistant', text: assistantMessage }]);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-4 space-y-6">
      <div className="pt-4 flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-white/50 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl">语音烹饪助手</h1>
          <p className="text-sm text-gray-600">边做边问，实时指导</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg space-y-4">
        {conversation.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎙️</div>
            <h2 className="text-xl mb-2">语音助手已准备就绪</h2>
            <p className="text-sm text-gray-600">点击下方按钮开始提问</p>
          </div>
        ) : (
          conversation.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl ${message.role === 'user' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                {message.text}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-center">
        <button
          onClick={startListening}
          disabled={isListening}
          className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all ${
            isListening ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-br from-pink-500 to-rose-500 hover:scale-110'
          }`}
        >
          {isListening ? <Loader className="w-10 h-10 text-white animate-spin" /> : <Mic className="w-10 h-10 text-white" />}
        </button>
      </div>
    </div>
  );
}
