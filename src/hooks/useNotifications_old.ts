import { useNotificationStore } from "../stores/notificationSto  // Nova função principal que verifica TODAS as notificações baseadas no banco
  const checkAllSmartNotifications = async () => {
    try {
      const alerts = await apiService.checkAllNotifications();
      
      alerts.forEach(alert => {
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
      });

      console.log(`🔔 ${alerts.length} notificações inteligentes verificadas`);
      return alerts.length; // Retorna quantas notificações foram criadas
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
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao verificar saldo baixo:", error);
      return false;
    }
  };apiService } from "../lib/supabaseApi";

export const useNotifications = () => {
  const { addNotification } = useNotificationStore();

  const generateId = () => crypto.randomUUID();

  const addBudgetAlert = async (categoryId: string, amount: number) => {
    const alert = await apiService.checkBudgetOverage(categoryId, amount);
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

  const addLowBalanceAlert = async (balance: number) => {
    console.log(`🔍 Verificando saldo baixo: R$ ${balance.toFixed(2)}`);
    const alert = await apiService.checkLowBalance(balance);
    if (alert) {
      console.log(`⚠️ Saldo baixo detectado! Threshold: R$ ${alert.data.threshold.toFixed(2)}`);
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
    } else {
      console.log(`✅ Saldo OK`);
    }
  };

  const addUnusualTransactionAlert = async (
    amount: number,
    type: "income" | "expense"
  ) => {
    const alert = await apiService.checkUnusualTransaction(amount, type);
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
    addBudgetAlert,
    addLowBalanceAlert,
    addUnusualTransactionAlert,
    addUpcomingBillAlert,
    addTestNotification,
  };
};
