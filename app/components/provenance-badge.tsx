'use client';

/**
 * Provenance UI (redesign Point 4): every uncertain value wears its badge.
 */

import React from 'react';
import { PROVENANCE_INFO, PROVENANCE_LEGEND, type DataProvenance } from '@lib/provenance';

export function ProvenanceBadge({
  kind,
  compact = false,
}: {
  kind: DataProvenance;
  compact?: boolean;
}) {
  const info = PROVENANCE_INFO[kind];
  return (
    <span
      className={`provenance-badge prov-${kind}`}
      title={info.description}
      aria-label={`${info.label}: ${info.description}`}
    >
      <span className="prov-symbol" aria-hidden="true">
        {info.symbol}
      </span>
      {!compact && <span className="prov-label">{info.label}</span>}
    </span>
  );
}

/** Inline legend explaining all provenance kinds at once. */
export function ProvenanceLegend() {
  return (
    <div className="provenance-legend" aria-label="Data source legend">
      <span className="legend-title">Data sources:</span>
      {PROVENANCE_LEGEND.map((kind) => (
        <span
          key={kind}
          className={`legend-item legend-${kind}`}
          title={PROVENANCE_INFO[kind].description}
        >
          <span aria-hidden="true">{PROVENANCE_INFO[kind].symbol}</span> {PROVENANCE_INFO[kind].label}
        </span>
      ))}
    </div>
  );
}