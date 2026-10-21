'use client';

import React from 'react';
import { MONTH_ART, monthArtFor } from '@lib/month-art';
import { getMercedoniusMonthLabel } from '@lib/calendar-service';

interface MonthCircleProps {
  /** Mercedonius month number (0 = year boundary, 1-13 = named months) */
  month: number;
  /** Year for the label */
  year: number;
  /** Size of the circle in CSS pixels */
  size?: number;
  /** Optional click handler */
  onClick?: () => void;
  className?: string;
}

/**
 * Displays the Mercedonius month artwork fully visible inside a circle,
 * centred on the sundial. Image is object-fit: cover so nothing is cut off
 * on web or mobile.
 */
export function MonthCircle({
  month,
  year,
  size = 260,
  onClick,
  className = '',
}: MonthCircleProps) {
  const src = monthArtFor(month);
  const label = getMercedoniusMonthLabel(month);
  const hasArt = src != null;

  return (
    <div
      className={`month-circle ${className}`}
      style={{
        width: size,
        height: size,
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Month image: ${label} ${year}`}
    >
      <div className="month-circle-ring" />
      {hasArt ? (
        <img
          src={src}
          alt={`${label} month artwork`}
          className="month-circle-image"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="month-circle-placeholder">
          <span className="month-circle-emoji">☀️</span>
          <span className="month-circle-text">{label}</span>
        </div>
      )}
      <div className="month-circle-overlay">
        <span className="month-circle-label">{label}</span>
        <span className="month-circle-year">{year} AUC</span>
      </div>
    </div>
  );
}