import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

function MonthPage() {
  const { monthKey } = useParams();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulan {monthKey}</CardTitle>
        <CardDescription>Segera hadir di fase berikutnya.</CardDescription>
      </CardHeader>
    </Card>
  );
}

export default MonthPage;
