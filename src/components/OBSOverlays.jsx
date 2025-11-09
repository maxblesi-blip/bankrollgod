// src/components/OBSOverlays.jsx
// Production-ready OBS Browser Overlays für BankrollGod

import React, { useState, useEffect } from 'react';

// Environment-spezifische API URL
const getApiBaseUrl = () => {
  if (typeof window === 'undefined') return '';
  
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  } else {
    // Production API URL - ersetze mit deiner echten Backend URL
    return process.env.REACT_APP_BACKEND_URL || 'https://bankrollgod-backend.onrender.com';
  }
};

// Utility Functions
const formatCurrency = (amount, currency = 'EUR') => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0);
};

// Production-ready Styles (ohne CSS-Variablen)
const overlayBaseStyle = {
  background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(13, 95, 63, 0.9) 100%)',
  border: '2px solid #0d5f3f',
  borderRadius: '12px',
  padding: '16px',
  color: '#ffffff',
  fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
  fontWeight: '600',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  width: '100%',
  height: '80px',
  margin: '0',
  overflow: 'hidden',
  animation: 'fadeIn 0.5s ease-out'
};

const overlayContainerStyle = {
  margin: '0',
  padding: '0',
  width: '100vw',
  height: '100vh',
  backgroundColor: 'transparent',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden'
};

const valueStyle = {
  fontSize: '1.8rem',
  fontWeight: '700',
  color: '#ffffff',
  margin: '0'
};

const labelStyle = {
  fontSize: '0.9rem',
  color: '#a0a0a0',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '4px'
};

const positiveStyle = { color: '#16a34a' };
const goldStyle = { color: '#fbbf24' };
const negativeStyle = { color: '#dc2626' };

// CSS für Animationen
const globalCSS = `
  body { 
    margin: 0; 
    padding: 0; 
    overflow: hidden; 
    background: transparent; 
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }
`;

// Hook für Live-Daten mit Bankroll-Parameter und Production API
const useLiveData = (bankrollId) => {
  const [data, setData] = useState({
    activeSession: {
      total_buyins: 0,
      total_cashes: 0,
      cash_count: 0,
      session_name: "Lädt...",
      profit: 0
    },
    activeBankroll: {
      name: "Lädt...",
      current_amount: 0,
      starting_amount: 0,
      currency: "EUR"
    },
    isLoading: true,
    lastUpdate: null
  });
  
  useEffect(() => {
    const apiBaseUrl = getApiBaseUrl();
    
    const fetchBankrollData = async () => {
      try {
        if (bankrollId && apiBaseUrl) {
          console.log(`Fetching data for bankroll ${bankrollId} from ${apiBaseUrl}`);
          
          // Parallel API calls für bessere Performance
          const [bankrollResponse, sessionResponse] = await Promise.all([
            fetch(`${apiBaseUrl}/api/bankrolls/${bankrollId}`, {
              headers: {
                'Content-Type': 'application/json',
              }
            }),
            fetch(`${apiBaseUrl}/api/bankrolls/${bankrollId}/sessions/active`, {
              headers: {
                'Content-Type': 'application/json',
              }
            })
          ]);
          
          if (bankrollResponse.ok) {
            const bankroll = await bankrollResponse.json();
            const session = sessionResponse.ok ? await sessionResponse.json() : null;
            
            const sessionData = session ? {
              total_buyins: session.total_buyins || 0,
              total_cashes: session.total_cashes || 0,
              cash_count: session.cash_count || 0,
              session_name: session.name || "Aktive Session",
              profit: (session.total_cashes || 0) - (session.total_buyins || 0)
            } : {
              total_buyins: 0,
              total_cashes: 0,
              cash_count: 0,
              session_name: "Keine aktive Session",
              profit: 0
            };
            
            setData({
              activeSession: sessionData,
              activeBankroll: {
                name: bankroll.name,
                current_amount: bankroll.current_amount,
                starting_amount: bankroll.starting_amount,
                currency: bankroll.currency || 'EUR'
              },
              isLoading: false,
              lastUpdate: new Date().toLocaleTimeString()
            });
            
            console.log('✅ Data loaded successfully:', {
              bankroll: bankroll.name,
              session: sessionData.session_name,
              buyins: sessionData.total_buyins,
              cashes: sessionData.total_cashes
            });
            
          } else {
            throw new Error(`Bankroll API error: ${bankrollResponse.status}`);
          }
        } else {
          // Fallback zu Demo-Daten wenn keine Bankroll-ID oder API offline
          const demoData = {
            activeSession: {
              total_buyins: 150.00,
              total_cashes: 280.00,
              cash_count: 3,
              session_name: bankrollId ? "Demo Session (ID: " + bankrollId + ")" : "Demo Session",
              profit: 130.00
            },
            activeBankroll: {
              name: "GGPoker Demo",
              current_amount: 850.00,
              starting_amount: 700.00,
              currency: "EUR"
            },
            isLoading: false,
            lastUpdate: new Date().toLocaleTimeString()
          };
          
          setData(demoData);
          console.log('📊 Using demo data:', demoData);
        }
      } catch (error) {
        console.error('❌ API fetch error:', error);
        
        // Fallback zu Demo-Daten bei API-Fehlern
        setData({
          activeSession: {
            total_buyins: 150.00,
            total_cashes: 280.00,
            cash_count: 3,
            session_name: `Demo (API Offline)`,
            profit: 130.00
          },
          activeBankroll: {
            name: "Demo Bankroll",
            current_amount: 850.00,
            starting_amount: 700.00,
            currency: "EUR"
          },
          isLoading: false,
          lastUpdate: new Date().toLocaleTimeString()
        });
      }
    };

    // Sofort laden
    fetchBankrollData();
    
    // Update alle 5 Sekunden für Live-Daten
    const interval = setInterval(fetchBankrollData, 5000);
    
    return () => clearInterval(interval);
  }, [bankrollId]);

  return data;
};

