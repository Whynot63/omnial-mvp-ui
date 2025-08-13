import React, { useState } from 'react';
import DepositUSDC from './DepositUSDC';
import Withdraw from './Withdraw';
import StatsCharts from './StatsCharts';

interface StatsData {
  chain: string;
  localShares: bigint;
  localAssets: bigint;
}

interface TabbedInterfaceProps {
  stats: StatsData[];
}

export function TabbedInterface({ stats }: TabbedInterfaceProps) {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'stats'>('deposit');

  const containerStyle: React.CSSProperties = {
    maxWidth: 800,
    width: '100%',
    background: '#fff',
    borderRadius: 16,
    border: '1px solid rgba(0,0,0,0.06)',
    boxShadow: '0 4px 18px rgba(0,0,0,0.05)',
    overflow: 'hidden'
  };

  const tabsContainerStyle: React.CSSProperties = {
    display: 'flex',
    borderBottom: '1px solid rgba(0,0,0,0.08)',
    background: '#fafafa'
  };

  const tabStyle: React.CSSProperties = {
    flex: 1,
    padding: '16px 24px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    color: '#666',
    transition: 'all 0.2s ease',
    borderBottom: '3px solid transparent',
    position: 'relative'
  };

  const activeTabStyle: React.CSSProperties = {
    ...tabStyle,
    color: '#111',
    background: '#fff',
    borderBottomColor: '#111'
  };

  const hoverTabStyle: React.CSSProperties = {
    ...tabStyle,
    color: '#333',
    background: 'rgba(0,0,0,0.02)'
  };

  const contentStyle: React.CSSProperties = {
    padding: '24px',
    minHeight: '400px'
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'deposit':
        return <DepositUSDC />;
      case 'withdraw':
        return <Withdraw />;
      case 'stats':
        return <StatsCharts stats={stats} />;
      default:
        return <DepositUSDC />;
    }
  };

  return (
    <div style={containerStyle}>
      <div style={tabsContainerStyle}>
        <button
          style={activeTab === 'deposit' ? activeTabStyle : tabStyle}
          onMouseEnter={(e) => {
            if (activeTab !== 'deposit') {
              e.currentTarget.style.color = '#333';
              e.currentTarget.style.background = 'rgba(0,0,0,0.02)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'deposit') {
              e.currentTarget.style.color = '#666';
              e.currentTarget.style.background = 'transparent';
            }
          }}
          onClick={() => setActiveTab('deposit')}
        >
          Deposit
        </button>
        <button
          style={activeTab === 'withdraw' ? activeTabStyle : tabStyle}
          onMouseEnter={(e) => {
            if (activeTab !== 'withdraw') {
              e.currentTarget.style.color = '#333';
              e.currentTarget.style.background = 'rgba(0,0,0,0.02)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'withdraw') {
              e.currentTarget.style.color = '#666';
              e.currentTarget.style.background = 'transparent';
            }
          }}
          onClick={() => setActiveTab('withdraw')}
        >
          Withdraw
        </button>
        <button
          style={activeTab === 'stats' ? activeTabStyle : tabStyle}
          onMouseEnter={(e) => {
            if (activeTab !== 'stats') {
              e.currentTarget.style.color = '#333';
              e.currentTarget.style.background = 'rgba(0,0,0,0.02)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'stats') {
              e.currentTarget.style.color = '#666';
              e.currentTarget.style.background = 'transparent';
            }
          }}
          onClick={() => setActiveTab('stats')}
        >
          Stats
        </button>
      </div>
      
      <div style={contentStyle}>
        {renderTabContent()}
      </div>
    </div>
  );
}

export default TabbedInterface;
