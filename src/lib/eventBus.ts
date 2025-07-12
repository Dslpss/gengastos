import { useCallback } from "react";

// Event dispatcher para comunicação entre componentes
class EventBus {
  private events: { [key: string]: Function[] } = {};

  on(event: string, callback: Function) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter((cb) => cb !== callback);
  }

  emit(event: string, data?: any) {
    if (!this.events[event]) return;
    this.events[event].forEach((callback) => callback(data));
  }
}

export const eventBus = new EventBus();

// Hook para usar o event bus
export const useEventBus = () => {
  const emit = useCallback((event: string, data?: any) => {
    eventBus.emit(event, data);
  }, []);

  const on = useCallback((event: string, callback: Function) => {
    eventBus.on(event, callback);

    // Cleanup function
    return () => {
      eventBus.off(event, callback);
    };
  }, []);

  return { emit, on };
};

// Eventos específicos
export const EVENTS = {
  TRANSACTION_CREATED: "transaction:created",
  TRANSACTION_UPDATED: "transaction:updated",
  TRANSACTION_DELETED: "transaction:deleted",
  RECURRING_TRANSACTION_CREATED: "recurringTransaction:created",
  RECURRING_TRANSACTION_UPDATED: "recurringTransaction:updated",
  RECURRING_TRANSACTION_DELETED: "recurringTransaction:deleted",
  USER_SETTINGS_UPDATED: "userSettings:updated",
  DASHBOARD_REFRESH: "dashboard:refresh",
} as const;
