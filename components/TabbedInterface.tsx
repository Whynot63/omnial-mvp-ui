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
    <div className="tabbed-interface">
      <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === 'deposit' ? 'active' : ''}`}
          onClick={() => setActiveTab('deposit')}
        >
          Deposit
        </button>
        <button
          className={`tab-button ${activeTab === 'withdraw' ? 'active' : ''}`}
          onClick={() => setActiveTab('withdraw')}
        >
          Withdraw
        </button>
        <button
          className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Stats
        </button>
      </div>
      
      <div className="tab-content">
        {renderTabContent()}
      </div>

      <style jsx>{`
        .tabbed-interface {
          max-width: 800px;
          width: 100%;
          background: #fff;
          border-radius: 16px;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 4px 18px rgba(0,0,0,0.05);
          overflow: hidden;
        }

        .tabs-container {
          display: flex;
          border-bottom: 1px solid rgba(0,0,0,0.08);
          background: #fafafa;
        }

        .tab-button {
          flex: 1;
          padding: 16px 24px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          color: #666;
          transition: all 0.2s ease;
          border-bottom: 3px solid transparent;
          position: relative;
        }

        .tab-button:hover {
          color: #333;
          background: rgba(0,0,0,0.02);
        }

        .tab-button.active {
          color: #111;
          background: #fff;
          border-bottom-color: #111;
        }

        .tab-content {
          padding: 24px;
          min-height: 300px;
        }
      `}</style>
    </div>
  );
}

export default TabbedInterface;
