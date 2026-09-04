import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { EditorContent } from '@tiptap/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useRichTextEditor, RichTextToolbar } from '@/components/RichTextEditor';
import {
  getMonthlySummary,
  getWeeklySummary,
  saveMonthlySummary,
  saveWeeklySummary,
} from '@/services/api/summaryApi';
import { formatMonthLabel, formatWeekRangeLabel, getWeekDates } from '@/lib/dateHelpers';

function SummaryEditorPage() {
  const { monthKey, weekKey } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isMonth = Boolean(monthKey);
  const key = (monthKey ?? weekKey ?? '') as string;

  const weekDates = useMemo(() => (weekKey ? getWeekDates(weekKey) : []), [weekKey]);

  const title = isMonth
    ? `Ringkasan Bulanan · ${formatMonthLabel(key)}`
    : `Ringkasan Mingguan · ${formatWeekRangeLabel(weekDates)}`;

  const { data: monthSummary } = useQuery({
    queryKey: ['monthlySummary', key],
    queryFn: () => getMonthlySummary(key),
    enabled: isMonth,
  });
  const { data: weekSummary } = useQuery({
    queryKey: ['weeklySummary', key],
    queryFn: () => getWeeklySummary(key),
    enabled: !isMonth,
  });
  const summary = isMonth ? monthSummary : weekSummary;

  const [summaryHtml, setSummaryHtml] = useState('');

  useEffect(() => {
    setSummaryHtml(summary?.summaryHtml ?? '');
  }, [summary?.summaryHtml]);

  const saveMonthMutation = useMutation({
    mutationFn: saveMonthlySummary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthlySummary', key] });
      navigate(-1);
    },
  });
  const saveWeekMutation = useMutation({
    mutationFn: saveWeeklySummary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeklySummary', key] });
      navigate(-1);
    },
  });

  const isSaving = saveMonthMutation.isPending || saveWeekMutation.isPending;

  function handleSave() {
    if (isMonth) {
      saveMonthMutation.mutate({ monthKey: key, summaryHtml });
    } else {
      saveWeekMutation.mutate({ weekKey: key, summaryHtml });
    }
  }

  const editor = useRichTextEditor({
    value: summaryHtml,
    onChange: setSummaryHtml,
    placeholder: isMonth ? 'Tulis ringkasan knowledge bulan ini...' : 'Tulis ringkasan knowledge minggu ini...',
    contentClassName: 'min-h-[50vh] rounded-[30px] px-6 py-4 md:h-full md:flex-1',
  });

  return (
    <div className="flex flex-col gap-5">
      <Breadcrumbs
        items={
          isMonth
            ? [
                { label: 'Timeline', to: '/' },
                { label: formatMonthLabel(key), to: `/months/${key}` },
                { label: 'Ringkasan Bulanan' },
              ]
            : [
                { label: 'Timeline', to: '/' },
                { label: formatWeekRangeLabel(weekDates), to: `/weeks/${key}` },
                { label: 'Ringkasan Mingguan' },
              ]
        }
      />

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Kembali"
          className="rounded-full p-2 text-muted-foreground hover:bg-background"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </div>

      <h1 className="text-2xl font-bold capitalize md:text-3xl">{title}</h1>

      {editor && (
        <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
          <RichTextToolbar editor={editor} layout="row" className="md:hidden" />
          <EditorContent editor={editor} className="md:flex md:flex-1 md:flex-col" />
          <RichTextToolbar editor={editor} layout="panel" className="hidden md:flex md:w-60 md:shrink-0" />
        </div>
      )}
    </div>
  );
}

export default SummaryEditorPage;
