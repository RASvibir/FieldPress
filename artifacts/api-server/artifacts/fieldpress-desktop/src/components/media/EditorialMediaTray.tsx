import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, Copy, Check, ExternalLink, Image as ImageIcon } from "lucide-react";

interface EditorialMediaTrayProps {
  storyId: string;
  headline: string;
  onInsertMarkdown: (markdown: string) => void;
}

export const EditorialMediaTray: React.FC<EditorialMediaTrayProps> = ({
  storyId,
  headline,
  onInsertMarkdown,
}) => {
  const [searchQuery, setSearchQuery] = useState(headline);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [generatedPrompts, setGeneratedPrompts] = useState<any[]>([]);
  const [promptLoading, setPromptLoading] = useState(false);
  const [format, setFormat] = useState<"article_hero" | "social_card" | "podcast_cover">("article_hero");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/stories/${storyId}/images/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      setResults(data.candidates || []);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePrompt = async () => {
    setPromptLoading(true);
    try {
      const res = await fetch(`/api/stories/${storyId}/images/generate-prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format }),
      });
      const data = await res.json();
      setGeneratedPrompts(data.prompts || []);
    } finally {
      setPromptLoading(false);
    }
  };

  const handleInsert = (item: any) => {
    const md = `\n\n![${item.description || item.title}](${item.url})\n*${item.description || item.title}*\n<small class="editorial-attribution">${item.attribution}</small>\n\n`;
    onInsertMarkdown(md);
  };

  const handleCopyPrompt = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full border-l bg-card p-4 space-y-4">
      <div className="flex items-center space-x-2 border-b pb-2">
        <ImageIcon className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-sm">Editorial Media & Prompt Engine</h3>
      </div>

      <Tabs defaultValue="archival" className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="archival" className="text-xs">
            <Search className="w-3.5 h-3.5 mr-1" /> Archival Search
          </TabsTrigger>
          <TabsTrigger value="ai_prompt" className="text-xs">
            <Sparkles className="w-3.5 h-3.5 mr-1" /> Visual Prompts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="archival" className="space-y-3 pt-2">
          <div className="flex space-x-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Wikimedia Commons..."
              className="text-xs h-8"
            />
            <Button size="sm" onClick={handleSearch} disabled={loading} className="h-8 px-3">
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>

          <div className="overflow-y-auto max-h-[500px] space-y-3 pr-1">
            {results.map((item, idx) => (
              <div key={idx} className="border rounded-md p-2.5 bg-background space-y-2 text-xs">
                <div className="relative aspect-video overflow-hidden rounded bg-muted">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="object-cover w-full h-full"
                    loading="lazy"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                    {item.license}
                  </Badge>
                  <a
                    href={item.sourcePageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground hover:text-primary flex items-center gap-0.5 text-[11px]"
                  >
                    Source <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="font-medium line-clamp-1">{item.title}</p>
                <p className="text-muted-foreground text-[11px] font-mono line-clamp-1">
                  {item.attribution}
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full text-xs h-7"
                  onClick={() => handleInsert(item)}
                >
                  Insert Image & Attribution
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ai_prompt" className="space-y-3 pt-2">
          <div className="flex items-center space-x-2">
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as any)}
              className="border rounded px-2 py-1 text-xs bg-background h-8 flex-1"
            >
              <option value="article_hero">16:9 Article Hero</option>
              <option value="social_card">4:5 Social Card</option>
              <option value="podcast_cover">1:1 Podcast Cover</option>
            </select>
            <Button size="sm" onClick={handleGeneratePrompt} disabled={promptLoading} className="h-8">
              {promptLoading ? "Generating..." : "Generate"}
            </Button>
          </div>

          <div className="overflow-y-auto max-h-[500px] space-y-3 pr-1">
            {generatedPrompts.map((p, idx) => (
              <div key={idx} className="border rounded-md p-3 bg-background space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-[10px]">
                    {p.aspectRatio} | {p.format}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-xs"
                    onClick={() => handleCopyPrompt(p.prompt, `prompt-${idx}`)}
                  >
                    {copiedId === `prompt-${idx}` ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>

                <div>
                  <p className="text-muted-foreground font-semibold text-[11px]">Prompt:</p>
                  <p className="p-2 rounded bg-muted font-mono text-[11px] leading-relaxed select-all">
                    {p.prompt}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground font-semibold text-[11px]">Negative Prompt:</p>
                  <p className="p-1.5 rounded bg-muted/60 text-[10px] text-muted-foreground font-mono">
                    {p.negativePrompt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
