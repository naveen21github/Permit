import { PermitApplication } from '../types';
import { createNewApplication, initiateHandoff, acceptHandoff, logDelay, approveApplication } from './workflowEngine';

const LOCAL_QUEUE_KEY = 'permit_tracker_local_queue';
const MAIN_APPS_KEY = 'permit_tracker_applications';
const NETWORK_STATUS_KEY = 'permit_tracker_is_online';

const memoryStore: Record<string, string> = {};

function getItem(key: string): string | null {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(key);
  }
  return memoryStore[key] || null;
}

function setItem(key: string, val: string): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(key, val);
  } else {
    memoryStore[key] = val;
  }
}

export function isOnline(): boolean {
  const val = getItem(NETWORK_STATUS_KEY);
  return val === null ? true : val === 'true';
}

export function setOnlineStatus(status: boolean): void {
  setItem(NETWORK_STATUS_KEY, String(status));
}

export function getLocalQueue(): PermitApplication[] {
  try {
    const raw = getItem(LOCAL_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to parse local queue:', err);
    return [];
  }
}

export function saveApplicationLocally(app: PermitApplication): void {
  const queue = getLocalQueue();
  const existingIdx = queue.findIndex((item) => item.id === app.id);
  if (existingIdx >= 0) {
    queue[existingIdx] = app;
  } else {
    queue.push(app);
  }
  setItem(LOCAL_QUEUE_KEY, JSON.stringify(queue));
}

export function syncLocalQueue(): PermitApplication[] {
  const queue = getLocalQueue();
  const mainApps = getStoredApplications();

  const synced: PermitApplication[] = [];

  for (const app of queue) {
    const updatedApp: PermitApplication = {
      ...app,
      syncStatus: 'synced',
      timelineEvents: [
        ...app.timelineEvents,
        {
          id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          timestamp: new Date().toISOString(),
          type: 'OFFLINE_SYNC',
          title: 'Offline Submission Synchronized',
          description: `Field captured permit application ${app.id} successfully synchronized with central authority database.`,
          actor: app.applicantRef,
          department: app.currentDepartment
        }
      ]
    };

    const existingIndex = mainApps.findIndex((a) => a.id === app.id);
    if (existingIndex >= 0) {
      mainApps[existingIndex] = updatedApp;
    } else {
      mainApps.unshift(updatedApp);
    }
    synced.push(updatedApp);
  }

  // Clear local queue and save main applications
  setItem(LOCAL_QUEUE_KEY, JSON.stringify([]));
  saveAllApplications(mainApps);

  return mainApps;
}

export function getStoredApplications(): PermitApplication[] {
  try {
    const raw = getItem(MAIN_APPS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to read main applications:', err);
  }

  // Seed default dataset if empty
  const defaultApps = generateDefaultApplications();
  saveAllApplications(defaultApps);
  return defaultApps;
}

export function saveAllApplications(apps: PermitApplication[]): void {
  setItem(MAIN_APPS_KEY, JSON.stringify(apps));
}

/**
 * Generates initial seed set of rich applications for demonstration.
 */
function generateDefaultApplications(): PermitApplication[] {
  const apps: PermitApplication[] = [];

  // App 1: Active In Review with Accepted Handoff
  let app1 = createNewApplication({
    id: 'PRM-2026-1042',
    permitType: 'Bus Stop Bay Relocation',
    routeRef: 'Route 104 - Central Station Bay 4',
    applicantRef: 'Metro Operations Ltd.'
  });
  app1 = initiateHandoff(app1, {
    toDepartment: 'Traffic Management & Engineering',
    toRole: 'Traffic Engineer',
    toOwner: 'Engineer Bob Smith',
    fromOwner: 'Officer Sarah Chen (Intake Desk)',
    handoffReason: 'Traffic flow simulation and curb radius engineering review'
  });
  app1 = acceptHandoff(app1, 'Engineer Bob Smith');
  apps.push(app1);

  // App 2: Delayed Application with Accountable Reason
  let app2 = createNewApplication({
    id: 'PRM-2026-1088',
    permitType: 'Special Event Transit Corridor',
    routeRef: 'Route 101 - Marathon Loop',
    applicantRef: 'City Events Organizers'
  });
  app2 = initiateHandoff(app2, {
    toDepartment: 'Traffic Management & Engineering',
    toRole: 'Traffic Engineer',
    toOwner: 'Engineer Bob Smith',
    fromOwner: 'Officer Sarah Chen',
    handoffReason: 'Signal priority and road closure coordination'
  });
  app2 = acceptHandoff(app2, 'Engineer Bob Smith');
  app2 = logDelay(app2, {
    delayReason: 'Traffic coordination',
    delayNotes: 'Awaiting signal synchronization control approval from central traffic command center',
    loggedBy: 'Engineer Bob Smith'
  });
  apps.push(app2);

  // App 3: Documents Deficient
  const app3 = createNewApplication({
    id: 'PRM-2026-1104',
    permitType: 'Road Excavation & Bus Lane Access',
    routeRef: 'Route 55 - Sector 4 West',
    applicantRef: 'Apex Utilities Corp',
    requiredDocuments: ['Route Alignment Map', 'Traffic Impact Assessment', 'Safety & Emergency Plan'],
    providedDocuments: ['Route Alignment Map']
  });
  apps.push(app3);

  // App 4: Pending Handoff Acceptance (Owner is still sender!)
  let app4 = createNewApplication({
    id: 'PRM-2026-1150',
    permitType: 'Fleet Route Extension',
    routeRef: 'Route 204 - North Corridor Extension',
    applicantRef: 'Public Transport Services'
  });
  app4 = initiateHandoff(app4, {
    toDepartment: 'Field Inspection & Safety',
    toRole: 'Safety Inspector',
    toOwner: 'Inspector Alex Rivera',
    fromOwner: 'Officer Sarah Chen (Intake Desk)',
    handoffReason: 'Field safety audit of proposed bus stop turnarounds'
  });
  apps.push(app4);

  // App 5: Approved Application
  let app5 = createNewApplication({
    id: 'PRM-2026-0920',
    permitType: 'Overnight Maintenance Clearance',
    routeRef: 'BRT Line Red - Tunnel Segment A',
    applicantRef: 'Transit Maintenance Division'
  });
  app5 = initiateHandoff(app5, {
    toDepartment: 'Executive & Regulatory Approval',
    toRole: 'Department Director',
    toOwner: 'Director Jane Doe',
    fromOwner: 'Officer Sarah Chen',
    handoffReason: 'Regulatory maintenance variance signoff'
  });
  app5 = acceptHandoff(app5, 'Director Jane Doe');
  app5 = approveApplication(app5, 'Director Jane Doe', 'All safety protocols and structural integrity checks satisfied.');
  apps.push(app5);

  return apps;
}
