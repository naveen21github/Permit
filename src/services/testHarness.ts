import { TestCaseResult, PermitApplication } from '../types';
import {
  createNewApplication,
  initiateHandoff,
  acceptHandoff,
  approveApplication,
  WorkflowValidationError,
  logDelay
} from './workflowEngine';
import { saveApplicationLocally, getLocalQueue, syncLocalQueue } from './storage';

/**
 * Runs the reproducible automated test harness for failure & edge cases.
 */
export function runTestHarness(): TestCaseResult[] {
  const results: TestCaseResult[] = [];

  // Test Case 1: Missing document check prevents approval & shows delay reason
  results.push(testMissingDocumentBlocking());

  // Test Case 2: Unaccepted department handoff maintains previous ownership visibility
  results.push(testUnacceptedHandoffOwnership());

  // Test Case 3: Offline submission captures locally and syncs cleanly
  results.push(testOfflineSubmissionAndSync());

  // Test Case 4: Premature approval prevention when checks are incomplete
  results.push(testPrematureApprovalPrevention());

  // Test Case 5: Valid handoff initiation and acceptance workflow
  results.push(testValidHandoffExecution());

  return results;
}

function testMissingDocumentBlocking(): TestCaseResult {
  const startTime = performance.now();
  const logs: string[] = [];
  try {
    logs.push('Creating application with missing documents ("Safety & Emergency Plan")...');
    const app = createNewApplication({
      permitType: 'Special Event Transit Corridor',
      routeRef: 'Route 101 Corridor',
      applicantRef: 'City Events Org',
      requiredDocuments: ['Route Alignment Map', 'Safety & Emergency Plan'],
      providedDocuments: ['Route Alignment Map']
    });

    logs.push(`Application status: ${app.status}`);
    logs.push(`Delay reason: '${app.delayReason}'`);
    logs.push(`Missing docs: ${app.documentsCheck.missingDocuments.join(', ')}`);

    if (app.status !== 'DOCUMENTS_PENDING') {
      throw new Error(`Expected status DOCUMENTS_PENDING, got ${app.status}`);
    }
    if (app.delayReason !== 'Awaiting applicant document') {
      throw new Error(`Expected delay reason 'Awaiting applicant document', got '${app.delayReason}'`);
    }

    logs.push('Attempting to approve application with missing documents...');
    let caughtError = false;
    try {
      approveApplication(app, 'Director Jane Doe', 'Attempting premature approval');
    } catch (err: any) {
      caughtError = true;
      logs.push(`[EXPECTED ERROR REJECTED APPROVAL]: ${err.message}`);
    }

    if (!caughtError) {
      throw new Error('System failed to prevent approval on missing documents!');
    }

    return {
      id: 'TC-01',
      name: 'Missing Document Safeguard',
      description: 'Verifies application with incomplete documents cannot proceed to approval and displays accountable delay reason.',
      status: 'PASS',
      assertion: 'App blocked at DOCUMENTS_PENDING with explicit delay reason; premature approval attempt threw WorkflowValidationError.',
      logs,
      executionTimeMs: Math.round(performance.now() - startTime),
      payload: { appId: app.id, status: app.status, delayReason: app.delayReason }
    };
  } catch (err: any) {
    return {
      id: 'TC-01',
      name: 'Missing Document Safeguard',
      description: 'Verifies application with incomplete documents cannot proceed to approval.',
      status: 'FAIL',
      assertion: err.message,
      logs,
      executionTimeMs: Math.round(performance.now() - startTime)
    };
  }
}

