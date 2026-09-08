import {
  PermitApplication,
  WorkflowStatus,
  Department,
  Role,
  DelayReason,
  DepartmentHandoff,
  TimelineEvent,
  DocumentCheckStatus,
  ALLOWED_DELAY_REASONS
} from '../types';

export class WorkflowValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorkflowValidationError';
  }
}

/**
 * Creates a brand new synthetic or user-submitted permit application.
 */
export function createNewApplication(params: {
  id?: string;
  permitType: PermitApplication['permitType'];
  routeRef: string;
  applicantRef: string;
  priority?: PermitApplication['priority'];
  isOfflineCaptured?: boolean;
  requiredDocuments?: string[];
  providedDocuments?: string[];
  submittedBy?: string;
}): PermitApplication {
  const now = new Date().toISOString();
  const due = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(); // 14 days SLA
  const appNumber = params.id || `PRM-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const reqDocs = params.requiredDocuments || [
    'Route Alignment Map',
    'Traffic Impact Assessment',
    'Safety & Emergency Plan',
    'Operator License Certificate'
  ];
  const provDocs = params.providedDocuments || reqDocs;

  const missingDocs = reqDocs.filter((doc) => !provDocs.includes(doc));
  const isComplete = missingDocs.length === 0;

  const docStatus: DocumentCheckStatus = {
    isComplete,
    requiredDocuments: reqDocs,
    providedDocuments: provDocs,
    missingDocuments: missingDocs,
    verifiedBy: isComplete ? (params.submittedBy || 'Intake Officer Desk') : undefined,
    verifiedAt: isComplete ? now : undefined,
    notes: isComplete ? 'All mandatory documents verified at intake' : `Missing ${missingDocs.length} required documents`
  };

  const initialEvent: TimelineEvent = {
    id: `evt-${Date.now()}-1`,
    timestamp: now,
    type: 'SUBMISSION',
    title: 'Application Submitted',
    description: `Permit application submitted by ${params.applicantRef} for ${params.routeRef}`,
    actor: params.submittedBy || params.applicantRef,
    department: 'Document Intake & Verification'
  };

  const initialStatus: WorkflowStatus = isComplete ? 'SUBMITTED' : 'DOCUMENTS_PENDING';

  return {
    id: appNumber,
    permitType: params.permitType,
    routeRef: params.routeRef,
    applicantRef: params.applicantRef,
    currentDepartment: 'Document Intake & Verification',
    currentRole: 'Intake Officer',
    currentOwner: 'Officer Sarah Chen (Intake Desk)',
    pendingHandoff: null,
    status: initialStatus,
    submissionTimestamp: now,
    dueTimestamp: due,
    documentsCheck: docStatus,
    delayReason: isComplete ? null : 'Awaiting applicant document',
    delayNotes: isComplete ? null : `Application held at Document Check. Missing: ${missingDocs.join(', ')}`,
    decisionReason: null,
    decisionTimestamp: null,
    isOfflineCaptured: !!params.isOfflineCaptured,
    syncStatus: params.isOfflineCaptured ? 'pending_sync' : 'synced',
    handoffHistory: [],
    timelineEvents: [initialEvent],
    priority: params.priority || 'MEDIUM'
  };
}

/**
 * Updates document verification status.
 */
export function verifyDocuments(
  app: PermitApplication,
  providedDocs: string[],
  verifierName: string
): PermitApplication {
  const now = new Date().toISOString();
  const missingDocs = app.documentsCheck.requiredDocuments.filter((doc) => !providedDocs.includes(doc));
  const isComplete = missingDocs.length === 0;

  const updatedDocStatus: DocumentCheckStatus = {
    ...app.documentsCheck,
    providedDocuments: providedDocs,
    missingDocuments: missingDocs,
    isComplete,
    verifiedBy: verifierName,
    verifiedAt: now,
    notes: isComplete ? 'Document verification complete' : `Pending missing documents: ${missingDocs.join(', ')}`
  };

  const newStatus: WorkflowStatus = isComplete
    ? app.status === 'DOCUMENTS_PENDING' || app.status === 'DELAYED'
      ? 'DOCUMENTS_VERIFIED'
      : app.status
    : 'DOCUMENTS_PENDING';

  const docEvent: TimelineEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: now,
    type: 'DOC_CHECK',
    title: isComplete ? 'Documents Verified Complete' : 'Document Check Deficiencies Flagged',
    description: isComplete
      ? `All ${providedDocs.length} documents verified by ${verifierName}`
      : `Missing documents: ${missingDocs.join(', ')}`,
    actor: verifierName,
    department: app.currentDepartment
  };

  return {
    ...app,
    documentsCheck: updatedDocStatus,
    status: newStatus,
    delayReason: isComplete ? (app.delayReason === 'Awaiting applicant document' ? null : app.delayReason) : 'Awaiting applicant document',
    delayNotes: isComplete ? (app.delayReason === 'Awaiting applicant document' ? null : app.delayNotes) : `Missing: ${missingDocs.join(', ')}`,
    timelineEvents: [...app.timelineEvents, docEvent]
  };
}

/**
 * Initiates a department handoff. Ownership remains with sending officer until accepted!
 */
export function initiateHandoff(
  app: PermitApplication,
  params: {
    toDepartment: Department;
    toOwner: string;
    toRole: Role;
    fromOwner: string;
    handoffReason: string;
  }
): PermitApplication {
  // Edge Case Rule 1: Missing document check
  if (!app.documentsCheck.isComplete) {
    throw new WorkflowValidationError(
      `Cannot initiate department handoff for application ${app.id}: Mandatory document checks are incomplete. Missing: ${app.documentsCheck.missingDocuments.join(', ')}`
    );
  }

  // Edge Case Rule: Already has pending handoff
  if (app.pendingHandoff) {
    throw new WorkflowValidationError(
      `Application ${app.id} already has a pending handoff to ${app.pendingHandoff.toDepartment} (${app.pendingHandoff.toOwner}). Target department must accept or reject existing handoff first.`
    );
  }

  if (!params.handoffReason || params.handoffReason.trim().length === 0) {
    throw new WorkflowValidationError('A valid handoff reason is required for cross-department handoffs.');
  }

  const now = new Date().toISOString();
  const handoffRecord: DepartmentHandoff = {
    id: `hdf-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    fromDepartment: app.currentDepartment,
    toDepartment: params.toDepartment,
    fromOwner: params.fromOwner,
    toOwner: params.toOwner,
    toRole: params.toRole,
    handoffReason: params.handoffReason,
    initiatedAt: now,
    status: 'PENDING'
  };

  const handoffEvent: TimelineEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: now,
    type: 'HANDOFF_INITIATED',
    title: `Handoff Initiated: ${app.currentDepartment} ➔ ${params.toDepartment}`,
    description: `Initiated by ${params.fromOwner}. Transferring responsibility to ${params.toOwner} (${params.toRole}). Reason: ${params.handoffReason}`,
    actor: params.fromOwner,
    department: app.currentDepartment,
    metadata: { handoffId: handoffRecord.id }
  };

  return {
    ...app,
    pendingHandoff: handoffRecord,
    status: 'PENDING_HANDOFF_ACCEPTANCE',
    // Note: currentDepartment and currentOwner remain as previous department & sender until target accepts!
    timelineEvents: [...app.timelineEvents, handoffEvent]
  };
}

