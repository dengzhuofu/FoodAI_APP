type AuthEventType = 'UNAUTHORIZED';
type AuthEventHandler = () => void;

const listeners: Record<string, AuthEventHandler[]> = {};

export const authEvents = {
  on: (event: AuthEventType, handler: AuthEventHandler) => {
    if (!listeners[event]) {
      listeners[event] = [];
    }
    listeners[event].push(handler);
  },
  off: (event: AuthEventType, handler: AuthEventHandler) => {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter(h => h !== handler);
  },
  emit: (event: AuthEventType) => {
    if (!listeners[event]) return;
    listeners[event].forEach(handler => handler());
  }
};
