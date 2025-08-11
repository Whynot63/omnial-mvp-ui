import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface StatsData {
  chain: string;
  localShares: bigint;
  localAssets: bigint;
}

interface StatsChartsProps {
  stats: StatsData[];
}

export function StatsCharts({ stats }: StatsChartsProps) {
  // Convert BigInt to number for Chart.js (assuming values are reasonable)
  const formatBigInt = (value: bigint): number => {
    return Number(value) / 1e6; // Assuming 18 decimals, adjust if needed
  };

  const chartData = {
    labels: stats.map(stat => stat.chain),
    datasets: [
      {
        label: 'Local Shares',
        data: stats.map(stat => formatBigInt(stat.localShares)),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#C9CBCF',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const assetsChartData = {
    labels: stats.map(stat => stat.chain),
    datasets: [
      {
        label: 'Local Assets',
        data: stats.map(stat => formatBigInt(stat.localAssets)),
        backgroundColor: [
          '#4BC0C0',
          '#FF9F40',
          '#9966FF',
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#C9CBCF',
          '#FF6384',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

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
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value.toFixed(4)}`;
          },
        },
      },
    },
  };

  const containerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    width: '100%',
    maxWidth: '800px',
  };

  const chartContainerStyle: React.CSSProperties = {
    background: '#fff',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid rgba(0,0,0,0.08)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
    textAlign: 'center',
    color: '#333',
  };

  if (!stats || stats.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={chartContainerStyle}>
          <div style={titleStyle}>🤷‍♂️</div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={chartContainerStyle}>
        <div style={titleStyle}>Local Shares by Chain</div>
        <Pie data={chartData} options={chartOptions} />
      </div>
      
      <div style={chartContainerStyle}>
        <div style={titleStyle}>Local Assets by Chain</div>
        <Pie data={assetsChartData} options={chartOptions} />
      </div>
    </div>
  );
}

export default StatsCharts; 