/**
 * Accepts a pending handoff, transferring active ownership to the receiving officer.
 */
export function acceptHandoff(
  app: PermitApplication,
  acceptingOwner: string
): PermitApplication {
  if (!app.pendingHandoff) {
    throw new WorkflowValidationError(`No pending handoff to accept for application ${app.id}.`);
  }

  const handoff = app.pendingHandoff;
  const now = new Date().toISOString();

  const completedHandoff: DepartmentHandoff = {
    ...handoff,
    acceptedAt: now,
    status: 'ACCEPTED'
  };

  const acceptEvent: TimelineEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: now,
    type: 'HANDOFF_ACCEPTED',
    title: `Handoff Accepted by ${handoff.toDepartment}`,
    description: `Ownership officially transferred from ${handoff.fromOwner} (${handoff.fromDepartment}) to ${acceptingOwner} (${handoff.toDepartment}).`,
    actor: acceptingOwner,
    department: handoff.toDepartment,
    metadata: { handoffId: handoff.id }
  };

  return {
    ...app,
    currentDepartment: handoff.toDepartment,
    currentRole: handoff.toRole,
    currentOwner: acceptingOwner,
    pendingHandoff: null,
    status: 'IN_REVIEW',
    handoffHistory: [...app.handoffHistory, completedHandoff],
    timelineEvents: [...app.timelineEvents, acceptEvent]
  };
}

/**
 * Logs an accountable delay reason.
 */