function testUnacceptedHandoffOwnership(): TestCaseResult {
  const startTime = performance.now();
  const logs: string[] = [];
  try {
    logs.push('Creating document-complete application...');
    const app = createNewApplication({
      permitType: 'Bus Stop Bay Relocation',
      routeRef: 'Central Station Bay 4',
      applicantRef: 'Metro Operations'
    });

    const senderOwner = app.currentOwner; // e.g. "Officer Sarah Chen (Intake Desk)"
    const senderDept = app.currentDepartment;

    logs.push(`Initial Owner: ${senderOwner} (${senderDept})`);
    logs.push('Initiating handoff to Traffic Management & Engineering (Target Owner: Engineer Bob Smith)...');

    const appWithHandoff = initiateHandoff(app, {
      toDepartment: 'Traffic Management & Engineering',
      toRole: 'Traffic Engineer',
      toOwner: 'Engineer Bob Smith',
      fromOwner: senderOwner,
      handoffReason: 'Traffic flow simulation and signal timing review'
    });

    logs.push(`Handoff status: ${appWithHandoff.status}`);
    logs.push(`Pending Handoff Target: ${appWithHandoff.pendingHandoff?.toDepartment} -> ${appWithHandoff.pendingHandoff?.toOwner}`);
    logs.push(`Active Owner during pending transfer: ${appWithHandoff.currentOwner} (${appWithHandoff.currentDepartment})`);

    // ASSERTION: currentOwner MUST STILL BE senderOwner until target accepts!
    if (appWithHandoff.currentOwner !== senderOwner) {
      throw new Error(`Ownership leaked before acceptance! Expected '${senderOwner}', but got '${appWithHandoff.currentOwner}'`);
    }

    if (appWithHandoff.status !== 'PENDING_HANDOFF_ACCEPTANCE') {
      throw new Error(`Expected status PENDING_HANDOFF_ACCEPTANCE, got ${appWithHandoff.status}`);
    }

    return {
      id: 'TC-02',
      name: 'Unaccepted Handoff Ownership Retention',
      description: 'Verifies that sending officer retains visible ownership responsibility until receiving department accepts handoff.',
      status: 'PASS',
      assertion: 'Current owner remained unchanged as sender during pending handoff state; target handoff flagged as pending.',
      logs,
      executionTimeMs: Math.round(performance.now() - startTime),
      payload: {
        appId: app.id,
        currentOwner: appWithHandoff.currentOwner,
        pendingTarget: appWithHandoff.pendingHandoff?.toOwner
      }
    };
  } catch (err: any) {
    return {
      id: 'TC-02',
      name: 'Unaccepted Handoff Ownership Retention',
      description: 'Verifies sender retains ownership until acceptance.',
      status: 'FAIL',
      assertion: err.message,
      logs,
      executionTimeMs: Math.round(performance.now() - startTime)
    };
  }
}

function testOfflineSubmissionAndSync(): TestCaseResult {
  const startTime = performance.now();
  const logs: string[] = [];
  try {
    logs.push('Simulating offline field capture (network disconnected)...');
    const offlineApp = createNewApplication({
      permitType: 'Road Excavation & Bus Lane Access',
      routeRef: 'Route 55 Field Sector B',
      applicantRef: 'Field Inspector Alex Rivera',
      isOfflineCaptured: true
    });

    logs.push(`Captured offline application ID: ${offlineApp.id}, Sync status: ${offlineApp.syncStatus}`);

    logs.push('Saving application to offline local queue...');
    saveApplicationLocally(offlineApp);

    const localQueue = getLocalQueue();
    const queuedApp = localQueue.find((a) => a.id === offlineApp.id);

    if (!queuedApp) {
      throw new Error('Application was not found in offline local queue storage!');
    }
    if (queuedApp.syncStatus !== 'pending_sync') {
      throw new Error(`Expected syncStatus 'pending_sync', got '${queuedApp.syncStatus}'`);
    }

    logs.push(`Successfully stored application locally. Queue size: ${localQueue.length}`);
    logs.push('Simulating network reconnection & trigger sync execution...');

    const syncedApps = syncLocalQueue();
    const syncedApp = syncedApps.find((a) => a.id === offlineApp.id);

    if (!syncedApp || syncedApp.syncStatus !== 'synced') {
      throw new Error('Sync failed to update application status to "synced"!');
    }

    logs.push(`Sync complete. Application ${syncedApp.id} is now fully synced with server.`);

    return {
      id: 'TC-03',
      name: 'Offline Field Capture & Queue Sync',
      description: 'Verifies offline field capture persists locally and synchronizes cleanly when online.',
      status: 'PASS',
      assertion: 'Local capture stored in offline queue with pending_sync badge, then synced without data loss.',
      logs,
      executionTimeMs: Math.round(performance.now() - startTime),
      payload: { appId: offlineApp.id, syncStatusAfter: syncedApp.syncStatus }
    };
  } catch (err: any) {
    return {
      id: 'TC-03',
      name: 'Offline Field Capture & Queue Sync',
      description: 'Verifies offline capture and sync.',
      status: 'FAIL',
      assertion: err.message,
      logs,
      executionTimeMs: Math.round(performance.now() - startTime)
    };
  }
}

