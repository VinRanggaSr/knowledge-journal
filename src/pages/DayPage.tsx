import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatDateLabel } from '@/lib/dateHelpers';

function DayPage() {
  const { date } = useParams();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{date ? formatDateLabel(date) : 'Hari ini'}</CardTitle>
        <CardDescription>Segera hadir di fase berikutnya.</CardDescription>
      </CardHeader>
    </Card>
  );
}

export default DayPage;
