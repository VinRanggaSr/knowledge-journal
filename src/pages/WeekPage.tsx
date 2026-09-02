import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

function WeekPage() {
  const { weekKey } = useParams();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Minggu {weekKey}</CardTitle>
        <CardDescription>Segera hadir di fase berikutnya.</CardDescription>
      </CardHeader>
    </Card>
  );
}

export default WeekPage;
