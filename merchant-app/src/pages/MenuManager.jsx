import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2, Edit2, X, Search, Image as ImageIcon, Upload } from 'lucide-react';
import axios from '../api/axios';

// PREDEFINED_CATEGORIES are now dynamically loaded based on shop type

const MenuManager = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingItemId, setEditingItemId] = useState(null);
    
    const [predefinedCategories, setPredefinedCategories] = useState([]);
    // Form state
    const [formData, setFormData] = useState({ 
        item_name: '', 
        categorySelect: '', 
        price: '', 
        is_available: true,
        stock: 0,
        imageType: 'url', // 'url' or 'file'
        imageUrl: '',
        imageFile: null
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('All');

    useEffect(() => {
        fetchMenuItems();
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await axios.get('/merchant/profile');
            const type = res.data.shop_type;
            let cats = ['Beverages', 'Desserts', 'Snacks']; // default fallback
            if (type === 'Bakery') cats = ['Cake', 'Bread', 'Pastry', 'Beverages'];
            else if (type === 'Café') cats = ['Coffee', 'Tea', 'Sandwich', 'Desserts'];
            else if (type === 'Restaurant') cats = ['Rice', 'Kottu', 'Curry', 'BBQ', 'Beverages', 'Desserts'];
            
            setPredefinedCategories(cats);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMenuItems = async () => {
        try {
            const res = await axios.get('/menu');
            setItems(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (type === 'file') {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const finalCategory = formData.categorySelect || predefinedCategories[0];

            const submitData = new FormData();
            submitData.append('item_name', formData.item_name);
            submitData.append('price', formData.price);
            submitData.append('category', finalCategory);
            submitData.append('is_available', formData.is_available);
            submitData.append('stock', formData.stock);

            if (formData.imageType === 'file' && formData.imageFile) {
                submitData.append('image', formData.imageFile);
            } else if (formData.imageType === 'url' && formData.imageUrl) {
                submitData.append('image_url', formData.imageUrl);
            }

            if (editingItemId) {
                await axios.put(`/menu/${editingItemId}`, submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await axios.post('/menu', submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            
            setShowForm(false);
            setEditingItemId(null);
            setFormData({ 
                item_name: '', 
                categorySelect: predefinedCategories[0] || '', 
                price: '', 
                is_available: true,
                stock: 0,
                imageType: 'url',
                imageUrl: '',
                imageFile: null
            });
            fetchMenuItems();
        } catch (err) {
            console.error(err);
            alert('Error adding item');
        }
    };

    const toggleAvailability = async (item) => {
        try {
            await axios.put(`/menu/${item.id}`, { ...item, is_available: !item.is_available });
            fetchMenuItems();
        } catch (err) {
            console.error(err);
        }
    };

    const deleteItem = async (id) => {
        if (!window.confirm('Are you sure you want to delete this menu item?')) return;
        try {
            await axios.delete(`/menu/${id}`);
            fetchMenuItems();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEditClick = (item) => {
        setEditingItemId(item.id);
        setFormData({
            item_name: item.item_name,
            price: item.price,
            categorySelect: item.category,
            is_available: Boolean(item.is_available),
            stock: item.stock || 0,
            imageType: 'url',
            imageUrl: item.image_url || '',
            imageFile: null
        });
        setShowForm(true);
    };

    // Derived states
    const itemsWithCategory = useMemo(() => {
        return items.map(item => ({
            ...item,
            category: item.category || 'Uncategorized'
        }));
    }, [items]);

    const categories = useMemo(() => {
        const cats = new Set(itemsWithCategory.map(i => i.category));
        return Array.from(cats).sort();
    }, [itemsWithCategory]);

    const availableCount = items.filter(i => i.is_available).length;

    const filteredItems = useMemo(() => {
        let result = itemsWithCategory;
        
        // Search filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(item => 
                item.item_name.toLowerCase().includes(q) || 
                item.category.toLowerCase().includes(q)
            );
        }

        // Tab filter
        if (activeTab !== 'All') {
            result = result.filter(item => item.category === activeTab);
        }

        return result;
    }, [itemsWithCategory, searchQuery, activeTab]);

    // Grouping by category
    const groupedItems = useMemo(() => {
        const groups = {};
        for (const item of filteredItems) {
            if (!groups[item.category]) {
                groups[item.category] = [];
            }
            groups[item.category].push(item);
        }
        // Return sorted categories
        return Object.keys(groups).sort().map(cat => ({
            categoryName: cat,
            items: groups[cat]
        }));
    }, [filteredItems]);


    return (
        <div className="animate-fade-in relative" style={{ paddingBottom: '4rem' }}>
            {/* Header */}
            <div className="d-flex justify-between align-start mb-4">
                <div>
                    <h1 style={{fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.2rem'}}>Menu</h1>
                    <p style={{color: 'var(--text-muted)'}}>
                        {items.length} items — {availableCount} available — {categories.length} categories
                    </p>
                </div>
                <button 
                    onClick={() => {
                        setEditingItemId(null);
                        setFormData({ 
                            item_name: '', categorySelect: predefinedCategories[0] || '',
                            price: '', is_available: true, stock: 0, imageType: 'url', imageUrl: '', imageFile: null
                        });
                        setShowForm(true);
                    }}
                    style={{
                        background: 'var(--primary)', color: '#fff', border: 'none',
                        fontWeight: 600, padding: '0 1.25rem', borderRadius: '12px',
                        display: 'flex', alignItems: 'center', cursor: 'pointer',
                        fontSize: '0.9rem', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)',
                        height: '40px', alignSelf: 'center'
                    }}
                >
                    <Plus size={18} style={{marginRight: '6px'}} /> Add Item
                </button>
            </div>

            {/* Sub Header: Search and Tabs */}
            <div className="mb-4">
                <div style={{ position: 'relative', maxWidth: '400px', marginBottom: '1.5rem' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                        type="text" 
                        placeholder="Search items or categories..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', 
                            borderRadius: '20px', border: '1px solid var(--border)',
                            backgroundColor: '#fff', outline: 'none'
                        }}
                    />
                </div>

                <div className="d-flex" style={{ gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                    <button 
                        onClick={() => setActiveTab('All')}
                        style={{
                            padding: '0.4rem 1rem', borderRadius: '20px', border: 'none', cursor: 'pointer',
                            fontWeight: activeTab === 'All' ? 600 : 500,
                            background: activeTab === 'All' ? 'var(--primary)' : '#f8fafc',
                            color: activeTab === 'All' ? '#fff' : 'var(--text-muted)'
                        }}
                    >
                        All
                    </button>
                    {categories.map(cat => {
                        const count = itemsWithCategory.filter(i => i.category === cat).length;
                        return (
                            <button 
                                key={cat}
                                onClick={() => setActiveTab(cat)}
                                style={{
                                    padding: '0.4rem 1.25rem', borderRadius: '20px', border: 'none', cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    fontWeight: activeTab === cat ? 600 : 500,
                                    background: activeTab === cat ? 'var(--primary)' : 'transparent',
                                    color: activeTab === cat ? '#fff' : 'var(--text-muted)',
                                    boxShadow: activeTab === cat ? '0 4px 6px rgba(16, 185, 129, 0.3)' : 'none',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {cat} <span style={{opacity: 0.7, fontSize: '0.85em', marginLeft: '4px'}}>{count}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Modals and Overlays */}
            {showForm && createPortal(
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    <style>
                        {`
                        @keyframes slideUpFade {
                            from { opacity: 0; transform: translateY(20px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                        `}
                    </style>
                    <div style={{ 
                        background: '#fff', borderRadius: '16px', width: '500px', maxWidth: '95%',
                        maxHeight: '90vh', overflowY: 'auto', position: 'relative',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        animation: 'slideUpFade 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}>
                        <div className="d-flex justify-between align-center" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                            <div>
                                <h3 style={{margin: 0, fontSize: '1.25rem'}}>{editingItemId ? 'Edit Menu Item' : 'Add Menu Item'}</h3>
                                <p style={{color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem', marginTop: '4px'}}>
                                    {editingItemId ? 'Update the details for this menu item.' : 'Fill in the details for your menu item.'}
                                </p>
                            </div>
                            <button 
                                onClick={() => setShowForm(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.5rem' }}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                            <div className="form-group mb-4">
                                <label className="form-label" style={{fontWeight: 600}}>Item Name *</label>
                                <input 
                                    type="text" 
                                    name="item_name"
                                    className="form-control" 
                                    value={formData.item_name} 
                                    onChange={handleFormChange} 
                                    placeholder="e.g. Beefcurry"
                                    required 
                                    style={{ borderRadius: '8px', border: '1px solid var(--border)', padding: '0.7rem' }}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="form-group">
                                    <label className="form-label" style={{fontWeight: 600}}>Price (LKR) *</label>
                                    <input 
                                        type="number" 
                                        name="price"
                                        step="0.01" 
                                        className="form-control" 
                                        value={formData.price} 
                                        onChange={handleFormChange} 
                                        required 
                                        style={{ borderRadius: '8px', border: '1px solid var(--border)', padding: '0.7rem' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" style={{fontWeight: 600}}>Stock Count</label>
                                    <input 
                                        type="number" 
                                        name="stock"
                                        className="form-control" 
                                        value={formData.stock} 
                                        onChange={handleFormChange} 
                                        min="0"
                                        style={{ borderRadius: '8px', border: '1px solid var(--border)', padding: '0.7rem' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" style={{fontWeight: 600}}>Category</label>
                                    <select 
                                        name="categorySelect"
                                        className="form-control" 
                                        value={formData.categorySelect} 
                                        onChange={handleFormChange}
                                        style={{ borderRadius: '8px', border: '1px solid var(--border)', padding: '0.7rem', backgroundColor: '#fff' }}
                                    >
                                        <option value="" disabled>Select a category</option>
                                        {predefinedCategories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group mb-4">
                                <div className="d-flex justify-between align-center mb-2">
                                    <label className="form-label" style={{fontWeight: 600, margin: 0}}>Image (Optional)</label>
                                    <div className="d-flex" style={{fontSize: '0.8rem', background: '#f3f4f6', borderRadius: '6px', padding: '2px'}}>
                                        <button type="button" onClick={() => setFormData({...formData, imageType: 'url'})} style={{background: formData.imageType === 'url' ? '#fff' : 'transparent', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', boxShadow: formData.imageType === 'url' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'}}>URL</button>
                                        <button type="button" onClick={() => setFormData({...formData, imageType: 'file'})} style={{background: formData.imageType === 'file' ? '#fff' : 'transparent', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', boxShadow: formData.imageType === 'file' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'}}>Upload</button>
                                    </div>
                                </div>
                                
                                {formData.imageType === 'url' ? (
                                    <div className="d-flex flex-column gap-2" style={{ width: '100%' }}>
                                        <input 
                                            type="url" 
                                            name="imageUrl"
                                            className="form-control" 
                                            placeholder="https://example.com/image.jpg"
                                            value={formData.imageUrl} 
                                            onChange={handleFormChange} 
                                            style={{ borderRadius: '8px', border: '1px solid var(--border)', padding: '0.7rem' }}
                                        />
                                        {formData.imageUrl && (
                                            <div style={{ marginTop: '0.5rem', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', position: 'relative' }}>
                                                <img 
                                                    src={formData.imageUrl} 
                                                    alt="Preview" 
                                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                                                    onLoad={(e) => { e.target.style.display = 'block'; e.target.nextSibling.style.display = 'none'; }}
                                                />
                                                <div style={{ display: 'none', color: 'var(--danger)', fontSize: '0.85rem', textAlign: 'center' }}>
                                                    Invalid Image URL<br/><span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Please check the link and try again</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{border: '1px dashed var(--border)', borderRadius: '8px', padding: '1rem', textAlign: 'center'}}>
                                        <input type="file" name="imageFile" id="imageFileInput" accept="image/*" style={{display: 'none'}} onChange={handleFormChange} />
                                        <label htmlFor="imageFileInput" style={{cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-muted)'}}>
                                            <Upload size={24} />
                                            <span>{formData.imageFile ? formData.imageFile.name : 'Click to select an image from device'}</span>
                                        </label>
                                    </div>
                                )}
                            </div>

                            <div className="form-group mb-5" style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                <div className="d-flex justify-between align-center">
                                    <div>
                                        <label style={{fontWeight: 600, display: 'block', marginBottom: '2px'}}>Available</label>
                                        <span style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>Visible to customers</span>
                                    </div>
                                    <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '24px' }}>
                                        <input 
                                            type="checkbox" 
                                            name="is_available"
                                            checked={formData.is_available} 
                                            onChange={handleFormChange} 
                                            style={{ opacity: 0, width: 0, height: 0 }} 
                                        />
                                        <span style={{
                                            position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                                            backgroundColor: formData.is_available ? 'var(--primary)' : '#ccc',
                                            transition: '0.4s', borderRadius: '24px'
                                        }}></span>
                                        <span style={{
                                            position: 'absolute', content: '""', height: '18px', width: '18px',
                                            left: formData.is_available ? '19px' : '3px', bottom: '3px',
                                            backgroundColor: 'white', transition: '0.4s', borderRadius: '50%'
                                        }}></span>
                                    </label>
                                </div>
                            </div>

                            <div className="d-flex justify-end gap-3">
                                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)} style={{padding: '0.6rem 1.5rem', borderRadius: '8px', border: '1px solid var(--border)', background: '#fff'}}>
                                    Cancel
                                </button>
                                <button type="submit" style={{
                                    background: 'var(--primary)', color: '#fff', border: 'none',
                                    fontWeight: 600, padding: '0.6rem 1.5rem', borderRadius: '8px',
                                    cursor: 'pointer', fontSize: '1rem',
                                    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)'
                                }}>
                                    {editingItemId ? 'Update Item' : 'Add to Menu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Menu List */}
            {loading ? <p>Loading menu...</p> : filteredItems.length === 0 ? (
                <div style={{textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)'}}>
                    <p>No items found for the current filter/search.</p>
                </div>
            ) : (
                <div className={activeTab === 'All' ? "d-flex" : "d-flex flex-column"} style={{gap: '2.5rem', overflowX: activeTab === 'All' ? 'auto' : 'visible', alignItems: activeTab === 'All' ? 'flex-start' : 'stretch', paddingBottom: activeTab === 'All' ? '1rem' : '0'}}>
                    {groupedItems.map((group, index) => {
                        // Color array for category pills just like the screenshot
                        const colors = ['#e0f2fe', '#fce7f3', '#fef3c7', '#e0e7ff', '#dcfce7'];
                        const textColors = ['#0284c7', '#db2777', '#d97706', '#4f46e5', '#16a34a'];
                        const catIndex = categories.indexOf(group.categoryName);
                        const colorIndex = (catIndex === -1 ? index : catIndex) % colors.length;

                        return (
                            <div key={group.categoryName} className="animate-fade-in" style={activeTab === 'All' ? { minWidth: '280px', flex: '0 0 auto' } : { width: '100%' }}>
                                <div className="d-flex align-center gap-3 mb-4" style={{position: 'relative'}}>
                                    <span style={{
                                        background: colors[colorIndex], 
                                        color: textColors[colorIndex], 
                                        padding: '0.2rem 0.8rem', 
                                        borderRadius: '20px', 
                                        fontWeight: 600,
                                        fontSize: '0.85rem'
                                    }}>
                                        {group.categoryName}
                                    </span>
                                    <span style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>{group.items.length} items</span>
                                    <div style={{flex: 1, height: '1px', background: '#f3f4f6', marginLeft: '1rem'}}></div>
                                </div>

                                <div style={{
                                    display: 'grid', 
                                    gridTemplateColumns: activeTab === 'All' ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))', 
                                    gap: '1.5rem'
                                }}>
                                    {group.items.map(item => (
                                        <div key={item.id} style={{
                                            background: '#fff', 
                                            borderRadius: '12px', 
                                            border: '1px solid var(--border)',
                                            overflow: 'hidden',
                                            display: 'flex',
                                            flexDirection: 'column'
                                        }}>
                                            <div style={{
                                                height: '140px', 
                                                background: '#f9fafb', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                borderBottom: '1px solid var(--border)',
                                                position: 'relative',
                                                opacity: item.is_available ? 1 : 0.5
                                            }}>
                                                {item.image_url ? (
                                                    <img 
                                                        src={item.image_url.startsWith('/uploads') ? `http://localhost:5000${item.image_url}` : item.image_url} 
                                                        alt={item.item_name} 
                                                        style={{width: '100%', height: '100%', objectFit: 'cover'}} 
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%23cbd5e1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";
                                                            e.target.style.objectFit = 'none';
                                                        }}
                                                    />
                                                ) : (
                                                    <ImageIcon size={32} color="#cbd5e1" />
                                                )}
                                            </div>
                                            <div style={{padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', opacity: item.is_available ? 1 : 0.6}}>
                                                <div className="d-flex justify-between align-start mb-2">
                                                    <h4 style={{margin: 0, fontSize: '1rem', flex: 1, paddingRight: '0.5rem'}}>{item.item_name}</h4>
                                                    <span style={{fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem', whiteSpace: 'nowrap'}}>
                                                        LKR {item.price}
                                                    </span>
                                                </div>
                                                <div style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem'}}>
                                                    Stock: <span style={{fontWeight: 600, color: item.stock > 0 ? 'var(--success)' : 'var(--danger)'}}>{item.stock}</span>
                                                </div>
                                                
                                                <div style={{marginTop: 'auto', paddingTop: '1rem', borderTop: '1px dashed var(--border)'}}>
                                                    <div className="d-flex justify-between align-center">
                                                        <div className="d-flex align-center gap-2">
                                                            <label style={{ position: 'relative', display: 'inline-block', width: '32px', height: '18px' }}>
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={item.is_available} 
                                                                    onChange={() => toggleAvailability(item)} 
                                                                    style={{ opacity: 0, width: 0, height: 0 }} 
                                                                />
                                                                <span style={{
                                                                    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                                                                    backgroundColor: item.is_available ? 'var(--primary)' : '#e5e7eb',
                                                                    transition: '0.3s', borderRadius: '24px'
                                                                }}></span>
                                                                <span style={{
                                                                    position: 'absolute', content: '""', height: '14px', width: '14px',
                                                                    left: item.is_available ? '16px' : '2px', bottom: '2px',
                                                                    backgroundColor: 'white', transition: '0.3s', borderRadius: '50%'
                                                                }}></span>
                                                            </label>
                                                            <span style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>
                                                                {item.is_available ? 'In Stock' : 'Sold Out'}
                                                            </span>
                                                        </div>
                                                        <div className="d-flex gap-2">
                                                            <button 
                                                                onClick={() => handleEditClick(item)}
                                                                style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'}}
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button 
                                                                onClick={() => deleteItem(item.id)}
                                                                style={{background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444'}}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MenuManager;
