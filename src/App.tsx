import React from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Contacts } from './pages/Contacts';
import { Deals } from './pages/Deals';
import { Activities } from './pages/Activities';
import { useAppStore } from './store/appStore';

function App() {
  const { activePage } = useAppStore();

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'contacts': return <Contacts />;
      case 'deals': return <Deals />;
      case 'activities': return <Activities />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout>
      {renderPage()}
    </Layout>
  );
}

export default App;
