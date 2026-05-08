import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MenuManager from './pages/MenuManager';
import OrdersManager from './pages/OrdersManager';
import OffersManager from './pages/OffersManager';
import AdsManager from './pages/AdsManager';
import ShopProfile from './pages/ShopProfile';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes inside Layout */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/menu" element={<MenuManager />} />
          <Route path="/orders" element={<OrdersManager />} />
          <Route path="/offers" element={<OffersManager />} />
          <Route path="/ads" element={<AdsManager />} />
          <Route path="/profile" element={<ShopProfile />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
