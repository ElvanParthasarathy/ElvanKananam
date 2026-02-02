import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { IconTrash, IconPlus, IconEdit, IconX } from '../common/Icons';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { showSubtitles } from '../../config/translations';

function ItemManager({ t, language }) {
    const showSubs = showSubtitles(language);
    // Language-aware display: Tamil mode shows Tamil first
    const useTamilFirst = language === 'ta_mixed' || language === 'ta_only';
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        name_tamil: '',
        rate: '',
        hsn_or_sac: '50072010',
        description: '',
        type: 'silks'
    });

    useEffect(() => {
        fetchItems();
    }, []);

    async function fetchItems() {
        setLoading(true);
        const { data, error } = await supabase
            .from('items')
            .select('*')
            .eq('type', 'silks')
            .order('name', { ascending: true });

        if (error) console.error('Error fetching items:', error);
        else setItems(data || []);
        setLoading(false);
    }

    const openModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name || '',
                name_tamil: item.name_tamil || '',
                rate: item.rate || '',
                hsn_or_sac: item.hsn_or_sac || '50072010',
                description: item.description || '',
                type: 'silks'
            });
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                name_tamil: '',
                rate: '',
                hsn_or_sac: '50072010',
                description: '',
                type: 'silks'
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name) {
            showToast(showSubs ? `${t.itemNameRequired || 'பொருள் பெயர் தேவை'} / Item Name is required` : (t.itemNameRequired || 'பொருள் பெயர் தேவை'), 'warning');
            return;
        }

        const payload = { ...formData, type: 'silks' };

        let error;
        if (editingItem) {
            const { error: updateError } = await supabase
                .from('items')
                .update(payload)
                .eq('id', editingItem.id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase
                .from('items')
                .insert([payload]);
            error = insertError;
        }

        if (error) {
            showToast(`${t.error || 'பிழை'}: ${error.message}`, 'error');
        } else {
            setIsModalOpen(false);
            fetchItems();
        }
    };

    const handleDelete = async (id) => {
        const shouldDelete = await confirm({
            title: showSubs ? `${t.deleteItem || 'பொருளை நீக்க'} / Delete Item` : (t.deleteItem || 'பொருளை நீக்க'),
            message: showSubs
                ? `${t.deleteItemConfirm || 'நீங்கள் இந்த பொருளை கண்டிப்பாக நீக்க விரும்புகிறீர்களா?'} \n(Are you sure you want to delete this item?)`
                : (t.deleteItemConfirm || 'நீங்கள் இந்த பொருளை கண்டிப்பாக நீக்க விரும்புகிறீர்களா?'),
            confirmText: showSubs ? `${t.delete || 'நீக்க'} / Delete` : (t.delete || 'நீக்க'),
            type: 'danger'
        });

        if (!shouldDelete) return;

        const { error } = await supabase
            .from('items')
            .delete()
            .eq('id', id);

        if (error) {
            showToast(`${t.error || 'பிழை'}: ${error.message}`, 'error');
        } else {
            fetchItems();
        }
    };

    return (
        <div style={{ padding: isMobile ? '15px' : '30px' }}>
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                marginBottom: '20px',
                gap: '15px'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontSize: isMobile ? '1.2rem' : '22px', fontWeight: '600', margin: 0, color: 'var(--color-text)' }}>{t.silksItems || 'பட்டு பொருட்கள்'}</h2>
                    {showSubs && <span style={{ fontSize: '13px', color: '#6b7280' }}>Silks Items</span>}
                </div>
                <button
                    onClick={() => openModal()}
                    style={{
                        background: 'var(--color-brand-silks)',
                        color: 'white',
                        border: 'none',
                        padding: '8px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        height: '44px',
                        width: isMobile ? '100%' : 'auto',
                        justifyContent: 'center'
                    }}
                >
                    <IconPlus size={20} />
                    <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
                        <div style={{ fontWeight: '700', fontSize: '13px' }}>{t.newItem || 'புதிய பொருள்'}</div>
                        {showSubs && <div style={{ fontSize: '10px', fontWeight: '400', opacity: 0.9 }}>New Item</div>}
                    </div>
                </button>
            </div>

            {/* Desktop Table View */}
            {!isMobile && (
                <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                            <tr>
                                <th style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.name || 'பெயர்'}</div>
                                    {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Name</div>}
                                </th>
                                <th style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.hsnCode || 'HSN குறியீடு'}</div>
                                    {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>HSN Code</div>}
                                </th>
                                <th style={{ padding: '12px 20px', textAlign: 'right', color: 'var(--color-text-muted)' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.price || 'விலை'}</div>
                                    {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Price</div>}
                                </th>
                                <th style={{ padding: '12px 20px', textAlign: 'center', color: 'var(--color-text-muted)', width: '100px' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.actions || 'செயல்கள்'}</div>
                                    {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Actions</div>}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '16px', fontWeight: '500' }}>{t.loading || 'ஏற்றுகிறது...'}</span>
                                            {showSubs && <span style={{ fontSize: '13px', opacity: 0.8 }}>Loading...</span>}
                                        </div>
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ padding: '60px 40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                                            <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-text)' }}>{t.noItems || 'பொருட்கள் இல்லை'}</div>
                                            {showSubs && <div style={{ fontSize: '14px', color: '#6b7280' }}>No items found.</div>}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                items.map(item => {
                                    const primaryName = useTamilFirst ? (item.name_tamil || item.name) : (item.name || item.name_tamil);
                                    const subtitleName = useTamilFirst ? item.name : item.name_tamil;

                                    return (
                                        <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                            <td style={{ padding: '12px 20px' }}>
                                                <div style={{ fontWeight: '500', color: 'var(--color-text)' }}>{primaryName}</div>
                                                {showSubs && subtitleName && primaryName !== subtitleName && (
                                                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{subtitleName}</div>
                                                )}
                                            </td>
                                            <td style={{ padding: '12px 20px', color: 'var(--color-text)' }}>{item.hsn_or_sac}</td>
                                            <td style={{ padding: '12px 20px', textAlign: 'right', color: 'var(--color-text)', fontWeight: '600' }}>₹{item.rate}</td>
                                            <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                                    <button onClick={() => openModal(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><IconEdit size={16} /></button>
                                                    <button onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)' }}><IconTrash size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Mobile Card View */}
            {isMobile && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                            <span style={{ fontSize: '16px', fontWeight: '500' }}>{t.loading || 'ஏற்றுகிறது...'}</span>
                            {showSubs && <span style={{ fontSize: '13px', opacity: 0.8 }}>Loading...</span>}
                        </div>
                    ) : items.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                            <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--color-text)' }}>{t.noItems || 'பொருட்கள் இல்லை'}</div>
                            {showSubs && <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>No items found.</div>}
                        </div>
                    ) : (
                        items.map(item => (
                            <div key={item.id} style={{
                                background: 'var(--color-surface)',
                                borderRadius: '12px',
                                border: '1px solid var(--color-border)',
                                padding: '16px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                                    <span style={{ fontWeight: '700', fontSize: '16px', color: 'var(--color-brand-silks)' }}>
                                        {useTamilFirst ? (item.name_tamil || item.name) : (item.name || item.name_tamil)}
                                    </span>
                                    {showSubs && (
                                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                            {useTamilFirst ? item.name : item.name_tamil}
                                        </span>
                                    )}
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>HSN: {item.hsn_or_sac}</span>
                                        <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-success)' }}>₹{item.rate}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => openModal(item)} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '8px', color: 'var(--color-text-muted)' }}><IconEdit size={18} /></button>
                                    <button onClick={() => handleDelete(item.id)} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '8px', color: 'var(--color-danger)' }}><IconTrash size={18} /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'var(--color-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
                }}>
                    <div style={{
                        background: 'var(--color-surface)',
                        padding: '25px',
                        borderRadius: '12px',
                        width: '400px',
                        maxWidth: '90%',
                        border: '1px solid var(--color-border)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ margin: 0, color: 'var(--color-text)', fontSize: '18px' }}>{editingItem ? (t.editItem || 'பொருளை திருத்த') : (t.newItem || 'புதிய பொருள்')}</h3>
                                {showSubs && <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{editingItem ? 'Edit Item' : 'New Item'}</span>}
                            </div>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><IconX size={20} /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.itemNameTamil || 'தமிழ் பெயர்'}</div>
                                    {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Tamil Name</div>}
                                </label>
                                <input
                                    type="text"
                                    value={formData.name_tamil}
                                    onChange={e => setFormData({ ...formData, name_tamil: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '3px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.name || 'பெயர்'} *</div>
                                    {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Name (English) *</div>}
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '3px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.price || 'விலை'}</div>
                                    {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Price</div>}
                                </label>
                                <input
                                    type="number"
                                    value={formData.rate}
                                    onChange={e => setFormData({ ...formData, rate: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '3px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.hsnCode || 'HSN குறியீடு'}</div>
                                    {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>HSN Code</div>}
                                </label>
                                <input
                                    type="text"
                                    value={formData.hsn_or_sac}
                                    onChange={e => setFormData({ ...formData, hsn_or_sac: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '3px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 15px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer', color: 'var(--color-text)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1.2' }}>
                                    <span>{t.cancel || 'Cancel'}</span>
                                    {showSubs && <span style={{ fontSize: '10px', opacity: 0.7 }}>Cancel</span>}
                                </div>
                            </button>
                            <button onClick={handleSave} style={{ padding: '8px 15px', background: 'var(--color-brand-silks)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1.2' }}>
                                    <span>{t.save || 'Save'}</span>
                                    {showSubs && <span style={{ fontSize: '10px', opacity: 0.9 }}>Save</span>}
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ItemManager;
