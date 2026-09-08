import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Smartphone,
  BarChart3,
  CheckCircle2,
  BookOpen,
  Wifi,
  WifiOff,
  RefreshCw,
  Bus
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOnline: boolean;
  onToggleOnline: () => void;
  pendingSyncCount: number;
  onSync: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isOnline,
  onToggleOnline,
  pendingSyncCount,
  onSync
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'applications', label: 'Permit Applications', icon: FileText },
    { id: 'field', label: 'Field Capture (Offline)', icon: Smartphone },
    { id: 'experiment', label: 'Baseline vs Prototype', icon: BarChart3 },
    { id: 'tests', label: 'Test Harness', icon: CheckCircle2 },
    { id: 'docs', label: 'Architecture & Docs', icon: BookOpen }
  ];

  return (
    <header style={{ background: '#0b0f19', borderBottom: '1px solid #24324d', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
        {/* Top Header Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)'
              }}
            >
              <Bus style={{ width: '24px', height: '24px', color: '#ffffff' }} />
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                CROSS-DEPARTMENT PERMIT TRACKER
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
                Public Transport Authority • Accountable Delay & Ownership System
              </div>
            </div>
          </div>

          {/* Network Connection & Offline Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {pendingSyncCount > 0 && (
              <button
                onClick={onSync}
                className="btn btn-warning"
                style={{ fontSize: '0.8rem', padding: '6px 12px', borderRadius: '20px' }}
                title="Synchronize offline saved applications"
              >
                <RefreshCw style={{ width: '14px', height: '14px' }} className="spin" />
                <span>{pendingSyncCount} Awaiting Sync</span>
              </button>
            )}

            <button
              onClick={onToggleOnline}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '20px',
                border: isOnline ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
                background: isOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: isOnline ? '#34d399' : '#fbbf24',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Click to simulate offline / online connection state"
            >
              {isOnline ? (
                <>
                  <Wifi style={{ width: '14px', height: '14px' }} />
                  <span>ONLINE (Connected)</span>
                </>
              ) : (
                <>
                  <WifiOff style={{ width: '14px', height: '14px' }} />
                  <span>OFFLINE MODE</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '8px', borderTop: '1px solid #1e293b', paddingTop: '8px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '8px 8px 0 0',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  border: 'none',
                  borderBottom: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                  background: isActive ? '#131b2e' : 'transparent',
                  color: isActive ? '#3b82f6' : '#94a3b8',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon style={{ width: '16px', height: '16px' }} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
