import React, { useMemo, useState } from 'react';
import { useAccount, useChainId, useSwitchChain, useReadContract, useWriteContract, useWaitForTransactionReceipt, useReadContracts } from 'wagmi';
import { decodeAbiParameters, erc20Abi, Hex, parseUnits, type Address } from 'viem';
import { VaultAbi } from '../consts/abis/Vault';
import { CHAINS, VAULT_ADDRESS } from '../consts';

export function DepositUSDC() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { chains, switchChain, isPending: isSwitching } = useSwitchChain();
  const [amount, setAmount] = useState<string>('');
  // Vault address from env

  // Prefer chain list from wagmi config; fallback to our CHAINS constant
  const availableChains = chains?.length ? chains : CHAINS;

  const selectedChain = useMemo(
    () => availableChains.find((c) => c.id === chainId) ?? CHAINS[0],
    [availableChains, chainId]
  );

  // Read USDC token address from Vault
  const { data: usdcAddressData } = useReadContract({
    address: VAULT_ADDRESS,
    abi: VaultAbi,
    functionName: 'USDC',
    query: {
      enabled: Boolean(VAULT_ADDRESS),
      staleTime: 60_000,
    },
  });
  const tokenAddress = usdcAddressData as Address | undefined;

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
    args: [address as Address, VAULT_ADDRESS],
    query: {
      enabled: Boolean(address),
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
    if (!tokenAddress || !parsedAmount) return;
    writeContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'approve',
      args: [VAULT_ADDRESS, parsedAmount],
      chainId: selectedChain.id,
    }, {
      onSuccess: () => {
        // Refetch allowance after tx confirmation via receipt effect
      },
    });
  };

  const onDeposit = async () => {
    if (!VAULT_ADDRESS || !parsedAmount || !address) return;
    // Vault deposit: deposit(uint256 assets, address receiver, bytes _extraOptions) payable
    writeContract({
      address: VAULT_ADDRESS,
      abi: VaultAbi,
      functionName: 'deposit',
      args: [parsedAmount, address as Address, '0x'],
      chainId: selectedChain.id,
    });
  };

  const canDeposit = Boolean(isConnected && parsedAmount && VAULT_ADDRESS && !needsApproval);

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

        {!VAULT_ADDRESS && (
          <div style={{ fontSize: 12, color: '#777', textAlign: 'center' }}>
            Set env var `NEXT_PUBLIC_VAULT_ADDRESS` to enable deposits.
          </div>
        )}

        <button
          onClick={onPrimaryAction}
          disabled={(!parsedAmount || !VAULT_ADDRESS || isBusy || !tokenAddress) && isConnected}
          style={primaryBtn}
        >
          {isBusy ? (needsApproval ? 'Approving…' : 'Processing…') : actionLabel}
        </button>
      </div>
    </div>
  );
}

export default DepositUSDC;

