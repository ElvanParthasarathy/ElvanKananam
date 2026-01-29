
import React, { useState, useEffect } from 'react';
import { IconHome, IconPlus, IconSearch, IconSettings, IconUsers, IconBox, IconFileText, IconPrinter, IconMenu } from '../common/Icons';
import { supabase } from '../../config/supabaseClient';
import ItemManager from './ItemManager';
import CustomerManager from './CustomerManager';
import BusinessManager from './BusinessManager';

function SilksDashboard({ onHome, onNewInvoice, onSelectInvoice }) {
    const [activeTab, setActiveTab] = useState('home'); // 'home', 'items', 'customers', 'invoices', 'business', etc.
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        if (activeTab === 'home' || activeTab === 'invoices') {
            fetchInvoices();
        }
    }, [activeTab]);

    async function fetchInvoices() {
        setLoading(true);
        // Fetch invoices with customer data
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

    // Calculate Summary
    const totalReceivables = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const totalSales = totalReceivables; // For now same

    // --- Sidebar Styles Helper ---
    const getSidebarItemStyle = (tabName) => ({
        padding: '8px 20px',
        color: activeTab === tabName ? 'var(--color-text)' : 'var(--color-text-muted)',
        background: activeTab === tabName ? 'var(--color-bg)' : 'transparent', // CSS variable for active background
        borderLeft: activeTab === tabName ? '3px solid var(--color-brand-silks)' : '3px solid transparent',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '10px',
        fontWeight: activeTab === tabName ? '500' : 'normal',
        fontSize: '14px',
        textDecoration: 'none'
    });

    // Helper for inactive/placeholder items
    const SidebarItem = ({ id, icon, label, implemented = true }) => (
        <div
            onClick={() => implemented && setActiveTab(id)}
            style={{
                ...getSidebarItemStyle(id),
                opacity: implemented ? 1 : 0.6,
                cursor: implemented ? 'pointer' : 'default'
            }}
            title={!implemented ? "Not implemented yet" : ""}
        >
            {icon} {label}
        </div>
    );

    const renderHome = () => (
        <>
            {/* Header */}
            <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
                <h2 style={{ fontSize: '24px', margin: 0, fontWeight: '400', color: 'var(--color-text)' }}>Home</h2>
            </div>

            {/* Dashboard Content */}
            <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>

                {/* Summary Cards */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                    <div style={{ flex: 1, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '20px' }}>
                        <div style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.5px' }}>Total Receivables</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '5px' }}>Total Unpaid Invoices ₹{totalReceivables.toLocaleString('en-IN')}</div>
                        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'baseline' }}>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--color-warning)' }}>₹ {totalReceivables.toLocaleString('en-IN')}</div>
                            <div style={{ marginLeft: '10px', fontSize: '12px', color: 'var(--color-warning)' }}>Current</div>
                        </div>
                        <div style={{ height: '4px', background: 'var(--color-bg)', marginTop: '15px', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: '100%', height: '100%', background: 'var(--color-warning)' }}></div>
                        </div>
                    </div>

                    <div style={{ flex: 1, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '20px' }}>
                        <div style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.5px' }}>Total Sales</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '5px' }}>Total Sales (This Year)</div>
                        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'baseline' }}>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--color-brand-silks)' }}>₹ {totalSales.toLocaleString('en-IN')}</div>
                            <div style={{ marginLeft: '10px', fontSize: '12px', color: 'var(--color-brand-silks)' }}>+100%</div>
                        </div>
                        <div style={{ height: '4px', background: 'var(--color-bg)', marginTop: '15px', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: '100%', height: '100%', background: 'var(--color-brand-silks)' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    const renderInvoices = () => (
        <>
            <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '24px', margin: 0, fontWeight: '400', color: 'var(--color-text)' }}>Invoices</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn" onClick={onNewInvoice} style={{ background: 'var(--color-brand-silks)', color: 'white', border: 'none', borderRadius: '3px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <IconPlus size={16} /> New
                    </button>
                    <div className="input-group" style={{ width: 'auto', margin: 0 }}>
                        <IconSearch size={16} />
                        <input
                            type="text"
                            placeholder="Search Invoices..."
                            className="input-field"
                            style={{ padding: '6px 10px', height: '32px', fontSize: '13px', width: '200px', background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div style={{ padding: '20px' }}>
                <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                            <tr>
                                <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: '600', color: 'var(--color-text-muted)' }}>DATE</th>
                                <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: '600', color: 'var(--color-text-muted)' }}>INVOICE#</th>
                                <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: '600', color: 'var(--color-text-muted)' }}>CUSTOMER NAME</th>
                                <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: '600', color: 'var(--color-text-muted)' }}>STATUS</th>
                                <th style={{ padding: '12px 20px', textAlign: 'right', fontWeight: '600', color: 'var(--color-text-muted)' }}>AMOUNT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading invoices...</td></tr>
                            ) : filteredInvoices.length === 0 ? (
                                <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No invoices found. Create your first one!</td></tr>
                            ) : (
                                filteredInvoices.map((inv) => (
                                    <tr
                                        key={inv.id}
                                        onClick={() => onSelectInvoice(inv)}
                                        style={{ borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '12px 20px', color: 'var(--color-text)' }}>{inv.date}</td>
                                        <td style={{ padding: '12px 20px', color: 'var(--color-info)' }}>{inv.invoice_number}</td>
                                        <td style={{ padding: '12px 20px', color: 'var(--color-text)' }}>
                                            {inv.customers?.company_name || inv.customers?.name}
                                        </td>
                                        <td style={{ padding: '12px 20px' }}>
                                            <span style={{
                                                padding: '2px 8px',
                                                borderRadius: '3px',
                                                fontSize: '11px',
                                                textTransform: 'uppercase',
                                                fontWeight: '600',
                                                background: inv.status === 'Draft' ? 'var(--color-bg)' : 'var(--color-success-bg)',
                                                color: inv.status === 'Draft' ? 'var(--color-text-muted)' : 'var(--color-success)',
                                            }}>
                                                {inv.status || 'SAVED'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: '600', color: 'var(--color-text)' }}>
                                            ₹ {inv.total_amount?.toLocaleString('en-IN')}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );

    return (
        <div className="dashboard-wrapper" style={{ display: 'flex', height: '100vh', background: 'var(--color-bg)', fontFamily: 'var(--font-primary)', color: 'var(--color-text)' }}>
            {/* Sidebar */}
            <div style={{ width: '240px', background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', flexShrink: 0, justifyContent: 'space-between' }}>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    <div style={{ padding: '20px', fontSize: '18px', fontWeight: 'bold', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ color: 'var(--color-brand-silks)' }}>E</span> <span style={{ color: 'var(--color-text)' }}>lvan Kananam</span>
                    </div>

                    <div style={{ padding: '10px 0' }}>
                        <SidebarItem id="home" icon={<IconHome size={16} />} label="Home" implemented={true} />
                        <SidebarItem id="customers" icon={<IconUsers size={16} />} label="Customers" implemented={true} />
                        <SidebarItem id="items" icon={<IconBox size={16} />} label="Items" implemented={true} />
                        <SidebarItem id="invoices" icon={<IconFileText size={16} />} label="Invoices" implemented={true} />
                        <SidebarItem id="business" icon={<IconSettings size={16} />} label="Settings" implemented={true} />
                    </div>

                    <div style={{ padding: '10px 20px', color: 'var(--color-text-muted)', cursor: 'pointer', borderTop: '1px solid var(--color-border)' }} onClick={onHome}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                            <IconHome size={16} /> Back to Main
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                {activeTab === 'home' && renderHome()}
                {activeTab === 'invoices' && renderInvoices()}
                {activeTab === 'items' && <ItemManager />}
                {activeTab === 'customers' && <CustomerManager />}
                {activeTab === 'business' && <BusinessManager />}
            </div>
        </div>
    );
}

export default SilksDashboard;
