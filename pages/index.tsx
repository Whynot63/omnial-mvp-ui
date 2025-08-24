import { ConnectKitButton } from 'connectkit';
import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import React from 'react';

const TabbedInterface = dynamic(() => import('../components/TabbedInterface'), { ssr: false });

const Home: NextPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 20 }}>
      <ConnectKitButton />
      <TabbedInterface />
    </div>
  );
};

export default Home;
