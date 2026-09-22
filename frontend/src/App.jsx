import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Import Pages
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import StoreManagement from './pages/StoreManagement';
import AddProduct from './pages/AddProduct';
import Inventory from './pages/Inventory';
import RawMaterials from './pages/RawMaterials';
import Customers from './pages/Customers';
import CustomerDetails from './pages/customerDetails';
import Analytics from './pages/Analytics';
import StockMovement from './pages/StockMovement';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import SignUp from './pages/signup';
import Sales from './pages/Sales';
import PaymentInfo from './pages/PaymentInfo';
import Orders from './pages/Orders';
import Users from './pages/Users';
import PendingAccess from './pages/PendingAccess';

// Import Components
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import HomeRedirect from './components/HomeRedirect';
import { getStoredUser, homePath } from './auth/roles';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Need both profile + JWT — API rejects requests without the token
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (user && token) {
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
            <Navigate to={homePath(getStoredUser()?.role)} replace /> : 
            <Login setIsAuthenticated={setIsAuthenticated} />
            
          }
           
        />
         <Route path="/signup" element={<SignUp />} />
         <Route
           path="/forgot-password"
           element={
             isAuthenticated ? (
               <Navigate to={homePath(getStoredUser()?.role)} replace />
             ) : (
               <ForgotPassword />
             )
           }
         />


        {/* Protected Routes with Layout */}
        <Route element={<PrivateRoute isAuthenticated={isAuthenticated} />}>
          <Route element={<Layout />}>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/store" element={<StoreManagement />} />
            <Route path="/store/sales" element={<Sales />} />
            <Route path="/store/payment" element={<PaymentInfo />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/management" element={<AddProduct />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/raw-materials" element={<RawMaterials />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/:id" element={<CustomerDetails />} /> 
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/report" element={<Analytics />} />
            <Route path="/stock-movement" element={<StockMovement />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/pending" element={<PendingAccess />} />
           
            
          </Route>
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </Router>
  );
}

export default App;