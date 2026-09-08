import React, { useState, useEffect } from 'react';
import { ExperimentResult } from '../types';
import { runSyntheticExperiment } from '../services/experimentRunner';
import {
  BarChart3,
  TrendingDown,
  Eye,
  AlertTriangle,
  Play,
  FileCheck,
  CheckCircle,
  HelpCircle,
  Zap,
  Info
} from 'lucide-react';

export const ExperimentReportView: React.FC = () => {
  const [experimentResult, setExperimentResult] = useState<ExperimentResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [sampleSize, setSampleSize] = useState(100);

  useEffect(() => {
    // Run initial benchmark on mount
    handleRunExperiment();
  }, []);

  const handleRunExperiment = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const res = runSyntheticExperiment(sampleSize);
      setExperimentResult(res);
      setIsSimulating(false);
    }, 400);
  };

  if (!experimentResult) return null;

  const { baseline, prototype, delayReductionPct, visibilityImprovementPct, sampleApplications, failureAnalysis } =
    experimentResult;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Experiment Header Banner */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          background: 'linear-gradient(135deg, #131b2e 0%, #1e293b 100%)',
          borderLeft: '4px solid #3b82f6'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              className="badge"
              style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', fontSize: '0.7rem' }}
            >
              SYNTHETIC EXPERIMENT BENCHMARK
            </span>
            <span className="mono" style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Run ID: {experimentResult.runId}
            </span>
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '4px' }}>
            Baseline vs. Accountable Prototype Evaluation Report
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
            Empirical before-and-after trial evaluating {baseline.totalApplications} synthetic permit applications.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            value={sampleSize}
            onChange={(e) => setSampleSize(Number(e.target.value))}
            style={{
              padding: '8px 12px',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f8fafc',
              fontSize: '0.85rem'
            }}
          >
            <option value={50}>50 Applications</option>
            <option value={100}>100 Applications</option>
            <option value={250}>250 Applications</option>
          </select>

          <button className="btn btn-primary" onClick={handleRunExperiment} disabled={isSimulating}>
            <Play style={{ width: '16px', height: '16px' }} />
            {isSimulating ? 'Simulating Cohort...' : 'Re-Run Synthetic Experiment'}
          </button>
        </div>
      </div>

      {/* Synthetic Results Notice */}
      <div
        style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '8px',
          padding: '10px 14px',
          fontSize: '0.8rem',
          color: '#fbbf24',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <Info style={{ width: '16px', height: '16px', flexShrink: 0 }} />
        <span>
          <strong>Notice:</strong> All data shown below is generated from controlled synthetic permit workloads to
          quantify delay reduction and ownership visibility without using real employee surveillance metrics.
        </span>
      </div>

      {/* Major Metrics Side-by-Side Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Metric 1: Processing Days (Primary Metric) */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
              Primary Metric: Calendar Processing Days
            </div>
            <div
              style={{
                padding: '4px 10px',
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 800
              }}
            >
              -{delayReductionPct}% Delay Reduction
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Baseline (Manual)</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f87171' }}>{baseline.avgCalendarDays}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Days to decision</div>
            </div>
            <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Prototype (Accountable)</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399' }}>{prototype.avgCalendarDays}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Days to decision</div>
            </div>
          </div>

          {/* Progress Bar Visualizer */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
              <span>Baseline: {baseline.avgCalendarDays} days</span>
              <span>Target: &lt; 7.0 days</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(100, (prototype.avgCalendarDays / baseline.avgCalendarDays) * 100)}%`,
                  height: '100%',
                  background: '#10b981'
                }}
              />
            </div>
          </div>
        </div>

        {/* Metric 2: Responsibility & Owner Visibility (Secondary Metric) */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
              Secondary Metric: Responsibility Visibility
            </div>
            <div
              style={{
                padding: '4px 10px',
                background: 'rgba(59, 130, 246, 0.2)',
                color: '#60a5fa',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 800
              }}
            >
              +{visibilityImprovementPct}% Improvement
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Baseline Visibility</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24' }}>
                {baseline.responsibilityVisibilityPct}%
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Shared queues</div>
            </div>
            <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Prototype Visibility</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399' }}>
                {prototype.responsibilityVisibilityPct}%
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Explicit owners</div>
            </div>
          </div>

          {/* Progress Bar Visualizer */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
              <span>Prototype: 100% visible</span>
              <span>Baseline: 32% visible</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', background: '#3b82f6' }} />
            </div>
          </div>
        </div>

        {/* Metric 3: Accountable Delay Reason Recording */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
              Delay Reason Recording Rate
            </div>
            <div
              style={{
                padding: '4px 10px',
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 800
              }}
            >
              100% Controlled
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Baseline Delays</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f87171' }}>
                {baseline.delayReasonCapturedPct}%
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Free-text or missing</div>
            </div>
            <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Prototype Delays</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399' }}>
                {prototype.delayReasonCapturedPct}%
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Mandatory reason</div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
              <span>SLA Breach Rate: Baseline {baseline.slaBreachRatePct}% ➔ Prototype {prototype.slaBreachRatePct}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${100 - prototype.slaBreachRatePct}%`,
                  height: '100%',
                  background: '#10b981'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Failure & Bottleneck Analysis Section */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle style={{ width: '20px', height: '20px', color: '#fbbf24' }} />
          Empirical Failure & Bottleneck Analysis
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
          {failureAnalysis.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '12px 14px',
                fontSize: '0.825rem',
                color: '#cbd5e1',
                lineHeight: 1.5
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Sample Applications Comparison Table */}
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #24324d' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Cohort Breakdown (Sample Applications)</h3>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Side-by-side processing timeline comparison between manual baseline and accountable prototype
          </p>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.825rem' }}>
          <thead>
            <tr style={{ background: '#1e293b', color: '#94a3b8', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '10px 14px' }}>App ID</th>
              <th style={{ padding: '10px 14px' }}>Permit Type</th>
              <th style={{ padding: '10px 14px' }}>Baseline Days</th>
              <th style={{ padding: '10px 14px' }}>Prototype Days</th>
              <th style={{ padding: '10px 14px' }}>Days Saved</th>
              <th style={{ padding: '10px 14px' }}>Baseline Owner</th>
              <th style={{ padding: '10px 14px' }}>Prototype Delay Reason</th>
            </tr>
          </thead>
          <tbody>
            {sampleApplications.map((sample) => {
              const daysSaved = Math.round((sample.baselineDays - sample.prototypeDays) * 10) / 10;
              return (
                <tr key={sample.id} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '10px 14px' }} className="mono">
                    <span style={{ fontWeight: 700, color: '#3b82f6' }}>{sample.id}</span>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#f8fafc', fontWeight: 500 }}>{sample.type}</td>
                  <td style={{ padding: '10px 14px', color: '#f87171', fontWeight: 700 }}>{sample.baselineDays} days</td>
                  <td style={{ padding: '10px 14px', color: '#34d399', fontWeight: 700 }}>{sample.prototypeDays} days</td>
                  <td style={{ padding: '10px 14px', color: '#60a5fa', fontWeight: 700 }}>+{daysSaved} days</td>
                  <td style={{ padding: '10px 14px', color: '#94a3b8' }}>
                    {sample.baselineOwnerVisible ? 'Shared Queue' : 'Unassigned (Lost)'}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    {sample.prototypeDelayReason !== 'None' ? (
                      <span className="badge badge-delayed" style={{ fontSize: '0.65rem' }}>
                        {sample.prototypeDelayReason}
                      </span>
                    ) : (
                      <span style={{ color: '#64748b' }}>None</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
