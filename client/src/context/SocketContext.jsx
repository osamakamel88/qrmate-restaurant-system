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
      // Bell alert (Ding-Dong)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      const gain2 = ctx.createGain();

      osc1.frequency.setValueAtTime(880, ctx.currentTime);
      gain1.gain.setValueAtTime(0.4, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc2.frequency.setValueAtTime(700, ctx.currentTime + 0.25);
      gain2.gain.setValueAtTime(0.4, ctx.currentTime + 0.25);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.4);
      osc2.start(ctx.currentTime + 0.25);
      osc2.stop(ctx.currentTime + 0.7);
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

  const connectWebSocket = () => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.hostname || 'localhost';
      const port = '3001'; // Backend port
      const wsUrl = `${protocol}//${host}:${port}/ws`;

      console.log(`Connecting WS to ${wsUrl}...`);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('✅ WebSocket Connected to Local Server');
        setIsConnected(true);
        // Re-register role if previously defined
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
          setLastEvent(data);

          if (data.type === 'NEW_ORDER') {
            playSynthesizedSound('order');
            setActiveNotification({
              title: `طلب جديد طاولة ${data.payload.table_number || ''}`,
              titleEn: `New Order Table ${data.payload.table_number || ''}`,
              desc: `${data.payload.items?.length || 1} أصناف - ${data.payload.total_amount} ج.م`,
              type: 'info'
            });
          } else if (data.type === 'NEW_TABLE_CALL') {
            playSynthesizedSound('call');
            const typeLabels = {
              waiter: 'طلب ويتر 🙋‍♂️',
              bill: 'طلب حساب وشيك 💵',
              water: 'طلب ماء 💧',
              charcoal: 'تغيير فحم شيشة 🔥',
              other: 'استدعاء عام'
            };
            setActiveNotification({
              title: `تنبيه من طاولة ${data.payload.table_number}`,
              titleEn: `Alert from Table ${data.payload.table_number}`,
              desc: typeLabels[data.payload.type] || data.payload.type,
              type: 'warning'
            });
          } else if (data.type === 'CLIENT_ORDER_READY') {
            playSynthesizedSound('ready');
            setActiveNotification({
              title: '🍽️ طلبك جاهز بالهناء والشفاء!',
              titleEn: '🍽️ Your order is ready and on the way!',
              desc: data.payload.messageAr || data.payload.messageEn,
              type: 'success',
              isOrderReady: true
            });
          }
        } catch (err) {
          console.error('Socket message parse error:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log('WS disconnected, reconnecting in 3s...');
        setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = (err) => {
        console.warn('WS connection notice:', err.message);
        ws.close();
      };

      wsRef.current = ws;
    } catch (err) {
      console.warn('WebSocket setup error:', err);
      setTimeout(connectWebSocket, 3000);
    }
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
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
      playSound: playSynthesizedSound
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
