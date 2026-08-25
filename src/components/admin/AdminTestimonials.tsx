import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Star, Eye, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  content: string;
  avatar_url: string | null;
  rating: number;
  is_visible: boolean;
  sort_order: number;
  kind: string;
  workshop_post_id: string | null;
}

interface WorkshopOption {
  id: string;
  title: string;
}

// Sentinel used in the Select for "workshop_post_id is null" (applies to all workshops),
// since Radix Select doesn't allow an empty-string item value.
const ALL_WORKSHOPS_VALUE = 'all';

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [workshops, setWorkshops] = useState<WorkshopOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    content: '',
    avatar_url: '',
    rating: '5',
    is_visible: true,
    sort_order: '0',
    kind: 'general',
    workshop_post_id: ALL_WORKSHOPS_VALUE
  });

  useEffect(() => {
    fetchTestimonials();
    fetchWorkshops();
  }, []);

  const fetchTestimonials = async () => {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('sort_order');

    if (error) {
      toast.error('Error loading testimonials');
      return;
    }
    
    setTestimonials(data || []);
    setLoading(false);
  };

  const fetchWorkshops = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title')
      .eq('category', 'workshop')
      .order('title');

    if (error) {
      toast.error('Error loading workshops');
      return;
    }

    setWorkshops(data || []);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      content: '',
      avatar_url: '',
      rating: '5',
      is_visible: true,
      sort_order: '0',
      kind: 'general',
      workshop_post_id: ALL_WORKSHOPS_VALUE
    });
    setEditingTestimonial(null);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      role: testimonial.role || '',
      content: testimonial.content,
      avatar_url: testimonial.avatar_url || '',
      rating: testimonial.rating.toString(),
      is_visible: testimonial.is_visible,
      sort_order: testimonial.sort_order.toString(),
      kind: testimonial.kind,
      workshop_post_id: testimonial.workshop_post_id || ALL_WORKSHOPS_VALUE
    });
    setDialogOpen(true);
  };

  const handleKindChange = (kind: string) => {
    // Switching back to "general" must clear workshop_post_id in the form state too,
    // otherwise a stale workshop id could get saved if the user re-toggles to "workshop"
    // without picking again. The DB CHECK (kind='workshop' OR workshop_post_id IS NULL)
    // is enforced again on submit as a safety net.
    setFormData((prev) => ({
      ...prev,
      kind,
      workshop_post_id: kind === 'general' ? ALL_WORKSHOPS_VALUE : prev.workshop_post_id
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Enforced again here (not just in the UI) because the DB has a CHECK constraint:
    // kind='workshop' OR workshop_post_id IS NULL. A "general" testimonial can never
    // carry a workshop_post_id, or the insert/update fails.
    const isWorkshopKind = formData.kind === 'workshop';
    const workshopPostId = isWorkshopKind && formData.workshop_post_id !== ALL_WORKSHOPS_VALUE
      ? formData.workshop_post_id
      : null;

    const testimonialData = {
      name: formData.name,
      role: formData.role || null,
      content: formData.content,
      avatar_url: formData.avatar_url || null,
      rating: parseInt(formData.rating),
      is_visible: formData.is_visible,
      sort_order: parseInt(formData.sort_order) || 0,
      kind: formData.kind,
      workshop_post_id: workshopPostId
    };

    if (editingTestimonial) {
      const { error } = await supabase
        .from('testimonials')
        .update(testimonialData)
        .eq('id', editingTestimonial.id);

      if (error) {
        toast.error('Chyba při ukládání: ' + error.message);
        return;
      }
      toast.success('Testimonial updated');
    } else {
      const { error } = await supabase
        .from('testimonials')
        .insert(testimonialData);

      if (error) {
        toast.error('Chyba při vytváření: ' + error.message);
        return;
      }
      toast.success('Testimonial added');
    }

    setDialogOpen(false);
    resetForm();
    fetchTestimonials();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    
    if (error) {
      toast.error('Chyba při mazání: ' + error.message);
      return;
    }
    
    toast.success('Testimonial deleted');
    fetchTestimonials();
  };

  const toggleVisibility = async (testimonial: Testimonial) => {
    const { error } = await supabase
      .from('testimonials')
      .update({ is_visible: !testimonial.is_visible })
      .eq('id', testimonial.id);

    if (error) {
      toast.error('Error changing visibility');
      return;
    }
    
    fetchTestimonials();
  };

  const getWorkshopLabel = (testimonial: Testimonial) => {
    if (!testimonial.workshop_post_id) return 'Všechny workshopy';
    const workshop = workshops.find((w) => w.id === testimonial.workshop_post_id);
    // Falls back gracefully if the linked workshop is no longer in our list
    // (e.g. its category changed away from "workshop").
    return workshop ? workshop.title : 'Workshop nenalezen';
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading testimonials...</div>;
  }

  const generalTestimonials = testimonials.filter((t) => t.kind !== 'workshop');
  const workshopTestimonials = testimonials.filter((t) => t.kind === 'workshop');

  const renderTestimonialsTable = (items: Testimonial[], showWorkshopColumn: boolean) => {
    if (items.length === 0) {
      return <p className="text-center text-muted-foreground py-8">No testimonials yet</p>;
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Review</TableHead>
            {showWorkshopColumn && <TableHead>Workshop</TableHead>}
            <TableHead>Hodnocení</TableHead>
            <TableHead>Visibility</TableHead>
            <TableHead className="text-right">Akce</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((testimonial) => (
            <TableRow key={testimonial.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </TableCell>
              <TableCell className="max-w-xs">
                <p className="truncate">{testimonial.content}</p>
              </TableCell>
              {showWorkshopColumn && (
                <TableCell>
                  <span className="text-sm text-muted-foreground">{getWorkshopLabel(testimonial)}</span>
                </TableCell>
              )}
              <TableCell>
                <div className="flex gap-0.5">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-gold fill-gold" />
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleVisibility(testimonial)}
                >
                  {testimonial.is_visible ? (
                    <Badge variant="outline" className="gap-1">
                      <Eye className="h-3 w-3" /> Visible
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <EyeOff className="h-3 w-3" /> Hidden
                    </Badge>
                  )}
                </Button>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(testimonial)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(testimonial.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <Card className="border-gold/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-serif">Testimonial Management</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-gold hover:bg-gold-dark text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingTestimonial ? 'Edit Testimonial' : 'New Testimonial'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="např. Anna K."
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">Role / Location</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="např. Expat Mom, Barcelona"
                />
              </div>
              <div>
                <Label htmlFor="content">Testimonial Text</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Testimonial Text..."
                  rows={4}
                  required
                />
              </div>
              <div>
                <Label htmlFor="avatar_url">Profile Image URL</Label>
                <Input
                  id="avatar_url"
                  type="url"
                  value={formData.avatar_url}
                  onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label>Typ reference</Label>
                <RadioGroup
                  value={formData.kind}
                  onValueChange={handleKindChange}
                  className="flex gap-6 mt-2"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="general" id="kind-general" />
                    <Label htmlFor="kind-general" className="font-normal cursor-pointer">Běžná reference</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="workshop" id="kind-workshop" />
                    <Label htmlFor="kind-workshop" className="font-normal cursor-pointer">Reference z workshopu</Label>
                  </div>
                </RadioGroup>
              </div>
              {formData.kind === 'workshop' && (
                <div>
                  <Label htmlFor="workshop_post_id">Workshop</Label>
                  <Select
                    value={formData.workshop_post_id}
                    onValueChange={(value) => setFormData({ ...formData, workshop_post_id: value })}
                  >
                    <SelectTrigger id="workshop_post_id">
                      <SelectValue placeholder="Vyberte workshop" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_WORKSHOPS_VALUE}>Všechny workshopy</SelectItem>
                      {workshops.map((workshop) => (
                        <SelectItem key={workshop.id} value={workshop.id}>
                          {workshop.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rating">Rating (1-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_visible"
                  checked={formData.is_visible}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_visible: checked })}
                />
                <Label htmlFor="is_visible">Show on Website</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Zrušit
                </Button>
                <Button type="submit" className="bg-gold hover:bg-gold-dark text-white">
                  {editingTestimonial ? 'Uložit změny' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">Běžné reference</TabsTrigger>
            <TabsTrigger value="workshop">Reference z workshopů</TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            {renderTestimonialsTable(generalTestimonials, false)}
          </TabsContent>
          <TabsContent value="workshop">
            {renderTestimonialsTable(workshopTestimonials, true)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdminTestimonials;
