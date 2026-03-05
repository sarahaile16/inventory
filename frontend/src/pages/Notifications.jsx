import React, { useState, useEffect } from 'react';
import { FiBell, FiCheck, FiX, FiClock, FiAlertCircle, FiTruck } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

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
      
      // Mock data based on your screenshot
      const mockNotifications = [
        {
          id: 1,
          message: '50 units of Main Plate (18 Pieces) moved to store.',
          date: 'Oct 25, 2025',
          time: '10:30 AM',
          type: 'stock_movement',
          read: false,
          icon: FiTruck,
          color: 'blue'
        },
        {
          id: 2,
          message: 'VÄRDERA (6 pieces) is running low on stock.',
          date: 'Oct 25, 2025',
          time: '09:15 AM',
          type: 'low_stock',
          read: false,
          icon: FiAlertCircle,
          color: 'red'
        },
        {
          id: 3,
          message: 'MOSSMAL (Bowl, dot pattern/light green, 6 ½") is running low on stock.',
          date: 'Oct 25, 2025',
          time: '09:15 AM',
          type: 'low_stock',
          read: false,
          icon: FiAlertCircle,
          color: 'red'
        },
        {
          id: 4,
          message: '50 units of GLADELIG (18 Piece Dinner Ware set) moved to store.',
          date: 'Oct 25, 2025',
          time: '08:45 AM',
          type: 'stock_movement',
          read: true,
          icon: FiTruck,
          color: 'blue'
        },
        {
          id: 5,
          message: '20 units of GODMIDDAG (18 Piece) moved to store.',
          date: 'Oct 25, 2025',
          time: '08:30 AM',
          type: 'stock_movement',
          read: true,
          icon: FiTruck,
          color: 'blue'
        },
        {
          id: 6,
          message: '30 units of GLADELIG (18 Piece Dinner Ware set) moved to store.',
          date: 'Oct 25, 2025',
          time: 'Yesterday',
          type: 'stock_movement',
          read: true,
          icon: FiTruck,
          color: 'blue'
        },
        {
          id: 7,
          message: '50 units of FÄRGKLAR (18 Piece Dinner Ware set) moved to store.',
          date: 'Oct 25, 2025',
          time: 'Yesterday',
          type: 'stock_movement',
          read: true,
          icon: FiTruck,
          color: 'blue'
        }
      ];
      
      setNotifications(mockNotifications);
      
      // If using real API:
      // const response = await axios.get('http://localhost:5000/api/notifications');
      // setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      // Update local state
      setNotifications(notifications.map(notif => 
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
      setNotifications(notifications.map(notif => ({ ...notif, read: true })));
      
      // If using real API:
      // await axios.patch('http://localhost:5000/api/notifications/read-all');
      
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      setNotifications(notifications.filter(notif => notif.id !== id));
      
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

  // Filter notifications
  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'read') return notif.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIconColor = (color) => {
    switch(color) {
      case 'blue': return 'bg-blue-100 text-blue-600';
      case 'red': return 'bg-red-100 text-red-600';
      case 'green': return 'bg-green-100 text-green-600';
      case 'yellow': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        <p className="text-gray-600">Stay updated with your inventory</p>
      </div>

      {/* Notification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Total Notifications</p>
          <p className="text-2xl font-bold">{notifications.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Unread</p>
          <p className="text-2xl font-bold text-blue-600">{unreadCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Low Stock Alerts</p>
          <p className="text-2xl font-bold text-red-600">
            {notifications.filter(n => n.type === 'low_stock').length}
          </p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b flex flex-wrap items-center justify-between gap-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'all' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'unread' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'read' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Read
            </button>
          </div>
          
          <div className="flex space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center"
              >
                <FiCheck className="mr-2" />
                Mark all as read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center"
              >
                <FiX className="mr-2" />
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Notifications List - Exactly matching your screenshot */}
        <div className="divide-y divide-gray-200">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <div 
                  key={notification.id} 
                  className={`p-4 hover:bg-gray-50 transition ${!notification.read ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start">
                    {/* Icon */}
                    <div className={`p-2 rounded-full ${getIconColor(notification.color)} mr-4`}>
                      <Icon size={20} />
                    </div>
                    
                    {/* Content - Matching your screenshot format */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-gray-900 ${!notification.read ? 'font-semibold' : ''}`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center mt-1 text-sm text-gray-500">
                            <FiClock className="mr-1" size={14} />
                            <span>{notification.date}</span>
                            {notification.time && (
                              <>
                                <span className="mx-1">•</span>
                                <span>{notification.time}</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                              title="Mark as read"
                            >
                              <FiCheck size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                            title="Delete"
                          >
                            <FiX size={16} />
                          </button>
                        </div>
                      </div>
                      
                      {/* Type badge */}
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          notification.type === 'stock_movement' 
                            ? 'bg-blue-100 text-blue-800'
                            : notification.type === 'low_stock'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {notification.type === 'stock_movement' ? 'Stock Movement' : 'Low Stock Alert'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FiBell size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No notifications found</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions - Matching your screenshot */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => window.location.href = '/stock-movement'}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
          >
            <FiTruck className="mr-2" />
            View Stock Movements
          </button>
          <button 
            onClick={() => window.location.href = '/inventory'}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center"
          >
            <FiAlertCircle className="mr-2" />
            Check Low Stock
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notifications;