import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { IconTrash, IconPlus, IconEdit, IconX, IconSearch } from '../common/Icons';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { showSubtitles } from '../../config/translations';

function CoolieItemManager({ t, language }) {
    const showSubs = showSubtitles(language);
    // Language-aware display: Tamil mode shows Tamil first, English/Tanglish shows English first
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

    // Form State - Only Name and Tamil Name
    const [formData, setFormData] = useState({
        name_english: '',
        name_tamil: '',
        type: 'coolie'
    });

    useEffect(() => {
        fetchItems();
    }, []);

    async function fetchItems() {
        setLoading(true);
        const { data, error } = await supabase
            .from('coolie_items')
            .select('*')
            .eq('type', 'coolie')
            .order('name_english', { ascending: true });

        if (error) {
            console.error('Error fetching items:', error);
            setItems([]);
        } else {
            setItems(data || []);
        }
        setLoading(false);
    }

    const openModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name_english: item.name_english || '',
                name_tamil: item.name_tamil || '',
                type: 'coolie'
            });
        } else {
            setEditingItem(null);
            setFormData({
                name_english: '',
                name_tamil: '',
                type: 'coolie'
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name_english) {
            showToast(showSubs ? `${t.itemName || 'பொருள் பெயர்'} ${t.required || 'தேவை'} / Item Name is required` : (t.itemName || 'பொருள் பெயர்') + ' ' + (t.required || 'தேவை'), 'warning');
            return;
        }

        const payload = {
            ...formData,
            type: 'coolie'
        };

        let error;
        if (editingItem) {
            const { error: updateError } = await supabase
                .from('coolie_items')
                .update(payload)
                .eq('id', editingItem.id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase
                .from('coolie_items')
                .insert([payload]);
            error = insertError;
        }

        if (error) {
            showToast(`${t.error}: ${error.message}`, 'error');
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
            .from('coolie_items')
            .delete()
            .eq('id', id);

        if (error) {
            showToast(`${t.error}: ${error.message}`, 'error');
        } else {
            fetchItems();
        }
    };

    // Filter State
    const [filter, setFilter] = useState('');

    const filteredItems = items.filter(item => {
        if (!filter) return true;
        const search = filter.toLowerCase();
        return (
            (item.name_english && item.name_english.toLowerCase().includes(search)) ||
            (item.name_tamil && item.name_tamil.toLowerCase().includes(search))
        );
    });

    return (
        <div style={{ padding: isMobile ? '16px' : '24px' }}>
            {/* Header */}
            <div className="coolie-header-wrapper">
                <div className="coolie-title-group">
                    <h2 className="coolie-title">{t.coolieItems || 'பொருள்கள்'}</h2>
                    {showSubs && <span className="coolie-subtitle">Items List</span>}
                </div>

                <div className="coolie-actions-group" style={{ flexDirection: isMobile ? 'column' : 'row', width: isMobile ? '100%' : 'auto' }}>
                    {/* Search Bar */}
                    <div className="coolie-search-bar" style={{ width: isMobile ? '100%' : '240px' }}>
                        <IconSearch size={16} color="var(--md-sys-color-on-surface-variant)" />
                        <input
                            type="text"
                            placeholder={!showSubs ? (t.search || 'தேடுக...') : ''}
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="coolie-search-input"
                        />
                        {showSubs && !filter && (
                            <div className="dual-placeholder-overlay" style={{ left: '36px' }}>
                                <span className="dual-placeholder-primary">{t.search || 'தேடுக...'}</span>
                                <span className="dual-placeholder-sub">Search Items</span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => openModal()}
                        className="coolie-primary-btn"
                        style={{ width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}
                    >
                        <IconPlus size={20} />
                        <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
                            <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{t.newItem || 'புதிய பொருள்'}</div>
                            {showSubs && <div style={{ fontSize: '0.7rem', fontWeight: '400', opacity: 0.9 }}>New Item</div>}
                        </div>
                    </button>
                </div>
            </div>

            {/* Desktop Table View */}
            {!isMobile && (
                <div className="coolie-table-container">
                    <table className="coolie-table">
                        <thead>
                            <tr>
                                <th>
                                    <div>{t.name || 'பெயர்'}</div>
                                    {showSubs && <div style={{ fontSize: '0.7rem', fontWeight: 'normal' }}>Name</div>}
                                </th>
                                <th style={{ textAlign: 'center', width: '100px' }}>
                                    <div>{t.actions || 'செயல்கள்'}</div>
                                    {showSubs && <div style={{ fontSize: '0.7rem', fontWeight: 'normal' }}>Actions</div>}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="2" style={{ padding: '40px', textAlign: 'center', color: 'var(--md-sys-color-on-surface-variant)' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '1rem', fontWeight: '500' }}>{t.loading || 'ஏற்றுகிறது...'}</span>
                                            {showSubs && <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Loading...</span>}
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan="2" className="coolie-empty">
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--md-sys-color-on-surface)' }}>{t.noItems || 'பொருள்கள் இல்லை'}</div>
                                            {showSubs && <div style={{ fontSize: '0.875rem', color: 'var(--md-sys-color-on-surface-variant)' }}>No items found.</div>}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map(item => {
                                    // Language-aware display
                                    const primaryName = useTamilFirst ? (item.name_tamil || item.name_english) : (item.name_english || item.name_tamil);
                                    const subtitleName = useTamilFirst ? item.name_english : item.name_tamil;

                                    return (
                                        <tr key={item.id}>
                                            <td style={{ padding: '16px 20px' }}>
                                                <div style={{ fontWeight: '500', color: 'var(--md-sys-color-on-surface)' }}>{primaryName}</div>
                                                {showSubs && subtitleName && primaryName !== subtitleName && (
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '2px' }}>{subtitleName}</div>
                                                )}
                                            </td>
                                            <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                                    <button
                                                        onClick={() => openModal(item)}
                                                        className="coolie-table-btn-delete"
                                                        style={{ color: 'var(--md-sys-color-primary)', background: 'transparent' }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--md-sys-color-surface-container-highest)' }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                                                    >
                                                        <IconEdit size={18} />
                                                    </button>
                                                    <button onClick={() => handleDelete(item.id)} className="coolie-table-btn-delete"><IconTrash size={18} /></button>
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
                        <div className="coolie-loading">
                            <span style={{ fontSize: '1rem', fontWeight: '500' }}>{t.loading || 'ஏற்றுகிறது...'}</span>
                            {showSubs && <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Loading...</span>}
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="coolie-empty">
                            <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--md-sys-color-on-surface)' }}>{t.noItems}</div>
                            {showSubs && <div style={{ fontSize: '0.875rem' }}>No items found.</div>}
                        </div>
                    ) : (
                        filteredItems.map(item => (
                            <div key={item.id} className="coolie-card coolie-item-card">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--md-sys-color-primary)' }}>
                                        {useTamilFirst ? (item.name_tamil || item.name_english) : (item.name_english || item.name_tamil)}
                                    </span>
                                    {showSubs && (
                                        <span style={{ fontSize: '0.75rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                                            {useTamilFirst ? item.name_english : item.name_tamil}
                                        </span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => openModal(item)} className="coolie-icon-btn"><IconEdit size={18} /></button>
                                    <button onClick={() => handleDelete(item.id)} className="coolie-icon-btn danger"><IconTrash size={18} /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="coolie-overlay">
                    <div className="coolie-dialog">
                        <div className="coolie-dialog-header">
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <h3 className="coolie-dialog-title" style={{ fontSize: '1.25rem', fontWeight: '600' }}>{editingItem ? (t.editItem || 'பொருளை மாற்றுக') : (t.newItem || 'புதிய பொருள்')}</h3>
                                {showSubs && <span style={{ fontSize: '0.8rem', color: 'var(--md-sys-color-on-surface-variant)' }}>{editingItem ? 'Edit Item' : 'New Item'}</span>}
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="coolie-icon-btn" style={{ width: '32px', height: '32px', background: 'transparent' }}><IconX size={24} /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="coolie-input-group">
                                <label className="coolie-label">
                                    <div>{t.itemNameTamil || 'பொருள் பெயர்'}</div>
                                    {showSubs && <div style={{ fontSize: '0.7rem', fontWeight: 'normal', opacity: 0.8 }}>Item Name (Tamil)</div>}
                                </label>
                                <input
                                    type="text"
                                    className="coolie-input-field"
                                    value={formData.name_tamil}
                                    onChange={e => setFormData({ ...formData, name_tamil: e.target.value })}
                                />
                            </div>
                            <div className="coolie-input-group">
                                <label className="coolie-label">
                                    <div>{t.itemNameEnglish || 'Item Name'}</div>
                                    {showSubs && <div style={{ fontSize: '0.7rem', fontWeight: 'normal', opacity: 0.8 }}>Item Name (English)</div>}
                                </label>
                                <input
                                    type="text"
                                    className="coolie-input-field"
                                    value={formData.name_english}
                                    onChange={e => setFormData({ ...formData, name_english: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="coolie-dialog-actions">
                            <button onClick={() => setIsModalOpen(false)} className="coolie-text-btn">
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1.2' }}>
                                    <span>{t.cancel || 'Cancel'}</span>
                                    {showSubs && <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>Cancel</span>}
                                </div>
                            </button>
                            <button onClick={handleSave} className="coolie-primary-btn" style={{ height: '48px', padding: '0 24px', width: 'auto' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1.2' }}>
                                    <span>{t.save || 'Save'}</span>
                                    {showSubs && <span style={{ fontSize: '0.65rem', opacity: 0.9 }}>Save</span>}
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CoolieItemManager;
