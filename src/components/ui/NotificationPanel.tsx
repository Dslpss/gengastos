import React from "react";
import { useNotificationStore } from "../../stores/notificationStore";
import { X, Bell, Trash2, CheckCheck } from "lucide-react";

const NotificationPanel: React.FC = () => {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    unreadCount,
  } = useNotificationStore();
  const [open, setOpen] = React.useState(false);
  const [showClearConfirm, setShowClearConfirm] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);

  // Fecha o painel ao clicar fora
  React.useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Fecha ao pressionar ESC
  React.useEffect(() => {
    if (!open) return;
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      {/* Badge do sino */}
      <button
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notificações"
        aria-expanded={open}
      >
        <Bell
          className={`w-6 h-6 transition-colors duration-200 ${
            open ? "text-blue-600" : "text-gray-700"
          }`}
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center font-bold shadow-lg border-2 border-white animate-bounce">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}

        {/* Contador sempre visível (mesmo quando 0) */}
        <span
          className={`absolute -bottom-1 -right-1 text-[10px] font-bold px-1 py-0.5 rounded-full min-w-[1rem] h-4 flex items-center justify-center transition-all duration-200 ${
            unreadCount > 0
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-300 text-gray-600"
          }`}
        >
          {notifications.length > 999 ? "999+" : notifications.length}
        </span>
      </button>

      {/* Overlay para mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-[9998] md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Painel de notificações */}
      {open && (
        <div
          className="fixed md:absolute right-4 md:right-0 top-16 md:top-full md:mt-2 w-[calc(100vw-2rem)] md:w-96 bg-white shadow-xl rounded-xl border border-gray-200 z-[9999] max-h-[80vh] md:max-h-96 overflow-hidden animate-in slide-in-from-top-2 md:slide-in-from-top-0 duration-200"
          style={{
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-900">Notificações</span>
              {unreadCount > 0 && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                  {unreadCount} nova{unreadCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <>
                  {unreadCount > 0 && (
                    <button
                      className="p-1.5 hover:bg-green-100 rounded-lg transition-colors duration-200 text-green-600 hover:text-green-700"
                      onClick={() => {
                        markAllAsRead();
                      }}
                      title="Marcar todas como lidas"
                      aria-label="Marcar todas como lidas"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (showClearConfirm) {
                        clearNotifications();
                        setShowClearConfirm(false);
                      } else {
                        setShowClearConfirm(true);
                        // Auto-cancelar após 3 segundos
                        setTimeout(() => setShowClearConfirm(false), 3000);
                      }
                    }}
                    title={
                      showClearConfirm
                        ? "Clique novamente para confirmar"
                        : "Limpar todas as notificações"
                    }
                    aria-label="Limpar todas"
                    className={`p-1.5 rounded-lg transition-colors duration-200 ${
                      showClearConfirm
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : "hover:bg-red-100 text-red-600 hover:text-red-700"
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                className="p-1.5 hover:bg-white hover:bg-opacity-60 rounded-lg transition-colors duration-200"
                onClick={() => setOpen(false)}
                aria-label="Fechar"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">Nenhuma notificação</p>
                <p className="text-sm text-gray-400 mt-1">
                  Você está em dia! ✨
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-4 hover:bg-gray-50 transition-colors duration-200 ${
                    n.read
                      ? "bg-white"
                      : "bg-blue-50 border-l-4 border-blue-400"
                  }`}
                >
                  <div className="pt-1 flex-shrink-0">
                    {n.icon ? (
                      <span className="text-2xl">{n.icon}</span>
                    ) : (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bell className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-medium ${
                        n.read ? "text-gray-900" : "text-gray-900"
                      }`}
                    >
                      {n.title}
                    </div>
                    <div
                      className={`text-sm mt-1 ${
                        n.read ? "text-gray-600" : "text-gray-700"
                      }`}
                    >
                      {n.message}
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      {n.timestamp &&
                        new Date(n.timestamp).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                    </div>
                  </div>
                  {!n.read && (
                    <button
                      className="ml-2 text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium flex-shrink-0"
                      onClick={() => markAsRead(n.id)}
                    >
                      Marcar como lida
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t bg-gray-50 flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {notifications.length} notificação
                {notifications.length !== 1 ? "ões" : ""}
              </span>
              <button
                className="text-xs text-red-600 hover:text-red-800 hover:underline font-medium"
                onClick={clearNotifications}
              >
                Limpar todas
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
