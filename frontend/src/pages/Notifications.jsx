import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiBell, FiCheck, FiX, FiClock, FiAlertCircle, FiTruck, FiDollarSign } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { getUserRole } from '../auth/roles';
import {
  PageShell,
  PageHero,
  StatGrid,
  StatCard,
  Panel,
  SoftButton,
  LoadingBlock,
  EmptyState
} from '../components/ui/PageChrome';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const typeIcon = {
  deadline: FiClock,
  rest_payment: FiDollarSign,
  low_stock: FiAlertCircle,
  stock_movement: FiTruck
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${API_URL}/notifications`, {
        params: { role: getUserRole() }
      });
      const items = (Array.isArray(response.data) ? response.data : []).map((item) => ({
        ...item,
        icon: typeIcon[item.type] || FiBell
      }));
      setNotifications(items);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      setNotifications(notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      ));

      // If using real API:
      // await axios.patch(`http://localhost:5000/api/notifications/${id}/read`);

      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(notifications.map((notif) => ({ ...notif, read: true })));

      // If using real API:
      // await axios.patch('http://localhost:5000/api/notifications/read-all');

      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      setNotifications(notifications.filter((notif) => notif.id !== id));

      // If using real API:
      // await axios.delete(`http://localhost:5000/api/notifications/${id}`);

      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAll = async () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      try {
        setNotifications([]);

        // If using real API:
        // await axios.delete('http://localhost:5000/api/notifications/clear-all');

        toast.success('All notifications cleared');
      } catch (error) {
        console.error('Error clearing notifications:', error);
      }
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'read') return notif.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIconColor = (color) => {
    switch (color) {
      case 'blue':
        return 'bg-sky-100 text-sky-600';
      case 'red':
        return 'bg-rose-100 text-rose-600';
      case 'green':
        return 'bg-emerald-100 text-emerald-600';
      case 'yellow':
        return 'bg-amber-100 text-amber-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  if (loading) {
    return (
      <PageShell>
        <LoadingBlock />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHero
        tone="teal"
        eyebrow="Alerts"
        title="Notifications"
        subtitle="Deadline alerts include customer orders and rest payment still due"
      />

      <StatGrid cols="3">
        <StatCard
          label="Total"
          value={notifications.length}
          icon={<FiBell size={16} />}
          accent="slate"
        />
        <StatCard
          label="Unread"
          value={unreadCount}
          icon={<FiBell size={16} />}
          accent="sky"
        />
        <StatCard
          label="Deadline / rest due"
          value={notifications.filter((n) => n.type === 'deadline').length}
          icon={<FiClock size={16} />}
          accent="amber"
        />
      </StatGrid>

      <Panel
        title="Inbox"
        action={
          <div className="flex flex-wrap gap-1.5">
            {['all', 'unread', 'read'].map((key) => (
              <SoftButton
                key={key}
                onClick={() => setFilter(key)}
                className={
                  filter === key
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </SoftButton>
            ))}
            {unreadCount > 0 && (
              <SoftButton
                onClick={markAllAsRead}
                className="text-teal-700 hover:bg-teal-50"
              >
                <FiCheck size={12} /> Mark all
              </SoftButton>
            )}
            {notifications.length > 0 && (
              <SoftButton
                onClick={clearAll}
                className="text-rose-600 hover:bg-rose-50"
              >
                <FiX size={12} /> Clear
              </SoftButton>
            )}
          </div>
        }
        bodyClassName="p-0 sm:p-0"
      >
        <div className="divide-y divide-slate-100">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <div
                  key={notification.id}
                  className={`px-3 py-2.5 hover:bg-slate-50/80 transition ${
                    !notification.read ? 'bg-teal-50/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 ${getIconColor(notification.color)}`}
                    >
                      <Icon size={14} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p
                            className={`text-xs sm:text-sm text-slate-900 truncate ${
                              !notification.read ? 'font-semibold' : ''
                            }`}
                          >
                            {notification.message}
                          </p>
                          <div className="flex items-center mt-0.5 text-[10px] text-slate-500">
                            <FiClock className="mr-1" size={10} />
                            <span>{notification.date}</span>
                            {notification.time && (
                              <>
                                <span className="mx-1">·</span>
                                <span>{notification.time}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5 shrink-0">
                          {!notification.read && (
                            <SoftButton
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 text-teal-600 hover:bg-teal-100"
                              title="Mark as read"
                            >
                              <FiCheck size={14} />
                            </SoftButton>
                          )}
                          <SoftButton
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 text-rose-600 hover:bg-rose-100"
                            title="Delete"
                          >
                            <FiX size={14} />
                          </SoftButton>
                        </div>
                      </div>

                      <div className="mt-1.5">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] ${
                            notification.type === 'deadline'
                              ? 'bg-amber-100 text-amber-800'
                              : notification.type === 'stock_movement'
                                ? 'bg-sky-100 text-sky-800'
                                : notification.type === 'low_stock'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {notification.type === 'deadline'
                            ? 'Deadline + rest'
                            : notification.type === 'low_stock'
                              ? 'Low Stock'
                              : 'Stock Movement'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyState>
              <FiBell size={28} className="mx-auto mb-2 text-slate-300" />
              No notifications found
            </EmptyState>
          )}
        </div>
      </Panel>

      <Panel title="Quick actions" className="mt-3 sm:mt-4">
        <div className="flex flex-wrap gap-1.5">
          <Link
            to="/orders"
            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500 text-white hover:bg-amber-600"
          >
            <FiClock size={12} /> Open orders
          </Link>
          <Link
            to="/stock-movement"
            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-sky-600 text-white hover:bg-sky-700"
          >
            <FiTruck size={12} /> Stock movements
          </Link>
          <Link
            to="/inventory"
            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <FiAlertCircle size={12} /> Low stock
          </Link>
        </div>
      </Panel>
    </PageShell>
  );
};

export default Notifications;
