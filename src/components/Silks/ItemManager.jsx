import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { IconTrash, IconPlus, IconEdit, IconSave, IconX } from '../common/Icons';

function ItemManager() {
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
        description: ''
    });

    useEffect(() => {
        fetchItems();
    }, []);

    async function fetchItems() {
        setLoading(true);
        const { data, error } = await supabase
            .from('items')
            .select('*')
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
                description: item.description || ''
            });
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                name_tamil: '',
                rate: '',
                hsn_or_sac: '5007',
                description: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name) {
            alert('Item Name is required');
            return;
        }

        const payload = { ...formData };

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
            alert('Error saving item: ' + error.message);
        } else {
            setIsModalOpen(false);
            fetchItems();
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;

        const { error } = await supabase
            .from('items')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Error deleting item: ' + error.message);
        } else {
            fetchItems();
        }
    };

    return (
        <div style={{ padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '24px', margin: 0, color: 'var(--color-text)' }}>Items</h2>
                <button
                    onClick={() => openModal()}
                    style={{ background: 'var(--color-brand-silks)', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                    <IconPlus size={16} /> New Item
                </button>
            </div>

            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                        <tr>
                            <th style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--color-text-muted)' }}>Name</th>
                            <th style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--color-text-muted)' }}>Tamil Name</th>
                            <th style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--color-text-muted)' }}>HSN/SAC</th>
                            <th style={{ padding: '12px 20px', textAlign: 'right', color: 'var(--color-text-muted)' }}>Rate</th>
                            <th style={{ padding: '12px 20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading...</td></tr>
                        ) : items.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No items found.</td></tr>
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
                            <h3 style={{ margin: 0, color: 'var(--color-text)' }}>{editingItem ? 'Edit Item' : 'New Item'}</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><IconX size={20} /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500', color: 'var(--color-text-muted)' }}>Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '3px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500', color: 'var(--color-text-muted)' }}>Tamil Name</label>
                                <input
                                    type="text"
                                    value={formData.name_tamil}
                                    onChange={e => setFormData({ ...formData, name_tamil: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '3px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500', color: 'var(--color-text-muted)' }}>Rate</label>
                                <input
                                    type="number"
                                    value={formData.rate}
                                    onChange={e => setFormData({ ...formData, rate: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '3px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500', color: 'var(--color-text-muted)' }}>HSN/SAC</label>
                                <input
                                    type="text"
                                    value={formData.hsn_or_sac}
                                    onChange={e => setFormData({ ...formData, hsn_or_sac: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '3px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 15px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '3px', cursor: 'pointer', color: 'var(--color-text)' }}>Cancel</button>
                            <button onClick={handleSave} style={{ padding: '8px 15px', background: 'var(--color-brand-silks)', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ItemManager;
