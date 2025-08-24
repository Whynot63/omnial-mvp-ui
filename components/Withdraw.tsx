import React, { useMemo, useState } from 'react';
import { useAccount, useChainId, useSwitchChain, useReadContract, useWriteContract, useWaitForTransactionReceipt, useReadContracts } from 'wagmi';
import { erc20Abi, formatUnits, parseUnits, type Address } from 'viem';
import { VaultAbi } from '../consts/abis/Vault';
import { CHAINS, VAULT_ADDRESS } from '../consts';

const EXTRA_OPTIONS = "0x"
const DECIMALS = 6

export function Withdraw() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { chains, switchChain, isPending: isSwitching } = useSwitchChain();
  const [amount, setAmount] = useState<string>('');
  const availableChains = chains?.length ? chains : CHAINS;

  const { data: fee } = useReadContract({
    address: VAULT_ADDRESS,
    abi: VaultAbi,
    functionName: 'quoteDeposit',
    args: [EXTRA_OPTIONS]
  })
  const { data: rawTokenData } = useReadContracts({
    contracts: CHAINS.flatMap((chain) => ([
      {
        address: VAULT_ADDRESS,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address],
        chainId: chain.id
      },
    ])),
    query: {
      enabled: address !== undefined
    }
  })

  const tokenData = useMemo(() => {
    if (rawTokenData === undefined) return [];

    return CHAINS.map((chain, idx) => {
      const rawBalance = rawTokenData[idx];
      return {
        chain,
        balance: rawBalance.result !== undefined ? BigInt(rawBalance.result) : 0n,
      }
    }).filter(({ balance }) => balance !== 0n);
  }, [rawTokenData])

  const selectedChain = useMemo(
    () => availableChains.find((c) => c.id === chainId) ?? CHAINS[0],
    [availableChains, chainId]
  );

  const parsedAmount = useMemo(() => {
    const numeric = Number(amount);
    if (!Number.isFinite(numeric) || numeric <= 0) return undefined;
    try {
      return parseUnits(amount as `${number}` | `${bigint}`, DECIMALS);
    } catch {
      return undefined;
    }
  }, [amount]);

  // Fetch allowance for spender (deposit contract)


  const { writeContract, data: txHash, isPending: isWriting } = useWriteContract();
  const { data: receipt, isLoading: isWaiting } = useWaitForTransactionReceipt({ hash: txHash });

  const isBusy = isSwitching || isWriting || isWaiting;

  const onRedeem = async () => {
    if (!parsedAmount || !address || !fee) return;
    writeContract({
      address: VAULT_ADDRESS,
      abi: VaultAbi,
      functionName: 'redeem',
      args: [parsedAmount, address as Address, address as Address, EXTRA_OPTIONS],
      chainId: selectedChain.id,
      value: fee.nativeFee
    });
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
    : 'Withdraw';

  const onPrimaryAction = () => {
    if (!isConnected) return; // Connect handled by global button
    return onRedeem();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>Withdraw shares</div>
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
            <div style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', fontSize: 13 }}>shares</div>
          </div>
        </div>

        <button
          onClick={onPrimaryAction}
          disabled={(!parsedAmount || !VAULT_ADDRESS || isBusy) && isConnected}
          style={primaryBtn}
        >
          {isBusy ? ('Processing…') : actionLabel}
        </button>
      </div>

      {tokenData.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={label}>Your vault shares</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tokenData.sort((a, b) => Number(b.balance - a.balance)).map((td, index) => (
              <div
                key={`${td.chain.id}-${index}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: 'rgba(0,0,0,0.02)',
                  border: '1px solid rgba(0,0,0,0.04)',
                  fontSize: 14,
                }}
                onClick={() => {
                  switchChain?.({ chainId: td.chain.id })
                  setAmount(formatUnits(td.balance, 18))
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {getChainIconUrl(td.chain) ? (
                    <img
                      src={getChainIconUrl(td.chain)}
                      alt={td.chain.name}
                      width={20}
                      height={20}
                      style={{ borderRadius: 999 }}
                    />
                  ) : (
                    <div style={{
                      width: 20,
                      height: 20,
                      borderRadius: 999,
                      background: 'rgba(0,0,0,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      fontWeight: 600,
                      color: '#666'
                    }}>
                      {td.chain.name.charAt(0)}
                    </div>
                  )}
                  <span style={{ fontWeight: 500, color: '#333' }}>{td.chain.name}</span>
                </div>
                <div style={{
                  fontWeight: 600,
                  color: '#111',
                  fontFamily: 'monospace',
                  fontSize: 15
                }}>
                  {Number(formatUnits(td.balance, 18)).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 6
                  })} shares
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Withdraw;

