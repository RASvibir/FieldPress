import React, { useState, useRef, useEffect } from 'react';

interface DirectMessage {
  id: string;
  sender_handle: string;
  content: string;
  created_at: string;
}

interface WireMessage {
  id: string;
  sender_handle: string;
  content: string;
  message_type: 'chat' | 'tip' | 'pressy_bot' | 'system';
  created_at: string;
}

interface DMConversation {
  id: string;
  recipientHandle: string;
  recipientName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export const FieldyCommunications: React.FC<{
  currentUserHandle?: string;
  onPromoteTipToDesk: (text: string, sourceHandle: string) => void;
}> = ({ currentUserHandle = 'ras.ip', onPromoteTipToDesk }) => {
  const [activeChannelType, setActiveChannelType] = useState<'bureau' | 'dm'>('bureau');
  const [activeDmRecipient, setActiveDmRecipient] = useState<string>('glitterpop');
  
  const activeReporters = [
    { handle: 'ras.ip', name: 'ras.ip (You)', isBot: false },
    { handle: 'glitterpop', name: 'glitterpop', isBot: false },
    { handle: 'jordan', name: 'jordan', isBot: false },
    { handle: 'pressy', name: 'Pressy\'O Bot', isBot: true },
  ];

  const [wireMessages, setWireMessages] = useState<WireMessage[]>([
    {
      id: 'w-1',
      sender_handle: 'glitterpop',
      content: 'Loop transit signals showing delays near State & Madison.',
      message_type: 'chat',
      created_at: '11:45 AM',
    },
    {
      id: 'w-2',
      sender_handle: 'pressy',
      content: '🤖 Pressy verified: CTA alerts confirm minor switch issue. No agency budget impact.',
      message_type: 'pressy_bot',
      created_at: '11:46 AM',
    }
  ]);
  const [inputWireText, setInputWireText] = useState('');

  const [conversations, setConversations] = useState<DMConversation[]>([
    {
      id: 'dm-1',
      recipientHandle: 'glitterpop',
      recipientName: 'Pamela (glitterpop)',
      lastMessage: 'Got the photo set from 63rd St.',
      lastMessageAt: '12:02 PM',
      unreadCount: 1,
    },
    {
      id: 'dm-2',
      recipientHandle: 'jordan',
      recipientName: 'Jordan (Chicago Loop)',
      lastMessage: 'Checking city budget line items now.',
      lastMessageAt: '10:45 AM',
      unreadCount: 0,
    },
  ]);

  const [dmThreads, setDmThreads] = useState<Record<string, DirectMessage[]>>({
    glitterpop: [
      { id: '1', sender_handle: 'glitterpop', content: 'Headed down to the junction.', created_at: '11:58 AM' },
      { id: '2', sender_handle: 'glitterpop', content: 'Got the photo set from 63rd St.', created_at: '12:02 PM' },
    ],
    jordan: [
      { id: '3', sender_handle: 'jordan', content: 'Checking city budget line items now.', created_at: '10:45 AM' },
    ],
  });

  const [inputDmText, setInputDmText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [wireMessages, dmThreads, activeChannelType, activeDmRecipient]);

  const handleSendWire = () => {
    if (!inputWireText.trim()) return;
    const isPressy = inputWireText.toLowerCase().startsWith('@pressy');
    const msg: WireMessage = {
      id: crypto.randomUUID(),
      sender_handle: currentUserHandle,
      content: inputWireText,
      message_type: 'chat',
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setWireMessages(prev => [...prev, msg]);
    const sentText = inputWireText;
    setInputWireText('');

    if (isPressy) {
      setTimeout(() => {
        setWireMessages(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            sender_handle: 'pressy',
            content: `🤖 Pressy lead check: "${sentText.replace(/@pressy/i, '').trim()}". Context corroborated across local feeds.`,
            message_type: 'pressy_bot',
            created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]);
      }, 600);
    }
  };

  const handleSendDm = () => {
    if (!inputDmText.trim()) return;
    const newMsg: DirectMessage = {
      id: crypto.randomUUID(),
      sender_handle: currentUserHandle,
      content: inputDmText,
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setDmThreads(prev => ({
      ...prev,
      [activeDmRecipient]: [...(prev[activeDmRecipient] || []), newMsg],
    }));
    setConversations(prev =>
      prev.map(c =>
        c.recipientHandle === activeDmRecipient
          ? { ...c, lastMessage: inputDmText, lastMessageAt: newMsg.created_at, unreadCount: 0 }
          : c
      )
    );
    setInputDmText('');
  };

  const startDm = (handle: string) => {
    if (handle === currentUserHandle || handle === 'pressy') return;
    setActiveDmRecipient(handle);
    setActiveChannelType('dm');
  };

  return (
    <div className="flex h-[720px] border border-zinc-800 bg-zinc-950 font-mono text-xs rounded-lg overflow-hidden my-4">
      {/* Sidebar */}
      <div className="w-64 border-r border-zinc-800 bg-zinc-900/60 flex flex-col justify-between p-3">
        <div>
          <div className="flex rounded bg-black border border-zinc-800 p-0.5 mb-4">
            <button
              type="button"
              onClick={() => setActiveChannelType('bureau')}
              className={`flex-1 py-1.5 text-center text-[11px] font-bold rounded ${
                activeChannelType === 'bureau' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              📡 Bureau Wire
            </button>
            <button
              type="button"
              onClick={() => setActiveChannelType('dm')}
              className={`flex-1 py-1.5 text-center text-[11px] font-bold rounded ${
                activeChannelType === 'dm' ? 'bg-zinc-800 text-cyan-300' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              💬 DMs
            </button>
          </div>

          {activeChannelType === 'bureau' ? (
            <div>
              <div className="text-zinc-500 font-bold uppercase tracking-wider text-[10px] mb-2">
                Active Desk Roster
              </div>
              <ul className="space-y-1.5">
                {activeReporters.map(rep => (
                  <li
                    key={rep.handle}
                    onClick={() => startDm(rep.handle)}
                    className="flex items-center justify-between p-1.5 rounded hover:bg-zinc-800/60 cursor-pointer group"
                  >
                    <div className="flex items-center space-x-2">
                      <span className={`h-2 w-2 rounded-full ${rep.isBot ? 'bg-cyan-400' : 'bg-emerald-500'}`} />
                      <span className="text-zinc-300 font-semibold">{rep.name}</span>
                    </div>
                    {!rep.isBot && rep.handle !== currentUserHandle && (
                      <span className="text-[10px] text-zinc-500 group-hover:text-cyan-400">DM →</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div>
              <div className="text-zinc-500 font-bold uppercase tracking-wider text-[10px] mb-2">
                Conversations
              </div>
              <ul className="space-y-1">
                {conversations.map(conv => (
                  <li
                    key={conv.recipientHandle}
                    onClick={() => {
                      setActiveDmRecipient(conv.recipientHandle);
                      setConversations(prev =>
                        prev.map(c => c.recipientHandle === conv.recipientHandle ? { ...c, unreadCount: 0 } : c)
                      );
                    }}
                    className={`p-2 rounded cursor-pointer border ${
                      activeDmRecipient === conv.recipientHandle
                        ? 'bg-zinc-800/80 border-cyan-700/50'
                        : 'border-transparent hover:bg-zinc-800/40'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-zinc-200">@{conv.recipientHandle}</span>
                      <span className="text-[10px] text-zinc-500">{conv.lastMessageAt}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="truncate text-[11px] text-zinc-400 max-w-[140px]">{conv.lastMessage}</p>
                      {conv.unreadCount > 0 && (
                        <span className="px-1.5 py-0.2 bg-cyan-600 text-black text-[9px] font-bold rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="text-[10px] text-zinc-500 border-t border-zinc-800 pt-2">
          Desk Auth: <span className="text-zinc-300 font-bold">@{currentUserHandle}</span>
        </div>
      </div>

      {/* Main Chat Pane */}
      <div className="flex-1 flex flex-col justify-between bg-black/50">
        {activeChannelType === 'bureau' ? (
          <>
            <div className="px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/30 flex justify-between items-center text-[11px] text-zinc-400">
              <span>📡 Frequency: <strong className="text-zinc-200">#bureau-global</strong></span>
              <span className="text-zinc-500">Summon bot with @pressy</span>
            </div>
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {wireMessages.map(msg => {
                const isBot = msg.sender_handle === 'pressy';
                return (
                  <div
                    key={msg.id}
                    className={`p-2.5 rounded border ${
                      isBot ? 'bg-cyan-950/20 border-cyan-800/60 text-cyan-200' : 'bg-zinc-900/70 border-zinc-800 text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-zinc-300">{isBot ? '🤖 ' : ''}@{msg.sender_handle}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] text-zinc-500">{msg.created_at}</span>
                        {!isBot && (
                          <button
                            type="button"
                            onClick={() => onPromoteTipToDesk(msg.content, msg.sender_handle)}
                            className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold"
                          >
                            ⚡ PUSH TO DESK
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>
            <div className="p-3 border-t border-zinc-800 bg-zinc-900/60 flex items-center space-x-2">
              <input
                type="text"
                value={inputWireText}
                onChange={e => setInputWireText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendWire()}
                placeholder="Broadcast tip to wire or '@pressy [query]'..."
                className="flex-1 bg-black border border-zinc-700 rounded px-3 py-2 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={handleSendWire}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-black font-bold rounded"
              >
                Broadcast
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/30 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="font-bold text-zinc-200">@{activeDmRecipient}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveChannelType('bureau')}
                className="text-zinc-500 hover:text-zinc-300 text-[11px]"
              >
                Switch to Wire ↗
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {(dmThreads[activeDmRecipient] || []).map(msg => {
                const isMe = msg.sender_handle === currentUserHandle;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[75%] p-2.5 rounded border ${
                      isMe ? 'bg-cyan-950/40 border-cyan-800/60 text-cyan-100' : 'bg-zinc-900/80 border-zinc-800 text-zinc-200'
                    }`}>
                      <div className="flex items-center justify-between space-x-4 mb-1 text-[10px] text-zinc-500">
                        <span className="font-bold text-zinc-400">@{msg.sender_handle}</span>
                        <span>{msg.created_at}</span>
                      </div>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                    {!isMe && (
                      <button
                        type="button"
                        onClick={() => onPromoteTipToDesk(msg.content, msg.sender_handle)}
                        className="mt-1 text-[10px] text-amber-400/80 hover:text-amber-300 underline font-semibold"
                      >
                        ⚡ Push Tip to Desk
                      </button>
                    )}
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>
            <div className="p-3 border-t border-zinc-800 bg-zinc-900/60 flex items-center space-x-2">
              <input
                type="text"
                value={inputDmText}
                onChange={e => setInputDmText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendDm()}
                placeholder={`DM to @${activeDmRecipient}...`}
                className="flex-1 bg-black border border-zinc-700 rounded px-3 py-2 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={handleSendDm}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-black font-bold rounded"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
