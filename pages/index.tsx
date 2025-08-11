import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import { ConnectKitButton } from 'connectkit';
import React, { useEffect, useState } from 'react';
import { decodeAbiParameters, type Hex } from 'viem';
import { useReadContracts } from 'wagmi';
import { CHAINS, VAULT_ADDRESS } from '../consts';
import { VaultAbi } from '../consts/abis/Vault';
import StatsCharts from '../components/StatsCharts';

const DepositUSDC = dynamic(() => import('../components/DepositUSDC'), { ssr: false });

const Home: NextPage = () => {
  const [stats, setStats] = useState<{ chain: string, localShares: bigint, localAssets: bigint }[]>();

  const { data: rawStats } = useReadContracts({
    contracts: CHAINS.flatMap((chain) => ([
      {
        address: VAULT_ADDRESS,
        abi: VaultAbi,
        functionName: 'stats',
        chainId: chain.id
      }
    ]))
  })
  
  useEffect(() => {
    if (rawStats === undefined) return;
    setStats(CHAINS.map((chain, idx) => {
      const chainRawStats = rawStats[idx].result as Hex;
      const [localAssets, localShares] = decodeAbiParameters([{ type: "uint256" }, { type: "uint256" }], chainRawStats)

      console.log(stats)
      return { chain: chain.name, localAssets, localShares }
    }))
  }, [rawStats])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 20 }}>
      <ConnectKitButton />
      <DepositUSDC />
      <StatsCharts stats={stats || []} />
    </div>
  );
};

export default Home;
