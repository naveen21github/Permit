import React, { useState } from 'react';
import { PermitApplication, WorkflowStatus, Department, DelayReason, ALLOWED_DELAY_REASONS } from '../types';
import {
  Search,
  Filter,
  FileText,
  User,
  Building,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  WifiOff,
  Layers,
  Table as TableIcon
} from 'lucide-react';

interface ApplicationListViewProps {
  applications: PermitApplication[];
  onSelectApp: (app: PermitApplication) => void;
  onNewApp: () => void;
}

export const ApplicationListView: React.FC<ApplicationListViewProps> = ({
  applications,
  onSelectApp,
  onNewApp
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [delayReasonFilter, setDelayReasonFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  const filteredApps = applications.filter((app) => {
    // Search query match
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      app.id.toLowerCase().includes(searchLower) ||
      app.permitType.toLowerCase().includes(searchLower) ||
      app.routeRef.toLowerCase().includes(searchLower) ||
      app.applicantRef.toLowerCase().includes(searchLower) ||
      app.currentOwner.toLowerCase().includes(searchLower);

    // Status filter
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;

    // Department filter
    const matchesDepartment = departmentFilter === 'ALL' || app.currentDepartment === departmentFilter;

    // Delay reason filter
    const matchesDelayReason = delayReasonFilter === 'ALL' || app.delayReason === delayReasonFilter;

    return matchesSearch && matchesStatus && matchesDepartment && matchesDelayReason;
  });

  const getStatusBadge = (status: WorkflowStatus, app: PermitApplication) => {
    switch (status) {
      case 'SUBMITTED':
        return <span className="badge badge-submitted">SUBMITTED</span>;
      case 'DOCUMENTS_PENDING':
        return <span className="badge badge-docs-pending">DOCS INCOMPLETE</span>;
      case 'DOCUMENTS_VERIFIED':
        return <span className="badge badge-docs-verified">DOCS VERIFIED</span>;
      case 'IN_REVIEW':
        return <span className="badge badge-in-review">IN REVIEW</span>;
      case 'PENDING_HANDOFF_ACCEPTANCE':
        return <span className="badge badge-pending-handoff">PENDING HANDOFF</span>;
      case 'DELAYED':
        return <span className="badge badge-delayed">DELAYED</span>;
      case 'APPROVED':
        return <span className="badge badge-approved">APPROVED</span>;
      case 'REJECTED':
        return <span className="badge badge-rejected">REJECTED</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Search & Filter Header Toolbar */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Permit Application Registry</h2>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Showing {filteredApps.length} of {applications.length} synthetic applications
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ display: 'flex', background: '#1e293b', padding: '3px', borderRadius: '8px', border: '1px solid #334155' }}>
              <button
                onClick={() => setViewMode('cards')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: viewMode === 'cards' ? '#3b82f6' : 'transparent',
                  color: viewMode === 'cards' ? '#ffffff' : '#94a3b8',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Layers style={{ width: '14px', height: '14px' }} /> Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: viewMode === 'table' ? '#3b82f6' : 'transparent',
                  color: viewMode === 'table' ? '#ffffff' : '#94a3b8',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <TableIcon style={{ width: '14px', height: '14px' }} /> Table
              </button>
            </div>

            <button className="btn btn-primary" onClick={onNewApp} style={{ fontSize: '0.85rem' }}>
              + Create Permit Application
            </button>
          </div>
        </div>

        {/* Filter Inputs Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '16px',
                height: '16px',
                color: '#64748b'
              }}
            />
            <input
              type="text"
              placeholder="Search ID, route, applicant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '9px 12px',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f8fafc',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="DOCUMENTS_PENDING">Documents Deficient</option>
            <option value="DOCUMENTS_VERIFIED">Documents Verified</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="PENDING_HANDOFF_ACCEPTANCE">Pending Handoff</option>
            <option value="DELAYED">Delayed</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            style={{
              padding: '9px 12px',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f8fafc',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          >
            <option value="ALL">All Departments</option>
            <option value="Document Intake & Verification">Document Intake</option>
            <option value="Traffic Management & Engineering">Traffic Management</option>
            <option value="Field Inspection & Safety">Field Inspection & Safety</option>
            <option value="Operations & Fleet Planning">Operations & Fleet</option>
            <option value="Executive & Regulatory Approval">Executive Approval</option>
          </select>

          {/* Delay Reason Filter */}
          <select
            value={delayReasonFilter}
            onChange={(e) => setDelayReasonFilter(e.target.value)}
            style={{
              padding: '9px 12px',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f8fafc',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          >
            <option value="ALL">All Delay Reasons</option>
            {ALLOWED_DELAY_REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Applications Content Display */}
      {filteredApps.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
          <FileText style={{ width: '48px', height: '48px', margin: '0 auto 12px', opacity: 0.5 }} />
          <h3>No applications matched your filter criteria</h3>
          <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Try resetting search filters or create a new permit request.</p>
        </div>
      ) : viewMode === 'cards' ? (
        /* CARDS VIEW */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="card"
              onClick={() => onSelectApp(app)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                borderLeft: app.delayReason
                  ? '4px solid #ef4444'
                  : app.pendingHandoff
                  ? '4px solid #ec4899'
                  : app.status === 'APPROVED'
                  ? '4px solid #10b981'
                  : '4px solid #3b82f6'
              }}
            >
              <div>
                {/* App ID & Badges */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#3b82f6' }}>
                      {app.id}
                    </span>
                    {app.syncStatus === 'pending_sync' && (
                      <span
                        className="badge"
                        style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', fontSize: '0.65rem' }}
                      >
                        <WifiOff style={{ width: '10px', height: '10px' }} /> Offline
                      </span>
                    )}
                  </div>
                  {getStatusBadge(app.status, app)}
                </div>

                {/* Permit Type & Route */}
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px', color: '#f8fafc' }}>{app.permitType}</h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '12px' }}>{app.routeRef}</p>

                {/* Accountable Owner Box */}
                <div
                  style={{
                    background: '#1e293b',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #334155',
                    fontSize: '0.8rem',
                    marginBottom: '10px'
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                    Current Responsible Owner
                  </div>
                  <div style={{ color: '#f8fafc', fontWeight: 600, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User style={{ width: '14px', height: '14px', color: '#3b82f6' }} />
                    <span>{app.currentOwner}</span>
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '2px' }}>
                    Dept: {app.currentDepartment} ({app.currentRole})
                  </div>

                  {/* Pending Handoff Notice */}
                  {app.pendingHandoff && (
                    <div
                      style={{
                        marginTop: '8px',
                        padding: '6px 8px',
                        background: 'rgba(236, 72, 153, 0.15)',
                        border: '1px solid rgba(236, 72, 153, 0.3)',
                        borderRadius: '6px',
                        color: '#f472b6',
                        fontSize: '0.75rem'
                      }}
                    >
                      ⚠️ Pending transfer to <strong>{app.pendingHandoff.toOwner}</strong> ({app.pendingHandoff.toDepartment})
                    </div>
                  )}
                </div>

                {/* Explicit Delay Reason Box */}
                {app.delayReason && (
                  <div
                    style={{
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      fontSize: '0.8rem',
                      color: '#f87171'
                    }}
                  >
                    <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertTriangle style={{ width: '14px', height: '14px' }} />
                      <span>Accountable Delay: {app.delayReason}</span>
                    </div>
                    {app.delayNotes && (
                      <div style={{ fontSize: '0.75rem', marginTop: '3px', color: '#fca5a5' }}>
                        "{app.delayNotes}"
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer Info */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #1e293b',
                  paddingTop: '10px',
                  fontSize: '0.75rem',
                  color: '#64748b'
                }}
              >
                <span>Docs: {app.documentsCheck.isComplete ? '✅ Complete' : '⚠️ Incomplete'}</span>
                <span>Submitted: {new Date(app.submissionTimestamp).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#1e293b', borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                <th style={{ padding: '12px 16px' }}>Application ID</th>
                <th style={{ padding: '12px 16px' }}>Type & Route</th>
                <th style={{ padding: '12px 16px' }}>Current Department</th>
                <th style={{ padding: '12px 16px' }}>Current Responsible Owner</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Accountable Delay Reason</th>
                <th style={{ padding: '12px 16px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => (
                <tr
                  key={app.id}
                  onClick={() => onSelectApp(app)}
                  style={{
                    borderBottom: '1px solid #1e293b',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#1a253e')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '12px 16px' }} className="mono">
                    <span style={{ fontWeight: 700, color: '#3b82f6' }}>{app.id}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>{app.permitType}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{app.routeRef}</div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{app.currentDepartment}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>{app.currentOwner}</div>
                    {app.pendingHandoff && (
                      <div style={{ fontSize: '0.7rem', color: '#f472b6' }}>
                        Pending Transfer ➔ {app.pendingHandoff.toOwner}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px' }}>{getStatusBadge(app.status, app)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {app.delayReason ? (
                      <span className="badge badge-delayed" style={{ fontSize: '0.7rem' }}>
                        {app.delayReason}
                      </span>
                    ) : (
                      <span style={{ color: '#64748b' }}>None</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                      Inspect ➔
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
