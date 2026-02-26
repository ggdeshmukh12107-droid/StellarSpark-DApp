import React, { useState, useEffect } from 'react';
import { StellarWalletsKit, Networks } from '@creit.tech/stellar-wallets-kit';
import { FreighterModule } from '@creit.tech/stellar-wallets-kit/modules/freighter';
import { AlbedoModule } from '@creit.tech/stellar-wallets-kit/modules/albedo';
import { WalletConnectModule } from '@creit.tech/stellar-wallets-kit/modules/wallet-connect';
import * as StellarSdk from 'stellar-sdk';
import './index.css';

// ─── Constants ─────────────────────────────────────────────────────────────
const CONTRACT_ID = 'YOUR_CONTRACT_ID'; // Replace with your deployed Soroban contract ID
const NETWORK = Networks.TESTNET;
const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const CAMPAIGN_GOAL = 1000; // XLM

// Create the WalletConnect module with the Reown Project ID
const wcModule = new WalletConnectModule({
  projectId: 'b56e18d47c72ab683b10814fe9495694', // From your Reown dashboard
  metadata: {
    name: 'StellarSpark',
    description: 'StellarSpark - Crowdfunding on Stellar',
    url: 'https://stellarspark.io',
    icons: ['https://avatars.githubusercontent.com/u/179229932']
  }
});

// Initialize kit globally with Freighter, Albedo and WalletConnect
// In v2 of @creit.tech/stellar-wallets-kit, we use static methods.
StellarWalletsKit.init({
  network: NETWORK,
  modules: [
    new FreighterModule(),
    new AlbedoModule(),
    wcModule
  ]
});

