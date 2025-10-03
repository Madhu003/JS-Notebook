import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface NotebookMeta {
  id: string;
  title: string;
  createdAt: number;
}

const STORAGE_KEY = 'notebooks_meta_v1';

const readNotebooks = (): NotebookMeta[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as NotebookMeta[]) : [];
  } catch {
    return [];
  }
};

const writeNotebooks = (items: NotebookMeta[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export default function LandingPage(): JSX.Element {
  const [items, setItems] = useState<NotebookMeta[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setItems(readNotebooks());
  }, []);

  const createNotebook = () => {
    const id = Date.now().toString();
    const title = `Notebook ${items.length + 1}`;
    const next = [{ id, title, createdAt: Date.now() }, ...items];
    setItems(next);
    writeNotebooks(next);
    navigate(`/notebook/${id}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Your Notebooks</h2>
        <button
          onClick={createNotebook}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + New Notebook
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-gray-500">No notebooks yet. Create your first one.</div>
      ) : (
        <ul className="divide-y bg-white rounded border">
          {items.map(n => (
            <li key={n.id} className="p-4 hover:bg-gray-50 flex justify-between">
              <div>
                <div className="font-medium text-gray-900">{n.title}</div>
                <div className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
              <Link
                to={`/notebook/${n.id}`}
                className="text-blue-600 hover:text-blue-800"
              >
                Open
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