export function logDelay(
  app: PermitApplication,
  params: {
    delayReason: DelayReason;
    delayNotes: string;
    loggedBy: string;
  }
): PermitApplication {
  if (!ALLOWED_DELAY_REASONS.includes(params.delayReason)) {
    throw new WorkflowValidationError(
      `Invalid delay reason: '${params.delayReason}'. Reason must be selected from controlled list: ${ALLOWED_DELAY_REASONS.join(', ')}`
    );
  }

  if (!params.delayNotes || params.delayNotes.trim().length < 5) {
    throw new WorkflowValidationError('Accountable delay requires a detailed explanatory note (at least 5 characters).');
  }

  const now = new Date().toISOString();

  const delayEvent: TimelineEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: now,
    type: 'DELAY_LOGGED',
    title: `Accountable Delay Logged: ${params.delayReason}`,
    description: `Recorded by ${params.loggedBy} at ${app.currentDepartment}. Justification: ${params.delayNotes}`,
    actor: params.loggedBy,
    department: app.currentDepartment,
    metadata: { delayReason: params.delayReason }
  };

  return {
    ...app,
    status: 'DELAYED',
    delayReason: params.delayReason,
    delayNotes: params.delayNotes,
    timelineEvents: [...app.timelineEvents, delayEvent]
  };
}

/**
 * Resolves a delay and resumes active workflow.
 */
export function resolveDelay(
  app: PermitApplication,
  resolvedBy: string,
  resolutionNotes: string
): PermitApplication {
  if (app.status !== 'DELAYED' && !app.delayReason) {
    throw new WorkflowValidationError(`Application ${app.id} is not currently marked as delayed.`);
  }

  const now = new Date().toISOString();
  const resolveEvent: TimelineEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: now,
    type: 'DELAY_RESOLVED',
    title: `Delay Resolved: ${app.delayReason}`,
    description: `Resolved by ${resolvedBy}. Notes: ${resolutionNotes}`,
    actor: resolvedBy,
    department: app.currentDepartment
  };

  return {
    ...app,
    status: app.pendingHandoff ? 'PENDING_HANDOFF_ACCEPTANCE' : 'IN_REVIEW',
    delayReason: null,
    delayNotes: null,
    timelineEvents: [...app.timelineEvents, resolveEvent]
  };
}

/**
 * Approves a permit application with strict rule checks.
 */
export function approveApplication(
  app: PermitApplication,
  approverName: string,
  approvalNotes: string
): PermitApplication {
  // Rule 6: Premature approval checks
  if (!app.documentsCheck.isComplete) {
    throw new WorkflowValidationError(
      `Premature Approval Rejected! Application ${app.id} cannot be approved because document check is incomplete. Missing: ${app.documentsCheck.missingDocuments.join(', ')}`
    );
  }

  if (app.status === 'DELAYED') {
    throw new WorkflowValidationError(
      `Premature Approval Rejected! Application ${app.id} is currently flagged as DELAYED (${app.delayReason}). Delay must be resolved prior to final approval.`
    );
  }

  if (app.pendingHandoff) {
    throw new WorkflowValidationError(
      `Premature Approval Rejected! Application ${app.id} has an unaccepted pending handoff to ${app.pendingHandoff.toDepartment}. Handoff must be accepted and reviewed before approval.`
    );
  }

  const now = new Date().toISOString();

  const approveEvent: TimelineEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: now,
    type: 'APPROVED',
    title: 'Permit Application APPROVED',
    description: `Final approval granted by ${approverName} (${app.currentDepartment}). Remarks: ${approvalNotes || 'All regulatory checks satisfied.'}`,
    actor: approverName,
    department: app.currentDepartment
  };

  return {
    ...app,
    status: 'APPROVED',
    decisionReason: approvalNotes || 'Approved after complete multi-department verification and compliance checks.',
    decisionTimestamp: now,
    timelineEvents: [...app.timelineEvents, approveEvent]
  };
}

/**
 * Rejects a permit application (requires decision reason).
 */
export function rejectApplication(
  app: PermitApplication,
  rejectorName: string,
  rejectionReason: string
): PermitApplication {
  if (!rejectionReason || rejectionReason.trim().length < 10) {
    throw new WorkflowValidationError('Rejection requires a clear explanatory decision reason (minimum 10 characters).');
  }

  const now = new Date().toISOString();

  const rejectEvent: TimelineEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: now,
    type: 'REJECTED',
    title: 'Permit Application REJECTED',
    description: `Application rejected by ${rejectorName} (${app.currentDepartment}). Reason: ${rejectionReason}`,
    actor: rejectorName,
    department: app.currentDepartment
  };

  return {
    ...app,
    status: 'REJECTED',
    decisionReason: rejectionReason,
    decisionTimestamp: now,
    timelineEvents: [...app.timelineEvents, rejectEvent]
  };
}
