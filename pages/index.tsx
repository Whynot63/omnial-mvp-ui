import { ConnectKitButton } from 'connectkit';
import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import React from 'react';
import { VAULT_ADDRESS } from '../consts';

const TabbedInterface = dynamic(() => import('../components/TabbedInterface'), { ssr: false });

const Home: NextPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 20 }}>
      <ConnectKitButton />
      <div style={{ maxWidth: 800 }}>
        <h4 style={{ marginTop: "10px", marginBottom: "0px" }}>Omni-chain Vault (ERC-4626)</h4>
        <p style={{ fontSize: '14px', lineHeight: '15px', color: '#555', marginTop: "10px", marginBottom: "0px" }}>
          An Omni-chain Vault is a smart investment account that lets you deposit tokens on any supported chain while a smart contract or its manager allocates them across chains to earn yield.
        </p>
        <h4 style={{ marginTop: "10px", marginBottom: "0px" }}>How it differs from standard Vaults:</h4>
        <div style={{ fontSize: '14px', color: '#555', marginTop: "10px", marginBottom: "0px" }}>
          <ul style={{ paddingLeft: "14px" }}>
            <li>
              Standard vaults: limited to a single chain; liquidity and yield opportunities are fragmented by chain.            </li>
            <li>
              Omni-chain vaults: aggregate liquidity and yields from all supported chains into one shared strategy, while still allowing deposits and withdrawals natively on any chain.</li>
          </ul>
        </div>
        <h4 style={{ marginTop: "10px", marginBottom: "0px" }}>Benefits to the end users:</h4>
        <div style={{ fontSize: '14px', lineHeight: '20px', color: '#555', marginTop: "10px", marginBottom: "0px" }}>
          <ul style={{ paddingLeft: "14px" }}>
            <li>Unified yield: earn the best rates across all chains without bridging or juggling multiple protocols.</li>
            <li>Better risk composition: diversified exposure while keeping risk parameters isolated at the market level.</li>
            <li>Seamless access: deposit and withdraw instantly from any chain, with no manual bridging or fragmented positions to track.</li>
          </ul>
        </div>

        <h4><a target='_blank' style={{ fontWeight: 700, fontSize: 16 }} href={`https://debank.com/profile/${VAULT_ADDRESS}`}>{VAULT_ADDRESS}</a> / <a target='_blank' style={{ fontWeight: 700, fontSize: 16 }} href="https://github.com/Whynot63/omnial-mvp/blob/master/contracts/OmnialAaveUsdcVault.sol">github</a></h4>
      </div>
      <TabbedInterface />
    </div>
  );
};

export default Home;
