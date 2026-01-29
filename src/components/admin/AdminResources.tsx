import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Trash2, Edit, Plus, FileText, Music, File } from 'lucide-react';

interface Resource {
  id: string;
  category_id: string | null;
  video_id: string | null;
  title: string;
  description: string | null;
  resource_type: string;
  file_url: string;
  file_size_mb: number | null;
  min_membership: string;
  is_free: boolean;
  sort_order: number;
  download_count: number;
  week_number: number | null;
  resource_subtype: string | null;
}

interface Category {
  id: string;
  name: string;
  month_number: number;
}

const AdminResources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [weekFilter, setWeekFilter] = useState<string>('all');
  const [subtypeFilter, setSubtypeFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    resource_type: 'pdf',
    file_url: '',
    file_size_mb: '',
    category_id: '',
    min_membership: 'basic',
    is_free: false,
    sort_order: 0,
    week_number: '',
    resource_subtype: '',
  });

  useEffect(() => {
    fetchResources();
    fetchCategories();
  }, []);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('sort_order');

      if (error) throw error;
      setResources(data || []);
    } catch (err) {
      console.error('Error fetching resources:', err);
      toast.error('Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('video_categories')
      .select('id, name, month_number')
      .order('month_number');

    if (data) setCategories(data);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      resource_type: 'pdf',
      file_url: '',
      file_size_mb: '',
      category_id: '',
      min_membership: 'basic',
      is_free: false,
      sort_order: 0,
      week_number: '',
      resource_subtype: '',
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        file_size_mb: formData.file_size_mb ? parseFloat(formData.file_size_mb) : null,
        category_id: formData.category_id || null,
        week_number: formData.week_number ? parseInt(formData.week_number) : null,
        resource_subtype: formData.resource_subtype || null,
      };

      if (editingId) {
        const { error } = await supabase
          .from('resources')
          .update(payload)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Resource updated successfully!');
      } else {
        const { error } = await supabase
          .from('resources')
          .insert([payload]);

        if (error) throw error;
        toast.success('Resource added successfully!');
      }

      resetForm();
      fetchResources();
    } catch (err) {
      console.error('Error saving resource:', err);
      toast.error('Failed to save resource');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (resource: Resource) => {
    setFormData({
      title: resource.title,
      description: resource.description || '',
      resource_type: resource.resource_type,
      file_url: resource.file_url,
      file_size_mb: resource.file_size_mb?.toString() || '',
      category_id: resource.category_id || '',
      min_membership: resource.min_membership,
      is_free: resource.is_free,
      sort_order: resource.sort_order,
      week_number: resource.week_number?.toString() || '',
      resource_subtype: resource.resource_subtype || '',
    });
    setEditingId(resource.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Resource deleted successfully!');
      fetchResources();
    } catch (err) {
      console.error('Error deleting resource:', err);
      toast.error('Failed to delete resource');
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'worksheet':
      case 'pdf':
        return FileText;
      case 'meditation':
      case 'audio':
        return Music;
      default:
        return File;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Add/Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {editingId ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            {editingId ? 'Edit Resource' : 'Add New Resource'}
          </CardTitle>
          <CardDescription>
            Upload worksheets, meditations, PDFs, and other downloadable materials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Month 1 Worksheet"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resource_type">Type *</Label>
                <Select
                  value={formData.resource_type}
                  onValueChange={(value) => setFormData({ ...formData, resource_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="worksheet">Worksheet</SelectItem>
                    <SelectItem value="meditation">Meditation</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the resource"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="file_url">File URL *</Label>
                <Input
                  id="file_url"
                  value={formData.file_url}
                  onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                  placeholder="https://..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file_size_mb">File Size (MB)</Label>
                <Input
                  id="file_size_mb"
                  type="number"
                  step="0.1"
                  value={formData.file_size_mb}
                  onChange={(e) => setFormData({ ...formData, file_size_mb: e.target.value })}
                  placeholder="e.g., 2.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        Month {cat.month_number}: {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_membership">Required Membership *</Label>
                <Select
                  value={formData.min_membership}
                  onValueChange={(value) => setFormData({ ...formData, min_membership: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="week_number">Week Number</Label>
                <Select
                  value={formData.week_number}
                  onValueChange={(value) => setFormData({ ...formData, week_number: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Not assigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Not assigned</SelectItem>
                    <SelectItem value="1">Week 1</SelectItem>
                    <SelectItem value="2">Week 2</SelectItem>
                    <SelectItem value="3">Week 3</SelectItem>
                    <SelectItem value="4">Week 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resource_subtype">Resource Subtype</Label>
                <Select
                  value={formData.resource_subtype}
                  onValueChange={(value) => setFormData({ ...formData, resource_subtype: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="General" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">General</SelectItem>
                    <SelectItem value="workbook">Workbook</SelectItem>
                    <SelectItem value="affirmation">Affirmation</SelectItem>
                    <SelectItem value="tarot_card">Tarot Card</SelectItem>
                    <SelectItem value="vision_board">Vision Board</SelectItem>
                    <SelectItem value="habit_tracker">Habit Tracker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <Button type="submit" disabled={submitting} className="bg-gold hover:bg-gold-dark">
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>{editingId ? 'Update Resource' : 'Add Resource'}</>
                )}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Resources List */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Resources ({resources.length})</CardTitle>
          <CardDescription>Manage all downloadable resources</CardDescription>
        </CardHeader>
        <CardContent>
          {resources.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No resources yet. Add your first one above!</p>
          ) : (
            <>
              {/* Filters */}
              <div className="flex gap-4 mb-6">
                <div className="space-y-2">
                  <Label>Filter by Week</Label>
                  <Select value={weekFilter} onValueChange={setWeekFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Weeks</SelectItem>
                      <SelectItem value="none">Not Assigned</SelectItem>
                      <SelectItem value="1">Week 1</SelectItem>
                      <SelectItem value="2">Week 2</SelectItem>
                      <SelectItem value="3">Week 3</SelectItem>
                      <SelectItem value="4">Week 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Filter by Subtype</Label>
                  <Select value={subtypeFilter} onValueChange={setSubtypeFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subtypes</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="workbook">Workbook</SelectItem>
                      <SelectItem value="affirmation">Affirmation</SelectItem>
                      <SelectItem value="tarot_card">Tarot Card</SelectItem>
                      <SelectItem value="vision_board">Vision Board</SelectItem>
                      <SelectItem value="habit_tracker">Habit Tracker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Week</TableHead>
                  <TableHead>Subtype</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Membership</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resources
                  .filter((resource) => {
                    // Week filter
                    if (weekFilter !== 'all') {
                      if (weekFilter === 'none' && resource.week_number !== null) return false;
                      if (weekFilter !== 'none' && resource.week_number?.toString() !== weekFilter) return false;
                    }

                    // Subtype filter
                    if (subtypeFilter !== 'all') {
                      if (subtypeFilter === 'general' && resource.resource_subtype !== null && resource.resource_subtype !== '') return false;
                      if (subtypeFilter !== 'general' && resource.resource_subtype !== subtypeFilter) return false;
                    }

                    return true;
                  })
                  .map((resource) => {
                  const Icon = getResourceIcon(resource.resource_type);
                  const category = categories.find(c => c.id === resource.category_id);
                  return (
                    <TableRow key={resource.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-gold" />
                          {resource.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{resource.resource_type}</Badge>
                      </TableCell>
                      <TableCell>
                        {resource.week_number ? (
                          <Badge variant="secondary">Week {resource.week_number}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {resource.resource_subtype ? (
                          <Badge variant="outline" className="capitalize">
                            {resource.resource_subtype.replace('_', ' ')}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">General</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {category ? `Month ${category.month_number}` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            resource.min_membership === 'premium'
                              ? 'bg-gradient-gold text-white'
                              : 'bg-gold/20 text-gold-dark'
                          }
                        >
                          {resource.min_membership}
                        </Badge>
                      </TableCell>
                      <TableCell>{resource.download_count || 0}</TableCell>
                      <TableCell>
                        {resource.file_size_mb ? `${resource.file_size_mb.toFixed(1)} MB` : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(resource)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(resource.id)}
                            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminResources;
