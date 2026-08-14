import { useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ImageOff, Loader2, Upload } from 'lucide-react';

const BUCKET = 'cms-images';
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface CmsImageFieldProps {
  value: string;
  onChange: (newUrl: string) => void;
  disabled?: boolean;
  // Forwarded to the URL input so an image field behaves like every other
  // field: focusing it points the live preview at that section, and leaving
  // it flushes the pending save instead of waiting out the debounce.
  onFocus?: () => void;
  onBlur?: () => void;
}

// Upload widget for cms_content rows with field_type='image_url'. Drop-in
// replacement for the plain URL <Input> the admin used before — see
// docs/cms-images.md for the one-line integration into AdminCMS.tsx.
//
// Deliberately dumb about persistence: onChange only reports the new public
// URL, exactly like typing a URL into the old input did. The caller still
// owns debouncing/autosave/revert-to-default — this component doesn't know
// about cms_content at all.
const CmsImageField = ({ value, onChange, disabled, onFocus, onBlur }: CmsImageFieldProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Nepodporovaný formát fotky — povolené jsou JPG, PNG nebo WEBP.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error('Fotka je příliš velká — maximální velikost je 5 MB.');
      return;
    }

    setUploading(true);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, file, { contentType: file.type });

      if (uploadError) {
        toast.error('Nahrání se nezdařilo: ' + uploadError.message);
        return;
      }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
      onChange(data.publicUrl);
      toast.success('Fotka nahrána.');
    } catch (err) {
      toast.error('Nahrání se nezdařilo: ' + (err instanceof Error ? err.message : 'neznámá chyba'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        {value ? (
          <img
            src={value}
            alt="Náhled fotky"
            className="h-16 w-16 rounded border border-border object-cover shrink-0"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded border border-dashed border-border text-muted-foreground">
            <ImageOff className="h-5 w-5" />
          </div>
        )}

        <div className="flex-1 min-w-0 space-y-1.5">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder="URL fotky"
            disabled={disabled || uploading}
            className="text-xs"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled || uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Nahrávám…
              </>
            ) : (
              <>
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                Nahrát novou fotku
              </>
            )}
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileInputChange}
      />
      <p className="text-[11px] text-muted-foreground">JPG, PNG nebo WEBP, max. 5 MB.</p>
    </div>
  );
};

export default CmsImageField;
