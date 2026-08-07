import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface ExtraSection {
  heading?: string;
  intro?: string;
  features?: string[];
  outro?: string;
}

interface BookingCard {
  id: string;
  card_key: string;
  booking_type: string | null;
  title: string;
  badge: string | null;
  image: string | null;
  duration_minutes: number;
  duration_label: string | null;
  price_eur: number | string;
  price_note: string | null;
  description: string;
  features_heading: string | null;
  features: string[];
  extra_sections: ExtraSection[];
  note: string | null;
  contact_heading: string | null;
  phone: string | null;
  email: string | null;
  valid_until: string | null;
  highlight: boolean;
  is_active: boolean;
  sort_order: number;
}

const asArray = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

const AdminBookingCards = () => {
  const [cards, setCards] = useState<BookingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<BookingCard | null>(null);

  const fetchCards = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('booking_cards')
      .select('*')
      .order('sort_order');

    if (error) {
      toast.error('Error loading cards: ' + error.message);
    } else {
      setCards(
        (data as unknown as BookingCard[]).map((c) => ({
          ...c,
          features: asArray<string>(c.features),
          extra_sections: asArray<ExtraSection>(c.extra_sections),
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const save = async () => {
    if (!editing) return;

    if (!editing.title.trim()) {
      toast.error('Title cannot be empty');
      return;
    }
    const price = Number(editing.price_eur);
    if (!Number.isFinite(price) || price < 0) {
      toast.error('Price must be a number of 0 or more');
      return;
    }
    if (!editing.duration_minutes || editing.duration_minutes <= 0) {
      toast.error('Duration must be more than 0 minutes');
      return;
    }

    const { error } = await supabase
      .from('booking_cards')
      .update({
        title: editing.title,
        badge: editing.badge || null,
        image: editing.image || null,
        duration_minutes: editing.duration_minutes,
        duration_label: editing.duration_label || null,
        price_eur: price,
        price_note: editing.price_note || null,
        description: editing.description,
        features_heading: editing.features_heading || null,
        // Drop rows the admin left blank rather than rendering empty bullets.
        features: editing.features.filter((f) => f.trim()),
        extra_sections: editing.extra_sections.map((s) => ({
          ...s,
          features: (s.features || []).filter((f) => f.trim()),
        })),
        note: editing.note || null,
        contact_heading: editing.contact_heading || null,
        phone: editing.phone || null,
        email: editing.email || null,
        valid_until: editing.valid_until || null,
        highlight: editing.highlight,
        is_active: editing.is_active,
        sort_order: editing.sort_order,
      } as never)
      .eq('id', editing.id);

    if (error) {
      toast.error('Error saving: ' + error.message);
      return;
    }

    toast.success('Card saved — changes are live on /booking and used for payment');
    setEditing(null);
    fetchCards();
  };

  const toggleActive = async (card: BookingCard) => {
    const { error } = await supabase
      .from('booking_cards')
      .update({ is_active: !card.is_active } as never)
      .eq('id', card.id);

    if (error) toast.error('Error: ' + error.message);
    else fetchCards();
  };

  const move = async (card: BookingCard, direction: -1 | 1) => {
    const ordered = [...cards];
    const i = ordered.findIndex((c) => c.id === card.id);
    const j = i + direction;
    if (j < 0 || j >= ordered.length) return;

    // Swap the two sort_order values rather than renumbering everything.
    const a = ordered[i];
    const b = ordered[j];
    await supabase.from('booking_cards').update({ sort_order: b.sort_order } as never).eq('id', a.id);
    await supabase.from('booking_cards').update({ sort_order: a.sort_order } as never).eq('id', b.id);
    fetchCards();
  };

  const setField = <K extends keyof BookingCard>(key: K, value: BookingCard[K]) =>
    setEditing((prev) => (prev ? { ...prev, [key]: value } : prev));

  const setFeature = (index: number, value: string) =>
    setEditing((prev) => {
      if (!prev) return prev;
      const features = [...prev.features];
      features[index] = value;
      return { ...prev, features };
    });

  const setSection = (index: number, patch: Partial<ExtraSection>) =>
    setEditing((prev) => {
      if (!prev) return prev;
      const extra_sections = [...prev.extra_sections];
      extra_sections[index] = { ...extra_sections[index], ...patch };
      return { ...prev, extra_sections };
    });

  const setSectionFeature = (si: number, fi: number, value: string) =>
    setEditing((prev) => {
      if (!prev) return prev;
      const extra_sections = [...prev.extra_sections];
      const features = [...(extra_sections[si].features || [])];
      features[fi] = value;
      extra_sections[si] = { ...extra_sections[si], features };
      return { ...prev, extra_sections };
    });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-semibold">Booking Cards</h2>
        <p className="text-sm text-muted-foreground">
          The sessions offered on /booking. Price and duration here are what the client is
          charged — Stripe reads these values, so a change takes effect immediately.
        </p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="space-y-3">
          {cards.map((card, i) => (
            <Card key={card.id} className={card.is_active ? '' : 'opacity-60'}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold">{card.title}</span>
                      <Badge variant="outline">€{Number(card.price_eur)}</Badge>
                      <Badge variant="outline">{card.duration_minutes} min</Badge>
                      {card.highlight && <Badge className="bg-gold">Highlighted</Badge>}
                      {!card.is_active && <Badge variant="secondary">Hidden</Badge>}
                      {card.valid_until && (
                        <Badge variant="secondary">Until {card.valid_until}</Badge>
                      )}
                    </div>
                    <code className="text-xs text-muted-foreground">{card.card_key}</code>
                    {card.booking_type && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Booked and charged as: <code>{card.booking_type}</code>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => move(card, -1)} disabled={i === 0}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => move(card, 1)}
                      disabled={i === cards.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Switch
                      checked={card.is_active}
                      onCheckedChange={() => toggleActive(card)}
                    />
                    <Button size="sm" variant="ghost" onClick={() => setEditing(card)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit booking card</DialogTitle>
          </DialogHeader>

          {editing && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={editing.title} onChange={(e) => setField('title', e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Badge (small label above the title)</Label>
                <Input
                  value={editing.badge || ''}
                  onChange={(e) => setField('badge', e.target.value)}
                  placeholder="e.g. Special Welcome Offer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (EUR)</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={editing.price_eur}
                    onChange={(e) => setField('price_eur', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">This is the amount charged.</p>
                </div>
                <div className="space-y-2">
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={editing.duration_minutes}
                    onChange={(e) => setField('duration_minutes', Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Also sets how long the calendar blocks.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price note</Label>
                  <Input
                    value={editing.price_note || ''}
                    onChange={(e) => setField('price_note', e.target.value)}
                    placeholder="e.g. €79 per session"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration label</Label>
                  <Input
                    value={editing.duration_label || ''}
                    onChange={(e) => setField('duration_label', e.target.value)}
                    placeholder="e.g. 3 × 60 min sessions"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  rows={5}
                  value={editing.description}
                  onChange={(e) => setField('description', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Blank lines create paragraphs on the card.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Bullet list heading</Label>
                <Input
                  value={editing.features_heading || ''}
                  onChange={(e) => setField('features_heading', e.target.value)}
                  placeholder="e.g. This session may help you:"
                />
              </div>

              <div className="space-y-2">
                <Label>Bullet points</Label>
                {editing.features.map((f, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={f} onChange={(e) => setFeature(i, e.target.value)} />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setField('features', editing.features.filter((_, x) => x !== i))
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setField('features', [...editing.features, ''])}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add bullet
                </Button>
              </div>

              <div className="space-y-3 border-t pt-4">
                <Label>Extra sections</Label>
                {editing.extra_sections.map((s, si) => (
                  <Card key={si} className="bg-muted/40">
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Section {si + 1}</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setField(
                              'extra_sections',
                              editing.extra_sections.filter((_, x) => x !== si)
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>

                      <Input
                        placeholder="Heading"
                        value={s.heading || ''}
                        onChange={(e) => setSection(si, { heading: e.target.value })}
                      />
                      <Textarea
                        rows={2}
                        placeholder="Intro text"
                        value={s.intro || ''}
                        onChange={(e) => setSection(si, { intro: e.target.value })}
                      />

                      {(s.features || []).map((f, fi) => (
                        <div key={fi} className="flex gap-2">
                          <Input
                            value={f}
                            onChange={(e) => setSectionFeature(si, fi, e.target.value)}
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setSection(si, {
                                features: (s.features || []).filter((_, x) => x !== fi),
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setSection(si, { features: [...(s.features || []), ''] })}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add bullet
                      </Button>

                      <Textarea
                        rows={2}
                        placeholder="Closing text"
                        value={s.outro || ''}
                        onChange={(e) => setSection(si, { outro: e.target.value })}
                      />
                    </CardContent>
                  </Card>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setField('extra_sections', [...editing.extra_sections, { features: [] }])
                  }
                >
                  <Plus className="h-4 w-4 mr-1" /> Add section
                </Button>
              </div>

              <div className="space-y-2 border-t pt-4">
                <Label>Note under the bullets</Label>
                <Textarea
                  rows={3}
                  value={editing.note || ''}
                  onChange={(e) => setField('note', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Contact heading</Label>
                  <Input
                    value={editing.contact_heading || ''}
                    onChange={(e) => setField('contact_heading', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={editing.phone || ''}
                    onChange={(e) => setField('phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={editing.email || ''}
                    onChange={(e) => setField('email', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Image path</Label>
                  <Input
                    value={editing.image || ''}
                    onChange={(e) => setField('image', e.target.value)}
                    placeholder="/booking/example.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Available until</Label>
                  <Input
                    type="date"
                    value={editing.valid_until || ''}
                    onChange={(e) => setField('valid_until', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty for no end date. After this day the card hides itself and
                    bookings are refused.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 border-t pt-4">
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={editing.highlight}
                    onCheckedChange={(v) => setField('highlight', v)}
                  />
                  Highlight (full width, gold ring)
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={editing.is_active}
                    onCheckedChange={(v) => setField('is_active', v)}
                  />
                  Visible on the site
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <Button className="bg-gold hover:bg-gold-dark flex-1" onClick={save}>
                  Save changes
                </Button>
                <Button variant="outline" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBookingCards;