// 1. Session Buy-Ins Overlay
export const SessionBuyInsOverlay = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const bankrollId = urlParams.get('bankroll');
  
  const { activeSession, isLoading } = useLiveData(bankrollId);
  
  return (
    <div style={overlayContainerStyle}>
      <style>{globalCSS}</style>
      <div style={{
        ...overlayBaseStyle, 
        flexDirection: 'column', 
        gap: '8px', 
        width: '180px',
        height: '80px',
        opacity: isLoading ? 0.7 : 1
      }}>
        <div style={labelStyle}>Buy-Ins</div>
        <div style={{...valueStyle, ...goldStyle}}>
          {formatCurrency(activeSession.total_buyins)}
        </div>
        {bankrollId && (
          <div style={{...labelStyle, fontSize: '0.7rem', opacity: 0.6}}>
            ID: {bankrollId}
          </div>
        )}
      </div>
    </div>
  );
};

// 2. Session Cashes Overlay
export const SessionCashesOverlay = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const bankrollId = urlParams.get('bankroll');
  
  const { activeSession, isLoading } = useLiveData(bankrollId);
  
  return (
    <div style={overlayContainerStyle}>
      <style>{globalCSS}</style>
      <div style={{
        ...overlayBaseStyle, 
        flexDirection: 'column', 
        gap: '8px', 
        width: '180px',
        height: '80px',
        opacity: isLoading ? 0.7 : 1
      }}>
        <div style={labelStyle}>Cashes</div>
        <div style={{...valueStyle, ...positiveStyle}}>
          {formatCurrency(activeSession.total_cashes)}
        </div>
        {bankrollId && (
          <div style={{...labelStyle, fontSize: '0.7rem', opacity: 0.6}}>
            ID: {bankrollId}
          </div>
        )}
      </div>
    </div>
  );
};

// 3. Bankroll Stand Overlay
export const BankrollStandOverlay = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const bankrollId = urlParams.get('bankroll');
  
  const { activeBankroll, isLoading } = useLiveData(bankrollId);
  const profit = activeBankroll.current_amount - activeBankroll.starting_amount;
  const isProfit = profit >= 0;
  
  return (
    <div style={overlayContainerStyle}>
      <style>{globalCSS}</style>
      <div style={{
        ...overlayBaseStyle, 
        flexDirection: 'column', 
        gap: '4px', 
        width: '200px',
        height: '100px',
        opacity: isLoading ? 0.7 : 1
      }}>
        <div style={{...labelStyle, ...goldStyle, fontSize: '0.8rem'}}>
          {activeBankroll.name}
        </div>
        <div style={{...valueStyle, fontSize: '1.6rem'}}>
          {formatCurrency(activeBankroll.current_amount, activeBankroll.currency)}
        </div>
        <div style={{
          fontSize: '1rem',
          fontWeight: '600',
          color: isProfit ? positiveStyle.color : negativeStyle.color,
          margin: '0'
        }}>
          {isProfit ? '+' : ''}{formatCurrency(profit, activeBankroll.currency)}
        </div>
        {bankrollId && (
          <div style={{...labelStyle, fontSize: '0.6rem', opacity: 0.5}}>
            ID: {bankrollId}
          </div>
        )}
      </div>
    </div>
  );
};

