import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent } from '@/components/ui/sheet';

export interface FormValues {
  text: string;
  isDaily: boolean;
}

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  label: string;
  placeholder?: string;
  initial?: Partial<FormValues>;
  withDailySwitch?: boolean;
  isSaving?: boolean;
  onSubmit: (values: FormValues) => void;
}

function FormDialog({
  open,
  onOpenChange,
  title,
  label,
  placeholder,
  initial,
  withDailySwitch,
  isSaving,
  onSubmit,
}: FormDialogProps) {
  const [text, setText] = useState('');
  const [isDaily, setIsDaily] = useState(false);

  useEffect(() => {
    if (open) {
      setText(initial?.text ?? '');
      setIsDaily(initial?.isDaily ?? false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit({ text: text.trim(), isDaily });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title={title}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">{label}</label>
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} autoFocus />
          </div>
          {withDailySwitch && (
            <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Dilakukan setiap hari</p>
                <p className="text-xs text-muted-foreground">Masuk ke checklist harian dan grafik konsistensi.</p>
              </div>
              <Switch checked={isDaily} onCheckedChange={setIsDaily} />
            </div>
          )}
          <Button type="submit" disabled={isSaving || !text.trim()}>
            {isSaving ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export default FormDialog;
