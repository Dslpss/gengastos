import { useNotificationStore } from "../stores/notificationStore";
import { apiService } from "../lib/supabaseApi";

export const useNotifications = () => {
  const { addNotification, notifications } = useNotificationStore();

  const generateId = () => crypto.randomUUID();

  // Função para verificar se já existe notificação similar
  const hasRecentNotification = (
    type: string,
    message: string,
    minutesAgo = 5
  ) => {
    const now = new Date();
    const timeThreshold = new Date(now.getTime() - minutesAgo * 60 * 1000);

    return notifications.some(
      (notification) =>
        notification.type === type &&
        notification.message === message &&
        new Date(notification.timestamp) > timeThreshold
    );
  };

  const addBudgetAlert = async (categoryId: string, amount: number) => {
    const alert = await apiService.checkBudgetOverage(categoryId, amount);
    if (alert && !hasRecentNotification(alert.type, alert.message)) {
      addNotification({
        id: generateId(),
        type: alert.type,
        title: alert.title,
        message: alert.message,
        timestamp: new Date().toISOString(),
        read: false,
        icon: alert.icon,
        data: alert.data,
      });
    }
  };

  const addUnusualTransactionAlert = async (
    amount: number,
    type: "income" | "expense"
  ) => {
    const alert = await apiService.checkUnusualTransaction(amount, type);
    if (alert && !hasRecentNotification(alert.type, alert.message)) {
      addNotification({
        id: generateId(),
        type: alert.type,
        title: alert.title,
        message: alert.message,
        timestamp: new Date().toISOString(),
        read: false,
        icon: alert.icon,
        data: alert.data,
      });
    }
  };

  // Nova função principal que verifica TODAS as notificações baseadas no banco
  const checkAllSmartNotifications = async () => {
    try {
      const alerts = await apiService.checkAllNotifications();
      let addedCount = 0;

      alerts.forEach((alert) => {
        // Só adiciona se não tiver notificação similar recente
        if (!hasRecentNotification(alert.type, alert.message)) {
          addNotification({
            id: generateId(),
            type: alert.type,
            title: alert.title,
            message: alert.message,
            timestamp: new Date().toISOString(),
            read: false,
            icon: alert.icon,
            data: alert.data,
          });
          addedCount++;
        }
      });

      console.log(
        `🔔 ${addedCount} novas notificações de ${alerts.length} verificadas`
      );
      return addedCount; // Retorna quantas notificações foram criadas
    } catch (error) {
      console.error("Erro ao verificar notificações inteligentes:", error);
      return 0;
    }
  };

  // Função para verificar apenas saldo baixo (com dados reais)
  const checkLowBalanceFromDB = async () => {
    try {
      const currentBalance = await apiService.calculateCurrentBalance();
      const alert = await apiService.checkLowBalance(currentBalance);

      console.log(`💰 Saldo atual calculado: R$ ${currentBalance.toFixed(2)}`);

      if (alert && !hasRecentNotification(alert.type, alert.message)) {
        addNotification({
          id: generateId(),
          type: alert.type,
          title: alert.title,
          message: alert.message,
          timestamp: new Date().toISOString(),
          read: false,
          icon: alert.icon,
          data: alert.data,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao verificar saldo baixo:", error);
      return false;
    }
  };

  // Funções específicas (ainda funcionais)
  const addUpcomingBillAlert = async () => {
    const alert = await apiService.checkUpcomingBills();
    if (alert) {
      addNotification({
        id: generateId(),
        type: alert.type,
        title: alert.title,
        message: alert.message,
        timestamp: new Date().toISOString(),
        read: false,
        icon: alert.icon,
        data: alert.data,
      });
    }
  };

  const addTestNotification = () => {
    addNotification({
      id: generateId(),
      type: "budget_exceeded",
      title: "🎉 Sistema de Notificações Ativo!",
      message: "As notificações inteligentes estão funcionando perfeitamente.",
      timestamp: new Date().toISOString(),
      read: false,
      icon: "✅",
      data: { test: true },
    });
  };

  return {
    // Novas funções inteligentes baseadas no banco
    checkAllSmartNotifications,
    checkLowBalanceFromDB,

    // Funções específicas (ainda funcionais)
    addBudgetAlert,
    addUnusualTransactionAlert,
    addUpcomingBillAlert,
    addTestNotification,
  };
};
