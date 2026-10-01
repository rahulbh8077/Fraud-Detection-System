import React, { ReactNode, useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from '../ui/Toast';
import { getHealth } from '../../api/client';

interface PageMeta {
  title: string;
  subtitle?: string;
}

export const PageMetaContext = React.createContext<(meta: PageMeta) => void>(() => {});

export function Layout({ children }: { children: ReactNode }) {
  const [pageMeta, setPageMeta] = useState<PageMeta>({ title: 'FraudShield AI' });
  const [modelOnline, setModelOnline] = useState(false);
  const [modelName, setModelName] = useState('FraudShield v1.0');

  useEffect(() => {
    getHealth().then((h) => {
      setModelOnline(h.model_loaded);
      if (h.model_version) setModelName(`FraudShield v${h.model_version}`);
    }).catch(() => setModelOnline(false));
  }, []);

  return (
    <PageMetaContext.Provider value={setPageMeta}>
      <div className="flex h-screen overflow-hidden bg-navy-900">
        <Sidebar modelOnline={modelOnline} modelName={modelName} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header title={pageMeta.title} subtitle={pageMeta.subtitle} modelOnline={modelOnline} />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
        <ToastContainer />
      </div>
    </PageMetaContext.Provider>
  );
}

export function usePageMeta(title: string, subtitle?: string) {
  const setMeta = React.useContext(PageMetaContext);
  useEffect(() => { setMeta({ title, subtitle }); }, [title, subtitle]);
}
