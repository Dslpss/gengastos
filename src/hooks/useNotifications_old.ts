import { useNotificationStore } from "../stores/notificationStore";

// Hook de notificações (versão antiga/backup)
export const useNotificationsOld = () => {
  const { addNotification } = useNotificationStore();

  const generateId = () => crypto.randomUUID();

  const addTestNotification = () => {
    addNotification({
      id: generateId(),
      type: "budget_exceeded",
      title: "Notificação de Teste",
      message: "Esta é uma versão antiga do hook de notificações.",
      timestamp: new Date().toISOString(),
      read: false,
      icon: "ℹ️",
      data: { legacy: true },
    });
  };

  return {
    addTestNotification,
  };
};
