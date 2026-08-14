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
import { Pencil, Plus, Trash2, AlertTriangle } from 'lucide-react';

interface HubProduct {
  id: string;
  hub_slug: string;
  name: string;
  description: string | null;
  price_eur: number | string;
  is_active: boolean;
}

const isNew = (id: string) => id.startsWith('new-');
const LARGE_CHANGE_THRESHOLD = 0.3;

const AdminHubProducts = () => {
  const [hubs, setHubs] = useState<HubProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<HubProduct | null>(null);
  const [originalPrice, setOriginalPrice] = useState<number | null>(null);
  const [priceConfirmOpen, setPriceConfirmOpen] = useState(false);
  const [priceConfirmInput, setPriceConfirmInput] = useState('');

  const fetchHubs = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('hub_products').select('*').order('hub_slug');
    if (error) toast.error('Chyba při načítání hubů: ' + error.message);
    else setHubs(data as unknown as HubProduct[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchHubs();
  }, []);

  const openEdit = (hub: HubProduct) => {
    setEditing(hub);
    setOriginalPrice(Number(hub.price_eur));
  };

  const openNew = () => {
    setEditing({
      id: `new-${Date.now()}`,
      hub_slug: '',
      name: '',
      description: '',
      price_eur: 127,
      is_active: true,
    });
    setOriginalPrice(null);
  };

  const validate = (h: HubProduct): string | null => {
    if (!h.hub_slug.trim()) return 'Klíč hubu nemůže být prázdný';
    if (!/^[a-z0-9_]+$/.test(h.hub_slug)) return 'Klíč hubu smí obsahovat jen malá písmena, číslice a podtržítko';
    if (!h.name.trim()) return 'Název nemůže být prázdný';
    const price = Number(h.price_eur);
    if (!Number.isFinite(price) || price < 5 || price > 2000) return 'Cena musí být mezi 5 € a 2000 €';
    return null;
  };

  const persist = async (h: HubProduct) => {
    const payload = {
      hub_slug: h.hub_slug,
      name: h.name,
      description: h.description || null,
      price_eur: Number(h.price_eur),
      is_active: h.is_active,
    };

    const { error } = isNew(h.id)
      ? await supabase.from('hub_products').insert(payload as never)
      : await supabase.from('hub_products').update(payload as never).eq('id', h.id);

    if (error) {
      toast.error('Chyba při ukládání: ' + error.message);
      return;
    }

    toast.success('Hub uložen — změna je živá pro nové nákupy');
    setEditing(null);
    setPriceConfirmOpen(false);
    setPriceConfirmInput('');
    fetchHubs();
  };

  const save = async () => {
    if (!editing) return;
    const err = validate(editing);
    if (err) {
      toast.error(err);
      return;
    }

    const newPrice = Number(editing.price_eur);
    const priceChanged = !isNew(editing.id) && originalPrice !== null && newPrice !== originalPrice;

    if (priceChanged) {
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

  const remove = async (hub: HubProduct) => {
    if (!confirm(`Smazat hub „${hub.name}"? Tuto akci nelze vrátit.`)) return;
    const { error } = await supabase.from('hub_products').delete().eq('id', hub.id);
    if (error) toast.error('Chyba: ' + error.message);
    else fetchHubs();
  };

  const toggleActive = async (hub: HubProduct) => {
    const { error } = await supabase
      .from('hub_products')
      .update({ is_active: !hub.is_active } as never)
      .eq('id', hub.id);
    if (error) toast.error('Chyba: ' + error.message);
    else fetchHubs();
  };

  const setField = <K extends keyof HubProduct>(key: K, value: HubProduct[K]) =>
    setEditing((prev) => (prev ? { ...prev, [key]: value } : prev));

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
          <h2 className="text-2xl font-serif font-semibold">Doplňkové huby (jednorázový nákup)</h2>
          <p className="text-sm text-muted-foreground">
            The Transformed Self a Endometriosis Management Hub, kupované na /checkout?product=hub.
            Cena zde je částka, kterou skutečně strhává Stripe.
          </p>
        </div>
        <Button size="sm" onClick={openNew}>
          <Plus className="h-4 w-4 mr-1" /> Nový hub
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Načítám...</p>
      ) : (
        <div className="space-y-3">
          {hubs.map((hub) => (
            <Card key={hub.id} className={hub.is_active ? '' : 'opacity-60'}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold">{hub.name}</span>
                      <Badge variant="outline">€{Number(hub.price_eur)}</Badge>
                      {!hub.is_active && <Badge variant="secondary">Neaktivní</Badge>}
                    </div>
                    <code className="text-xs text-muted-foreground">{hub.hub_slug}</code>
                    {hub.description && (
                      <p className="text-xs text-muted-foreground mt-1">{hub.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Switch checked={hub.is_active} onCheckedChange={() => toggleActive(hub)} />
                    <Button size="sm" variant="ghost" onClick={() => openEdit(hub)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(hub)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing && isNew(editing.id) ? 'Nový hub' : 'Upravit hub'}</DialogTitle>
          </DialogHeader>

          {editing && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Klíč hubu (hub_slug)</Label>
                <Input
                  value={editing.hub_slug}
                  disabled={!isNew(editing.id)}
                  onChange={(e) => setField('hub_slug', e.target.value.trim())}
                  placeholder="transformed_self"
                />
                <p className="text-xs text-muted-foreground">
                  {isNew(editing.id)
                    ? 'Jen malá písmena, číslice a podtržítko. Po uložení už nejde změnit.'
                    : 'Nelze změnit — je propojen s platební bránou (Stripe checkout) a odkazy na /checkout?hub=...'}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Název</Label>
                <Input value={editing.name} onChange={(e) => setField('name', e.target.value)} />
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
                <p className="text-xs text-muted-foreground flex items-start gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-gold flex-shrink-0 mt-0.5" />
                  Jde o jednorázovou platbu — na rozdíl od členství se změna projeví okamžitě u
                  každého dalšího nákupu, žádní stávající klienti tím ale dotčeni nejsou.
                </p>
              </div>

              <label className="flex items-center gap-2 text-sm border-t pt-4">
                <Switch checked={editing.is_active} onCheckedChange={(v) => setField('is_active', v)} />
                Aktivní (nabízet k prodeji)
              </label>

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
              Cena hubu <strong>{editing?.name}</strong> se mění z <strong>€{originalPrice}</strong>{' '}
              na <strong>€{newPriceForConfirm}</strong>.
            </p>
            {isLargeChange && (
              <p className="text-sm text-destructive font-medium flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                Jde o změnu o víc než 30 %. Zkontrolujte prosím, že jde o záměr.
              </p>
            )}
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

export default AdminHubProducts;
