import React, { useState, useEffect } from 'react';
import { TestCaseResult } from '../types';
import { runTestHarness } from '../services/testHarness';
import {
  CheckCircle2,
  XCircle,
  Play,
  Terminal,
  ShieldAlert,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const TestHarnessView: React.FC = () => {
  const [testResults, setTestResults] = useState<TestCaseResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCaseResult | null>(null);

  useEffect(() => {
    handleRunTests();
  }, []);

  const handleRunTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const results = runTestHarness();
      setTestResults(results);
      if (results.length > 0) {
        setSelectedTestCase(results[0]);
      }
      setIsRunning(false);
    }, 300);
  };

  const passCount = testResults.filter((t) => t.status === 'PASS').length;
  const failCount = testResults.filter((t) => t.status === 'FAIL').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Test Harness Header */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          background: 'linear-gradient(135deg, #131b2e 0%, #1a253e 100%)',
          borderLeft: '4px solid #10b981'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              className="badge"
              style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontSize: '0.7rem' }}
            >
              AUTOMATED EDGE-CASE SUITE
            </span>
            <span className="mono" style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Reproducible Failure Harness
            </span>
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '4px' }}>
            Edge Case & Failure Mode Validation Suite
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
            Verifies workflow engine invariants: missing doc blocking, unaccepted handoff ownership retention, offline capture, premature approval prevention.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
            <div>
              Status:{' '}
              <strong style={{ color: failCount === 0 ? '#34d399' : '#f87171' }}>
                {passCount}/{testResults.length} PASSED
              </strong>
            </div>
          </div>

          <button className="btn btn-primary" onClick={handleRunTests} disabled={isRunning}>
            <Play style={{ width: '16px', height: '16px' }} />
            {isRunning ? 'Executing Harness...' : 'Run All Edge Case Tests'}
          </button>
        </div>
      </div>

      {/* Main Grid: Test Case List & Detailed Execution Logs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(450px, 2fr)', gap: '20px' }}>
        {/* Left Column: Test Cases List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {testResults.map((tc) => {
            const isSelected = selectedTestCase?.id === tc.id;
            return (
              <div
                key={tc.id}
                className="card"
                onClick={() => setSelectedTestCase(tc)}
                style={{
                  cursor: 'pointer',
                  border: isSelected ? '1px solid #3b82f6' : '1px solid #24324d',
                  background: isSelected ? '#1a253e' : '#131b2e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {tc.status === 'PASS' ? (
                    <CheckCircle2 style={{ width: '22px', height: '22px', color: '#34d399', flexShrink: 0 }} />
                  ) : (
                    <XCircle style={{ width: '22px', height: '22px', color: '#f87171', flexShrink: 0 }} />
                  )}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="mono" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>
                        {tc.id}
                      </span>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>{tc.name}</h4>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{tc.description}</p>
                  </div>
                </div>

                <div className="mono" style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {tc.executionTimeMs}ms
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Console Log Stream & Assertion Details */}
        {selectedTestCase ? (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
              <div>
                <span className="mono" style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: 700 }}>
                  {selectedTestCase.id} • {selectedTestCase.name}
                </span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: '2px' }}>Test Assertion Log</h3>
              </div>
              <span
                className="badge"
                style={{
                  background: selectedTestCase.status === 'PASS' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: selectedTestCase.status === 'PASS' ? '#34d399' : '#f87171'
                }}
              >
                {selectedTestCase.status}
              </span>
            </div>

            {/* Assertion Summary */}
            <div
              style={{
                background: selectedTestCase.status === 'PASS' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: selectedTestCase.status === 'PASS' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                color: selectedTestCase.status === 'PASS' ? '#34d399' : '#f87171',
                fontWeight: 600
              }}
            >
              Assertion result: "{selectedTestCase.assertion}"
            </div>

            {/* Step-by-Step Console Log Box */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>
                <Terminal style={{ width: '14px', height: '14px' }} /> Execution Trace Logs
              </div>
              <div
                className="mono"
                style={{
                  background: '#090d16',
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                  padding: '14px',
                  fontSize: '0.8rem',
                  color: '#38bdf8',
                  lineHeight: 1.6,
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}
              >
                {selectedTestCase.logs.map((logLine, idx) => (
                  <div key={idx} style={{ color: logLine.includes('EXPECTED ERROR') ? '#fbbf24' : '#cbd5e1' }}>
                    &gt; {logLine}
                  </div>
                ))}
              </div>
            </div>

            {/* Payload State View */}
            {selectedTestCase.payload && (
              <div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>
                  Payload Output State
                </div>
                <pre
                  className="mono"
                  style={{
                    background: '#090d16',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    color: '#a78bfa',
                    overflowX: 'auto'
                  }}
                >
                  {JSON.stringify(selectedTestCase.payload, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            Select a test case to view logs and assertions.
          </div>
        )}
      </div>
    </div>
  );
};
