import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { usePublicClient, useReadContracts } from 'wagmi';
import { AUSDC_ADDRESS, CHAINS, VAULT_ADDRESS } from '../consts';
import { VaultAbi } from '../consts/abis/Vault';
import { erc20Abi, formatUnits } from 'viem';
import { arbitrum, avalanche, optimism, polygon } from 'viem/chains';

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = {
  background: {
    [avalanche.name]: "rgba(232, 65, 66, 0.8)",   // #E84142
    [polygon.name]: "rgba(130, 71, 229, 0.8)",  // #8247E5
    [arbitrum.name]: "rgba(40, 160, 240, 0.8)",  // #28A0F0
    [optimism.name]: "rgba(255, 69, 0, 0.8)",    // #FF4500
  },
  border: {
    [avalanche.name]: "rgba(232, 65, 66, 1)",     // #E84142
    [polygon.name]: "rgba(130, 71, 229, 1)",    // #8247E5
    [arbitrum.name]: "rgba(40, 160, 240, 1)",    // #28A0F0
    [optimism.name]: "rgba(255, 69, 0, 1)",      // #FF4500
  }
};


export function StatsCharts() {
  const [localAssets, setLocalAssets] = useState<{ chain: string, amount: bigint }[]>([]);
  const [localShares, setLocalShares] = useState<{ chain: string, amount: bigint }[]>([]);

  const { data: rawStats } = useReadContracts({
    contracts: CHAINS.flatMap((chain) => ([
      {
        address: VAULT_ADDRESS,
        abi: VaultAbi,
        functionName: "totalSupply",
        chainId: chain.id,
      },
      {
        address: AUSDC_ADDRESS(chain.id),
        abi: erc20Abi,
        functionName: "balanceOf",
        chainId: chain.id,
        args: [VAULT_ADDRESS]
      },
    ])),
    query: {
      refetchInterval: 2_000
    }
  })

  useEffect(() => {
    if (rawStats === undefined) return;

    CHAINS.forEach((chain, idx) => {
      const localShares = rawStats[2 * idx].result as bigint;
      const localAssets = rawStats[2 * idx + 1].result as bigint;

      if (localAssets > 0n)
        setLocalAssets(la => [...la.filter(stat => stat.chain !== chain.name), { chain: chain.name, amount: localAssets }]);

      if (localShares > 0n)
        setLocalShares(ls => [...ls.filter(stat => stat.chain !== chain.name), { chain: chain.name, amount: localShares }]);

    })
  }, [rawStats])


  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value.toFixed(4)}`;
          },
        },
      },
    },
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '12px',
    textAlign: 'center',
    color: '#333',
  };

  if (localAssets.length === 0 || localShares.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>🤷‍♂️</div>
        <div style={{ color: '#666' }}>No stats available</div>
      </div>
    );
  }

  console.log(localShares, COLORS);

  return <div>
    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
      <div style={{ flex: 1, maxWidth: '350px' }}>
        <div style={titleStyle}>Shares by Chain</div>
        <Doughnut data={{
          labels: localShares.map(stat => stat.chain),
          datasets: [
            {
              label: 'Shares',
              data: localShares.map(stat => Number(formatUnits(stat.amount, 18))),
              borderWidth: 2,
              backgroundColor: localShares.map(stat => COLORS.background[stat.chain]),
              borderColor: localShares.map(stat => COLORS.border[stat.chain]),
            },
          ],
        }} options={chartOptions} />
      </div>

      <div style={{ flex: 1, maxWidth: '350px' }}>
        <div style={titleStyle}>Assets by Chain</div>
        <Doughnut data={{
          labels: localAssets.map(stat => stat.chain),
          datasets: [
            {
              label: 'Shares',
              data: localAssets.map(stat => Number(formatUnits(stat.amount, 6))),
              borderWidth: 2,
              backgroundColor: localAssets.map(stat => COLORS.background[stat.chain]),
              borderColor: localAssets.map(stat => COLORS.border[stat.chain]),
            },
          ],
        }} options={chartOptions} />
      </div>
    </div>
  </div>
}

export default StatsCharts; 