import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { UserCircle, Store, MapPin, Phone, Mail, Navigation, LayoutList, MessageCircle, Clock, Calendar, Tag, Image as ImageIcon, Edit3, X, Check } from 'lucide-react';

const AVAILABLE_TAGS = ['Riverside', 'Beachside', 'Lakeside', 'Calm Place', 'Family Friendly', 'Study Friendly', 'City View', 'Date Night'];

const formatTime = (timeString) => {
    if (!timeString) return null;
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedH = h % 12 || 12;
    return `${formattedH}:${minutes} ${ampm}`;
};

const InputField = ({ label, field, type="text", isEditing, profile, editForm, setEditForm }) => {
    if (!isEditing) {
        return (
            <div style={{ background: '#f8fafc', padding: '1.25rem 1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <label className="form-label" style={{color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem', display: 'block'}}>{label}</label>
                <div style={{fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-dark)'}}>{profile[field] || 'N/A'}</div>
            </div>
        );
    }
    return (
        <div style={{ marginBottom: '0.5rem' }}>
            <label className="form-label" style={{fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block'}}>{label}</label>
            <input type={type} className="form-control" style={{ padding: '0.85rem 1rem' }} value={editForm[field] || ''} onChange={e => setEditForm({...editForm, [field]: e.target.value})} />
        </div>
    );
};

const ShopProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [whatsapp, setWhatsapp] = useState('');
    const [saving, setSaving] = useState(false);
    
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [logoFile, setLogoFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [licenseFile, setLicenseFile] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await axios.get('/merchant/profile');
            setProfile(res.data);
            setEditForm(res.data);
            if (res.data.whatsapp_number) {
                setWhatsapp(res.data.whatsapp_number);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsappSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.post('/merchant/profile/whatsapp', { whatsapp_number: whatsapp });
            alert('WhatsApp number updated successfully!');
            fetchProfile(); 
        } catch (err) {
            console.error(err);
            alert('Failed to update WhatsApp number.');
        } finally {
            setSaving(false);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const formData = new FormData();
            Object.keys(editForm).forEach(key => {
                if (key === 'tags') {
                    // tags might be array or JSON string in state, ensure it's stringified
                    const t = typeof editForm.tags === 'string' ? editForm.tags : JSON.stringify(editForm.tags);
                    formData.append('tags', t);
                } else if (editForm[key] !== null && editForm[key] !== undefined) {
                    formData.append(key, editForm[key]);
                }
            });
            if (logoFile) formData.append('logo', logoFile);
            if (coverFile) formData.append('cover', coverFile);
            if (licenseFile) formData.append('license', licenseFile);

            await axios.put('/merchant/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Profile updated successfully!');
            setIsEditing(false);
            fetchProfile();
        } catch (err) {
            console.error(err);
            alert('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const toggleEdit = () => {
        if (isEditing) {
            setEditForm(profile); // cancel edits
            setIsEditing(false);
        } else {
            setEditForm(profile);
            setLogoFile(null);
            setCoverFile(null);
            setLicenseFile(null);
            setIsEditing(true);
        }
    };

    if (loading) return <div className="animate-fade-in"><p>Loading profile...</p></div>;
    if (!profile) return <div className="animate-fade-in"><p>Failed to load profile.</p></div>;

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-between align-center mb-4">
                <div>
                    <h2 style={{margin: 0}}>Shop Profile</h2>
                    <p style={{color: 'var(--text-muted)', margin: 0}}>Manage your merchant and shop details.</p>
                </div>
                <button className={`btn ${isEditing ? 'btn-secondary' : 'btn-primary'} d-flex align-center gap-2`} onClick={toggleEdit}>
                    {isEditing ? <><X size={18}/> Cancel Edit</> : <><Edit3 size={18}/> Edit Profile</>}
                </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div className="grid grid-cols-2" style={{ gap: '2rem' }}>
                    {/* OWNER DETAILS */}
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <h3 className="d-flex align-center gap-2 mb-4" style={{borderBottom: '1px solid var(--border)', paddingBottom: '1rem', fontSize: '1.25rem'}}>
                            <UserCircle size={22} color="var(--primary)" /> 1. Owner Details
                        </h3>
                        <div className="d-flex flex-column" style={{ gap: '1.5rem' }}>
                            <div className="grid grid-cols-2" style={{ gap: '1.5rem' }}>
                                <InputField label={<><UserCircle size={14}/> Full Name</>} field="owner_name" isEditing={isEditing} profile={profile} editForm={editForm} setEditForm={setEditForm} />
                                <InputField label="NIC Number" field="nic_number" isEditing={isEditing} profile={profile} editForm={editForm} setEditForm={setEditForm} />
                            </div>
                            <div className="grid grid-cols-2" style={{ gap: '1.5rem' }}>
                                <InputField label={<><Phone size={14}/> Phone Number</>} field="phone" isEditing={isEditing} profile={profile} editForm={editForm} setEditForm={setEditForm} />
                                <InputField label={<><Mail size={14}/> Email Address</>} field="email" type="email" isEditing={isEditing} profile={profile} editForm={editForm} setEditForm={setEditForm} />
                            </div>
                        </div>
                    </div>

                    {/* SHOP INFORMATION */}
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <h3 className="d-flex align-center gap-2 mb-4" style={{borderBottom: '1px solid var(--border)', paddingBottom: '1rem', fontSize: '1.25rem'}}>
                            <Store size={22} color="var(--secondary)" /> 2. Shop Information
                        </h3>
                        <div className="d-flex flex-column" style={{ gap: '1.5rem' }}>
                            <div className="grid grid-cols-2" style={{ gap: '1.5rem' }}>
                                <InputField label="Shop Name" field="shop_name" isEditing={isEditing} profile={profile} editForm={editForm} setEditForm={setEditForm} />
                                <div>
                                    <label className="form-label">Shop Type</label>
                                    {isEditing ? (
                                        <select className="form-control" value={editForm.shop_type || ''} onChange={e => setEditForm({...editForm, shop_type: e.target.value})}>
                                            <option value="Restaurant">Restaurant</option>
                                            <option value="Café">Café</option>
                                            <option value="Bakery">Bakery</option>
                                            <option value="Juice Bar">Juice Bar</option>
                                            <option value="Fast Food">Fast Food</option>
                                        </select>
                                    ) : (
                                        <div style={{fontWeight: 600}}><span className="badge badge-primary">{profile.shop_type}</span></div>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2" style={{ gap: '1.5rem' }}>
                                <InputField label="Registration ID" field="registration_id" isEditing={isEditing} profile={profile} editForm={editForm} setEditForm={setEditForm} />
                                <InputField label="Registration Date" field="registration_date" type="date" isEditing={isEditing} profile={profile} editForm={editForm} setEditForm={setEditForm} />
                            </div>
                            <InputField label={<><MapPin size={14}/> Address</>} field="address" isEditing={isEditing} profile={profile} editForm={editForm} setEditForm={setEditForm} />
                            <div className="grid grid-cols-2" style={{ gap: '1.5rem' }}>
                                <InputField label={<><Navigation size={14}/> Area (Town)</>} field="area" isEditing={isEditing} profile={profile} editForm={editForm} setEditForm={setEditForm} />
                                <InputField label="District" field="district" isEditing={isEditing} profile={profile} editForm={editForm} setEditForm={setEditForm} />
                            </div>
                            {isEditing ? (
                                <div>
                                    <label className="form-label" style={{fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block'}}>Business Description</label>
                                    <textarea className="form-control" style={{ padding: '0.85rem 1rem' }} value={editForm.business_description || ''} onChange={e => setEditForm({...editForm, business_description: e.target.value})} />
                                </div>
                            ) : (
                                <div style={{ background: '#f8fafc', padding: '1.25rem 1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <label className="form-label" style={{color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem', display: 'block'}}>Business Description</label>
                                    <div style={{fontWeight: 500, fontSize: '1rem', lineHeight: '1.5', color: 'var(--text-dark)'}}>{profile.business_description || 'No description provided.'}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SERVICES AVAILABLE */}
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <h3 className="d-flex align-center gap-2 mb-4" style={{borderBottom: '1px solid var(--border)', paddingBottom: '1rem', fontSize: '1.25rem'}}>
                            <LayoutList size={22} color="var(--success)" /> 3. Services Available
                        </h3>
                        <div className="d-flex gap-4 mt-2" style={{flexWrap: 'wrap', gap: '2rem'}}>
                            {['takeaway', 'seating', 'delivery'].map(type => {
                                const field = `${type}_availability`;
                                const isChecked = isEditing ? (editForm[field] === 1 || editForm[field] === true) : profile[field] === 1;
                                return (
                                    <label key={type} className="d-flex align-center gap-2" style={{cursor: isEditing ? 'pointer' : 'default'}}>
                                        <input 
                                            type="checkbox" 
                                            checked={isChecked} 
                                            readOnly={!isEditing}
                                            onChange={(e) => isEditing && setEditForm({...editForm, [field]: e.target.checked})}
                                            style={{accentColor: 'var(--primary)', width: '18px', height: '18px'}} 
                                        />
                                        <span style={{fontWeight: 500}}>{type === 'seating' ? 'Dine-in (Seating)' : type.charAt(0).toUpperCase() + type.slice(1)}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* ADDITIONAL CONTACTS (WHATSAPP) */}
                    <div className="glass-panel" style={{borderLeft: '4px solid #25D366', padding: '2rem' }}>
                        <h3 className="d-flex align-center gap-2 mb-4" style={{borderBottom: '1px solid var(--border)', paddingBottom: '1rem', fontSize: '1.25rem'}}>
                            <MessageCircle size={22} color="#25D366" /> Additional Contacts
                        </h3>
                        <div className="mt-2 form-group">
                            <label className="form-label" style={{fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block'}}>WhatsApp Contact Number</label>
                            <div className="d-flex gap-2">
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="e.g. +94771234567" 
                                    value={whatsapp} 
                                    onChange={(e) => setWhatsapp(e.target.value)} 
                                />
                                <button type="button" onClick={handleWhatsappSave} className="btn" style={{background: '#25D366', color: 'white', border: 'none', fontWeight: 600, padding: '0 1.5rem'}} disabled={saving}>
                                    Save
                                </button>
                            </div>
                            <small style={{color: 'var(--text-muted)', marginTop: '8px', display: 'block'}}>
                                This number is securely stored in a dedicated contacts registry.
                            </small>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2" style={{ gap: '2rem' }}>
                    {/* BUSINESS HOURS */}
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <h3 className="d-flex align-center gap-2 mb-4" style={{borderBottom: '1px solid var(--border)', paddingBottom: '1rem', fontSize: '1.25rem'}}>
                            <Clock size={22} color="var(--warning)" /> Business Hours & Operations
                        </h3>
                        <div className="d-flex flex-column" style={{ gap: '1.5rem' }}>
                            <div className="grid grid-cols-2" style={{ gap: '1.5rem' }}>
                                <div>
                                    <label className="form-label">Opening Time</label>
                                    {isEditing ? (
                                        <input type="time" className="form-control" value={editForm.opening_time || ''} onChange={e => setEditForm({...editForm, opening_time: e.target.value})} />
                                    ) : (
                                        <div style={{fontWeight: 600}}>{formatTime(profile.opening_time) || '--:--'}</div>
                                    )}
                                </div>
                                <div>
                                    <label className="form-label">Closing Time</label>
                                    {isEditing ? (
                                        <input type="time" className="form-control" value={editForm.closing_time || ''} onChange={e => setEditForm({...editForm, closing_time: e.target.value})} />
                                    ) : (
                                        <div style={{fontWeight: 600}}>{formatTime(profile.closing_time) || '--:--'}</div>
                                    )}
                                </div>
                            </div>
                            <div style={{ marginTop: '0.5rem' }}>
                                <label className="form-label" style={{display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem'}}><Calendar size={16}/> Working Days</label>
                                {isEditing ? (
                                    <input type="text" className="form-control" style={{ padding: '0.85rem 1rem' }} placeholder="e.g. Mon - Sun" value={editForm.working_days || ''} onChange={e => setEditForm({...editForm, working_days: e.target.value})} />
                                ) : (
                                    <div style={{ background: '#f8fafc', padding: '1.25rem 1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                        <div style={{fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-dark)'}}>{profile.working_days || 'N/A'}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ENVIRONMENT TAGS */}
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <h3 className="d-flex align-center gap-2 mb-4" style={{borderBottom: '1px solid var(--border)', paddingBottom: '1rem', fontSize: '1.25rem'}}>
                            <Tag size={22} color="var(--primary)" /> Environment Tags
                        </h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '1rem' }}>
                            {(() => {
                                let currentTags = [];
                                const source = isEditing ? editForm.tags : profile.tags;
                                if (source) {
                                    try { currentTags = typeof source === 'string' ? JSON.parse(source) : source; } 
                                    catch (e) { currentTags = []; }
                                }
                                
                                if (!isEditing) {
                                    if (!currentTags || currentTags.length === 0) return <div style={{color: 'var(--text-muted)'}}>No tags configured.</div>;
                                    return currentTags.map(tag => (
                                        <span key={tag} className="badge" style={{background: 'var(--primary)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '20px'}}>
                                            {tag}
                                        </span>
                                    ));
                                }

                                return AVAILABLE_TAGS.map(tag => (
                                    <label key={tag} style={{
                                        padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', cursor: 'pointer',
                                        background: currentTags.includes(tag) ? 'var(--primary)' : '#f1f5f9',
                                        color: currentTags.includes(tag) ? '#fff' : '#475569',
                                        fontWeight: currentTags.includes(tag) ? 600 : 500, transition: '0.2s', whiteSpace: 'nowrap'
                                    }}>
                                        <input type="checkbox" style={{display: 'none'}} 
                                            checked={currentTags.includes(tag)} 
                                            onChange={(e) => {
                                                const newTags = e.target.checked 
                                                    ? [...currentTags, tag] 
                                                    : currentTags.filter(t => t !== tag);
                                                setEditForm({...editForm, tags: JSON.stringify(newTags)});
                                            }} 
                                        />
                                        {tag}
                                    </label>
                                ));
                            })()}
                        </div>
                    </div>

                    {/* MEDIA */}
                    <div className="glass-panel" style={{gridColumn: '1 / -1', padding: '2rem'}}>
                        <h3 className="d-flex align-center gap-2 mb-4" style={{borderBottom: '1px solid var(--border)', paddingBottom: '1rem', fontSize: '1.25rem'}}>
                            <ImageIcon size={22} color="var(--info)" /> Shop Identity Media
                        </h3>
                        <div className="grid grid-cols-3" style={{ gap: '2rem', marginTop: '1rem' }}>
                            <div>
                                <label className="form-label">Shop Logo</label>
                                {isEditing && (
                                    <input type="file" accept="image/*" className="form-control mb-2" style={{fontSize: '0.85rem'}} onChange={e => setLogoFile(e.target.files[0])} />
                                )}
                                {profile.logo_url ? (
                                    <div style={{width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--border)'}}>
                                        <img src={`http://localhost:5000${profile.logo_url}`} alt="Logo" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                    </div>
                                ) : (
                                    <div style={{width: '100px', height: '100px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)'}}>{isEditing ? 'Upload Logo' : 'No Logo'}</div>
                                )}
                            </div>
                            <div>
                                <label className="form-label">Cover Image</label>
                                {isEditing && (
                                    <input type="file" accept="image/*" className="form-control mb-2" style={{fontSize: '0.85rem'}} onChange={e => setCoverFile(e.target.files[0])} />
                                )}
                                {profile.cover_url ? (
                                    <div style={{width: '100%', height: '140px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)'}}>
                                        <img src={`http://localhost:5000${profile.cover_url}`} alt="Cover" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                    </div>
                                ) : (
                                    <div style={{width: '100%', height: '140px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)'}}>{isEditing ? 'Upload Cover' : 'No Cover Uploaded'}</div>
                                )}
                            </div>
                            <div>
                                <label className="form-label">Business License</label>
                                {isEditing && (
                                    <input type="file" className="form-control mb-2" style={{fontSize: '0.85rem'}} onChange={e => setLicenseFile(e.target.files[0])} />
                                )}
                                {profile.license_url ? (
                                    <div style={{width: '100%', height: '140px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)'}}>
                                        <a href={`http://localhost:5000${profile.license_url}`} target="_blank" rel="noreferrer" style={{color: 'var(--primary)', fontWeight: 600, textDecoration: 'none'}}>View License</a>
                                    </div>
                                ) : (
                                    <div style={{width: '100%', height: '140px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)'}}>{isEditing ? 'Upload License' : 'No License Uploaded'}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* SAVE CONTROLS */}
                {isEditing && (
                    <div className="d-flex justify-end gap-4" style={{borderTop: '1px solid var(--border)', paddingTop: '2rem', marginTop: '1rem'}}>
                        <button type="button" className="btn btn-secondary" style={{ padding: '0.85rem 1.5rem', fontSize: '1rem' }} onClick={toggleEdit}>Cancel</button>
                        <button type="submit" className="btn btn-primary d-flex align-center gap-2" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }} disabled={saving}>
                            <Check size={18} /> {saving ? 'Saving Profile...' : 'Save Profile Changes'}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default ShopProfile;
