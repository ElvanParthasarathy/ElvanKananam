import React, { useState, useEffect } from 'react';
import { IconSearch, IconPlus } from '../common/Icons';
import { supabase } from '../../config/supabaseClient';
import ItemManager from './ItemManager';
import CustomerManager from './CustomerManager';
import BusinessManager from './BusinessManager';

/**
 * SilksDashboard Component
 * 
 * Refactored to remove internal sidebar. Navigation is now handled by the main application sidebar.
 */
function SilksDashboard({ activeTab = 'dashboard', onNewInvoice, onSelectInvoice }) {
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

    const filteredInvoices = invoices.filter(inv =>
        inv.invoice_number?.toLowerCase().includes(filter.toLowerCase()) ||
        inv.customers?.name?.toLowerCase().includes(filter.toLowerCase()) ||
        inv.customers?.company_name?.toLowerCase().includes(filter.toLowerCase())
    );

    const totalReceivables = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

    const renderDashboard = () => (
        <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', width: '100%', animation: 'fadeIn 0.3s ease' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '25px', fontWeight: '400', color: 'var(--color-text)' }}>Revenue Overview</h2>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <div style={{ flex: 1, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.8px', marginBottom: '15px' }}>Total Receivables</div>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--color-warning)' }}>₹ {totalReceivables.toLocaleString('en-IN')}</div>
                    <div style={{ height: '4px', background: 'var(--color-bg)', marginTop: '20px', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ width: '100%', height: '100%', background: 'var(--color-warning)' }}></div>
                    </div>
                </div>

                <div style={{ flex: 1, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.8px', marginBottom: '15px' }}>Total Sales</div>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--color-brand-silks)' }}>₹ {totalReceivables.toLocaleString('en-IN')}</div>
                    <div style={{ height: '4px', background: 'var(--color-bg)', marginTop: '20px', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ width: '100%', height: '100%', background: 'var(--color-brand-silks)' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderInvoices = () => (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ background: 'transparent', borderBottom: '1px solid var(--color-border)', padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '24px', margin: 0, fontWeight: '400', color: 'var(--color-text)' }}>Invoices</h2>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <div className="input-group" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <IconSearch size={16} color="var(--color-text-muted)" />
                        <input
                            type="text"
                            placeholder="Filter invoices..."
                            style={{ background: 'transparent', border: 'none', color: 'var(--color-text)', padding: '10px 0', outline: 'none', fontSize: '14px', width: '220px' }}
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                    <button className="btn" onClick={onNewInvoice} style={{ background: 'var(--color-brand-silks)', color: 'white', borderRadius: '8px', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', fontWeight: '600' }}>
                        <IconPlus size={18} /> New Invoice
                    </button>
                </div>
            </div>

            <div style={{ padding: '30px' }}>
                <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                            <tr>
                                <th style={{ padding: '15px 20px', textAlign: 'left', fontWeight: '600', color: 'var(--color-text-muted)' }}>DATE</th>
                                <th style={{ padding: '15px 20px', textAlign: 'left', fontWeight: '600', color: 'var(--color-text-muted)' }}>INVOICE#</th>
                                <th style={{ padding: '15px 20px', textAlign: 'left', fontWeight: '600', color: 'var(--color-text-muted)' }}>CUSTOMER NAME</th>
                                <th style={{ padding: '15px 20px', textAlign: 'left', fontWeight: '600', color: 'var(--color-text-muted)' }}>STATUS</th>
                                <th style={{ padding: '15px 20px', textAlign: 'right', fontWeight: '600', color: 'var(--color-text-muted)' }}>AMOUNT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading records...</td></tr>
                            ) : filteredInvoices.length === 0 ? (
                                <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No records found.</td></tr>
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
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    return (
        <div className="layout-content-area" style={{ flex: 1, overflow: 'auto', background: 'transparent' }}>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'dashboard' && renderInvoices()}
            {activeTab === 'items' && <ItemManager />}
            {activeTab === 'customers' && <CustomerManager />}
            {activeTab === 'business' && <BusinessManager />}
        </div>
    );
}

export default SilksDashboard;
