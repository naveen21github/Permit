import React from 'react';
import { PermitApplication } from '../types';
import {
  FileText,
  Clock,
  UserCheck,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface DashboardViewProps {
  applications: PermitApplication[];
  onSelectApp: (app: PermitApplication) => void;
  onOpenFieldCapture: () => void;
  onRunExperiment: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  applications,
  onSelectApp,
  onOpenFieldCapture,
  onRunExperiment
}) => {
  const totalApps = applications.length;
  const activeApps = applications.filter((a) => a.status !== 'APPROVED' && a.status !== 'REJECTED').length;
  const appsWithVisibleOwnership = applications.filter((a) => !!a.currentOwner).length;
  const delayedApps = applications.filter((a) => a.status === 'DELAYED' || !!a.delayReason);
  const pendingHandoffs = applications.filter((a) => a.status === 'PENDING_HANDOFF_ACCEPTANCE' || !!a.pendingHandoff);

  const visibilityPercentage = totalApps > 0 ? Math.round((appsWithVisibleOwnership / totalApps) * 100) : 100;
  const delayReasonRecordedPercentage =
    delayedApps.length > 0
      ? Math.round((delayedApps.filter((a) => !!a.delayReason).length / delayedApps.length) * 100)
      : 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Privacy & Non-Surveillance Commitment Banner */}
      <div
        style={{
          background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '10px' }}>
            <ShieldCheck style={{ width: '24px', height: '24px', color: '#34d399' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
              Responsible Non-Surveillance Governance Standard Enforced
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              This system tracks application movement, department handoffs, and operational bottlenecks. It explicitly
              does NOT collect employee GPS, keystrokes, or productivity rankings.
            </div>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={onRunExperiment} style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
          Run Synthetic Benchmark ➔
        </button>
      </div>

      {/* Primary KPI Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {/* Total Apps */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '12px' }}>
            <FileText style={{ width: '28px', height: '28px', color: '#60a5fa' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Applications
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>{totalApps}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Active permits in system</div>
          </div>
        </div>

        {/* Active Apps */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(139, 92, 246, 0.15)', borderRadius: '12px' }}>
            <Clock style={{ width: '28px', height: '28px', color: '#a78bfa' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
              Active In-Flight
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>{activeApps}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Processing across departments</div>
          </div>
        </div>

        {/* Visible Ownership */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '12px' }}>
            <UserCheck style={{ width: '28px', height: '28px', color: '#34d399' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
              Visible Ownership
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399' }}>{visibilityPercentage}%</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{appsWithVisibleOwnership} of {totalApps} apps assigned</div>
          </div>
        </div>

        {/* Accountable Delays */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '12px' }}>
            <AlertTriangle style={{ width: '28px', height: '28px', color: '#f87171' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
              Accountable Delays
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f87171' }}>{delayedApps.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {delayReasonRecordedPercentage}% with controlled delay reason
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Pending Handoffs & Accountable Delays */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {/* Pending Department Handoffs Box */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ec4899' }}></div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Pending Handoff Acceptances ({pendingHandoffs.length})</h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Ownership retained by sender until accepted</span>
          </div>

          {pendingHandoffs.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
              <CheckCircle style={{ width: '24px', height: '24px', margin: '0 auto 8px', color: '#34d399' }} />
              No pending handoffs awaiting acceptance.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pendingHandoffs.map((app) => {
                const handoff = app.pendingHandoff;
                return (
                  <div
                    key={app.id}
                    onClick={() => onSelectApp(app)}
                    style={{
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span className="mono" style={{ fontWeight: 700, color: '#3b82f6', fontSize: '0.85rem' }}>
                          {app.id}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#f8fafc', fontWeight: 600 }}>{app.permitType}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        Transfer: <strong>{handoff?.fromDepartment}</strong> ➔ <strong>{handoff?.toDepartment}</strong>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#f472b6', marginTop: '2px' }}>
                        Current Owner: {app.currentOwner} (Pending Target: {handoff?.toOwner})
                      </div>
                    </div>
                    <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                      View / Accept ➔
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Delayed Applications Box with Controlled Delay Reasons */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Applications Flagged Delayed ({delayedApps.length})</h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Mandatory controlled reasons recorded</span>
          </div>

          {delayedApps.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
              <CheckCircle style={{ width: '24px', height: '24px', margin: '0 auto 8px', color: '#34d399' }} />
              No applications currently experiencing delays.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {delayedApps.map((app) => (
                <div
                  key={app.id}
                  onClick={() => onSelectApp(app)}
                  style={{
                    background: '#1e293b',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className="mono" style={{ fontWeight: 700, color: '#f87171', fontSize: '0.85rem' }}>
                        {app.id}
                      </span>
                      <span className="badge badge-delayed" style={{ fontSize: '0.7rem' }}>
                        {app.delayReason || 'Delayed'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#f8fafc', fontWeight: 500 }}>{app.routeRef}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                      Owner: {app.currentOwner} ({app.currentDepartment})
                    </div>
                  </div>
                  <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                    Inspect ➔
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Action Footer Bar */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #131b2e 0%, #1a253e 100%)'
        }}
      >
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Field Inspector Quick Actions</h4>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Capture new permit requests offline or initiate cross-department handoffs directly.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={onOpenFieldCapture}>
            + Field Capture Application
          </button>
        </div>
      </div>
    </div>
  );
};
