import React, { useState, useEffect } from 'react';
import { IconPlus, IconFiles, IconArrowLeft, IconTrash, IconSearch, IconUsers, IconBox, IconSettings } from '../common/Icons';
import { supabase } from '../../config/supabaseClient';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import ItemManager from './CoolieItemManager';
import CustomerManager from './CoolieCustomerManager';
import BusinessManager from './CoolieBusinessManager';
import { showSubtitles } from '../../config/translations';

function CoolieDashboard({ activeTab = 'dashboard', onNewBill, onHome, onSelectBill, onRefreshConfig, t, language, companyId }) {
    const showSubs = showSubtitles(language);
    // Language-aware display: Tamil mode shows Tamil first, English/Tanglish shows English first
    const useTamilFirst = language === 'ta_mixed' || language === 'ta_only';
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch Organization Map for Business Name Display
    const [orgMap, setOrgMap] = useState({});

    useEffect(() => {
        fetchOrgMap();
    }, []);

    const fetchOrgMap = async () => {
        const { data } = await supabase.from('coolie_settings').select('id, organization_name, marketing_title');
        if (data) {
            const map = {};
            data.forEach(org => {
                map[org.id] = org; // Store full object for bilingual display
            });
            setOrgMap(map);
        }
    };

    // Fetch Customer Map for Bilingual Display
    const [customerMap, setCustomerMap] = useState({});

    useEffect(() => {
        fetchCustomerMap();
    }, []);

    const fetchCustomerMap = async () => {
        const { data } = await supabase.from('coolie_customers').select('name, name_tamil, company_name, company_name_tamil, city, city_tamil');
        if (data) {
            const map = {};
            data.forEach(c => {
                // Map Entity Name (English -> Tamil) and (Tamil -> English)
                if (c.name && c.name_tamil) {
                    map[c.name] = c.name_tamil;
                    map[c.name_tamil] = c.name;
                }
                // Map Company Name (English -> Tamil) and (Tamil -> English)
                if (c.company_name && c.company_name_tamil) {
                    map[c.company_name] = c.company_name_tamil;
                    map[c.company_name_tamil] = c.company_name;
                }
                // Map City (English -> Tamil) and (Tamil -> English)
                // Normalize keys to handle case/spacing differences
                if (c.city && c.city_tamil) {
                    // English -> Tamil
                    map[c.city] = c.city_tamil;
                    map[c.city.toLowerCase().trim()] = c.city_tamil;

                    // Tamil -> English (multiple normalized forms)
                    map[c.city_tamil] = c.city;
                    map[c.city_tamil.trim()] = c.city;
                    // Also store without commas for better matching
                    map[c.city_tamil.replace(/,/g, '').trim()] = c.city;
                }
            });
            setCustomerMap(map);
        }
    };

    useEffect(() => {
        if (activeTab === 'dashboard') {
            fetchBills();
        }
    }, [activeTab, companyId]);

    async function fetchBills() {
        setLoading(true);
        let query = supabase
            .from('coolie_bills')
            .select('*')
            .order('created_at', { ascending: false });

        if (companyId) {
            query = query.eq('company_id', companyId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching coolie bills:', error);
        } else {
            setBills(data || []);
        }
        setLoading(false);
    }

    async function handleDelete(id, e) {
        e.stopPropagation();

        const shouldDelete = await confirm({
            title: showSubs ? `${t.deleteBill || 'பில்லை நீக்க'} / Delete Bill` : (t.deleteBill || 'பில்லை நீக்க'),
            message: showSubs
                ? `${t.deleteBillConfirm || 'நீங்கள் இந்த பில்லை கண்டிப்பாக நீக்க விரும்புகிறீர்களா?'} \n(Are you sure you want to delete this bill? This action cannot be undone.)`
                : (t.deleteBillConfirm || 'நீங்கள் இந்த பில்லை கண்டிப்பாக நீக்க விரும்புகிறீர்களா?'),
            confirmText: showSubs ? `${t.delete || 'நீக்க'} / Delete` : (t.delete || 'நீக்க'),
            type: 'danger'
        });

        if (!shouldDelete) return;

        const { error } = await supabase.from('coolie_bills').delete().eq('id', id);
        if (error) {
            showToast(`${t.error}: ${error.message}`, 'error');
        } else {
            fetchBills();
        }
    }

    const filteredBills = bills.filter(b =>
        b.customer_name?.toLowerCase().includes(filter.toLowerCase()) ||
        b.bill_no?.toLowerCase().includes(filter.toLowerCase()) ||
        b.city?.toLowerCase().includes(filter.toLowerCase())
    );

    const switchTab = (tab) => {
        if (tab === 'dashboard') window.location.hash = '#coolie-dashboard';
        if (tab === 'bills') window.location.hash = '#coolie-bills';
        if (tab === 'items') window.location.hash = '#coolie-items';
        if (tab === 'customers') window.location.hash = '#coolie-customers';
        if (tab === 'business') window.location.hash = '#coolie-business';
    };

    const renderDashboard = () => {
        // Group bills by company
        const grouped = bills.reduce((acc, bill) => {
            const key = bill.company_id || 'legacy';
            if (!acc[key]) acc[key] = [];
            acc[key].push(bill);
            return acc;
        }, {});

        // Sort keys to put legacy last or specific logic
        const companyIds = Object.keys(grouped).sort();

        return (
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: isMobile ? '15px' : '20px' }}>
                {/* Responsive Header */}
                <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    justifyContent: 'space-between',
                    gap: '20px',
                    marginBottom: '30px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <h1 style={{ fontSize: isMobile ? '20px' : '22px', fontWeight: '600', margin: 0, color: 'var(--color-text)' }}>{t.coolieBill}</h1>
                            {showSubs && <span style={{ fontSize: '13px', color: '#6b7280' }}>Coolie Bills</span>}
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: '12px',
                        width: isMobile ? '100%' : 'auto'
                    }}>
                        <div className="autocomplete-wrapper" style={{
                            background: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '8px',
                            padding: '0 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            height: isMobile ? '56px' : '48px',
                            flex: isMobile ? 1 : 'none'
                        }}>
                            <IconSearch size={16} color="var(--color-text-muted)" />
                            <input
                                type="text"
                                placeholder={!showSubs ? (t.searchPlaceholder || 'தேடுக...') : ''}
                                style={{ background: 'transparent', border: 'none', color: 'var(--color-text)', outline: 'none', fontSize: '14px', width: isMobile ? '100%' : '180px' }}
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            />
                            {showSubs && !filter && (
                                <div className="dual-placeholder-overlay" style={{ left: '36px' }}>
                                    <span className="dual-placeholder-primary">{t.searchPlaceholder || 'தேடுக...'}</span>
                                    <span className="dual-placeholder-sub">Search Bills...</span>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={onNewBill}
                            style={{
                                background: '#e65100',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: isMobile ? '0 15px' : '0 20px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: isMobile ? 'center' : 'flex-start',
                                gap: '8px',
                                fontWeight: '600',
                                height: isMobile ? '56px' : '48px',
                                boxShadow: '0 2px 4px rgba(230, 81, 0, 0.2)',
                                width: isMobile ? '100%' : 'auto'
                            }}
                        >
                            <IconPlus size={24} />
                            <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
                                <div style={{ fontWeight: '700', fontSize: '14px' }}>{t.newBill}</div>
                                {showSubs && <div style={{ fontSize: '11px', fontWeight: '400', opacity: 0.9 }}>New Bill</div>}
                            </div>
                        </button>
                    </div>
                </div>

                {/* Iterate over Groups */}
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '16px', fontWeight: '500' }}>{t.loading}</span>
                        {showSubs && <span style={{ fontSize: '13px', opacity: 0.8 }}>Loading...</span>}
                    </div>
                ) : companyIds.length === 0 ? (
                    <div style={{ padding: '60px 40px', textAlign: 'center', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--color-text)' }}>{t.noBills}</div>
                        {showSubs && <div style={{ fontSize: '13px' }}>No bills found.</div>}
                    </div>
                ) : (
                    companyIds.map(compId => {
                        const compBills = grouped[compId].filter(b =>
                            b.customer_name?.toLowerCase().includes(filter.toLowerCase()) ||
                            b.bill_no?.toLowerCase().includes(filter.toLowerCase()) ||
                            b.city?.toLowerCase().includes(filter.toLowerCase())
                        );

                        if (compBills.length === 0) return null;

                        const compOrg = orgMap[compId === 'legacy' ? null : compId];
                        // Language-aware name display (useTamilFirst is defined at component level)

                        let compName, compSub;
                        if (useTamilFirst) {
                            compName = compOrg?.marketing_title || compOrg?.organization_name || (compId === 'legacy' ? 'Legacy / Unknown' : t.company || 'நிறுவனம்');
                            compSub = compOrg?.marketing_title ? compOrg?.organization_name : '';
                        } else {
                            // English or Tanglish: Show English first
                            compName = compOrg?.organization_name || compOrg?.marketing_title || (compId === 'legacy' ? 'Legacy / Unknown' : t.company || 'Company');
                            compSub = compOrg?.organization_name && compOrg?.marketing_title ? compOrg?.marketing_title : '';
                        }

                        return (
                            <div key={compId} style={{ marginBottom: '30px' }}>
                                <div style={{
                                    marginBottom: '10px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '2px'
                                }}>
                                    <div style={{
                                        fontSize: '16px',
                                        fontWeight: '700',
                                        color: 'var(--color-primary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}>
                                        <IconBox size={18} />
                                        {compName}
                                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: '500' }}>({compBills.length})</span>
                                    </div>
                                    {showSubs && compSub && (
                                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', paddingLeft: '28px' }}>
                                            {compSub}
                                        </div>
                                    )}
                                </div>

                                {isMobile ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        {compBills.map((bill) => (
                                            <div
                                                key={bill.id}
                                                onClick={() => onSelectBill(bill)}
                                                style={{
                                                    background: 'var(--color-surface)',
                                                    border: '1px solid var(--color-border)',
                                                    borderRadius: '12px',
                                                    padding: '16px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '12px',
                                                    position: 'relative'
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: '500' }}>{bill.date}</span>
                                                        <span style={{ fontSize: '16px', fontWeight: '700', color: '#e65100' }}>{bill.bill_no}</span>
                                                    </div>
                                                    <div style={{ textAlign: 'right', paddingRight: '40px' }}>
                                                        <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text)' }}>
                                                            ₹{parseFloat(bill.grand_total || 0).toLocaleString('en-IN')}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <IconUsers size={14} color="var(--color-text-muted)" />
                                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text)' }}>
                                                                {useTamilFirst ? bill.customer_name : (customerMap[bill.customer_name] || bill.customer_name)}
                                                            </span>
                                                            {showSubs && customerMap[bill.customer_name] && (
                                                                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '400' }}>
                                                                    {useTamilFirst ? customerMap[bill.customer_name] : bill.customer_name}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '22px' }}>
                                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                                                                {useTamilFirst ? bill.city : (customerMap[bill.city] || customerMap[bill.city?.replace(/,/g, '').trim()] || bill.city)}
                                                            </span>
                                                            {showSubs && (customerMap[bill.city] || customerMap[bill.city?.replace(/,/g, '').trim()]) && (
                                                                <span style={{ fontSize: '11px', opacity: 0.8 }}>
                                                                    {useTamilFirst ? (customerMap[bill.city] || customerMap[bill.city?.replace(/,/g, '').trim()]) : bill.city}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={(e) => handleDelete(bill.id, e)}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '12px',
                                                        right: '12px',
                                                        background: 'var(--color-bg)',
                                                        border: '1px solid var(--color-border)',
                                                        borderRadius: '50%',
                                                        width: '32px',
                                                        height: '32px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#ef4444'
                                                    }}
                                                >
                                                    <IconTrash size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                            <thead style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                                                <tr>
                                                    <th style={{ padding: '15px 20px', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                                                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.date}</div>
                                                        {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Date</div>}
                                                    </th>
                                                    <th style={{ padding: '15px 20px', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                                                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.billNo}</div>
                                                        {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Bill No</div>}
                                                    </th>
                                                    <th style={{ padding: '15px 20px', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                                                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.customer}</div>
                                                        {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Merchant</div>}
                                                    </th>
                                                    <th style={{ padding: '15px 20px', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                                                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.placeCity}</div>
                                                        {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Place</div>}
                                                    </th>
                                                    <th style={{ padding: '15px 20px', textAlign: 'right', color: 'var(--color-text-muted)' }}>
                                                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.amount}</div>
                                                        {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Amount</div>}
                                                    </th>
                                                    <th style={{ padding: '15px 20px', width: '50px' }}></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {compBills.map((bill) => (
                                                    <tr
                                                        key={bill.id}
                                                        onClick={() => onSelectBill(bill)}
                                                        style={{ borderBottom: '1px solid var(--color-border)', cursor: 'pointer', transition: 'background 0.2s' }}
                                                        className="table-row-hover"
                                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg)'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                    >
                                                        <td style={{ padding: '15px 20px', color: 'var(--color-text)' }}>{bill.date}</td>
                                                        <td style={{ padding: '15px 20px', color: '#e65100', fontWeight: '600' }}>{bill.bill_no}</td>
                                                        <td style={{ padding: '15px 20px', color: 'var(--color-text)' }}>
                                                            <div style={{ fontWeight: '500' }}>
                                                                {useTamilFirst ? bill.customer_name : (customerMap[bill.customer_name] || bill.customer_name)}
                                                            </div>
                                                            {showSubs && customerMap[bill.customer_name] && (
                                                                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                                                                    {useTamilFirst ? customerMap[bill.customer_name] : bill.customer_name}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td style={{ padding: '15px 20px', color: 'var(--color-text-muted)' }}>
                                                            <div>
                                                                {useTamilFirst ? bill.city : (customerMap[bill.city] || customerMap[bill.city?.toLowerCase().trim()] || customerMap[bill.city?.replace(/,/g, '').trim()] || bill.city)}
                                                            </div>
                                                            {showSubs && (customerMap[bill.city] || customerMap[bill.city?.toLowerCase().trim()] || customerMap[bill.city?.replace(/,/g, '').trim()]) && (
                                                                <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '2px' }}>
                                                                    {useTamilFirst ? (customerMap[bill.city] || customerMap[bill.city?.toLowerCase().trim()] || customerMap[bill.city?.replace(/,/g, '').trim()]) : bill.city}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td style={{ padding: '15px 20px', textAlign: 'right', fontWeight: '700', color: 'var(--color-text)' }}>
                                                            ₹ {parseFloat(bill.grand_total || 0).toLocaleString('en-IN')}
                                                        </td>
                                                        <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                                                            <button
                                                                onClick={(e) => handleDelete(bill.id, e)}
                                                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px', opacity: 0.7 }}
                                                                title="Delete"
                                                            >
                                                                <IconTrash size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        );
    };

    const renderNav = () => {
        if (!isMobile) {
            return (
                <div style={{ display: 'flex', gap: '10px', padding: '20px 20px 0 20px', maxWidth: '1000px', margin: '0 auto' }}>
                    <button
                        onClick={() => switchTab('dashboard')}
                        style={{
                            padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                            background: activeTab === 'dashboard' ? '#e65100' : 'var(--color-surface)',
                            color: activeTab === 'dashboard' ? 'white' : 'var(--color-text-muted)',
                            fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px',
                            whiteSpace: 'nowrap',
                            border: activeTab === 'dashboard' ? 'none' : '1px solid var(--color-border)'
                        }}
                    >
                        <IconFiles size={20} />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: '1.2' }}>
                            <span style={{ fontSize: '14px' }}>{t.bills}</span>
                            {showSubs && <span style={{ fontSize: '10px', opacity: 0.8 }}>Bills</span>}
                        </div>
                    </button>
                    <button
                        onClick={() => switchTab('items')}
                        style={{
                            padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                            background: activeTab === 'items' ? '#e65100' : 'var(--color-surface)',
                            color: activeTab === 'items' ? 'white' : 'var(--color-text-muted)',
                            fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px',
                            whiteSpace: 'nowrap',
                            border: activeTab === 'items' ? 'none' : '1px solid var(--color-border)'
                        }}
                    >
                        <IconBox size={20} />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: '1.2' }}>
                            <span style={{ fontSize: '14px' }}>{t.itemsList}</span>
                            {showSubs && <span style={{ fontSize: '10px', opacity: 0.8 }}>Items</span>}
                        </div>
                    </button>
                    <button
                        onClick={() => switchTab('customers')}
                        style={{
                            padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                            background: activeTab === 'customers' ? '#e65100' : 'var(--color-surface)',
                            color: activeTab === 'customers' ? 'white' : 'var(--color-text-muted)',
                            fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px',
                            whiteSpace: 'nowrap',
                            border: activeTab === 'customers' ? 'none' : '1px solid var(--color-border)'
                        }}
                    >
                        <IconUsers size={20} />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: '1.2' }}>
                            <span style={{ fontSize: '14px' }}>{t.coolieCustomers || t.customers || 'வணிகர்கள்'}</span>
                            {showSubs && <span style={{ fontSize: '10px', opacity: 0.8 }}>Merchants</span>}
                        </div>
                    </button>
                    <button
                        onClick={() => switchTab('business')}
                        style={{
                            padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                            background: activeTab === 'business' ? '#e65100' : 'var(--color-surface)',
                            color: activeTab === 'business' ? 'white' : 'var(--color-text-muted)',
                            fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px',
                            whiteSpace: 'nowrap',
                            border: activeTab === 'business' ? 'none' : '1px solid var(--color-border)'
                        }}
                    >
                        <IconSettings size={20} />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: '1.2' }}>
                            <span style={{ fontSize: '14px' }}>{t.settings}</span>
                            {showSubs && <span style={{ fontSize: '10px', opacity: 0.8 }}>Settings</span>}
                        </div>
                    </button>
                </div>
            );
        }

        // Mobile Nav: Only show hub on dashboard, otherwise show sub-header
        if (activeTab === 'dashboard') {
            return renderMobileHub();
        }
        return renderSubHeader();
    };

    const renderSubHeader = () => (
        <div style={{
            padding: '12px 15px',
            background: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
        }}>
            <button
                onClick={() => switchTab('dashboard')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    background: 'rgba(230, 81, 0, 0.05)',
                    border: '1px solid rgba(230, 81, 0, 0.2)',
                    borderRadius: '10px',
                    color: '#e65100',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer'
                }}
            >
                <IconArrowLeft size={16} />
                {t.backToHub || 'முகப்பு / Back'}
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text)' }}>
                    {activeTab === 'bills' ? t.bills : activeTab === 'items' ? t.itemsList : activeTab === 'customers' ? t.customers : t.settings}
                </span>
                {showSubs && <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                    {activeTab === 'bills' ? 'All Bills' : activeTab}
                </span>}
            </div>
        </div>
    );

    const renderMobileHub = () => (
        <div style={{ padding: '20px 15px', background: 'var(--color-bg)' }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '15px'
            }}>
                <button
                    onClick={() => switchTab('bills')}
                    style={{
                        background: activeTab === 'bills' ? 'rgba(230, 81, 0, 0.1)' : 'var(--color-surface)',
                        border: activeTab === 'bills' ? '2px solid #e65100' : '1px solid var(--color-border)',
                        borderRadius: '16px',
                        padding: '15px 10px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        boxShadow: activeTab === 'bills' ? '0 4px 12px rgba(230, 81, 0, 0.05)' : 'none',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <IconFiles size={28} color={activeTab === 'bills' ? '#e65100' : 'var(--color-text-muted)'} />
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--color-text)' }}>{t.bills}</div>
                        {showSubs && <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Bills List</div>}
                    </div>
                </button>

                <button
                    onClick={() => { switchTab('items'); }}
                    style={{
                        background: activeTab === 'items' ? 'rgba(230, 81, 0, 0.1)' : 'var(--color-surface)',
                        border: activeTab === 'items' ? '2px solid #e65100' : '1px solid var(--color-border)',
                        borderRadius: '16px',
                        padding: '15px 10px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        boxShadow: activeTab === 'items' ? '0 4px 12px rgba(230, 81, 0, 0.05)' : 'none',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <IconBox size={28} color={activeTab === 'items' ? '#e65100' : 'var(--color-text-muted)'} />
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--color-text)' }}>{t.itemsList}</div>
                        {showSubs && <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Items</div>}
                    </div>
                </button>

                <button
                    onClick={() => { switchTab('customers'); }}
                    style={{
                        background: activeTab === 'customers' ? 'rgba(230, 81, 0, 0.1)' : 'var(--color-surface)',
                        border: activeTab === 'customers' ? '2px solid #e65100' : '1px solid var(--color-border)',
                        borderRadius: '16px',
                        padding: '15px 10px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        boxShadow: activeTab === 'customers' ? '0 4px 12px rgba(230, 81, 0, 0.05)' : 'none',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <IconUsers size={28} color={activeTab === 'customers' ? '#e65100' : 'var(--color-text-muted)'} />
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--color-text)' }}>{t.coolieCustomers || t.customers || 'வணிகர்கள்'}</div>
                        {showSubs && <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Merchants</div>}
                    </div>
                </button>

                <button
                    onClick={() => { switchTab('business'); }}
                    style={{
                        background: activeTab === 'business' ? 'rgba(230, 81, 0, 0.1)' : 'var(--color-surface)',
                        border: activeTab === 'business' ? '2px solid #e65100' : '1px solid var(--color-border)',
                        borderRadius: '16px',
                        padding: '15px 10px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        boxShadow: activeTab === 'business' ? '0 4px 12px rgba(230, 81, 0, 0.05)' : 'none',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <IconSettings size={28} color={activeTab === 'business' ? '#e65100' : 'var(--color-text-muted)'} />
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--color-text)' }}>{t.settings}</div>
                        {showSubs && <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Settings</div>}
                    </div>
                </button>
            </div>
        </div>
    );

    return (
        <div className="layout-content-area" style={{ flex: 1, overflow: 'auto', background: 'transparent' }}>
            {/* Nav / Hub / Sub-Header */}
            {renderNav()}

            <div style={{ paddingBottom: '40px' }}>
                {/* Content Rendering */}
                {/* On desktop: show dashboard. On mobile: only show dashboard if activeTab is bills/dashboard (the hub handles navigation) */}
                {(activeTab === 'dashboard' || activeTab === 'bills') && (!isMobile || activeTab === 'bills' ? renderDashboard() : null)}

                {activeTab === 'items' && <ItemManager t={t} language={language} />}
                {activeTab === 'customers' && <CustomerManager t={t} language={language} />}
                {activeTab === 'business' && <BusinessManager t={t} language={language} onSaveSuccess={onRefreshConfig} />}
            </div>
        </div>
    );
}

export default CoolieDashboard;
