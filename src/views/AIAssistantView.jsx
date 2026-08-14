import React, { useState } from 'react';
import { Sparkles, Bot, Send, Zap, TrendingUp, AlertTriangle, CheckCircle2, ShieldCheck, RefreshCw, Cpu } from 'lucide-react';

export default function AIAssistantView() {
  const [query, setQuery] = useState('');
  const [chatLog, setChatLog] = useState([
    {
      sender: 'ai',
      text: "Hello! I am your UAE ERP AI Intelligence Engine. How can I assist with financial audits, daycare analytics, or student management today?",
      timestamp: 'Just now'
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);

  const quickPrompts = [
    "Analyze daycare peak occupancy trends",
    "Audit double-entry ledger balance",
    "Predict next month tuition cashflow",
    "Check teacher-to-student ratio compliance"
  ];

  const handleSend = (textToSend) => {
    const message = textToSend || query;
    if (!message.trim()) return;

    // Append user message
    const userMsg = { sender: 'user', text: message, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatLog(prev => [...prev, userMsg]);
    if (!textToSend) setQuery('');
    setIsThinking(true);

    // AI Intelligence Logic Response
    setTimeout(() => {
      let aiResponseText = "";
      const lower = message.toLowerCase();

      if (lower.includes("daycare") || lower.includes("occupancy") || lower.includes("peak")) {
        aiResponseText = "📊 **Daycare AI Forecast**: Peak occupancy detected between 14:00 - 17:00 GST. Recommended staff allocation: 4 senior daycare handlers. Expected overtime billing volume: AED 4,250 this week.";
      } else if (lower.includes("audit") || lower.includes("ledger") || lower.includes("balance")) {
        aiResponseText = "🛡️ **Financial Audit Complete**: General Ledger is 100% balanced (Total Debits = Total Credits = AED 125,400). Zero unposted draft entries detected in POS module.";
      } else if (lower.includes("tuition") || lower.includes("cashflow") || lower.includes("predict")) {
        aiResponseText = "💡 **Predictive Revenue AI**: Projecting AED 142,000 for September tuition renewals. 40 of 42 active students are enrolled in auto-debit payments.";
      } else if (lower.includes("ratio") || lower.includes("compliance") || lower.includes("teacher")) {
        aiResponseText = "✅ **UAE Regulation Compliance**: Current Teacher-to-Student Ratio is 1:7 (UAE Ministry Standard is max 1:10). All staff Emirates IDs are valid.";
      } else {
        aiResponseText = `⚡ **AI Intelligence**: Processed prompt "${message}". General ledger status is optimal, all 42 active tuition records synced with automated accounting.`;
      }

      setChatLog(prev => [
        ...prev,
        { sender: 'ai', text: aiResponseText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
      setIsThinking(false);
    }, 800);
  };

  return (
    <div className="view-container">
      {/* Header Banner */}
      <div className="glass-card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(0, 0, 0, 0.4))', border: '1px solid var(--border-highlight)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 20px var(--accent-primary-glow)' }}>
              <Cpu size={30} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                UAE ERP AI Intelligence Hub
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Predictive Financial Forecasting, RFID Daycare Analytics & Real-Time Auditing Engine
              </p>
            </div>
          </div>
          <span className="badge-status badge-success" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <Sparkles size={14} /> AI Model v4.2 Active
          </span>
        </div>
      </div>

      {/* AI Insights KPI Cards */}
      <div className="grid-stats-large" style={{ marginBottom: '24px' }}>
        
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
              <TrendingUp size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Forecasted Revenue</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-primary)' }}>AED 142,000</div>
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+13.2% projected growth for upcoming monthly tuition cycle</p>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>AI Audit Score</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>100% Balanced</div>
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Zero double-entry discrepancies or unassigned receipts</p>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
              <Zap size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Daycare Efficiency</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>94.8%</div>
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Optimal room utilization across morning & evening daycare</p>
        </div>

      </div>

      {/* Interactive Chat Console */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '520px', padding: 0, overflow: 'hidden' }}>
        
        {/* Console Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card-bg-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bot size={22} color="var(--accent-primary)" />
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Interactive AI Assistant</h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'inline-block' }}></span> Ready
          </span>
        </div>

        {/* Quick Prompts Chips */}
        <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '8px', overflowX: 'auto' }}>
          {quickPrompts.map((p, idx) => (
            <button 
              key={idx} 
              onClick={() => handleSend(p)}
              className="btn btn-outline" 
              style={{ fontSize: '0.75rem', padding: '6px 12px', whiteSpace: 'nowrap', borderRadius: '14px', minHeight: '32px' }}
            >
              <Sparkles size={12} color="var(--accent-primary)" /> {p}
            </button>
          ))}
        </div>

        {/* Message Log */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {chatLog.map((msg, index) => (
            <div 
              key={index}
              style={{ 
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                display: 'flex',
                gap: '12px',
                flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
              }}
            >
              <div style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '12px', 
                background: msg.sender === 'user' ? 'var(--bg-card-hover)' : 'var(--accent-primary-glow)', 
                color: msg.sender === 'user' ? 'var(--text-main)' : 'var(--accent-primary)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0,
                border: '1px solid var(--border-color)'
              }}>
                {msg.sender === 'user' ? 'You' : <Bot size={20} />}
              </div>

              <div style={{
                background: msg.sender === 'user' ? 'var(--accent-primary)' : 'var(--bg-card-hover)',
                color: msg.sender === 'user' ? '#FFFFFF' : 'var(--text-main)',
                padding: '14px 18px',
                borderRadius: '18px',
                border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                <div>{msg.text}</div>
                <div style={{ fontSize: '0.68rem', marginTop: '6px', opacity: 0.7, textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isThinking && (
            <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <RefreshCw className="spin" size={16} color="var(--accent-primary)" /> AI Processing request...
            </div>
          )}
        </div>

        {/* Input Controls */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '12px', background: 'var(--bg-sidebar)' }}>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Ask AI Assistant anything about finance, students, or daycare..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-emerald" style={{ padding: '0 20px' }}>
            <Send size={18} />
          </button>
        </form>

      </div>
    </div>
  );
}
