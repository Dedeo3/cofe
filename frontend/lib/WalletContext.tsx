"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { BrowserProvider, type JsonRpcSigner } from "ethers";
import { CHAIN_ID } from "./contracts";

declare global {
  interface Window {
    ethereum?: any;
  }
}

type Connection = { address: string; signer: JsonRpcSigner; provider: BrowserProvider };

type WalletState = {
  address: string | null;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  connecting: boolean;
  connect: () => Promise<Connection>;
  disconnect: () => void;
};

const WalletContext = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [connecting, setConnecting] = useState(false);

  const hydrate = useCallback(async (browserProvider: BrowserProvider): Promise<Connection> => {
    const s = await browserProvider.getSigner();
    const addr = await s.getAddress();
    setProvider(browserProvider);
    setSigner(s);
    setAddress(addr);
    return { address: addr, signer: s, provider: browserProvider };
  }, []);

  const disconnect = useCallback(() => {
    // There's no universal EIP-1193 "revoke" call — this clears the app's
    // own state (matches how most dApps' disconnect buttons behave). The
    // wallet extension itself still shows the site as authorized until the
    // user removes that permission from the wallet's own settings.
    setAddress(null);
    setProvider(null);
    setSigner(null);
  }, []);

  const connect = useCallback(async (): Promise<Connection> => {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("No wallet found — install MetaMask (or similar) and try again.");
    }
    setConnecting(true);
    try {
      const browserProvider = new BrowserProvider(window.ethereum);
      await browserProvider.send("eth_requestAccounts", []);
      const network = await browserProvider.getNetwork();
      if (Number(network.chainId) !== CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }],
          });
        } catch {
          throw new Error(`Please switch your wallet to chain ID ${CHAIN_ID} (Sepolia) and try again.`);
        }
      }
      return await hydrate(browserProvider);
    } finally {
      setConnecting(false);
    }
  }, [hydrate]);

  // Passively restore an already-authorized connection on mount (no popup),
  // and stay in sync if the user switches accounts or networks in the
  // wallet directly rather than through this app.
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;
    const ethereum = window.ethereum;

    (async () => {
      try {
        const accounts: string[] = await ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          await hydrate(new BrowserProvider(ethereum));
        }
      } catch {
        // nothing to restore
      }
    })();

    const onAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        hydrate(new BrowserProvider(ethereum));
      }
    };
    const onChainChanged = () => {
      hydrate(new BrowserProvider(ethereum));
    };

    ethereum.on?.("accountsChanged", onAccountsChanged);
    ethereum.on?.("chainChanged", onChainChanged);
    return () => {
      ethereum.removeListener?.("accountsChanged", onAccountsChanged);
      ethereum.removeListener?.("chainChanged", onChainChanged);
    };
  }, [hydrate, disconnect]);

  const value = useMemo(
    () => ({ address, provider, signer, connecting, connect, disconnect }),
    [address, provider, signer, connecting, connect, disconnect],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
