import React, { useState } from 'react';
import { X, Share2, Copy, Check, ExternalLink } from 'lucide-react';

export interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  summary: string;
  url: string;
  type: 'classified' | 'pressie';
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  title,
  summary,
  url,
  type,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const fullUrl = url.startsWith('http') ? url : `https://fieldpress.studio${url}`;
  const hashtag = type === 'classified' ? '#FieldPressClassifieds #FieldPress' : '#FieldPress #GrassrootsNews';
  const socialPostText = `📰 ${title}\n\n${summary.slice(0, 140)}...\n\n${fullUrl}\n\n${hashtag}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(socialPostText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `${title} — ${summary.slice(0, 120)}`,
          url: fullUrl,
        });
      } catch {}
    } else {
      copyToClipboard();
    }
  };

  const shareLinks = [
    {
      name: 'X (Twitter)',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title + '\n\n' + fullUrl)}&hashtags=${type === 'classified' ? 'FieldPress,Classifieds' : 'FieldPress,Grassroots'}`,
      icon: '𝕏',
      color: 'bg-black text-white border-zinc-700',
    },
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
      icon: 'f',
      color: 'bg-[#1877f2] text-white border-[#1877f2]',
    },
    {
      name: 'LinkedIn',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`,
      icon: 'in',
      color: 'bg-[#0a66c2] text-white border-[#0a66c2]',
    },
    {
      name: 'WhatsApp',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(socialPostText)}`,
      icon: '💬',
      color: 'bg-[#25d366] text-black border-[#25d366]',
    },
  ];

  return (
    <div className="fixed inset-0 z-[10007] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono text-xs text-foreground">
      <div className="w-full max-w-md rounded-2xl border-2 border-border bg-card p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center space-x-2">
            <Share2 className="h-4 w-4 text-primary" />
            <h3 className="font-bold text-sm uppercase text-foreground font-serif">
              Share to Social Media
            </h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded hover:bg-muted text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Formatted Post Preview */}
        <div className="p-3.5 rounded-xl border border-border bg-muted/40 space-y-2">
          <div className="text-[10px] uppercase font-bold text-muted-foreground">Social Post Preview:</div>
          <p className="text-xs font-serif leading-relaxed text-foreground whitespace-pre-wrap">{socialPostText}</p>
        </div>

        {/* 1-Click Social Media Intent Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {shareLinks.map(s => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-xl border font-bold text-xs shadow-sm transition hover:opacity-90 ${s.color}`}
            >
              <span className="font-black text-sm">{s.icon}</span>
              <span>{s.name}</span>
            </a>
          ))}
        </div>

        {/* Native Mobile Share & Copy Text */}
        <div className="flex items-center space-x-2 pt-2 border-t border-border">
          <button
            type="button"
            onClick={handleNativeShare}
            className="flex-1 py-2 px-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Open Device Share</span>
          </button>

          <button
            type="button"
            onClick={copyToClipboard}
            className="py-2 px-3 rounded-xl border border-border bg-muted/60 hover:bg-muted text-foreground font-bold text-xs flex items-center space-x-1"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocialShareModal;
