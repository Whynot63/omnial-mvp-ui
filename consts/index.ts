import { Address } from 'viem';
import { optimism, arbitrum, avalanche, polygon } from 'wagmi/chains';

export const CHAINS = [polygon, optimism, arbitrum, avalanche];
export const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS as Address
export const USDC_ADDRESS = (chainId: number) => ({
    [polygon.id]: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
    [optimism.id]: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
    [arbitrum.id]: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    [avalanche.id]: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
}[chainId] as Address)