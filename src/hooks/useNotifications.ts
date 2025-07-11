import { useCallback, useRef } from "react";
import { useNotificationStore } from "../stores/notificationStore";
import { apiService } from "../lib/supabaseApi";

export const useNotifications = () => {
  const { addNotification } = useNotificationStore();
  const shownNotifications = useRef(new Set<string>());

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

  // Nova função principal que verifica TODAS as notificações baseadas no banco
  const checkAllSmartNotifications = useCallback(async () => {
    try {
      const alerts = await apiService.checkAllNotifications();
      let newAlertsCount = 0;

      alerts.forEach((alert) => {
        // Criar um ID único baseado no tipo e dados da notificação
        const notificationKey = `${alert.type}-${alert.title}-${JSON.stringify(
          alert.data
        )}`;

        // Só adicionar se não foi mostrada recentemente
        if (!shownNotifications.current.has(notificationKey)) {
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

          // Marcar como mostrada
          shownNotifications.current.add(notificationKey);
          newAlertsCount++;

          // Limpar após 5 minutos para permitir notificações futuras
          setTimeout(() => {
            shownNotifications.current.delete(notificationKey);
          }, 5 * 60 * 1000);
        }
      });

      console.log(
        `🔔 ${newAlertsCount} notificações inteligentes novas verificadas`
      );
      return newAlertsCount; // Retorna quantas notificações novas foram criadas
    } catch (error) {
      console.error("Erro ao verificar notificações inteligentes:", error);
      return 0;
    }
  }, [addNotification]);

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
