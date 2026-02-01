import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { IconTrash, IconPlus, IconEdit, IconSave, IconX } from '../common/Icons';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { showSubtitles } from '../../config/translations';

function ItemManager({ t, language }) {
    const showSubs = showSubtitles(language);
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        name_tamil: '',
        rate: '',
        hsn_or_sac: '5007', // Default
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
                hsn_or_sac: item.hsn_or_sac || '5007',
                description: item.description || '',
                type: 'silks'
            });
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                name_tamil: '',
                rate: '',
                hsn_or_sac: '5007',
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
                ? `${t.deleteItemConfirm || 'நீங்கள் இந்த பொருளை கண்டிப்பாக நீக்க விரும்புகிறீர்களா?'} \n(Are you sure you want to delete this item? This action cannot be undone.)`
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
        <div style={{ padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontSize: '24px', margin: 0, color: 'var(--color-text)' }}>{t.silksItems || 'பட்டு பொருட்கள்'}</h2>
                    {showSubs && <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Silks Items</span>}
                </div>
                <button
                    onClick={() => openModal()}
                    style={{ background: 'var(--color-brand-silks)', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                    <IconPlus size={16} />
                    <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
                        <div>{t.newItem || 'புதிய பொருள்'}</div>
                        {showSubs && <div style={{ fontSize: '10px', fontWeight: 'normal', opacity: 0.9 }}>New Item</div>}
                    </div>
                </button>
            </div>

            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                        <tr>
                            <th style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.name || 'பெயர்'}</div>
                                {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Name</div>}
                            </th>
                            <th style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.itemNameTamil || 'தமிழ் பெயர்'}</div>
                                {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Tamil Name</div>}
                            </th>
                            <th style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>HSN/SAC</div>
                                {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>HSN/SAC</div>}
                            </th>
                            <th style={{ padding: '12px 20px', textAlign: 'right', color: 'var(--color-text-muted)' }}>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.rate || 'விலை'}</div>
                                {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Rate</div>}
                            </th>
                            <th style={{ padding: '12px 20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.actions || 'செயல்கள்'}</div>
                                {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Actions</div>}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>{showSubs ? `${t.loading || 'ஏற்றுகிறது...'} / Loading...` : (t.loading || 'ஏற்றுகிறது...')}</td></tr>
                        ) : items.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--color-text)' }}>{t.noItems || 'பொருட்கள் இல்லை'}</div>
                                        {showSubs && <div style={{ fontSize: '13px' }}>No items found.</div>}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            items.map(item => (
                                <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <td style={{ padding: '12px 20px', color: 'var(--color-text)' }}>{item.name}</td>
                                    <td style={{ padding: '12px 20px', color: 'var(--color-text)' }}>{item.name_tamil}</td>
                                    <td style={{ padding: '12px 20px', color: 'var(--color-text)' }}>{item.hsn_or_sac}</td>
                                    <td style={{ padding: '12px 20px', textAlign: 'right', color: 'var(--color-text)' }}>₹{item.rate}</td>
                                    <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => openModal(item)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', marginRight: '10px' }}
                                        >
                                            <IconEdit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)' }}
                                        >
                                            <IconTrash size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'var(--color-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'var(--color-surface)', padding: '20px', borderRadius: '5px', width: '400px', maxWidth: '90%', border: '1px solid var(--color-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ margin: 0, color: 'var(--color-text)', fontSize: '18px' }}>{editingItem ? (t.editItem || 'பொருளை திருத்த') : (t.newItem || 'புதிய பொருள்')}</h3>
                                {showSubs && <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{editingItem ? 'Edit Item' : 'New Item'}</div>}
                            </div>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><IconX size={20} /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--color-text-muted)' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.name || 'பெயர்'} *</div>
                                    {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Name *</div>}
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '3px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--color-text-muted)' }}>
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
                                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--color-text-muted)' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.rate || 'விலை'}</div>
                                    {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Rate</div>}
                                </label>
                                <input
                                    type="number"
                                    value={formData.rate}
                                    onChange={e => setFormData({ ...formData, rate: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '3px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--color-text-muted)' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>HSN/SAC</div>
                                    {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>HSN/SAC</div>}
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
                            <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 15px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '3px', cursor: 'pointer', color: 'var(--color-text)' }}>{t.cancel || 'Cancel'}</button>
                            <button onClick={handleSave} style={{ padding: '8px 15px', background: 'var(--color-brand-silks)', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>{t.save || 'Save'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ItemManager;
