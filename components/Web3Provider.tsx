import React from 'react';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider, getDefaultConfig } from 'connectkit';
import { optimism, arbitrum, avalanche, polygon } from "wagmi/chains";

const config = createConfig(
  getDefaultConfig({
    appName: 'ConnectKit Next.js demo',
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    chains: [optimism, arbitrum, avalanche, polygon],
    transports: {
      [optimism.id]: http("https://optimism.gateway.tenderly.co"),
      [arbitrum.id]: http("https://arbitrum.gateway.tenderly.co"),
      [avalanche.id]: http("https://avalanche.gateway.tenderly.co"),
      [polygon.id]: http("https://polygon.gateway.tenderly.co"),
    },
    enableFamily: false,
  })
);

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider debugMode>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
