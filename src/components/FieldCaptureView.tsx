import React, { useState } from 'react';
import { PermitType, PermitApplication } from '../types';
import { createNewApplication } from '../services/workflowEngine';
import { saveApplicationLocally, getLocalQueue, syncLocalQueue } from '../services/storage';
import {
  Smartphone,
  Wifi,
  WifiOff,
  Save,
  RefreshCw,
  CheckCircle,
  FileCheck,
  MapPin,
  AlertCircle
} from 'lucide-react';

interface FieldCaptureViewProps {
  isOnline: boolean;
  onAppCreated: (app: PermitApplication) => void;
  onSyncTriggered: () => void;
}

const PERMIT_TYPES: PermitType[] = [
  'Bus Stop Bay Relocation',
  'Special Event Transit Corridor',
  'Fleet Route Extension',
  'Road Excavation & Bus Lane Access',
  'Overnight Maintenance Clearance',
  'BRT Dedicated Lane Permit'
];

export const FieldCaptureView: React.FC<FieldCaptureViewProps> = ({
  isOnline,
  onAppCreated,
  onSyncTriggered
}) => {
  const [permitType, setPermitType] = useState<PermitType>('Bus Stop Bay Relocation');
  const [routeRef, setRouteRef] = useState('');
  const [applicantRef, setApplicantRef] = useState('');
  const [providedDocs, setProvidedDocs] = useState<string[]>([
    'Route Alignment Map',
    'Traffic Impact Assessment'
  ]);
  const [priority, setPriority] = useState<PermitApplication['priority']>('MEDIUM');
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const localQueue = getLocalQueue();

  const handleToggleDoc = (docName: string) => {
    if (providedDocs.includes(docName)) {
      setProvidedDocs(providedDocs.filter((d) => d !== docName));
    } else {
      setProvidedDocs([...providedDocs, docName]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeRef || !applicantRef) {
      alert('Please fill out Route/Service reference and Applicant reference.');
      return;
    }

    const app = createNewApplication({
      permitType,
      routeRef,
      applicantRef,
      priority,
      isOfflineCaptured: !isOnline,
      providedDocuments: providedDocs
    });

    if (!isOnline) {
      // Save locally to IndexedDB/localStorage queue
      saveApplicationLocally(app);
      setSubmittedMessage(`Application ${app.id} captured OFFLINE. Saved locally to sync queue.`);
    } else {
      onAppCreated(app);
      setSubmittedMessage(`Application ${app.id} submitted successfully and synced.`);
    }

    // Reset form
    setRouteRef('');
    setApplicantRef('');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Offline Connectivity Status Header */}
      <div
        style={{
          background: isOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
          border: isOnline ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isOnline ? (
            <Wifi style={{ width: '24px', height: '24px', color: '#34d399' }} />
          ) : (
            <WifiOff style={{ width: '24px', height: '24px', color: '#fbbf24' }} />
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isOnline ? '#34d399' : '#fbbf24' }}>
              {isOnline ? 'ONLINE - Direct Central Sync Active' : 'OFFLINE MODE - Stored Locally'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {isOnline
                ? 'Submissions sync directly with central permit database.'
                : 'Field submissions are saved locally on device and queued for sync.'}
            </div>
          </div>
        </div>

        {localQueue.length > 0 && (
          <button className="btn btn-warning" onClick={onSyncTriggered} style={{ fontSize: '0.75rem', padding: '6px 10px' }}>
            <RefreshCw style={{ width: '12px', height: '12px' }} /> Sync ({localQueue.length})
          </button>
        )}
      </div>

      {/* Success Notification */}
      {submittedMessage && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#34d399',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle style={{ width: '18px', height: '18px' }} />
            <span>{submittedMessage}</span>
          </div>
          <button onClick={() => setSubmittedMessage(null)} style={{ background: 'none', border: 'none', color: '#34d399', cursor: 'pointer' }}>
            ✕
          </button>
        </div>
      )}

      {/* Field Capture Form */}
      <form className="card" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
          <Smartphone style={{ width: '22px', height: '22px', color: '#3b82f6' }} />
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Field Permit Capture Form</h3>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Streamlined mobile intake for transport authority inspectors</p>
          </div>
        </div>

        {/* 1. Request Type */}
        <div>
          <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
            Permit / Request Type
          </label>
          <select
            value={permitType}
            onChange={(e) => setPermitType(e.target.value as PermitType)}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f8fafc',
              fontSize: '0.875rem'
            }}
          >
            {PERMIT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Route / Service Reference */}
        <div>
          <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
            Route / Service Reference
          </label>
          <input
            type="text"
            placeholder="e.g. Route 104 Central Station Bay 4"
            value={routeRef}
            onChange={(e) => setRouteRef(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f8fafc',
              fontSize: '0.875rem'
            }}
          />
        </div>

        {/* 3. Applicant Reference */}
        <div>
          <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
            Applicant Reference / Operator Name
          </label>
          <input
            type="text"
            placeholder="e.g. Metro Operations Ltd."
            value={applicantRef}
            onChange={(e) => setApplicantRef(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f8fafc',
              fontSize: '0.875rem'
            }}
          />
        </div>

        {/* 4. Priority */}
        <div>
          <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
            Urgency / Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f8fafc',
              fontSize: '0.875rem'
            }}
          >
            <option value="LOW">Low Priority</option>
            <option value="MEDIUM">Medium Priority (Standard SLA)</option>
            <option value="HIGH">High Priority</option>
            <option value="URGENT">Urgent / Emergency Corridor</option>
          </select>
        </div>

        {/* 5. Document Checklist */}
        <div>
          <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '8px', fontWeight: 600 }}>
            Documents Captured at Intake
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#1e293b', padding: '12px', borderRadius: '8px' }}>
            {[
              'Route Alignment Map',
              'Traffic Impact Assessment',
              'Safety & Emergency Plan',
              'Operator License Certificate'
            ].map((doc) => (
              <label key={doc} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: '#cbd5e1' }}>
                <input
                  type="checkbox"
                  checked={providedDocs.includes(doc)}
                  onChange={() => handleToggleDoc(doc)}
                  style={{ width: '16px', height: '16px', accentColor: '#3b82f6' }}
                />
                <span>{doc}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn btn-primary" style={{ padding: '12px', fontSize: '0.95rem', marginTop: '8px' }}>
          <Save style={{ width: '18px', height: '18px' }} />
          {isOnline ? 'Submit Permit Application (Online)' : 'Save Application Locally (Offline)'}
        </button>
      </form>

      {/* Local Queue Status Box */}
      {localQueue.length > 0 && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Locally Saved Offline Queue ({localQueue.length})</h4>
            <span style={{ fontSize: '0.75rem', color: '#fbbf24' }}>Awaiting Sync</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {localQueue.map((app) => (
              <div
                key={app.id}
                style={{
                  background: '#1e293b',
                  padding: '10px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem'
                }}
              >
                <div>
                  <span className="mono" style={{ fontWeight: 700, color: '#3b82f6' }}>
                    {app.id}
                  </span>{' '}
                  • {app.permitType}
                </div>
                <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', fontSize: '0.65rem' }}>
                  Pending Sync
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
