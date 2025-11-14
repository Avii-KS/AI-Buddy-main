import { useState, useEffect } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { AdminDashboard } from './components/AdminDashboard';
import { BarChart3 } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState<'chat' | 'admin'>('chat');
  const [studentId, setStudentId] = useState<string>('');

  useEffect(() => {
    const id = crypto.randomUUID();
    setStudentId(id);
  }, []);

  if (!studentId) {
    return <div className="w-full h-screen flex items-center justify-center bg-blue-50">Loading...</div>;
  }

  return (
    <div className="h-screen flex flex-col">
      {currentView === 'chat' && (
        <button
          onClick={() => setCurrentView('admin')}
          className="absolute top-4 right-4 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg shadow-md flex items-center gap-2 z-10 transition-colors"
        >
          <BarChart3 className="w-4 h-4" />
          <span className="text-sm font-medium">Admin</span>
        </button>
      )}

      {currentView === 'admin' && (
        <button
          onClick={() => setCurrentView('chat')}
          className="absolute top-4 right-4 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg shadow-md z-10 transition-colors"
        >
          <span className="text-sm font-medium">Back to Chat</span>
        </button>
      )}

      {currentView === 'chat' && <ChatInterface studentId={studentId} />}
      {currentView === 'admin' && <AdminDashboard />}
    </div>
  );
}

export default App;
