import { useEffect, useRef, useState } from 'react';

const OUTCOMES = [
  {
    id: 'team',
    word: 'One team',
    arc: 0.85,
    color: '#0A2E28',
    text: 'Primary care, women\u2019s health and pediatrics coordinated by a single connected team.',
  },
  {
    id: 'access',
    word: 'Day or night',
    arc: 0.7,
    color: '#0B7A69',
    text: '24/7 virtual access so care fits around work, school and real family life.',
  },
  {
    id: 'plan',
    word: 'Personal',
    arc: 0.75,
    color: '#5AC8B2',
    text: 'Every member gets a care plan built around their stage, history and goals.',
  },
  {
    id: 'support',
    word: 'Ongoing',
    arc: 0.8,
    color: '#3E6E8E',
    text: 'Proactive check-ins and follow-up that continue between and after visits.',
  },
];

const ARC_RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * ARC_RADIUS;

function OutcomeRing({ item, active, reduced }) {
  const target = CIRCUMFERENCE * (1 - item.arc);
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative h-[136px] w-[136px]">
        <svg viewBox="0 0 136 136" className="h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="68" cy="68" r={ARC_RADIUS} fill="none" stroke="#0A2E28" strokeOpacity="0.12" strokeWidth="5" />
          <circle
            cx="68"
            cy="68"
            r={ARC_RADIUS}
            fill="none"
            stroke={item.color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={active || reduced ? target : CIRCUMFERENCE}
            style={{
              transition: active && !reduced ? 'stroke-dashoffset 1200ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
            }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center px-6 font-serif text-[19px] font-semibold leading-tight text-[#0A2E28]">
          {item.word}
        </span>
      </div>
      <p className="mt-4 max-w-[240px] text-[14px] leading-6 text-[#0A2E28]/70">{item.text}</p>
    </div>
  );
}
