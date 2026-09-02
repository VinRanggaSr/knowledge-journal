import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

function TagDetailPage() {
  const { tagId } = useParams();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detail Tag: {tagId}</CardTitle>
        <CardDescription>Segera hadir di fase berikutnya.</CardDescription>
      </CardHeader>
    </Card>
  );
}

export default TagDetailPage;
