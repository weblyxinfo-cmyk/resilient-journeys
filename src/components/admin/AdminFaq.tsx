import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface FaqRow {
  id: string;
  group_key: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
}

// Only pages that actually render a FAQ block today. Add an entry here (and
// wire the page to useFaqItems) before offering a new group in the admin.
const GROUPS: { key: string; label: string }[] = [
  { key: 'membership', label: 'Membership (/membership, /membership2)' },
  { key: 'hubs', label: 'Resilient Hubs (/resilient-hubs)' },
];

const isNew = (id: string) => id.startsWith('new-');

const AdminFaq = () => {
  const [items, setItems] = useState<FaqRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FaqRow | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('faq_items')
      .select('*')
      .order('group_key')
      .order('sort_order');

    if (error) toast.error('Error loading FAQ: ' + error.message);
    else setItems(data as unknown as FaqRow[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const save = async () => {
    if (!editing) return;
    if (!editing.question.trim() || !editing.answer.trim()) {
      toast.error('Question and answer cannot be empty');
      return;
    }

    const { error } = isNew(editing.id)
      ? await supabase.from('faq_items').insert({
          group_key: editing.group_key,
          question: editing.question,
          answer: editing.answer,
          sort_order: editing.sort_order,
          is_active: editing.is_active,
        } as never)
      : await supabase
          .from('faq_items')
          .update({
            question: editing.question,
            answer: editing.answer,
            is_active: editing.is_active,
          } as never)
          .eq('id', editing.id);

    if (error) {
      toast.error('Error saving: ' + error.message);
      return;
    }

    toast.success('FAQ saved — changes are live');
    setEditing(null);
    fetchItems();
  };

  const remove = async (item: FaqRow) => {
    if (!confirm(`Delete "${item.question}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('faq_items').delete().eq('id', item.id);
    if (error) toast.error('Error: ' + error.message);
    else fetchItems();
  };

  const toggleActive = async (item: FaqRow) => {
    const { error } = await supabase
      .from('faq_items')
      .update({ is_active: !item.is_active } as never)
      .eq('id', item.id);
    if (error) toast.error('Error: ' + error.message);
    else fetchItems();
  };

  // Swaps sort_order with the neighbour rather than renumbering the whole
  // group, same pattern as AdminBookingCards.
  const move = async (item: FaqRow, group: FaqRow[], direction: -1 | 1) => {
    const i = group.findIndex((g) => g.id === item.id);
    const j = i + direction;
    if (j < 0 || j >= group.length) return;
    const a = group[i];
    const b = group[j];
    await supabase.from('faq_items').update({ sort_order: b.sort_order } as never).eq('id', a.id);
    await supabase.from('faq_items').update({ sort_order: a.sort_order } as never).eq('id', b.id);
    fetchItems();
  };

  const addNew = (groupKey: string, group: FaqRow[]) => {
    const nextSort = group.length ? Math.max(...group.map((g) => g.sort_order)) + 1 : 0;
    setEditing({
      id: `new-${Date.now()}`,
      group_key: groupKey,
      question: '',
      answer: '',
      sort_order: nextSort,
      is_active: true,
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-serif font-semibold">FAQ</h2>
        <p className="text-sm text-muted-foreground">
          Frequently asked questions shown on the Membership and Resilient Hubs pages.
        </p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        GROUPS.map(({ key, label }) => {
          const group = items.filter((i) => i.group_key === key);
          return (
            <div key={key} className="space-y-3">
              <h3 className="text-lg font-serif font-semibold">{label}</h3>
              {group.map((item, i) => (
                <Card key={item.id} className={item.is_active ? '' : 'opacity-60'}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold">{item.question}</p>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.answer}</p>
                        {!item.is_active && (
                          <Badge variant="secondary" className="mt-2">Hidden</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => move(item, group, -1)} disabled={i === 0}>
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => move(item, group, 1)}
                          disabled={i === group.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Switch checked={item.is_active} onCheckedChange={() => toggleActive(item)} />
                        <Button size="sm" variant="ghost" onClick={() => setEditing(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => remove(item)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button size="sm" variant="outline" onClick={() => addNew(key, group)}>
                <Plus className="h-4 w-4 mr-1" /> Add FAQ
              </Button>
            </div>
          );
        })
      )}

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing && isNew(editing.id) ? 'New FAQ' : 'Edit FAQ'}</DialogTitle>
          </DialogHeader>

          {editing && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Question</Label>
                <Textarea
                  rows={2}
                  value={editing.question}
                  onChange={(e) => setEditing({ ...editing, question: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Answer</Label>
                <Textarea
                  rows={5}
                  value={editing.answer}
                  onChange={(e) => setEditing({ ...editing, answer: e.target.value })}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={editing.is_active}
                  onCheckedChange={(v) => setEditing({ ...editing, is_active: v })}
                />
                Visible on the site
              </label>
              <div className="flex gap-2 pt-2">
                <Button className="bg-gold hover:bg-gold-dark flex-1" onClick={save}>
                  Save
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

export default AdminFaq;
