import React, { useState } from 'react';
import {
  PermitApplication,
  Department,
  Role,
  DelayReason,
  ALLOWED_DELAY_REASONS,
  DepartmentHandoff
} from '../types';
import {
  verifyDocuments,
  initiateHandoff,
  acceptHandoff,
  logDelay,
  resolveDelay,
  approveApplication,
  rejectApplication,
  WorkflowValidationError
} from '../services/workflowEngine';
import {
  X,
  UserCheck,
  Building,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  FileCheck,
  Send,
  CheckSquare,
  Clock,
  History,
  AlertCircle,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface ApplicationDetailModalProps {
  app: PermitApplication;
  onClose: () => void;
  onUpdateApp: (updatedApp: PermitApplication) => void;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  app,
  onClose,
  onUpdateApp
}) => {
  const [activeActionTab, setActiveActionTab] = useState<'details' | 'docs' | 'handoff' | 'delay' | 'decision'>(
    'details'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Document check form state
  const [providedDocs, setProvidedDocs] = useState<string[]>(app.documentsCheck.providedDocuments);
  const [verifierName, setVerifierName] = useState('Officer Sarah Chen');

  // Handoff form state
  const [targetDept, setTargetDept] = useState<Department>('Traffic Management & Engineering');
  const [targetRole, setTargetRole] = useState<Role>('Traffic Engineer');
  const [targetOwner, setTargetOwner] = useState('Engineer Bob Smith');
  const [senderName, setSenderName] = useState(app.currentOwner);
  const [handoffReason, setHandoffReason] = useState('');

  // Delay form state
  const [selectedDelayReason, setSelectedDelayReason] = useState<DelayReason>('Awaiting applicant document');
  const [delayNotes, setDelayNotes] = useState('');
  const [loggedByName, setLoggedByName] = useState(app.currentOwner);

  // Delay resolution form state
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Decision form state
  const [approverName, setApproverName] = useState('Director Jane Doe');
  const [approvalNotes, setApprovalNotes] = useState('All regulatory criteria satisfied.');
  const [rejectionReason, setRejectionReason] = useState('');

  const clearError = () => setErrorMessage(null);

  // Document verification handler
  const handleVerifyDocs = () => {
    try {
      clearError();
      const updated = verifyDocuments(app, providedDocs, verifierName);
      onUpdateApp(updated);
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // Initiate Handoff handler
  const handleInitiateHandoff = () => {
    try {
      clearError();
      const updated = initiateHandoff(app, {
        toDepartment: targetDept,
        toRole: targetRole,
        toOwner: targetOwner,
        fromOwner: senderName,
        handoffReason
      });
      onUpdateApp(updated);
      setActiveActionTab('details');
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // Accept Handoff handler
  const handleAcceptHandoff = () => {
    try {
      clearError();
      const updated = acceptHandoff(app, app.pendingHandoff?.toOwner || 'Officer Recipient');
      onUpdateApp(updated);
      setActiveActionTab('details');
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // Log Delay handler
  const handleLogDelay = () => {
    try {
      clearError();
      const updated = logDelay(app, {
        delayReason: selectedDelayReason,
        delayNotes,
        loggedBy: loggedByName
      });
      onUpdateApp(updated);
      setActiveActionTab('details');
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // Resolve Delay handler
  const handleResolveDelay = () => {
    try {
      clearError();
      const updated = resolveDelay(app, loggedByName, resolutionNotes || 'Resolved delay issue');
      onUpdateApp(updated);
      setActiveActionTab('details');
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // Approve handler
  const handleApprove = () => {
    try {
      clearError();
      const updated = approveApplication(app, approverName, approvalNotes);
      onUpdateApp(updated);
      setActiveActionTab('details');
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // Reject handler
  const handleReject = () => {
    try {
      clearError();
      const updated = rejectApplication(app, approverName, rejectionReason);
      onUpdateApp(updated);
      setActiveActionTab('details');
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #24324d',
            paddingBottom: '16px',
            marginBottom: '20px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#3b82f6' }}>
                {app.id}
              </span>
              <span className="badge badge-submitted">{app.status}</span>
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
              {app.permitType}
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Route: {app.routeRef} • Applicant: {app.applicantRef}</p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            <X style={{ width: '24px', height: '24px' }} />
          </button>
        </div>

        {/* Error Notification Banner */}
        {errorMessage && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '20px',
              color: '#f87171',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle style={{ width: '20px', height: '20px', flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={clearError}
              style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Accountable Current Owner Header Banner */}
        <div
          style={{
            background: app.pendingHandoff
              ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)'
              : 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)',
            border: app.pendingHandoff ? '1px solid rgba(236, 72, 153, 0.4)' : '1px solid rgba(59, 130, 246, 0.4)',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
              Current Responsibility & Ownership
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
              {app.currentOwner}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: 600 }}>
              {app.currentDepartment} ({app.currentRole})
            </div>

            {app.pendingHandoff && (
              <div
                style={{
                  fontSize: '0.8rem',
                  color: '#f472b6',
                  fontWeight: 600,
                  marginTop: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Clock style={{ width: '14px', height: '14px' }} />
                <span>
                  Handoff Pending Transfer ➔ Target: <strong>{app.pendingHandoff.toOwner}</strong> (
                  {app.pendingHandoff.toDepartment})
                </span>
              </div>
            )}
          </div>

          {/* Action Button for Pending Handoff Acceptance */}
          {app.pendingHandoff && (
            <button className="btn btn-warning" onClick={handleAcceptHandoff} style={{ fontSize: '0.85rem' }}>
              Accept Handoff Ownership ➔
            </button>
          )}
        </div>

        {/* Action Tabs Bar */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #1e293b', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveActionTab('details')}
            style={{
              padding: '8px 14px',
              border: 'none',
              background: 'transparent',
              borderBottom: activeActionTab === 'details' ? '2px solid #3b82f6' : 'none',
              color: activeActionTab === 'details' ? '#3b82f6' : '#94a3b8',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Overview & Timeline
          </button>
          <button
            onClick={() => setActiveActionTab('docs')}
            style={{
              padding: '8px 14px',
              border: 'none',
              background: 'transparent',
              borderBottom: activeActionTab === 'docs' ? '2px solid #3b82f6' : 'none',
              color: activeActionTab === 'docs' ? '#3b82f6' : '#94a3b8',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Document Checks ({app.documentsCheck.isComplete ? 'Complete' : 'Deficient'})
          </button>
          <button
            onClick={() => setActiveActionTab('handoff')}
            style={{
              padding: '8px 14px',
              border: 'none',
              background: 'transparent',
              borderBottom: activeActionTab === 'handoff' ? '2px solid #3b82f6' : 'none',
              color: activeActionTab === 'handoff' ? '#3b82f6' : '#94a3b8',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Department Handoff
          </button>
          <button
            onClick={() => setActiveActionTab('delay')}
            style={{
              padding: '8px 14px',
              border: 'none',
              background: 'transparent',
              borderBottom: activeActionTab === 'delay' ? '2px solid #3b82f6' : 'none',
              color: activeActionTab === 'delay' ? '#3b82f6' : '#94a3b8',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Accountable Delay Log
          </button>
          <button
            onClick={() => setActiveActionTab('decision')}
            style={{
              padding: '8px 14px',
              border: 'none',
              background: 'transparent',
              borderBottom: activeActionTab === 'decision' ? '2px solid #3b82f6' : 'none',
              color: activeActionTab === 'decision' ? '#3b82f6' : '#94a3b8',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Approve / Reject
          </button>
        </div>

        {/* TAB 1: OVERVIEW & TIMELINE */}
        {activeActionTab === 'details' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Delay Warning if active */}
            {app.delayReason && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '10px',
                  padding: '14px',
                  color: '#f87171'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle style={{ width: '18px', height: '18px' }} />
                  <span>Application Delayed: {app.delayReason}</span>
                </div>
                <div style={{ fontSize: '0.8rem', marginTop: '4px', color: '#fca5a5' }}>
                  Justification: "{app.delayNotes}"
                </div>
              </div>
            )}

            {/* Complete Handoff Timeline Audit Trail */}
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
                Timestamped Audit & Handoff Timeline
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', paddingLeft: '20px' }}>
                {/* Vertical Line */}
                <div
                  style={{
                    position: 'absolute',
                    left: '7px',
                    top: '10px',
                    bottom: '10px',
                    width: '2px',
                    background: '#24324d'
                  }}
                />

                {app.timelineEvents.map((evt) => (
                  <div
                    key={evt.id}
                    style={{
                      position: 'relative',
                      background: '#1e293b',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      border: '1px solid #334155'
                    }}
                  >
                    {/* Node Dot */}
                    <div
                      style={{
                        position: 'absolute',
                        left: '-19px',
                        top: '16px',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: evt.type.includes('HANDOFF')
                          ? '#ec4899'
                          : evt.type.includes('DELAY')
                          ? '#ef4444'
                          : evt.type === 'APPROVED'
                          ? '#10b981'
                          : '#3b82f6'
                      }}
                    />

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f8fafc' }}>{evt.title}</div>
                      <div className="mono" style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        {new Date(evt.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{evt.description}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                      Actor: <strong>{evt.actor}</strong> ({evt.department})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DOCUMENT CHECKS */}
        {activeActionTab === 'docs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Mandatory Document Intake Verification</h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Applications with incomplete document checks are blocked from department handoffs and approvals.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#1e293b', padding: '16px', borderRadius: '8px' }}>
              {app.documentsCheck.requiredDocuments.map((docName) => {
                const isChecked = providedDocs.includes(docName);
                return (
                  <label
                    key={docName}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      color: isChecked ? '#f8fafc' : '#f87171'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setProvidedDocs([...providedDocs, docName]);
                        } else {
                          setProvidedDocs(providedDocs.filter((d) => d !== docName));
                        }
                      }}
                      style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }}
                    />
                    <span>{docName}</span>
                    {!isChecked && <span style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 700 }}>(Missing)</span>}
                  </label>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Verifier Officer Name"
                value={verifierName}
                onChange={(e) => setVerifierName(e.target.value)}
                style={{
                  padding: '8px 12px',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: '#f8fafc',
                  fontSize: '0.85rem'
                }}
              />
              <button className="btn btn-primary" onClick={handleVerifyDocs}>
                Update Document Status
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: DEPARTMENT HANDOFF */}
        {activeActionTab === 'handoff' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Initiate Cross-Department Ownership Handoff</h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Ownership remains with sending officer (<strong>{app.currentOwner}</strong>) until target officer accepts.
            </p>

            {app.pendingHandoff ? (
              <div
                style={{
                  background: 'rgba(236, 72, 153, 0.15)',
                  border: '1px solid rgba(236, 72, 153, 0.4)',
                  padding: '16px',
                  borderRadius: '8px',
                  color: '#f472b6'
                }}
              >
                <h4>Handoff Pending Acceptance!</h4>
                <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                  Target Department: {app.pendingHandoff.toDepartment} ({app.pendingHandoff.toOwner})
                </p>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Reason: "{app.pendingHandoff.handoffReason}"</p>
                <button className="btn btn-warning" onClick={handleAcceptHandoff} style={{ marginTop: '12px' }}>
                  Accept Handoff Ownership Now ➔
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                    Target Department
                  </label>
                  <select
                    value={targetDept}
                    onChange={(e) => setTargetDept(e.target.value as Department)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      color: '#f8fafc',
                      fontSize: '0.85rem'
                    }}
                  >
                    <option value="Traffic Management & Engineering">Traffic Management & Engineering</option>
                    <option value="Field Inspection & Safety">Field Inspection & Safety</option>
                    <option value="Operations & Fleet Planning">Operations & Fleet Planning</option>
                    <option value="Executive & Regulatory Approval">Executive & Regulatory Approval</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                      Target Officer Role
                    </label>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value as Role)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        color: '#f8fafc',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                      Target Officer Name
                    </label>
                    <input
                      type="text"
                      value={targetOwner}
                      onChange={(e) => setTargetOwner(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        color: '#f8fafc',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                    Mandatory Handoff Reason
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide specific technical justification for cross-department handoff..."
                    value={handoffReason}
                    onChange={(e) => setHandoffReason(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      color: '#f8fafc',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <button className="btn btn-primary" onClick={handleInitiateHandoff}>
                  Send Department Handoff Request ➔
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ACCOUNTABLE DELAY LOG */}
        {activeActionTab === 'delay' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Record Accountable Delay Reason</h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Select an explicit reason from the transport authority's controlled delay list.
            </p>

            {app.delayReason ? (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  padding: '16px',
                  borderRadius: '8px',
                  color: '#f87171'
                }}
              >
                <h4>Active Delay: {app.delayReason}</h4>
                <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Justification: "{app.delayNotes}"</p>

                <div style={{ marginTop: '16px' }}>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                    Resolution Notes
                  </label>
                  <input
                    type="text"
                    placeholder="State how the bottleneck was resolved..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      color: '#f8fafc',
                      fontSize: '0.85rem',
                      marginBottom: '10px'
                    }}
                  />
                  <button className="btn btn-success" onClick={handleResolveDelay}>
                    Clear Delay & Resume Active Workflow ➔
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                    Controlled Delay Reason Category
                  </label>
                  <select
                    value={selectedDelayReason}
                    onChange={(e) => setSelectedDelayReason(e.target.value as DelayReason)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      color: '#f8fafc',
                      fontSize: '0.85rem'
                    }}
                  >
                    {ALLOWED_DELAY_REASONS.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                    Explanatory Delay Justification Note
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe exact operational cause of delay..."
                    value={delayNotes}
                    onChange={(e) => setDelayNotes(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      color: '#f8fafc',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <button className="btn btn-danger" onClick={handleLogDelay}>
                  Flag Application Delayed ⚠️
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: APPROVE / REJECT */}
        {activeActionTab === 'decision' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Final Regulatory Approval / Rejection Decision</h3>

            {/* Approval Box */}
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '16px',
                borderRadius: '8px'
              }}
            >
              <h4 style={{ fontSize: '0.9rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ThumbsUp style={{ width: '18px', height: '18px' }} /> Grant Regulatory Approval
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                Requires complete documents, resolved delays, and accepted handoffs.
              </p>

              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Approver Officer Name"
                  value={approverName}
                  onChange={(e) => setApproverName(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    color: '#f8fafc',
                    fontSize: '0.85rem'
                  }}
                />
                <input
                  type="text"
                  placeholder="Approval Decision Remarks"
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    color: '#f8fafc',
                    fontSize: '0.85rem'
                  }}
                />
                <button className="btn btn-success" onClick={handleApprove}>
                  Approve Permit Application ✅
                </button>
              </div>
            </div>

            {/* Rejection Box */}
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '16px',
                borderRadius: '8px'
              }}
            >
              <h4 style={{ fontSize: '0.9rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ThumbsDown style={{ width: '18px', height: '18px' }} /> Reject Permit Application
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                Rejection requires an explicit decision reason.
              </p>

              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <textarea
                  rows={2}
                  placeholder="Mandatory rejection decision reason (minimum 10 chars)..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    color: '#f8fafc',
                    fontSize: '0.85rem'
                  }}
                />
                <button className="btn btn-danger" onClick={handleReject}>
                  Reject Application ❌
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
