import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Menu as MenuIcon, ClipboardList, Tag, LogOut, Store, Megaphone, UserCircle } from 'lucide-react';

const Sidebar = ({ isOpen, closeSidebar }) => {

    return (
        <>
            {isOpen && <div className="sidebar-overlay d-md-none" onClick={closeSidebar} style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40}} />}
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-logo">
                <Store size={28} />
                <span>SFMS Merchant</span>
            </div>

            <nav className="nav-container">
                <NavLink to="/dashboard" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                    <LayoutDashboard size={20} /> <span className="nav-text">Dashboard</span>
                </NavLink>
                <NavLink to="/orders" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                    <ClipboardList size={20} /> <span className="nav-text">Orders</span>
                </NavLink>
                <NavLink to="/menu" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                    <MenuIcon size={20} /> <span className="nav-text">Menu</span>
                </NavLink>
                <NavLink to="/offers" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Tag size={20} /> <span className="nav-text">Offers</span>
                </NavLink>
                <NavLink to="/ads" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Megaphone size={20} /> <span className="nav-text">Ads</span>
                </NavLink>
                <NavLink to="/profile" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                    <UserCircle size={20} /> <span className="nav-text">Profile</span>
                </NavLink>
            </nav>

        </aside>
        </>
    );
};

export default Sidebar;
