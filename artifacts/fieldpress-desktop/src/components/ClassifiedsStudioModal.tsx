import React, { useState } from 'react';
import { X, Tag, DollarSign, Repeat, Camera, Sparkles, CheckCircle2, Shield } from 'lucide-react';

export interface ClassifiedsStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onListingCreated: () => void;
}

export const ClassifiedsStudioModal: React.FC<ClassifiedsStudioModalProps> = ({
  isOpen,
  onClose,
  onListingCreated,
}) => {
  const [dealType, setDealType] = useState<'cash' | 'trade' | 'free'>('cash');
  const [category, setCategory] = useState<'gigs' | 'gear' | 'barter' | 'space' | 'notices'>('gear');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('50');
  const [condition, setCondition] = useState('Field Tested (Good)');
  const [corridor, setCorridor] = useState('Danville Junction Spur');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/classifieds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          category,
          corridorSector: corridor,
          priceDollars: dealType === 'cash' ? price : 0,
          isTrade: dealType === 'trade',
          description: `[Condition: ${condition}]\n\n${description.trim()}`,
          photoUrl: photoUrl || undefined,
        }),
      });

      if (res.ok) {
        onListingCreated();
        onClose();
      } else {
        alert('Could not publish classified listing.');
      }
    } catch {
      alert('Network error publishing listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10006] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-mono text-xs text-foreground">
      <div className="w-full max-w-2xl rounded-2xl border-2 border-border bg-card p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center space-x-2">
            <Tag className="h-4 w-4 text-amber-500" />
            <h3 className="font-bold text-sm uppercase text-foreground font-serif">
              Classified Ad Studio
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">
              Direct Peer Market
            </span>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded hover:bg-muted text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 1: Category & Deal Type Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-muted/40 border border-border">
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1.5">
                Market Section
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-background border border-border rounded-xl p-2 text-xs font-bold focus:outline-none"
              >
                <option value="gear">📸 Field Gear & Hardware</option>
                <option value="gigs">💼 Help Wanted & Gigs</option>
                <option value="barter">🤝 Buy, Sell & Barter</option>
                <option value="space">🏛️ Desks & Studio Space</option>
                <option value="notices">📢 Community Notices</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1.5">
                Deal Structure
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(['cash', 'trade', 'free'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setDealType(t)}
                    className={`py-1.5 px-2 rounded-lg font-bold text-[11px] capitalize border transition ${
                      dealType === t
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-background border-border text-muted-foreground'
                    }`}
                  >
                    {t === 'cash' ? '$ Fixed' : t === 'trade' ? '🤝 Trade' : '🎁 Free'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 2: Title & Price/Condition */}
          <div className="space-y-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                Ad Heading
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sony A7 III Body + 28-70mm Lens or Seeking Field Driver..."
                className="w-full bg-background border-2 border-border rounded-xl p-2.5 text-foreground text-sm font-bold font-serif focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {dealType === 'cash' && (
                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Price (USD)</label>
                  <div className="flex items-center border border-border rounded-xl px-2.5 bg-background">
                    <span className="text-muted-foreground font-bold">$</span>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-transparent p-2 text-foreground font-bold text-xs focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl p-2 text-xs focus:outline-none"
                >
                  <option>Brand New / Sealed</option>
                  <option>Field Tested (Good)</option>
                  <option>Fair / Working Condition</option>
                  <option>For Parts / Repair</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Corridor Sector</label>
                <input
                  type="text"
                  value={corridor}
                  onChange={(e) => setCorridor(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl p-2 text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Description */}
          <div>
            <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
              Ad Description & Specifications
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Include accessories, barter preferences, pickup location, or gig requirements..."
              className="w-full bg-background border border-border rounded-xl p-3 text-xs leading-relaxed focus:outline-none focus:border-primary font-mono"
            />
          </div>

          {/* Step 4: Photo Attachment */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
            <div className="flex items-center space-x-2">
              <Camera className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {photoUrl ? '✓ Photo proof attached' : 'Add photo proof of gear/item (Optional)'}
              </span>
            </div>
            <label className="cursor-pointer px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-bold">
              <span>{photoUrl ? 'Change Photo' : 'Upload Photo'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border bg-card text-foreground font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider shadow-sm"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Classified Ad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassifiedsStudioModal;
