import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import { ConnectKitButton } from 'connectkit';

const DepositUSDC = dynamic(() => import('../components/DepositUSDC'), { ssr: false });

const Home: NextPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 20 }}>
      <ConnectKitButton />
      <DepositUSDC />
    </div>
  );
};

export default Home;
