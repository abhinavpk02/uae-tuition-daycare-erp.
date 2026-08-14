import React from 'react';
import { Bot, AlertCircle } from 'lucide-react';

export default function AIAssistantView() {
  return (
    <div className="view-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '65vh' }}>
      <div className="glass-card" style={{ maxWidth: '480px', width: '100%', textAlign: 'center', padding: '40px 30px' }}>
        
        <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'var(--card-bg-subtle)', border: '1px solid var(--border-color)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', marginBottom: '20px' }}>
          <Bot size={32} />
        </div>

        <h2 style={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px' }}>
          Feature Unavailable
        </h2>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
          The AI Assistant feature is currently unavailable. Please check back later for future updates.
        </p>

        <div className="badge-status badge-warning" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
          <AlertCircle size={14} /> Under Maintenance
        </div>

      </div>
    </div>
  );
}
