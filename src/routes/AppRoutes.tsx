import { Routes, Route } from 'react-router-dom';
import TimelinePage from '@/pages/TimelinePage';
import MonthPage from '@/pages/MonthPage';
import WeekPage from '@/pages/WeekPage';
import DayPage from '@/pages/DayPage';
import KnowledgePage from '@/pages/KnowledgePage';
import KnowledgeEditorPage from '@/pages/KnowledgeEditorPage';
import TagsPage from '@/pages/TagsPage';
import TagDetailPage from '@/pages/TagDetailPage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<TimelinePage />} />
      <Route path="/months/:monthKey" element={<MonthPage />} />
      <Route path="/weeks/:weekKey" element={<WeekPage />} />
      <Route path="/days/:date" element={<DayPage />} />
      <Route path="/knowledge" element={<KnowledgePage />} />
      <Route path="/knowledge/new" element={<KnowledgeEditorPage />} />
      <Route path="/knowledge/:id/edit" element={<KnowledgeEditorPage />} />
      <Route path="/tags" element={<TagsPage />} />
      <Route path="/tags/:tagId" element={<TagDetailPage />} />
    </Routes>
  );
}

export default AppRoutes;