// 4. Cash Count Overlay
export const CashCountOverlay = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const bankrollId = urlParams.get('bankroll');
  
  const { activeSession, isLoading } = useLiveData(bankrollId);
  
  return (
    <div style={overlayContainerStyle}>
      <style>{globalCSS}</style>
      <div style={{
        ...overlayBaseStyle, 
        flexDirection: 'column', 
        gap: '4px', 
        width: '120px',
        height: '80px',
        opacity: isLoading ? 0.7 : 1
      }}>
        <div style={{fontSize: '1.2rem', margin: '0'}}>🏆</div>
        <div style={{...valueStyle, ...goldStyle, fontSize: '2rem'}}>
          {activeSession.cash_count}
        </div>
        <div style={{...labelStyle, fontSize: '0.8rem'}}>Cashes</div>
        {bankrollId && (
          <div style={{...labelStyle, fontSize: '0.6rem', opacity: 0.5}}>
            ID: {bankrollId}
          </div>
        )}
      </div>
    </div>
  );
};

// 5. Session Profit Overlay (BONUS)
export const SessionProfitOverlay = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const bankrollId = urlParams.get('bankroll');
  
  const { activeSession, activeBankroll, isLoading } = useLiveData(bankrollId);
  const sessionProfit = activeSession.profit || (activeSession.total_cashes - activeSession.total_buyins);
  const isProfit = sessionProfit >= 0;
  
  return (
    <div style={overlayContainerStyle}>
      <style>{globalCSS}</style>
      <div style={{
        ...overlayBaseStyle, 
        flexDirection: 'column', 
        gap: '6px', 
        width: '160px',
        height: '80px',
        opacity: isLoading ? 0.7 : 1,
        background: isProfit 
          ? 'linear-gradient(135deg, rgba(22, 163, 74, 0.9) 0%, rgba(13, 95, 63, 0.9) 100%)'
          : 'linear-gradient(135deg, rgba(220, 38, 38, 0.9) 0%, rgba(153, 27, 27, 0.9) 100%)'
      }}>
        <div style={labelStyle}>Session P/L</div>
        <div style={{
          ...valueStyle, 
          color: isProfit ? positiveStyle.color : negativeStyle.color,
          fontSize: '1.4rem'
        }}>
          {isProfit ? '+' : ''}{formatCurrency(sessionProfit, activeBankroll.currency)}
        </div>
        {bankrollId && (
          <div style={{...labelStyle, fontSize: '0.6rem', opacity: 0.5}}>
            ID: {bankrollId}
          </div>
        )}
      </div>
    </div>
  );
};

