export type Department =
  | 'Document Intake & Verification'
  | 'Traffic Management & Engineering'
  | 'Field Inspection & Safety'
  | 'Operations & Fleet Planning'
  | 'Executive & Regulatory Approval';

export type Role =
  | 'Intake Officer'
  | 'Compliance Specialist'
  | 'Traffic Engineer'
  | 'Signals & Corridor Lead'
  | 'Safety Inspector'
  | 'Field Assessor'
  | 'Fleet Coordinator'
  | 'Operations Planner'
  | 'Department Director'
  | 'Permit Authority Head';

export type WorkflowStatus =
  | 'SUBMITTED'
  | 'DOCUMENTS_PENDING'
  | 'DOCUMENTS_VERIFIED'
  | 'IN_REVIEW'
  | 'PENDING_HANDOFF_ACCEPTANCE'
  | 'DELAYED'
  | 'APPROVED'
  | 'REJECTED';

export type DelayReason =
  | 'Awaiting applicant document'
  | 'Safety clarification'
  | 'Traffic coordination'
  | 'Field inspection unavailable'
  | 'Capacity constraint'
  | 'System/offline sync';

export const ALLOWED_DELAY_REASONS: DelayReason[] = [
  'Awaiting applicant document',
  'Safety clarification',
  'Traffic coordination',
  'Field inspection unavailable',
  'Capacity constraint',
  'System/offline sync'
];

export type PermitType =
  | 'Bus Stop Bay Relocation'
  | 'Special Event Transit Corridor'
  | 'Fleet Route Extension'
  | 'Road Excavation & Bus Lane Access'
  | 'Overnight Maintenance Clearance'
  | 'BRT Dedicated Lane Permit';

export interface DocumentCheckStatus {
  isComplete: boolean;
  requiredDocuments: string[];
  providedDocuments: string[];
  missingDocuments: string[];
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
}

export interface DepartmentHandoff {
  id: string;
  fromDepartment: Department;
  toDepartment: Department;
  fromOwner: string;
  toOwner: string;
  toRole: Role;
  handoffReason: string;
  initiatedAt: string;
  acceptedAt?: string;
  rejectedAt?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  type:
    | 'SUBMISSION'
    | 'DOC_CHECK'
    | 'HANDOFF_INITIATED'
    | 'HANDOFF_ACCEPTED'
    | 'DELAY_LOGGED'
    | 'DELAY_RESOLVED'
    | 'REVIEW_UPDATED'
    | 'APPROVED'
    | 'REJECTED'
    | 'OFFLINE_SYNC';
  title: string;
  description: string;
  actor: string;
  department: Department;
  metadata?: Record<string, any>;
}

export interface PermitApplication {
  id: string;
  permitType: PermitType;
  routeRef: string;
  applicantRef: string;
  currentDepartment: Department;
  currentRole: Role;
  currentOwner: string;
  pendingHandoff: DepartmentHandoff | null;
  status: WorkflowStatus;
  submissionTimestamp: string;
  dueTimestamp: string;
  documentsCheck: DocumentCheckStatus;
  delayReason: DelayReason | null;
  delayNotes: string | null;
  decisionReason: string | null;
  decisionTimestamp: string | null;
  isOfflineCaptured: boolean;
  syncStatus: 'synced' | 'pending_sync';
  handoffHistory: DepartmentHandoff[];
  timelineEvents: TimelineEvent[];
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export interface ExperimentMetrics {
  totalApplications: number;
  avgCalendarDays: number;
  responsibilityVisibilityPct: number;
  delayReasonCapturedPct: number;
  approvedCount: number;
  rejectedCount: number;
  delayedCount: number;
  slaBreachRatePct: number;
}

export interface ExperimentResult {
  runId: string;
  timestamp: string;
  baseline: ExperimentMetrics;
  prototype: ExperimentMetrics;
  delayReductionPct: number;
  visibilityImprovementPct: number;
  sampleApplications: {
    id: string;
    type: PermitType;
    baselineDays: number;
    prototypeDays: number;
    baselineOwnerVisible: boolean;
    prototypeOwnerVisible: boolean;
    baselineDelayReason: string;
    prototypeDelayReason: DelayReason | 'None';
  }[];
  failureAnalysis: string[];
}

export interface TestCaseResult {
  id: string;
  name: string;
  description: string;
  status: 'PASS' | 'FAIL' | 'RUNNING';
  assertion: string;
  logs: string[];
  executionTimeMs: number;
  payload?: any;
}
