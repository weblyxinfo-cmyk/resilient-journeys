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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2, ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react';

interface MembershipTier {
  id: string;
  tier_key: string;
  name: string;
  subtitle: string | null;
  description: string | null;
  price_eur: number | string;
  billing_interval: 'month' | 'year';
  membership_type: 'basic' | 'premium';
  period_label: string | null;
  button_text: string | null;
  badge: string | null;
  quote: string | null;
  savings_note: string | null;
  features: string[];
  ideal_for: string[];
  highlighted: boolean;
  hidden: boolean;
  is_active: boolean;
  sort_order: number;
}

const asArray = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const isNew = (id: string) => id.startsWith('new-');

// A change of more than 30% in either direction gets an extra warning in the
// confirmation dialog, on top of the mandatory "type the new price" step.
const LARGE_CHANGE_THRESHOLD = 0.3;

const AdminMembershipTiers = () => {
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<MembershipTier | null>(null);
  // The price_eur the tier had when the edit dialog opened — used to decide
  // whether a confirmation step is needed and what "before" to show in it.
  const [originalPrice, setOriginalPrice] = useState<number | null>(null);
  const [priceConfirmOpen, setPriceConfirmOpen] = useState(false);
  const [priceConfirmInput, setPriceConfirmInput] = useState('');

  const fetchTiers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('membership_tiers')
      .select('*')
      .order('sort_order');

    if (error) {
      toast.error('Chyba při načítání tarifů: ' + error.message);
    } else {
      setTiers(
        (data as unknown as MembershipTier[]).map((t) => ({
          ...t,
          features: asArray<string>(t.features),
          ideal_for: asArray<string>(t.ideal_for),
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTiers();
  }, []);

  const openEdit = (tier: MembershipTier) => {
    setEditing(tier);
    setOriginalPrice(Number(tier.price_eur));
  };

  const openNew = () => {
    const nextSort = tiers.length ? Math.max(...tiers.map((t) => t.sort_order)) + 10 : 10;
    const blank: MembershipTier = {
      id: `new-${Date.now()}`,
      tier_key: '',
      name: '',
      subtitle: '',
      description: '',
      price_eur: 37,
      billing_interval: 'month',
      membership_type: 'basic',
      period_label: '/month',
      button_text: '',
      badge: '',
      quote: '',
      savings_note: '',
      features: [],
      ideal_for: [],
      highlighted: false,
      hidden: true,
      is_active: true,
      sort_order: nextSort,
    };
    setEditing(blank);
    setOriginalPrice(null);
  };

  const validate = (t: MembershipTier): string | null => {
    if (!t.tier_key.trim()) return 'Klíč tarifu nemůže být prázdný';
    if (!/^[a-z0-9_]+$/.test(t.tier_key)) return 'Klíč tarifu smí obsahovat jen malá písmena, číslice a podtržítko';
    if (!t.name.trim()) return 'Název nemůže být prázdný';
    const price = Number(t.price_eur);
    if (!Number.isFinite(price) || price < 5 || price > 2000) {
      return 'Cena musí být mezi 5 € a 2000 €';
    }
    return null;
  };

  const persist = async (t: MembershipTier) => {
    const price = Number(t.price_eur);
    const payload = {
      tier_key: t.tier_key,
      name: t.name,
      subtitle: t.subtitle || null,
      description: t.description || null,
      price_eur: price,
      billing_interval: t.billing_interval,
      membership_type: t.membership_type,
      period_label: t.period_label || null,
      button_text: t.button_text || null,
      badge: t.badge || null,
      quote: t.quote || null,
      savings_note: t.savings_note || null,
      features: t.features.filter((f) => f.trim()),
      ideal_for: t.ideal_for.filter((f) => f.trim()),
      highlighted: t.highlighted,
      hidden: t.hidden,
      is_active: t.is_active,
      sort_order: t.sort_order,
    };

    const { error } = isNew(t.id)
      ? await supabase.from('membership_tiers').insert(payload as never)
      : await supabase.from('membership_tiers').update(payload as never).eq('id', t.id);

    if (error) {
      toast.error('Chyba při ukládání: ' + error.message);
      return false;
    }

    toast.success('Tarif uložen — změna je živá, nová předplatná se řídí novou cenou');
    setEditing(null);
    setPriceConfirmOpen(false);
    setPriceConfirmInput('');
    fetchTiers();
    return true;
  };

  const save = async () => {
    if (!editing) return;
    const validationError = validate(editing);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const newPrice = Number(editing.price_eur);
    const priceChanged = !isNew(editing.id) && originalPrice !== null && newPrice !== originalPrice;

    if (priceChanged) {
      // Existing tier, price actually changed — require the extra
      // type-to-confirm step below rather than saving immediately.
      setPriceConfirmInput('');
      setPriceConfirmOpen(true);
      return;
    }

    await persist(editing);
  };

  const confirmPriceChange = async () => {
    if (!editing) return;
    const newPrice = Number(editing.price_eur);
    if (priceConfirmInput.trim() !== String(newPrice)) {
      toast.error('Opsaná částka neodpovídá nové ceně');
      return;
    }
    await persist(editing);
  };

  const remove = async (tier: MembershipTier) => {
    if (!confirm(`Smazat tarif „${tier.name}"? Nová předplatná s tímto klíčem přestanou fungovat. Tuto akci nelze vrátit.`)) return;
    const { error } = await supabase.from('membership_tiers').delete().eq('id', tier.id);
    if (error) toast.error('Chyba: ' + error.message);
    else fetchTiers();
  };

  const toggleActive = async (tier: MembershipTier) => {
    const { error } = await supabase
      .from('membership_tiers')
      .update({ is_active: !tier.is_active } as never)
      .eq('id', tier.id);
    if (error) toast.error('Chyba: ' + error.message);
    else fetchTiers();
  };

  const move = async (tier: MembershipTier, direction: -1 | 1) => {
    const ordered = [...tiers];
    const i = ordered.findIndex((t) => t.id === tier.id);
    const j = i + direction;
    if (j < 0 || j >= ordered.length) return;
    const a = ordered[i];
    const b = ordered[j];
    await supabase.from('membership_tiers').update({ sort_order: b.sort_order } as never).eq('id', a.id);
    await supabase.from('membership_tiers').update({ sort_order: a.sort_order } as never).eq('id', b.id);
    fetchTiers();
  };

  const setField = <K extends keyof MembershipTier>(key: K, value: MembershipTier[K]) =>
    setEditing((prev) => (prev ? { ...prev, [key]: value } : prev));

  const setListItem = (key: 'features' | 'ideal_for', index: number, value: string) =>
    setEditing((prev) => {
      if (!prev) return prev;
      const list = [...prev[key]];
      list[index] = value;
      return { ...prev, [key]: list };
    });

  const addListItem = (key: 'features' | 'ideal_for') =>
    setEditing((prev) => (prev ? { ...prev, [key]: [...prev[key], ''] } : prev));

  const removeListItem = (key: 'features' | 'ideal_for', index: number) =>
    setEditing((prev) =>
      prev ? { ...prev, [key]: prev[key].filter((_, i) => i !== index) } : prev
    );

  const newPriceForConfirm = editing ? Number(editing.price_eur) : 0;
  const changePercent =
    originalPrice && originalPrice > 0
      ? Math.abs((newPriceForConfirm - originalPrice) / originalPrice)
      : 0;
  const isLargeChange = changePercent > LARGE_CHANGE_THRESHOLD;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-semibold">Členské tarify</h2>
          <p className="text-sm text-muted-foreground">
            Karty na strákách /pricing, /membership a /membership2. Cena zde je částka, kterou
            skutečně strhává Stripe.
          </p>
        </div>
        <Button size="sm" onClick={openNew}>
          <Plus className="h-4 w-4 mr-1" /> Nový tarif
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Načítám...</p>
      ) : (
        <div className="space-y-3">
          {tiers.map((tier, i) => (
            <Card key={tier.id} className={tier.is_active ? '' : 'opacity-60'}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold">{tier.name}</span>
                      <Badge variant="outline">€{Number(tier.price_eur)} {tier.period_label}</Badge>
                      <Badge variant="outline">{tier.membership_type}</Badge>
                      {tier.highlighted && <Badge className="bg-gold">Zvýrazněno</Badge>}
                      {tier.hidden && <Badge variant="secondary">Skryto na webu</Badge>}
                      {!tier.is_active && <Badge variant="secondary">Neaktivní</Badge>}
                    </div>
                    <code className="text-xs text-muted-foreground">{tier.tier_key}</code>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => move(tier, -1)} disabled={i === 0}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => move(tier, 1)}
                      disabled={i === tiers.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Switch checked={tier.is_active} onCheckedChange={() => toggleActive(tier)} />
                    <Button size="sm" variant="ghost" onClick={() => openEdit(tier)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(tier)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit / new dialog */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing && isNew(editing.id) ? 'Nový tarif' : 'Upravit tarif'}</DialogTitle>
          </DialogHeader>

          {editing && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Klíč tarifu (tier_key)</Label>
                <Input
                  value={editing.tier_key}
                  disabled={!isNew(editing.id)}
                  onChange={(e) => setField('tier_key', e.target.value.trim())}
                  placeholder="basic_monthly"
                />
                <p className="text-xs text-muted-foreground">
                  {isNew(editing.id)
                    ? 'Jen malá písmena, číslice a podtržítko. Po uložení už nejde změnit.'
                    : 'Nelze změnit — je propojen s platební bránou (Stripe checkout).'}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Název</Label>
                <Input value={editing.name} onChange={(e) => setField('name', e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Podnadpis</Label>
                <Input
                  value={editing.subtitle || ''}
                  onChange={(e) => setField('subtitle', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Popis</Label>
                <Textarea
                  rows={3}
                  value={editing.description || ''}
                  onChange={(e) => setField('description', e.target.value)}
                />
              </div>

              <div className="rounded-lg border border-gold/40 bg-gold/5 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cena (EUR)</Label>
                    <Input
                      type="number"
                      min={5}
                      max={2000}
                      step="0.01"
                      value={editing.price_eur}
                      onChange={(e) => setField('price_eur', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Popisek období</Label>
                    <Input
                      value={editing.period_label || ''}
                      onChange={(e) => setField('period_label', e.target.value)}
                      placeholder="/month"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground flex items-start gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-gold flex-shrink-0 mt-0.5" />
                  Změna platí <strong>jen pro nová předplatná</strong>. Stávající klienti platí dál
                  původní částku — Stripe si ji pamatuje u jejich aktivního předplatného.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fakturační interval</Label>
                  <Select
                    value={editing.billing_interval}
                    onValueChange={(v) => setField('billing_interval', v as MembershipTier['billing_interval'])}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Měsíčně</SelectItem>
                      <SelectItem value="year">Ročně</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Typ členství</Label>
                  <Select
                    value={editing.membership_type}
                    onValueChange={(v) => setField('membership_type', v as MembershipTier['membership_type'])}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Text tlačítka</Label>
                  <Input
                    value={editing.button_text || ''}
                    onChange={(e) => setField('button_text', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Odznak (badge)</Label>
                  <Input
                    value={editing.badge || ''}
                    onChange={(e) => setField('badge', e.target.value)}
                    placeholder="Most Popular"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Citát</Label>
                <Textarea
                  rows={2}
                  value={editing.quote || ''}
                  onChange={(e) => setField('quote', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Poznámka k úspoře (jen u ročních tarifů)</Label>
                <Input
                  value={editing.savings_note || ''}
                  onChange={(e) => setField('savings_note', e.target.value)}
                  placeholder="Save €74 compared to monthly"
                />
              </div>

              <div className="space-y-2">
                <Label>Výhody (odrážky)</Label>
                {editing.features.map((f, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={f} onChange={(e) => setListItem('features', i, e.target.value)} />
                    <Button type="button" size="sm" variant="ghost" onClick={() => removeListItem('features', i)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button type="button" size="sm" variant="outline" onClick={() => addListItem('features')}>
                  <Plus className="h-4 w-4 mr-1" /> Přidat odrážku
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Pro koho je to ideální (odrážky)</Label>
                {editing.ideal_for.map((f, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={f} onChange={(e) => setListItem('ideal_for', i, e.target.value)} />
                    <Button type="button" size="sm" variant="ghost" onClick={() => removeListItem('ideal_for', i)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button type="button" size="sm" variant="outline" onClick={() => addListItem('ideal_for')}>
                  <Plus className="h-4 w-4 mr-1" /> Přidat odrážku
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-6 border-t pt-4">
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={editing.highlighted} onCheckedChange={(v) => setField('highlighted', v)} />
                  Zvýrazněná karta
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={!editing.hidden} onCheckedChange={(v) => setField('hidden', !v)} />
                  Zobrazit na webu
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={editing.is_active} onCheckedChange={(v) => setField('is_active', v)} />
                  Aktivní (nabízet k prodeji)
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <Button className="bg-gold hover:bg-gold-dark flex-1" onClick={save}>
                  Uložit
                </Button>
                <Button variant="outline" onClick={() => setEditing(null)}>
                  Zrušit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Price change confirmation */}
      <Dialog open={priceConfirmOpen} onOpenChange={(open) => !open && setPriceConfirmOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Potvrdit změnu ceny
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm">
              Cena tarifu <strong>{editing?.name}</strong> se mění z{' '}
              <strong>€{originalPrice}</strong> na <strong>€{newPriceForConfirm}</strong>.
            </p>
            {isLargeChange && (
              <p className="text-sm text-destructive font-medium flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                Jde o změnu o víc než 30 %. Zkontrolujte prosím, že jde o záměr.
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Změna platí jen pro nová předplatná. Stávající klienti platí dál původní částku
              €{originalPrice} — Stripe si ji pamatuje u jejich aktivního předplatného.
            </p>
            <div className="space-y-2">
              <Label>Pro potvrzení opište novou cenu ({newPriceForConfirm}):</Label>
              <Input
                value={priceConfirmInput}
                onChange={(e) => setPriceConfirmInput(e.target.value)}
                placeholder={String(newPriceForConfirm)}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground flex-1"
                onClick={confirmPriceChange}
                disabled={priceConfirmInput.trim() !== String(newPriceForConfirm)}
              >
                Potvrdit novou cenu
              </Button>
              <Button variant="outline" onClick={() => setPriceConfirmOpen(false)}>
                Zrušit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMembershipTiers;