// Overlay Index (für Testing und Setup)
export const OBSOverlaysIndex = () => {
  const overlays = [
    { name: 'Session Buy-Ins', path: '/obs/buyins', size: '180x80px', description: 'Total eingezahlte Buy-Ins der aktuellen Session' },
    { name: 'Session Cashes', path: '/obs/cashes', size: '180x80px', description: 'Total Cash-Outs der aktuellen Session' },
    { name: 'Bankroll Balance', path: '/obs/bankroll', size: '200x100px', description: 'Aktuelle Bankroll mit Gesamtprofit' },
    { name: 'Cash Count', path: '/obs/cash-count', size: '120x80px', description: 'Anzahl erfolgreicher Cash-Outs' },
    { name: 'Session Profit/Loss', path: '/obs/session-profit', size: '160x80px', description: 'Profit/Verlust der aktuellen Session' }
  ];

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f0f0f 0%, #083328 100%)',
      minHeight: '100vh',
      padding: '2rem',
      color: '#ffffff',
      fontFamily: 'Segoe UI, sans-serif'
    }}>
      <h1 style={{
        background: 'linear-gradient(135deg, #fbbf24, #d4af37)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontSize: '3rem',
        textAlign: 'center',
        marginBottom: '1rem'
      }}>
        🎥 BankrollGod OBS Overlays
      </h1>
      
      <p style={{
        textAlign: 'center',
        color: '#a0a0a0',
        marginBottom: '3rem',
        fontSize: '1.1rem'
      }}>
        Live-Updates alle 5 Sekunden • Production-ready für OBS Browser Sources
      </p>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '2rem',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {overlays.map((overlay, index) => (
          <div key={index} style={{
            background: 'rgba(26, 26, 26, 0.8)',
            border: '2px solid #0d5f3f',
            borderRadius: '15px',
            padding: '2rem',
            textAlign: 'center',
            transition: 'transform 0.3s ease, border-color 0.3s ease'
          }}>
            <h3 style={{color: '#fbbf24', marginBottom: '0.5rem', fontSize: '1.4rem'}}>
              {overlay.name}
            </h3>
            <p style={{color: '#a0a0a0', marginBottom: '0.5rem', fontSize: '0.9rem'}}>
              {overlay.description}
            </p>
            <span style={{
              background: '#0d5f3f',
              color: '#fbbf24',
              padding: '0.3rem 0.6rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: '600'
            }}>
              {overlay.size}
            </span>
            
            {/* Live Preview */}
            <div style={{
              background: '#000',
              borderRadius: '12px',
              margin: '1.5rem 0',
              height: '100px',
              overflow: 'hidden',
              border: '2px solid #0d5f3f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <iframe 
                src={overlay.path}
                width="100%" 
                height="100"
                frameBorder="0"
                title={overlay.name}
                style={{border: 'none', transform: 'scale(0.8)'}}
              />
            </div>
            
            <div style={{
              background: 'rgba(13, 95, 63, 0.2)',
              color: '#fbbf24',
              padding: '1rem',
              borderRadius: '10px',
              fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              wordBreak: 'break-all',
              border: '1px solid #0d5f3f'
            }}>
              {window.location.origin}{overlay.path}?bankroll=YOUR_BANKROLL_ID
            </div>
            
            <div style={{display: 'flex', gap: '0.75rem'}}>
              <a 
                href={`${overlay.path}?bankroll=demo`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'linear-gradient(135deg, #0d5f3f, #16a34a)',
                  color: '#fbbf24',
                  padding: '0.8rem 1.2rem',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  flex: '1',
                  textAlign: 'center',
                  transition: 'transform 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0px)'}
              >
                👁️ Preview Demo
              </a>
              <button 
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}${overlay.path}?bankroll=YOUR_BANKROLL_ID`)}
                style={{
                  background: 'rgba(251, 191, 36, 0.1)',
                  color: '#fbbf24',
                  border: '2px solid #fbbf24',
                  padding: '0.8rem 1.2rem',
                  borderRadius: '10px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  flex: '1',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(251, 191, 36, 0.2)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(251, 191, 36, 0.1)';
                  e.target.style.transform = 'translateY(0px)';
                }}
              >
                📋 Copy URL
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div style={{
        maxWidth: '800px',
        margin: '4rem auto 0',
        padding: '2rem',
        background: 'rgba(26, 26, 26, 0.6)',
        border: '2px solid #0d5f3f',
        borderRadius: '15px'
      }}>
        <h3 style={{color: '#fbbf24', textAlign: 'center', marginBottom: '1.5rem'}}>
          🎯 Setup in OBS Studio
        </h3>
        <ol style={{
          color: '#a0a0a0',
          paddingLeft: '1.5rem',
          lineHeight: '1.8',
          fontSize: '1rem'
        }}>
          <li><strong>Source hinzufügen</strong> → Browser Source</li>
          <li><strong>URL einfügen</strong> (ersetze YOUR_BANKROLL_ID mit echter ID)</li>
          <li><strong>Größe einstellen</strong> entsprechend Badge</li>
          <li><strong>"Refresh when scene becomes active"</strong> aktivieren</li>
          <li><strong>Optional:</strong> Custom CSS für weitere Anpassungen</li>
        </ol>
      </div>
    </div>
  );
};