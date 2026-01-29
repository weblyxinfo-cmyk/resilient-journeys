import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: 'blog' | 'workshop';
  featured_image_url: string | null;
  is_published: boolean;
  published_at: string | null;
  scheduled_at: string | null;
  min_membership: 'free' | 'basic' | 'premium';
  tags: string[];
  meta_title: string | null;
  meta_description: string | null;
  view_count: number;
  is_paid_workshop: boolean;
  workshop_price: number;
  workshop_currency: string;
  payment_iban: string | null;
  payment_message: string | null;
}

const membershipLabels = {
  free: 'Free',
  basic: 'Basic',
  premium: 'Premium'
};

const AdminBlog = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [activeCategory, setActiveCategory] = useState<'blog' | 'workshop'>('blog');

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'blog' as 'blog' | 'workshop',
    featured_image_url: '',
    is_published: false,
    scheduled_at: '',
    min_membership: 'free' as 'free' | 'basic' | 'premium',
    tags: '',
    meta_title: '',
    meta_description: '',
    is_paid_workshop: false,
    workshop_price: 0,
    workshop_currency: 'CZK',
    payment_iban: '',
    payment_message: ''
  });

  useEffect(() => {
    fetchPosts();
  }, [activeCategory]);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('category', activeCategory)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Error loading posts: ' + error.message);
    } else {
      setPosts(data as BlogPost[]);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: activeCategory,
      featured_image_url: '',
      is_published: false,
      scheduled_at: '',
      min_membership: 'free',
      tags: '',
      meta_title: '',
      meta_description: '',
      is_paid_workshop: false,
      workshop_price: 0,
      workshop_currency: 'CZK',
      payment_iban: '',
      payment_message: ''
    });
    setEditingPost(null);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content,
      category: post.category,
      featured_image_url: post.featured_image_url || '',
      is_published: post.is_published,
      scheduled_at: post.scheduled_at || '',
      min_membership: post.min_membership,
      tags: post.tags.join(', '),
      meta_title: post.meta_title || '',
      meta_description: post.meta_description || '',
      is_paid_workshop: post.is_paid_workshop || false,
      workshop_price: post.workshop_price || 0,
      workshop_currency: post.workshop_currency || 'CZK',
      payment_iban: post.payment_iban || '',
      payment_message: post.payment_message || ''
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Determine publish status
    let shouldPublish = formData.is_published;
    let publishedAt = undefined;
    let scheduledAt = formData.scheduled_at || null;

    if (formData.scheduled_at) {
      // If scheduled_at is set, don't publish immediately
      shouldPublish = false;
      publishedAt = undefined;
    } else if (formData.is_published && !editingPost?.is_published) {
      // If "Publish immediately" is checked and not already published
      shouldPublish = true;
      publishedAt = new Date().toISOString();
    }

    const postData: any = {
      title: formData.title,
      slug: formData.slug || generateSlug(formData.title),
      excerpt: formData.excerpt || null,
      content: formData.content,
      category: formData.category,
      featured_image_url: formData.featured_image_url || null,
      is_published: shouldPublish,
      published_at: publishedAt,
      scheduled_at: scheduledAt,
      min_membership: formData.min_membership,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      meta_title: formData.meta_title || formData.title,
      meta_description: formData.meta_description || formData.excerpt || formData.content.substring(0, 160),
      author_id: user?.id,
      is_paid_workshop: formData.category === 'workshop' ? formData.is_paid_workshop : false,
      workshop_price: formData.category === 'workshop' ? formData.workshop_price : 0,
      workshop_currency: formData.category === 'workshop' ? formData.workshop_currency : 'CZK',
      payment_iban: formData.category === 'workshop' && formData.payment_iban ? formData.payment_iban : null,
      payment_message: formData.category === 'workshop' && formData.payment_message ? formData.payment_message : null,
    };

    if (editingPost) {
      const { error } = await supabase
        .from('blog_posts')
        .update(postData)
        .eq('id', editingPost.id);

      if (error) {
        toast.error('Error saving: ' + error.message);
        return;
      }
      toast.success('Post updated');
    } else {
      const { error } = await supabase
        .from('blog_posts')
        .insert(postData);

      if (error) {
        toast.error('Error creating: ' + error.message);
        return;
      }
      toast.success('Post created');
    }

    setDialogOpen(false);
    resetForm();
    fetchPosts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Error deleting: ' + error.message);
    } else {
      toast.success('Post deleted');
      fetchPosts();
    }
  };

  const togglePublish = async (post: BlogPost) => {
    const { error } = await supabase
      .from('blog_posts')
      .update({
        is_published: !post.is_published,
        published_at: !post.is_published ? new Date().toISOString() : post.published_at
      })
      .eq('id', post.id);

    if (error) {
      toast.error('Error: ' + error.message);
    } else {
      toast.success(post.is_published ? 'Post unpublished' : 'Post published');
      fetchPosts();
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs for Blog / Workshopy */}
      <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as 'blog' | 'workshop')}>
        <div className="flex items-center justify-between">
          <TabsList className="bg-cream/50">
            <TabsTrigger value="blog">Blog Articles</TabsTrigger>
            <TabsTrigger value="workshop">Workshopy</TabsTrigger>
          </TabsList>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-gold hover:bg-gold-dark">
                <Plus className="h-4 w-4 mr-2" />
                Add {activeCategory === 'blog' ? 'Article' : 'Workshop'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPost ? 'Edit' : 'Create'} {activeCategory === 'blog' ? 'Article' : 'Workshop'}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL) *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="auto-generated-from-title"
                  />
                  <p className="text-xs text-muted-foreground">Leave empty to auto-generate</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={2}
                    placeholder="Short description for previews..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={12}
                    required
                    placeholder="Write your content here... (supports Markdown)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="featured_image_url">Featured Image URL</Label>
                  <Input
                    id="featured_image_url"
                    value={formData.featured_image_url}
                    onChange={(e) => setFormData({ ...formData, featured_image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min_membership">Minimum Membership</Label>
                    <Select value={formData.min_membership} onValueChange={(v: any) => setFormData({ ...formData, min_membership: v })}>
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
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="resilience, art-therapy, expat"
                    />
                  </div>
                </div>

                {formData.category === 'workshop' && (
                  <Card className="border-gold/30">
                    <CardContent className="pt-4 space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_paid_workshop"
                          checked={formData.is_paid_workshop}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_paid_workshop: checked })}
                        />
                        <Label htmlFor="is_paid_workshop" className="cursor-pointer font-semibold">
                          Paid Workshop (with registration & QR payment)
                        </Label>
                      </div>

                      {formData.is_paid_workshop && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="workshop_price">Price</Label>
                              <Input
                                id="workshop_price"
                                type="number"
                                min={0}
                                value={formData.workshop_price}
                                onChange={(e) => setFormData({ ...formData, workshop_price: parseInt(e.target.value) || 0 })}
                                placeholder="e.g. 1500"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="workshop_currency">Currency</Label>
                              <Select value={formData.workshop_currency} onValueChange={(v) => setFormData({ ...formData, workshop_currency: v })}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="CZK">CZK</SelectItem>
                                  <SelectItem value="EUR">EUR</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="payment_iban">Bank Account (IBAN)</Label>
                            <Input
                              id="payment_iban"
                              value={formData.payment_iban}
                              onChange={(e) => setFormData({ ...formData, payment_iban: e.target.value })}
                              placeholder="CZ6508000000192000145399"
                            />
                            <p className="text-xs text-muted-foreground">IBAN for QR payment code</p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="payment_message">Payment Message / Note</Label>
                            <Input
                              id="payment_message"
                              value={formData.payment_message}
                              onChange={(e) => setFormData({ ...formData, payment_message: e.target.value })}
                              placeholder="e.g. Workshop Resilience 2026"
                            />
                            <p className="text-xs text-muted-foreground">Message shown in bank transfer</p>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  <Label htmlFor="meta_title">SEO: Meta Title</Label>
                  <Input
                    id="meta_title"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    placeholder="Leave empty to use post title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_description">SEO: Meta Description</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    rows={2}
                    placeholder="Leave empty to use excerpt"
                  />
                </div>

                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="scheduled_at">Schedule for later (optional)</Label>
                    <Input
                      id="scheduled_at"
                      type="datetime-local"
                      value={formData.scheduled_at}
                      onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value, is_published: false })}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      If set, post will auto-publish at this date/time. Leave empty to publish manually.
                    </p>
                  </div>

                  {!formData.scheduled_at && (
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_published"
                        checked={formData.is_published}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                      />
                      <Label htmlFor="is_published" className="cursor-pointer">Publish immediately</Label>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="bg-gold hover:bg-gold-dark flex-1">
                    {editingPost ? 'Update' : 'Create'} {activeCategory === 'blog' ? 'Article' : 'Workshop'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value={activeCategory}>
          <Card>
            <CardHeader>
              <CardTitle>
                {activeCategory === 'blog' ? 'Blog Articles' : 'Workshopy'} ({posts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : posts.length === 0 ? (
                <p className="text-muted-foreground">
                  No {activeCategory === 'blog' ? 'articles' : 'workshopy'} yet. Create your first one!
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Membership</TableHead>
                      {activeCategory === 'workshop' && <TableHead>Price</TableHead>}
                      <TableHead>Views</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{post.title}</div>
                            <div className="text-sm text-muted-foreground">/{post.slug}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {post.scheduled_at && !post.is_published ? (
                            <Badge variant="outline" className="border-blue-500 text-blue-600">
                              Scheduled: {new Date(post.scheduled_at).toLocaleString()}
                            </Badge>
                          ) : (
                            <Badge variant={post.is_published ? 'default' : 'secondary'}>
                              {post.is_published ? 'Published' : 'Draft'}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{membershipLabels[post.min_membership]}</Badge>
                        </TableCell>
                        {activeCategory === 'workshop' && (
                          <TableCell>
                            {post.is_paid_workshop ? (
                              <Badge className="bg-green-100 text-green-800">
                                {post.workshop_price} {post.workshop_currency}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">Free inquiry</span>
                            )}
                          </TableCell>
                        )}
                        <TableCell>{post.view_count}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => togglePublish(post)}
                              title={post.is_published ? 'Unpublish' : 'Publish'}
                            >
                              {post.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(post)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(post.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminBlog;
