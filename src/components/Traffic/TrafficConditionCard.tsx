import React from 'react';
import { Clock, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import { TrafficService } from '../../services/traffic';

interface TrafficConditionCardProps {
  trafficModel: TrafficService;
}

export default function TrafficConditionCard({ trafficModel }: TrafficConditionCardProps) {
  const period = trafficModel.getPeriodInfo();

  return (
    <div className="glass-panel control-card" style={{ padding: '0.85rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f8fafc', fontWeight: 600, fontSize: '0.85rem' }}>
          <Activity size={15} color="#38bdf8" />
          <span>Traffic Layer Status</span>
        </div>
        <span className="brand-badge" style={{ color: period.badgeColor, borderColor: period.badgeColor }}>
          {period.label}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem' }}>
        <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.45rem', borderRadius: '6px' }}>
          <div style={{ color: '#94a3b8' }}>Demand Multiplier</div>
          <div className="mono" style={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.95rem' }}>
            {period.factor}x
          </div>
        </div>
        <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.45rem', borderRadius: '6px' }}>
          <div style={{ color: '#94a3b8' }}>Active Incidents</div>
          <div className="mono" style={{ color: trafficModel.incidents.size > 0 ? '#ef4444' : '#10b981', fontWeight: 700, fontSize: '0.95rem' }}>
            {trafficModel.incidents.size}
          </div>
        </div>
      </div>
    </div>
  );
}
