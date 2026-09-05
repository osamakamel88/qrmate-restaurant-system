import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const SocketContext = createContext();

// High-Impact Audio Synthesizer using Web Audio API (Zero external mp3 file dependencies, works offline 100%)
function playSynthesizedSound(type = 'call') {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (type === 'call') {
      // High-Alert Metallic Hotel Concierge Desk Bell (Distinct Double-Strike Brass Chime)
      // Strike 1 at t=0, Strike 2 at t=0.22s with rich harmonics for penetration in noisy environments
      const strikes = [0, 0.22];
      const harmonics = [
        { freq: 1046.50, gain: 0.50, decay: 1.2 }, // C6 fundamental
        { freq: 1318.51, gain: 0.40, decay: 1.0 }, // E6 harmonic
        { freq: 2093.00, gain: 0.35, decay: 0.8 }, // C7 high shimmer
        { freq: 3135.96, gain: 0.25, decay: 0.6 }, // G7 metallic strike overtone
      ];

      strikes.forEach((strikeTime) => {
        harmonics.forEach(({ freq, gain: peakGain, decay }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + strikeTime);
          
          // Sharp attack + resonant exponential decay
          gain.gain.setValueAtTime(peakGain, ctx.currentTime + strikeTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + strikeTime + decay);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(ctx.currentTime + strikeTime);
          osc.stop(ctx.currentTime + strikeTime + decay);
        });

        // Add acoustic transient strike click
        const clickOsc = ctx.createOscillator();
        const clickGain = ctx.createGain();
        clickOsc.type = 'triangle';
        clickOsc.frequency.setValueAtTime(880, ctx.currentTime + strikeTime);
        clickGain.gain.setValueAtTime(0.3, ctx.currentTime + strikeTime);
        clickGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + strikeTime + 0.08);
        clickOsc.connect(clickGain);
        clickGain.connect(ctx.destination);
        clickOsc.start(ctx.currentTime + strikeTime);
        clickOsc.stop(ctx.currentTime + strikeTime + 0.08);
      });
    } else if (type === 'order') {
      // Clear Ascending Triple-Chime (C5 -> E5 -> G5 -> C6)
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.11);
        gain.gain.setValueAtTime(0.45, ctx.currentTime + idx * 0.11);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.11 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.11);
        osc.stop(ctx.currentTime + idx * 0.11 + 0.4);
      });
    } else if (type === 'ready') {
      // Cheerful fanfare (E5 -> G5 -> C6 -> E6)
      const notes = [659.25, 783.99, 1046.50, 1318.51];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);
        gain.gain.setValueAtTime(0.4, ctx.currentTime + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.09 + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.09);
        osc.stop(ctx.currentTime + idx * 0.09 + 0.45);
      });
    }
  } catch (err) {
    console.warn('Audio synthesis note:', err.message);
  }
}

export function SocketProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const [activeNotification, setActiveNotification] = useState(null);
  const wsRef = useRef(null);
  const currentRoleRef = useRef('guest');
  const currentTableRef = useRef(null);
  const broadcastChannelRef = useRef(null);

  // Process incoming events from WS or BroadcastChannel
  const handleIncomingEvent = (data) => {
    if (!data || !data.type) return;
    setLastEvent(data);

    if (data.type === 'NEW_ORDER') {
      playSynthesizedSound('order');
      setActiveNotification({
        title: `طلب جديد طاولة ${data.payload?.table_number || ''}`,
        titleEn: `New Order Table ${data.payload?.table_number || ''}`,
        desc: `${data.payload?.items?.length || 1} أصناف - الإجمالي: ${data.payload?.grand_total || data.payload?.total_amount || 0} ج.م`,
        type: 'info'
      });
    } else if (data.type === 'NEW_TABLE_CALL') {
      playSynthesizedSound('call');
      const typeLabels = {
        waiter: 'طلب ويتر 🙋‍♂️',
        bill: 'طلب حساب وشيك 💵',
        water: 'طلب ماء 💧',
        charcoal: 'تغيير فحم شيشة 🔥',
        napkins: 'طلب مناديل وأدوات مائدة 🍴',
        other: 'استدعاء عام'
      };
      setActiveNotification({
        title: `🔔 استدعاء ويتر من طاولة #${data.payload?.table_number}`,
        titleEn: `🔔 Table #${data.payload?.table_number} Calling Waiter`,
        desc: typeLabels[data.payload?.type] || data.payload?.type || 'طلب مساعدة فورية',
        type: 'warning'
      });
    } else if (data.type === 'CLIENT_ORDER_READY') {
      playSynthesizedSound('ready');
      setActiveNotification({
        title: '🍽️ طلبك جاهز بالهناء والشفاء!',
        titleEn: '🍽️ Your order is ready and on the way!',
        desc: data.payload?.messageAr || data.payload?.messageEn || 'الطلب جاهز الآن',
        type: 'success',
        isOrderReady: true
      });
    }
  };

  // Broadcast event across WebSocket + Local BroadcastChannel + LocalStorage
  const broadcastLocalEvent = (eventType, payload) => {
    const eventObj = {
      type: eventType,
      payload,
      timestamp: new Date().toISOString()
    };

    // 1. Handle in current context
    handleIncomingEvent(eventObj);

    // 2. Send via WebSocket if open
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(eventObj));
      } catch (e) {}
    }

    // 3. Broadcast to other browser tabs via BroadcastChannel
    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage(eventObj);
      } catch (e) {}
    }

    // 4. Storage fallback for cross-tab sync
    try {
      localStorage.setItem('qrmate_realtime_event', JSON.stringify({ ...eventObj, _t: Date.now() }));
    } catch (e) {}
  };

  const connectWebSocket = () => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.hostname || 'localhost';
      const port = '3001'; // Backend port
      const wsUrl = `${protocol}//${host}:${port}/ws`;

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        if (currentRoleRef.current) {
          ws.send(JSON.stringify({
            type: 'REGISTER_ROLE',
            role: currentRoleRef.current,
            tableNumber: currentTableRef.current
          }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleIncomingEvent(data);
        } catch (err) {
          console.error('Socket message parse error:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };

      wsRef.current = ws;
    } catch (err) {
      setTimeout(connectWebSocket, 3000);
    }
  };

  useEffect(() => {
    connectWebSocket();

    // Setup cross-tab BroadcastChannel
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel('qrmate_realtime_bus');
        bc.onmessage = (ev) => {
          if (ev.data) handleIncomingEvent(ev.data);
        };
        broadcastChannelRef.current = bc;
      } catch (e) {}
    }

    // Setup Storage Event Listener
    const handleStorageChange = (e) => {
      if (e.key === 'qrmate_realtime_event' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          handleIncomingEvent(parsed);
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (broadcastChannelRef.current) broadcastChannelRef.current.close();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const registerRole = (role, tableNumber = null) => {
    currentRoleRef.current = role;
    currentTableRef.current = tableNumber;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'REGISTER_ROLE',
        role,
        tableNumber
      }));
    }
  };

  const clearNotification = () => setActiveNotification(null);

  return (
    <SocketContext.Provider value={{
      isConnected,
      lastEvent,
      registerRole,
      activeNotification,
      clearNotification,
      broadcastLocalEvent,
      playSound: playSynthesizedSound
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);

