import React, { useMemo, useState } from 'react';
import { useAccount, useChainId, useSwitchChain, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { optimism, arbitrum, avalanche, polygon } from 'wagmi/chains';
import { erc20Abi, parseUnits } from 'viem';

// Using viem's standard ERC-20 ABI

// USDC addresses by chain id
const USDC_ADDRESS_BY_CHAIN_ID: Record<number, `0x${string}`> = {
  [polygon.id]: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
  [optimism.id]: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
  [arbitrum.id]: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  [avalanche.id]: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
};

const CHAINS = [polygon, optimism, arbitrum, avalanche];

type HexAddress = `0x${string}`;

export function DepositUSDC() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { chains, switchChain, isPending: isSwitching } = useSwitchChain();
  const [amount, setAmount] = useState<string>('');
  const [customDepositAddress, setCustomDepositAddress] = useState<string>('');

  // Prefer chain list from wagmi config; fallback to our CHAINS constant
  const availableChains = chains?.length ? chains : CHAINS;

  const selectedChain = useMemo(
    () => availableChains.find((c) => c.id === chainId) ?? CHAINS[0],
    [availableChains, chainId]
  );

  const tokenAddress = USDC_ADDRESS_BY_CHAIN_ID[selectedChain.id] as HexAddress | undefined;

  // Deposit contract address can come from env or a user-provided input
  const envDepositAddress = (process.env.NEXT_PUBLIC_DEPOSIT_CONTRACT_ADDRESS as HexAddress | undefined) ?? undefined;
  const depositContractAddress: HexAddress | undefined = (customDepositAddress as HexAddress) || envDepositAddress;

  // Read USDC decimals (default to 6 if not available yet)
  const { data: decimalsData } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'decimals',
    query: {
      enabled: Boolean(tokenAddress),
      staleTime: 60_000,
    },
  });

  const tokenDecimals: number = Number(decimalsData ?? 6);

  const parsedAmount = useMemo(() => {
    const numeric = Number(amount);
    if (!Number.isFinite(numeric) || numeric <= 0) return undefined;
    try {
      return parseUnits(amount as `${number}` | `${bigint}`, tokenDecimals);
    } catch {
      return undefined;
    }
  }, [amount, tokenDecimals]);

  // Fetch allowance for spender (deposit contract)
  const { data: allowanceData, isFetching: isFetchingAllowance } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [address as HexAddress, depositContractAddress as HexAddress],
    query: {
      enabled: Boolean(address && tokenAddress && depositContractAddress),
      refetchInterval: 15_000,
    },
  });

  const allowance: bigint = (allowanceData as bigint) ?? 0n;

  const needsApproval = useMemo(() => {
    if (!parsedAmount) return false;
    return allowance < parsedAmount;
  }, [allowance, parsedAmount]);

  const { writeContract, data: txHash, isPending: isWriting } = useWriteContract();
  const { data: receipt, isLoading: isWaiting } = useWaitForTransactionReceipt({ hash: txHash });

  const isBusy = isSwitching || isWriting || isWaiting || isFetchingAllowance;

  const onApprove = async () => {
    if (!tokenAddress || !depositContractAddress || !parsedAmount) return;
    writeContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'approve',
      args: [depositContractAddress, parsedAmount],
      chainId: selectedChain.id,
    }, {
      onSuccess: () => {
        // Refetch allowance after tx confirmation via receipt effect
      },
    });
  };

  const onDeposit = async () => {
    if (!depositContractAddress || !parsedAmount) return;
    // Assumes the deposit contract exposes: function deposit(uint256 amount)
    const DEPOSIT_ABI = [
      {
        name: 'deposit',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [{ name: 'amount', type: 'uint256' }],
        outputs: [],
      },
    ] as const;

    writeContract({
      address: depositContractAddress,
      abi: DEPOSIT_ABI,
      functionName: 'deposit',
      args: [parsedAmount],
      chainId: selectedChain.id,
    });
  };

  const canDeposit = Boolean(isConnected && parsedAmount && depositContractAddress && !needsApproval);

  const card: React.CSSProperties = {
    maxWidth: 420,
    width: '100%',
    padding: 16,
    borderRadius: 14,
    background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
    border: '1px solid rgba(0,0,0,0.06)',
    boxShadow: '0 4px 18px rgba(0,0,0,0.05)'
  };

  const label: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#444', marginBottom: 8 };
  const input: React.CSSProperties = {
    padding: '14px 16px',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.08)',
    background: '#fff',
    outline: 'none',
    fontSize: 16,
  };
  const primaryBtn: React.CSSProperties = {
    padding: '14px 16px',
    borderRadius: 12,
    border: '1px solid transparent',
    background: '#111',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    opacity: isBusy ? 0.7 : 1,
  };
  const chainBtnBase: React.CSSProperties = {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    padding: '8px 10px',
    borderRadius: 999,
    border: '1px solid rgba(0,0,0,0.08)',
    background: '#fff',
    cursor: 'pointer',
    fontSize: 13,
  };

  const getChainIconUrl = (c: any): string | undefined => c?.iconUrl || c?.icon?.url || undefined;

  const actionLabel = !isConnected
    ? 'Connect wallet'
    : needsApproval
      ? 'Approve'
      : 'Deposit';

  const onPrimaryAction = () => {
    if (!isConnected) return; // Connect handled by global button
    return needsApproval ? onApprove() : onDeposit();
  };

  return (
    <div style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>Deposit USDC</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={label}>Network</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8 }}>
            {(availableChains.length ? availableChains : CHAINS).map((c) => {
              const active = c.id === selectedChain.id;
              return (
                <button
                  key={c.id}
                  style={{
                    ...chainBtnBase,
                    justifyContent: 'center',
                    borderColor: active ? '#111' : 'rgba(0,0,0,0.08)',
                    background: active ? '#111' : '#fff',
                    color: active ? '#fff' : '#111',
                  }}
                  onClick={() => switchChain?.({ chainId: c.id })}
                  disabled={isSwitching}
                >
                  {getChainIconUrl(c) ? (
                    <img src={getChainIconUrl(c)} alt={c.name} width={16} height={16} style={{ borderRadius: 999 }} />
                  ) : null}
                  <span style={{ whiteSpace: 'nowrap' }}>{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div style={label}>Amount</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ ...input, flex: 1 }}
            />
            <div style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', fontSize: 13 }}>USDC</div>
          </div>
        </div>

        {!envDepositAddress && (
          <div>
            <div style={label}>Deposit contract</div>
            <input
              type="text"
              placeholder="0x..."
              value={customDepositAddress}
              onChange={(e) => setCustomDepositAddress(e.target.value)}
              style={input}
            />
          </div>
        )}

        <button
          onClick={onPrimaryAction}
          disabled={(!parsedAmount || !depositContractAddress || isBusy || !tokenAddress) && isConnected}
          style={primaryBtn}
        >
          {isBusy ? (needsApproval ? 'Approving…' : 'Processing…') : actionLabel}
        </button>

        {isConnected && (!depositContractAddress || !tokenAddress) && (
          <div style={{ fontSize: 12, color: '#777', textAlign: 'center' }}>
            Enter a valid deposit contract and ensure USDC is supported on this network.
          </div>
        )}
      </div>
    </div>
  );
}

export default DepositUSDC;

