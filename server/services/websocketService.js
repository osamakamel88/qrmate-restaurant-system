import { WebSocketServer } from 'ws';

let wss = null;
const clients = new Map(); // ws => metadata { role, tableNumber, id }

export function initWebSocketServer(httpServer) {
  wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws, req) => {
    const id = Math.random().toString(36).substring(2, 9);
    clients.set(ws, { id, role: 'guest', tableNumber: null, connectedAt: new Date() });
    
    console.log(`🔌 WS Client connected: ${id}`);

    // Send initial handshake
    ws.send(JSON.stringify({ type: 'CONNECTED', clientId: id, timestamp: new Date().toISOString() }));

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        const clientMeta = clients.get(ws) || {};

        switch (data.type) {
          case 'REGISTER_ROLE':
            // role can be: 'captain', 'kds_kitchen', 'kds_barista', 'pos', 'guest', 'admin'
            clientMeta.role = data.role || 'guest';
            if (data.tableNumber) clientMeta.tableNumber = parseInt(data.tableNumber, 10);
            clients.set(ws, clientMeta);
            console.log(`👤 Client ${id} registered as [${clientMeta.role}] (Table: ${clientMeta.tableNumber || 'N/A'})`);
            ws.send(JSON.stringify({ type: 'REGISTERED', role: clientMeta.role, tableNumber: clientMeta.tableNumber }));
            break;

          case 'PING':
            ws.send(JSON.stringify({ type: 'PONG' }));
            break;

          default:
            break;
        }
      } catch (err) {
        console.error('WS parse error:', err.message);
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
      console.log(`❌ WS Client disconnected: ${id}`);
    });

    ws.on('error', (err) => {
      console.error(`WS error for client ${id}:`, err.message);
    });
  });

  return wss;
}

/**
 * Broadcast event to all or targeted clients
 */
export function broadcastEvent(eventType, payload, targetRole = null, targetTable = null) {
  if (!wss) return;

  const message = JSON.stringify({
    type: eventType,
    payload,
    timestamp: new Date().toISOString()
  });

  clients.forEach((meta, client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      let shouldSend = true;

      // Filter by role if specified
      if (targetRole && meta.role !== targetRole && meta.role !== 'admin' && meta.role !== 'pos') {
        shouldSend = false;
      }

      // Filter by table if specified
      if (targetTable && meta.tableNumber && meta.tableNumber !== targetTable) {
        shouldSend = false;
      }

      if (shouldSend) {
        try {
          client.send(message);
        } catch (err) {
          console.error('Failed to send WS message to client:', err.message);
        }
      }
    }
  });
}

export function broadcastNewOrder(orderData) {
  // Broadcast to all staff screens
  broadcastEvent('NEW_ORDER', orderData);
  // Also send dedicated table notification
  if (orderData.table_number) {
    broadcastEvent('ORDER_RECEIVED_AT_TABLE', orderData, null, orderData.table_number);
  }
}

export function broadcastOrderStatus(orderData) {
  broadcastEvent('ORDER_STATUS_CHANGED', orderData);
  if (orderData.table_number) {
    broadcastEvent('TABLE_ORDER_STATUS', orderData, null, orderData.table_number);
  }
}

export function broadcastTableCall(callData) {
  // Broadcast to Captain, Waiters, and Cashier POS
  broadcastEvent('NEW_TABLE_CALL', callData);
}

export function broadcastMenuUpdate() {
  broadcastEvent('MENU_UPDATED', { updated: true });
}
