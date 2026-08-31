import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const SocketContext = createContext();

// Audio Synthesizer using Web Audio API (Zero external mp3 file dependencies, works offline 100%)
function playSynthesizedSound(type = 'order') {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'order') {
      // Ascending chime (C5 -> E5 -> G5)
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.3);
      });
    } else if (type === 'call') {
      // High-clarity Bell alert (Ding-Dong 880Hz -> 660Hz)
      const now = ctx.currentTime;
      
      // Ding
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.6, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.6);

      // Dong
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.28);
      gain2.gain.setValueAtTime(0.6, now + 0.28);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.28);
      osc2.stop(now + 0.9);
    } else if (type === 'ready') {
      // Celebratory cheerful fanfare (E5 -> G5 -> C6 -> E6)
      const notes = [659.25, 783.99, 1046.50, 1318.51];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.35, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.4);
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

