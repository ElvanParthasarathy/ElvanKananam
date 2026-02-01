import React, { useState, useEffect } from 'react';
import { IconSearch, IconPlus, IconFiles, IconBox, IconUsers, IconSettings, IconArrowLeft, IconTrash } from '../common/Icons';
import { supabase } from '../../config/supabaseClient';
import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';
import ItemManager from './ItemManager';
import CustomerManager from './CustomerManager';
import BusinessManager from './SilksBusinessManager';
import { showSubtitles } from '../../config/translations';

/**
 * SilksDashboard Component
 * 
 * Refactored to match CoolieDashboard structure (Navigation bar, Layout).
 */
function SilksDashboard({ activeTab = 'dashboard', onNewInvoice, onSelectInvoice, onHome, t, language }) {
    const showSubs = showSubtitles(language);
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        if (activeTab === 'dashboard' || activeTab === 'invoices') {
            fetchInvoices();
        }
    }, [activeTab]);

    async function fetchInvoices() {
        setLoading(true);
        const { data, error } = await supabase
            .from('invoices')
            .select(`
                *,
                customers (name, company_name)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching invoices:', error);
        } else {
            setInvoices(data || []);
        }
        setLoading(false);
    }

    async function handleDelete(id, e) {
        e.stopPropagation();
        const shouldDelete = await confirm({
            title: showSubs ? `${t.deleteBill || 'பில்லை நீக்க'} / Delete Invoice` : (t.deleteBill || 'பில்லை நீக்க'),
            message: showSubs
                ? `${t.deleteBillConfirm || 'நீங்கள் இந்த பில்லை கண்டிப்பாக நீக்க விரும்புகிறீர்களா?'} \n(Are you sure you want to delete this invoice? This action cannot be undone.)`
                : (t.deleteBillConfirm || 'நீங்கள் இந்த பில்லை கண்டிப்பாக நீக்க விரும்புகிறீர்களா?'),
            confirmText: showSubs ? `${t.delete || 'நீக்க'} / Delete` : (t.delete || 'நீக்க'),
            type: 'danger'
        });

        if (shouldDelete) {
            // Delete items first (cascade usually handles this but safety first)
            await supabase.from('invoice_items').delete().eq('invoice_id', id);
            const { error } = await supabase.from('invoices').delete().eq('id', id);

            if (error) {
                showToast(`${t.error || 'பிழை'}: ${error.message}`, 'error');
            } else {
                showToast(showSubs ? `${t.billDeleted || 'பில் வெற்றிகரமாக நீக்கப்பட்டது'} / Invoice deleted successfully` : (t.billDeleted || 'பில் வெற்றிகரமாக நீக்கப்பட்டது'), 'success');
                fetchInvoices();
            }
        }
    }

    const filteredInvoices = invoices.filter(inv =>
        inv.invoice_number?.toLowerCase().includes(filter.toLowerCase()) ||
        inv.customers?.name?.toLowerCase().includes(filter.toLowerCase()) ||
        inv.customers?.company_name?.toLowerCase().includes(filter.toLowerCase())
    );



    // Helpers to switch tabs using window location hash (since App.jsx listens to it)
    const switchTab = (tab) => {
        if (tab === 'dashboard') window.location.hash = '#silks-dashboard';
        if (tab === 'items') window.location.hash = '#silks-items';
        if (tab === 'customers') window.location.hash = '#silks-customers';
        if (tab === 'business') window.location.hash = '#silks-business';
    };

    const renderNav = () => (
        <div style={{ display: 'flex', gap: '10px', padding: '20px 20px 0 20px', maxWidth: '1200px', margin: '0 auto' }}>
            <button
                onClick={() => switchTab('dashboard')}
                style={{
                    padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                    background: activeTab === 'dashboard' ? 'var(--color-brand-silks)' : 'transparent',
                    color: activeTab === 'dashboard' ? 'white' : 'var(--color-text-muted)',
                    fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', textAlign: 'left'
                }}
            >
                <IconFiles size={16} />
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                    <span style={{ fontSize: '14px' }}>{t.bills || 'பில்கள்'}</span>
                    {showSubs && <span style={{ fontSize: '10px', opacity: 0.8 }}>Bills</span>}
                </div>
            </button>
            <button
                onClick={() => switchTab('items')}
                style={{
                    padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                    background: activeTab === 'items' ? 'var(--color-brand-silks)' : 'transparent',
                    color: activeTab === 'items' ? 'white' : 'var(--color-text-muted)',
                    fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', textAlign: 'left'
                }}
            >
                <IconBox size={16} />
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                    <span style={{ fontSize: '14px' }}>{t.itemsList || 'பொருட்கள்'}</span>
                    {showSubs && <span style={{ fontSize: '10px', opacity: 0.8 }}>Items</span>}
                </div>
            </button>
            <button
                onClick={() => switchTab('customers')}
                style={{
                    padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                    background: activeTab === 'customers' ? 'var(--color-brand-silks)' : 'transparent',
                    color: activeTab === 'customers' ? 'white' : 'var(--color-text-muted)',
                    fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', textAlign: 'left'
                }}
            >
                <IconUsers size={16} />
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                    <span style={{ fontSize: '14px' }}>{t.customers || 'வணிகர்கள்'}</span>
                    {showSubs && <span style={{ fontSize: '10px', opacity: 0.8 }}>Merchants</span>}
                </div>
            </button>
            <button
                onClick={() => switchTab('business')}
                style={{
                    padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                    background: activeTab === 'business' ? 'var(--color-brand-silks)' : 'transparent',
                    color: activeTab === 'business' ? 'white' : 'var(--color-text-muted)',
                    fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', textAlign: 'left'
                }}
            >
                <IconSettings size={16} />
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                    <span style={{ fontSize: '14px' }}>{t.settings || 'அமைப்புகள்'}</span>
                    {showSubs && <span style={{ fontSize: '10px', opacity: 0.8 }}>Settings</span>}
                </div>
            </button>
        </div>
    );

    const renderDashboard = () => (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', width: '100%', animation: 'fadeIn 0.3s ease' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={onHome}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            color: 'var(--color-text-muted)'
                        }}
                    >
                        <IconArrowLeft size={20} />
                    </button>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h1 style={{ fontSize: '22px', margin: 0, fontWeight: '700', color: 'var(--color-text)' }}>{t.silksBills || 'பட்டு பில்கள்'}</h1>
                        {showSubs && <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Silks Bills</span>}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '8px', height: '40px' }}>
                        <IconSearch size={16} color="var(--color-text-muted)" />
                        <input
                            type="text"
                            placeholder={showSubs ? `${t.searchPlaceholder || 'தேடுக…'} Search...` : (t.searchPlaceholder || 'தேடுக…')}
                            style={{ background: 'transparent', border: 'none', color: 'var(--color-text)', outline: 'none', fontSize: '14px', width: '150px' }}
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={onNewInvoice}
                        style={{
                            background: 'var(--color-brand-silks)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0 20px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: '600',
                            height: '42px',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                        }}
                    >
                        <IconPlus size={18} />
                        <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
                            <div style={{ fontSize: '14px' }}>{t.newBill || 'புதிய பில்'}</div>
                            {showSubs && <div style={{ fontSize: '11px', opacity: 0.9, fontWeight: 'normal' }}>New Bill</div>}
                        </div>
                    </button>
                </div>
            </div>



            {/* Invoices List */}
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                        <tr>
                            <th style={{ padding: '15px 20px', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.date || 'தேதி'}</div>
                                {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>DATE</div>}
                            </th>
                            <th style={{ padding: '15px 20px', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.billNo || 'பில் எண்'}</div>
                                {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>INVOICE#</div>}
                            </th>
                            <th style={{ padding: '15px 20px', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.customer || 'வணிகர்'}</div>
                                {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>MERCHANT</div>}
                            </th>
                            <th style={{ padding: '15px 20px', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.status || 'நிலை'}</div>
                                {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>STATUS</div>}
                            </th>
                            <th style={{ padding: '15px 20px', textAlign: 'right', color: 'var(--color-text-muted)' }}>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.amount || 'தொகை'}</div>
                                {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>AMOUNT</div>}
                            </th>
                            <th style={{ padding: '15px 20px', width: '50px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>{showSubs ? `${t.loading || 'ஏற்றுகிறது...'} / Loading records...` : (t.loading || 'ஏற்றுகிறது...')}</td></tr>
                        ) : filteredInvoices.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '60px 40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--color-text)' }}>{t.noBills || 'பில்கள் இல்லை'}</div>
                                        {showSubs && <div style={{ fontSize: '13px' }}>No invoices found. Create a new one!</div>}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredInvoices.map((inv) => (
                                <tr
                                    key={inv.id}
                                    onClick={() => onSelectInvoice(inv)}
                                    style={{ borderBottom: '1px solid var(--color-border)', cursor: 'pointer', transition: 'background 0.2s' }}
                                    className="table-row-hover"
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '15px 20px', color: 'var(--color-text)' }}>{inv.date}</td>
                                    <td style={{ padding: '15px 20px', color: 'var(--color-info)', fontWeight: '600' }}>{inv.invoice_number}</td>
                                    <td style={{ padding: '15px 20px', color: 'var(--color-text)' }}>{inv.customers?.company_name || inv.customers?.name}</td>
                                    <td style={{ padding: '15px 20px' }}>
                                        <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: inv.status === 'Draft' ? 'var(--color-bg)' : 'var(--color-success-bg)', color: inv.status === 'Draft' ? 'var(--color-text-muted)' : 'var(--color-success)', border: '1px solid var(--color-border)' }}>
                                            {inv.status || 'SAVED'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px 20px', textAlign: 'right', fontWeight: '700', color: 'var(--color-text)' }}>₹ {inv.total_amount?.toLocaleString('en-IN')}</td>
                                    <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                                        <button
                                            onClick={(e) => handleDelete(inv.id, e)}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px', opacity: 0.7 }}
                                            title="Delete"
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
        </div>
    );

    return (
        <div className="layout-content-area" style={{ flex: 1, overflow: 'auto', background: 'transparent' }}>
            {renderNav()}
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'items' && <ItemManager t={t} language={language} />}
            {activeTab === 'customers' && <CustomerManager t={t} language={language} />}
            {activeTab === 'business' && <BusinessManager t={t} language={language} />}
        </div>
    );
}

export default SilksDashboard;
