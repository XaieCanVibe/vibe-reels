import React from 'react';

export const SkeletonReel = () => (
  <div style={{
    width: '100%',
    height: '100%',
    background: '#0f0f11',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: '0 0 80px 0'
  }}>
    {/* Shimmer overlay */}
    <div className="skeleton-shimmer" style={{ position: 'absolute', inset: 0 }} />

    {/* Bottom left info skeleton */}
    <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div className="skeleton-block" style={{ width: '140px', height: '14px', borderRadius: '8px' }} />
      <div className="skeleton-block" style={{ width: '220px', height: '12px', borderRadius: '8px' }} />
      <div className="skeleton-block" style={{ width: '160px', height: '12px', borderRadius: '8px' }} />
      <div className="skeleton-block" style={{ width: '120px', height: '11px', borderRadius: '8px', opacity: 0.6 }} />
    </div>

    {/* Right side actions skeleton */}
    <div style={{
      position: 'absolute',
      right: '14px',
      bottom: '90px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      alignItems: 'center'
    }}>
      <div className="skeleton-circle" style={{ width: '50px', height: '50px' }} />
      <div className="skeleton-circle" style={{ width: '48px', height: '48px' }} />
      <div className="skeleton-circle" style={{ width: '48px', height: '48px' }} />
      <div className="skeleton-circle" style={{ width: '48px', height: '48px' }} />
    </div>
  </div>
);

export const SkeletonFeed = () => (
  <div style={{ width: '100%', height: '100%', background: '#0f0f11' }}>
    <SkeletonReel />
  </div>
);