function testPrematureApprovalPrevention(): TestCaseResult {
  const startTime = performance.now();
  const logs: string[] = [];
  try {
    logs.push('Creating application and logging an active accountable delay...');
    let app = createNewApplication({
      permitType: 'BRT Dedicated Lane Permit',
      routeRef: 'BRT Line Red',
      applicantRef: 'Apex Transit Contractors'
    });

    app = logDelay(app, {
      delayReason: 'Traffic coordination',
      delayNotes: 'Awaiting signal synchronization study from traffic control room',
      loggedBy: 'Engineer Bob Smith'
    });

    logs.push(`Application status: ${app.status}, Delay reason: '${app.delayReason}'`);
    logs.push('Attempting premature approval while application is in DELAYED status...');

    let caughtError = false;
    try {
      approveApplication(app, 'Director Jane Doe', 'Force approval attempt');
    } catch (err: any) {
      caughtError = true;
      logs.push(`[EXPECTED PREMATURE APPROVAL REJECTED]: ${err.message}`);
    }

    if (!caughtError) {
      throw new Error('Workflow engine allowed premature approval on a delayed application!');
    }

    return {
      id: 'TC-04',
      name: 'Premature Approval Prevention',
      description: 'Verifies system enforces mandatory check completion and delay resolution before approval can be granted.',
      status: 'PASS',
      assertion: 'Premature approval rejected when application was in DELAYED status with pending traffic coordination.',
      logs,
      executionTimeMs: Math.round(performance.now() - startTime),
      payload: { appId: app.id, status: app.status }
    };
  } catch (err: any) {
    return {
      id: 'TC-04',
      name: 'Premature Approval Prevention',
      description: 'Verifies premature approval prevention.',
      status: 'FAIL',
      assertion: err.message,
      logs,
      executionTimeMs: Math.round(performance.now() - startTime)
    };
  }
}

function testValidHandoffExecution(): TestCaseResult {
  const startTime = performance.now();
  const logs: string[] = [];
  try {
    logs.push('Creating verified application...');
    let app = createNewApplication({
      permitType: 'Fleet Route Extension',
      routeRef: 'Route 204 Corridor',
      applicantRef: 'City Transit Authority'
    });

    logs.push(`Initial Dept: ${app.currentDepartment}, Owner: ${app.currentOwner}`);

    logs.push('Initiating handoff to Field Inspection & Safety (Inspector Alex Rivera)...');
    app = initiateHandoff(app, {
      toDepartment: 'Field Inspection & Safety',
      toRole: 'Safety Inspector',
      toOwner: 'Inspector Alex Rivera',
      fromOwner: app.currentOwner,
      handoffReason: 'Physical inspection of bus stop curb radius'
    });

    logs.push(`Pending handoff status: ${app.status}`);
    logs.push('Accepting handoff as Inspector Alex Rivera...');
    app = acceptHandoff(app, 'Inspector Alex Rivera');

    logs.push(`New Dept: ${app.currentDepartment}, New Owner: ${app.currentOwner}, Status: ${app.status}`);

    if (app.currentDepartment !== 'Field Inspection & Safety') {
      throw new Error(`Expected department 'Field Inspection & Safety', got '${app.currentDepartment}'`);
    }
    if (app.currentOwner !== 'Inspector Alex Rivera') {
      throw new Error(`Expected owner 'Inspector Alex Rivera', got '${app.currentOwner}'`);
    }
    if (app.handoffHistory.length !== 1) {
      throw new Error(`Expected 1 recorded handoff in history, got ${app.handoffHistory.length}`);
    }

    return {
      id: 'TC-05',
      name: 'Valid Cross-Department Handoff',
      description: 'Verifies seamless handoff initiation, pending state, acceptance, and active ownership transfer.',
      status: 'PASS',
      assertion: 'Handoff executed cleanly with timestamped audit history and active ownership transfer.',
      logs,
      executionTimeMs: Math.round(performance.now() - startTime),
      payload: { appId: app.id, newOwner: app.currentOwner, handoffCount: app.handoffHistory.length }
    };
  } catch (err: any) {
    return {
      id: 'TC-05',
      name: 'Valid Cross-Department Handoff',
      description: 'Verifies handoff execution.',
      status: 'FAIL',
      assertion: err.message,
      logs,
      executionTimeMs: Math.round(performance.now() - startTime)
    };
  }
}