// ─── App Component ──────────────────────────────────────────────────────────
function App() {
  // Local state
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [campaignStatus, setCampaignStatus] = useState({ total: 0, target: CAMPAIGN_GOAL });
  const [txStatus, setTxStatus] = useState(null); // null | 'pending' | 'success' | 'fail'
  const [error, setError] = useState(null);
  const [activityFeed, setActivityFeed] = useState([
    { id: 1, address: 'GDGQ...F3YM', amount: '150', time: '2 mins ago' },
    { id: 2, address: 'GBT7...KQXP', amount: '80', time: '15 mins ago' },
    { id: 3, address: 'GABC...WXYZ', amount: '200', time: '1 hour ago' },
  ]);

  // Poll campaign status every 10s
  useEffect(() => {
    fetchCampaignStatus();
    const interval = setInterval(fetchCampaignStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchCampaignStatus = async () => {
    try {
      console.log('[StellarSpark] Polling contract status...');
    } catch (err) {
      console.error('[StellarSpark] Failed to fetch status:', err);
    }
  };

  const connectWallet = async () => {
    try {
      setError(null);
      // In v2, authModal() opens the UI and returns the selected address
      const res = await StellarWalletsKit.authModal();
      if (res?.address) {
        setAddress(res.address);
      }
    } catch (err) {
      setError('Wallet not found or connection rejected');
      console.error(err);
    }
  };

  // ─── Handle Donation ──────────────────────────────────────────────────────
  const handleDonate = async () => {
    // Error type 1: Not connected
    if (!address) {
      setError('Please connect your wallet first.');
      connectWallet();
      return;
    }

    // Error type 2: Invalid amount
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid donation amount.');
      return;
    }

    try {
      setError(null);
      setTxStatus('pending');

      const server = new StellarSdk.Horizon.Server(HORIZON_URL);
      let account;
      try {
        account = await server.loadAccount(address);
      } catch (err) {
        if (err.response?.status === 404) {
          throw new Error('Account not found on testnet. Please fund it at friendbot.stellar.org first.');
        }
        throw err;
      }

      // Build a real demo transaction to trigger the Wallet popup!
      const fee = await server.fetchBaseFee();
      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(StellarSdk.Operation.payment({
          destination: address, // sending to self just for demo purposes
          asset: StellarSdk.Asset.native(),
          amount: parsedAmount.toString()
        }))
        .setTimeout(30)
        .build();

      // Trigger the wallet popup!
      const { signedTxXdr } = await StellarWalletsKit.signTransaction(
        transaction.toXDR(),
        { networkPassphrase: StellarSdk.Networks.TESTNET }
      );

      // Submit to testnet
      const signedTransaction = StellarSdk.TransactionBuilder.fromXDR(
        signedTxXdr,
        StellarSdk.Networks.TESTNET
      );
      await server.submitTransaction(signedTransaction);

      // ─── Simulate success ──────────────────────────────────────────────
      setTxStatus('success');
      setCampaignStatus((prev) => ({
        ...prev,
        total: Math.min(prev.total + parsedAmount, prev.target),
      }));
      setActivityFeed((prev) => [
        {
          id: Date.now(),
          address: address.slice(0, 4) + '...' + address.slice(-4),
          amount: parsedAmount.toString(),
          time: 'Just now',
        },
        ...prev.slice(0, 9),
      ]);
      setAmount('');
    } catch (err) {
      setTxStatus('fail');
      setError(err.message || 'Transaction failed. Please try again.');
    }
  };

  const progress = Math.min((campaignStatus.total / campaignStatus.target) * 100, 100);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div>
      <nav className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.5rem' }}>⚡</span>
          <h2 style={{ color: 'var(--secondary)', fontFamily: 'Outfit, sans-serif' }}>StellarSpark</h2>
        </div>

        {address ? (
          <button className="btn-primary" onClick={connectWallet} id="wallet-button">
            {address.slice(0, 6)}...{address.slice(-4)}
          </button>
        ) : (
          <button className="btn-primary" onClick={connectWallet} id="connect-wallet-btn">
            Connect Wallet
          </button>
        )}
      </nav>

      <div className="container">
        <header className="hero">
          <h1>Fuel the Future of Soroban</h1>
          <p>
            Support the next generation of decentralised applications on Stellar.
            Transparent, fast, and powered by the community.
          </p>
        </header>

        <div className="glass-card" style={{ padding: '40px', maxWidth: '780px', margin: '0 auto' }}>
          <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '.85rem' }}>Campaign Progress</span>
            <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>{progress.toFixed(1)}%</span>
          </div>
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>

          <div className="stats-grid" style={{ marginTop: '24px' }}>
            <div className="stat-item">
              <span className="stat-value">{campaignStatus.total} <small style={{ fontSize: '.65em', opacity: .7 }}>XLM</small></span>
              <span className="stat-label">Raised</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{campaignStatus.target} <small style={{ fontSize: '.65em', opacity: .7 }}>XLM</small></span>
              <span className="stat-label">Goal</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{activityFeed.length}</span>
              <span className="stat-label">Backers</span>
            </div>
          </div>

          <div style={{ marginTop: '36px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <input
              type="number"
              min="1"
              className="input-glass"
              placeholder="Amount in XLM"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError(null); setTxStatus(null); }}
              id="donation-amount"
              style={{ flex: 1 }}
            />
            <button
              className="btn-primary"
              onClick={handleDonate}
              disabled={txStatus === 'pending'}
              id="donate-btn"
              style={{ whiteSpace: 'nowrap' }}
            >
              {txStatus === 'pending' ? '⏳ Processing…' : '💫 Donate Now'}
            </button>
          </div>

          {error && (
            <p id="error-msg" style={{
              color: 'var(--accent)',
              marginTop: '12px',
              fontSize: '.9rem',
              textAlign: 'center',
              animation: 'fadeIn .3s ease'
            }}>
              ⚠ {error}
            </p>
          )}

          {txStatus && (
            <div id="tx-status-banner" style={{
              marginTop: '18px',
              padding: '12px 20px',
              borderRadius: '12px',
              textAlign: 'center',
              fontWeight: 600,
              background: txStatus === 'success' ? 'rgba(16,185,129,.12)' : 'rgba(244,63,94,.12)',
              border: `1px solid ${txStatus === 'success' ? '#10b981' : '#f43f5e'}`,
              color: txStatus === 'success' ? '#34d399' : '#fb7185',
              transition: 'all .4s ease'
            }}>
              {txStatus === 'success' && '🚀 Donation Successful! Thank you for supporting StellarSpark.'}
              {txStatus === 'fail' && '❌ Transaction Failed — please try again.'}
            </div>
          )}
        </div>

        <div className="activity-feed" style={{ maxWidth: '780px', margin: '40px auto 0' }}>
          <h3 style={{ marginBottom: '15px' }}>🔴 Live Activity</h3>
          <div className="glass-card" style={{ padding: '20px 28px' }}>
            {activityFeed.length === 0 && (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No donations yet — be the first!</p>
            )}
            {activityFeed.map((event) => (
              <div key={event.id} className="activity-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'linear-gradient(135deg,var(--primary),var(--secondary))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem'
                  }}>👤</span>
                  <div>
                    <span style={{ display: 'block', fontWeight: 600 }}>{event.address}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '.8rem' }}>{event.time}</span>
                  </div>
                </div>
                <span style={{ fontWeight: 700, color: 'var(--secondary)' }}>+{event.amount} XLM</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '60px', fontSize: '.85rem' }}>
          Built on <strong style={{ color: 'var(--secondary)' }}>Stellar Testnet</strong> • Powered by <strong style={{ color: 'var(--primary)' }}>Soroban</strong>
        </p>
      </div>
    </div>
  );
}

export default App;
