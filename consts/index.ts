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

export const AUSDC_ADDRESS = (chainId: number) => ({
    [polygon.id]: "0xA4D94019934D8333Ef880ABFFbF2FDd611C762BD",
    [optimism.id]: "0x38d693cE1dF5AaDF7bC62595A37D667aD57922e5",
    [arbitrum.id]: "0x724dc807b04555b71ed48a6896b6F41593b8C637",
    [avalanche.id]: "0x625E7708f30cA75bfd92586e17077590C60eb4cD",
}[chainId] as Address)