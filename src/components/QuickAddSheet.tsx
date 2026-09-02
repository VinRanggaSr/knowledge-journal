import { format } from 'date-fns';
import KnowledgeItemFormSheet from '@/components/KnowledgeItemFormSheet';
import { useUiStore } from '@/store/uiStore';

function QuickAddSheet() {
  const isOpen = useUiStore((s) => s.isQuickAddOpen);
  const close = useUiStore((s) => s.closeQuickAdd);
  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <KnowledgeItemFormSheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close();
      }}
      defaultDate={today}
    />
  );
}

export default QuickAddSheet;
