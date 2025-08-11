import { Address } from 'viem';
import { optimism, arbitrum, avalanche, polygon } from 'wagmi/chains';

export const CHAINS = [polygon, optimism, arbitrum, avalanche];
export const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS as Address
