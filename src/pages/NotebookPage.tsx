import { useParams } from 'react-router-dom';
import Notebook from '../components/Notebook';

export default function NotebookPage(): JSX.Element {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-4 px-4">
        <div className="text-sm text-gray-500">Notebook ID: {id}</div>
      </div>
      <Notebook />
    </div>
  );
}
