import React, { useState, useEffect } from 'react';
import { IconPlus, IconFiles, IconArrowLeft, IconTrash, IconSearch, IconUsers, IconBox, IconSettings } from '../common/Icons';
import { supabase } from '../../config/supabaseClient';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import ItemManager from './CoolieItemManager';
import CustomerManager from './CoolieCustomerManager';
import BusinessManager from './CoolieBusinessManager';
import { showSubtitles } from '../../config/translations';
import './Coolie.css'; // Import M3 Styles

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
        const { data, error } = await supabase.from('coolie_settings').select('id, organization_name, marketing_title');
        if (error) {
            console.warn('Error fetching organization map:', error);
            setOrgMap({});
            return;
        }
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
        const { data, error } = await supabase.from('coolie_customers').select('name, name_tamil, company_name, company_name_tamil, city, city_tamil');
        if (error) {
            console.warn('Error fetching customer map:', error);
            setCustomerMap({});
            return;
        }
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
            setBills([]);
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

    const normalizeBasic = (text) => String(text || '').toLowerCase().replace(/[\s\-_/.,]+/g, '');
    const normalizeTanglish = (text) => {
        let s = normalizeBasic(text);
        if (!s) return s;
        s = s
            .replace(/aa/g, 'a')
            .replace(/ee/g, 'e')
            .replace(/ii/g, 'i')
            .replace(/oo/g, 'o')
            .replace(/uu/g, 'u')
            .replace(/ph/g, 'f')
            .replace(/bh/g, 'b')
            .replace(/dh/g, 'd')
            .replace(/th/g, 't')
            .replace(/kh/g, 'k')
            .replace(/gh/g, 'g')
            .replace(/ch/g, 's')
            .replace(/sh/g, 's')
            .replace(/zh/g, 'l')
            .replace(/j/g, 's')
            .replace(/c/g, 's')
            .replace(/z/g, 's')
            .replace(/ng/g, 'n')
            .replace(/nj/g, 'n')
            .replace(/rr/g, 'r')
            .replace(/ll/g, 'l')
            .replace(/nn/g, 'n')
            .replace(/bb/g, 'b')
            .replace(/pp/g, 'p')
            .replace(/ff/g, 'f');
        s = s
            .replace(/b/g, 'p')
            .replace(/f/g, 'p')
            .replace(/d/g, 't')
            .replace(/g/g, 'k')
            .replace(/v/g, 'w');
        s = s.replace(/(.)\1+/g, '$1');
        return s;
    };
    const consonantSkeleton = (text) => normalizeTanglish(text).replace(/[aeiou]/g, '');

    const buildHaystack = (b) => {
        const raw = [
            b.customer_name,
            b.bill_no,
            b.city,
            customerMap[b.customer_name],
            customerMap[b.city]
        ].filter(Boolean).join(' ');

        return [
            raw.toLowerCase(),
            normalizeBasic(raw),
            normalizeTanglish(raw),
            consonantSkeleton(raw)
        ].filter(Boolean);
    };

    const buildNeedles = (input) => {
        const raw = String(input || '').toLowerCase().trim();
        if (!raw) return [];
        return [
            raw,
            normalizeBasic(raw),
            normalizeTanglish(raw),
            consonantSkeleton(raw)
        ].filter(Boolean);
    };

    const isBillMatch = (b) => {
        const needles = buildNeedles(filter);
        if (needles.length === 0) return true;
        const haystack = buildHaystack(b);
        return needles.some(n => haystack.some(h => h.includes(n)));
    };

    const filteredBills = bills.filter(isBillMatch);

    const switchTab = (tab) => {
        if (tab === 'dashboard') window.location.hash = '#coolie-dashboard';
        if (tab === 'bills') window.location.hash = '#coolie-bills';
        if (tab === 'items') window.location.hash = '#coolie-items';
        if (tab === 'customers') window.location.hash = '#coolie-customers';
        if (tab === 'business') window.location.hash = '#coolie-business';
    };

    const renderDashboard = () => {
        // Group bills by company
        const grouped = filteredBills.reduce((acc, bill) => {
            const key = bill.company_id || 'legacy';
            if (!acc[key]) acc[key] = [];
            acc[key].push(bill);
            return acc;
        }, {});

        // Sort keys to put legacy last or specific logic
        const companyIds = Object.keys(grouped).sort();

        return (
            <div className="coolie-dashboard">
                {/* Responsive Header */}
                <div className="coolie-header-wrapper">
                    <div className="coolie-title-group">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <h1 className="coolie-title">{t.coolieBill}</h1>
                        </div>
                        {showSubs && <span className="coolie-subtitle">Coolie Bills</span>}
                    </div>

                    <div className="coolie-actions-group">
                        <div className="coolie-search-bar">
                            <IconSearch size={16} color="var(--md-sys-color-on-surface-variant)" />
                            <input
                                type="text"
                                placeholder={!showSubs ? (t.searchPlaceholder || 'தேடுக...') : ''}
                                className="coolie-search-input"
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
                            className="coolie-primary-btn"
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
                    <div className="coolie-loading">
                        <div className="spinner-border text-primary" role="status" style={{ marginRight: '10px' }}></div>
                        <span style={{ fontWeight: '500' }}>{t.loading}</span>
                    </div>
                ) : companyIds.length === 0 ? (
                    <div className="coolie-empty">
                        <div style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--md-sys-color-on-surface)' }}>{t.noBills}</div>
                        {showSubs && <div className="coolie-subtitle">No bills found.</div>}
                    </div>
                ) : (
                    companyIds.map(compId => {
                        const compBills = grouped[compId].filter(isBillMatch);

                        if (compBills.length === 0) return null;

                        const compOrg = orgMap[compId === 'legacy' ? null : compId];
                        // Language-aware name display
                        let compName, compSub;
                        if (useTamilFirst) {
                            compName = compOrg?.marketing_title || compOrg?.organization_name || (compId === 'legacy' ? 'Legacy / Unknown' : t.company || 'நிறுவனம்');
                            compSub = compOrg?.marketing_title ? compOrg?.organization_name : '';
                        } else {
                            compName = compOrg?.organization_name || compOrg?.marketing_title || (compId === 'legacy' ? 'Legacy / Unknown' : t.company || 'Company');
                            compSub = compOrg?.organization_name && compOrg?.marketing_title ? compOrg?.marketing_title : '';
                        }

                        return (
                            <div key={compId} className="coolie-group-wrapper">
                                <div className="coolie-group-header">
                                    <div className="coolie-group-title">
                                        <IconBox size={18} />
                                        {compName}
                                        <span style={{ fontSize: '0.75rem', color: 'var(--md-sys-color-on-surface-variant)', fontWeight: '500' }}>({compBills.length})</span>
                                    </div>
                                    {showSubs && compSub && (
                                        <div style={{ fontSize: '0.75rem', color: 'var(--md-sys-color-on-surface-variant)', paddingLeft: '28px' }}>
                                            {compSub}
                                        </div>
                                    )}
                                </div>

                                {isMobile ? (
                                    <div className="coolie-mobile-list">
                                        {compBills.map((bill) => (
                                            <div
                                                key={bill.id}
                                                onClick={() => onSelectBill(bill)}
                                                className="coolie-card coolie-card-interactive"
                                            >
                                                <div className="coolie-card-header">
                                                    <div className="coolie-card-meta">
                                                        <span className="coolie-card-date">{bill.date}</span>
                                                        <span className="coolie-card-id">{bill.bill_no}</span>
                                                    </div>
                                                    <div className="coolie-card-amount">
                                                        ₹{parseFloat(bill.grand_total || 0).toLocaleString('en-IN')}
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <IconUsers size={14} color="var(--md-sys-color-on-surface-variant)" />
                                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--md-sys-color-on-surface)' }}>
                                                                {useTamilFirst ? bill.customer_name : (customerMap[bill.customer_name] || bill.customer_name)}
                                                            </span>
                                                            {showSubs && customerMap[bill.customer_name] && (
                                                                <span style={{ fontSize: '0.75rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                                                                    {useTamilFirst ? customerMap[bill.customer_name] : bill.customer_name}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '22px' }}>
                                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                            <span style={{ fontSize: '0.8125rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                                                                {useTamilFirst ? bill.city : (customerMap[bill.city] || customerMap[bill.city?.replace(/,/g, '').trim()] || bill.city)}
                                                            </span>
                                                            {showSubs && (customerMap[bill.city] || customerMap[bill.city?.replace(/,/g, '').trim()]) && (
                                                                <span style={{ fontSize: '0.75rem', color: 'var(--md-sys-color-on-surface-variant)', opacity: 0.8 }}>
                                                                    {useTamilFirst ? (customerMap[bill.city] || customerMap[bill.city?.replace(/,/g, '').trim()]) : bill.city}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={(e) => handleDelete(bill.id, e)}
                                                    className="coolie-card-delete"
                                                >
                                                    <IconTrash size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="coolie-table-container">
                                        <table className="coolie-table">
                                            <thead>
                                                <tr>
                                                    <th>
                                                        <div>{t.date}</div>
                                                        {showSubs && <div style={{ fontSize: '0.7rem', fontWeight: 'normal' }}>Date</div>}
                                                    </th>
                                                    <th>
                                                        <div>{t.billNo}</div>
                                                        {showSubs && <div style={{ fontSize: '0.7rem', fontWeight: 'normal' }}>Bill No</div>}
                                                    </th>
                                                    <th>
                                                        <div>{t.customer}</div>
                                                        {showSubs && <div style={{ fontSize: '0.7rem', fontWeight: 'normal' }}>Merchant</div>}
                                                    </th>
                                                    <th>
                                                        <div>{t.placeCity}</div>
                                                        {showSubs && <div style={{ fontSize: '0.7rem', fontWeight: 'normal' }}>Place</div>}
                                                    </th>
                                                    <th style={{ textAlign: 'right' }}>
                                                        <div>{t.amount}</div>
                                                        {showSubs && <div style={{ fontSize: '0.7rem', fontWeight: 'normal' }}>Amount</div>}
                                                    </th>
                                                    <th style={{ width: '50px' }}></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {compBills.map((bill) => (
                                                    <tr
                                                        key={bill.id}
                                                        onClick={() => onSelectBill(bill)}
                                                    >
                                                        <td>{bill.date}</td>
                                                        <td style={{ color: 'var(--md-sys-color-primary)', fontWeight: '600' }}>{bill.bill_no}</td>
                                                        <td>
                                                            <div style={{ fontWeight: '500' }}>
                                                                {useTamilFirst ? bill.customer_name : (customerMap[bill.customer_name] || bill.customer_name)}
                                                            </div>
                                                            {showSubs && customerMap[bill.customer_name] && (
                                                                <div style={{ fontSize: '0.75rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                                                                    {useTamilFirst ? customerMap[bill.customer_name] : bill.customer_name}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <div>
                                                                {useTamilFirst ? bill.city : (customerMap[bill.city] || customerMap[bill.city?.replace(/,/g, '').trim()] || bill.city)}
                                                            </div>
                                                            {showSubs && (customerMap[bill.city] || customerMap[bill.city?.replace(/,/g, '').trim()]) && (
                                                                <div style={{ fontSize: '0.75rem', color: 'var(--md-sys-color-on-surface-variant)', opacity: 0.8 }}>
                                                                    {useTamilFirst ? (customerMap[bill.city] || customerMap[bill.city?.replace(/,/g, '').trim()]) : bill.city}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td style={{ textAlign: 'right', fontWeight: '700' }}>
                                                            ₹ {parseFloat(bill.grand_total || 0).toLocaleString('en-IN')}
                                                        </td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <button
                                                                onClick={(e) => handleDelete(bill.id, e)}
                                                                className="coolie-table-btn-delete"
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
                )
                }
            </div >
        );
    };

    const renderNav = () => {
        if (!isMobile) {
            return (
                <div className="coolie-nav-container">
                    <button
                        onClick={() => switchTab('dashboard')}
                        className={`coolie-nav-pill ${activeTab === 'dashboard' ? 'active' : ''}`}
                    >
                        <IconFiles size={20} />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: '1.2' }}>
                            <span>{t.bills}</span>
                            {showSubs && <span style={{ fontSize: '0.625rem', opacity: 0.8 }}>Bills</span>}
                        </div>
                    </button>
                    <button
                        onClick={() => switchTab('items')}
                        className={`coolie-nav-pill ${activeTab === 'items' ? 'active' : ''}`}
                    >
                        <IconBox size={20} />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: '1.2' }}>
                            <span>{t.itemsList}</span>
                            {showSubs && <span style={{ fontSize: '0.625rem', opacity: 0.8 }}>Items</span>}
                        </div>
                    </button>
                    <button
                        onClick={() => switchTab('customers')}
                        className={`coolie-nav-pill ${activeTab === 'customers' ? 'active' : ''}`}
                    >
                        <IconUsers size={20} />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: '1.2' }}>
                            <span>{t.coolieCustomers || t.customers || 'வணிகர்கள்'}</span>
                            {showSubs && <span style={{ fontSize: '0.625rem', opacity: 0.8 }}>Merchants</span>}
                        </div>
                    </button>
                    <button
                        onClick={() => switchTab('business')}
                        className={`coolie-nav-pill ${activeTab === 'business' ? 'active' : ''}`}
                    >
                        <IconSettings size={20} />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: '1.2' }}>
                            <span>{t.settings}</span>
                            {showSubs && <span style={{ fontSize: '0.625rem', opacity: 0.8 }}>Settings</span>}
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
        <div className="coolie-sub-header">
            <button
                onClick={() => switchTab('dashboard')}
                className="coolie-back-btn"
            >
                <IconArrowLeft size={16} />
                {t.backToHub || 'முகப்பு / Back'}
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--md-sys-color-on-surface)' }}>
                    {activeTab === 'bills' ? t.bills : activeTab === 'items' ? t.itemsList : activeTab === 'customers' ? t.customers : t.settings}
                </span>
                {showSubs && <span style={{ fontSize: '0.625rem', color: 'var(--md-sys-color-on-surface-variant)', textTransform: 'capitalize' }}>
                    {activeTab === 'bills' ? 'All Bills' : activeTab}
                </span>}
            </div>
        </div>
    );

    const renderMobileHub = () => (
        <div style={{ padding: '0', background: 'transparent' }}>
            <div className="coolie-hub-grid">
                <button
                    onClick={() => switchTab('bills')}
                    className={`coolie-hub-card ${activeTab === 'bills' ? 'active' : ''}`}
                >
                    <IconFiles size={36} color={activeTab === 'bills' ? 'var(--md-sys-color-on-secondary-container)' : 'var(--md-sys-color-on-surface-variant)'} />
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: '700', fontSize: '0.925rem' }}>{t.bills}</div>
                        {showSubs && <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Bills List</div>}
                    </div>
                </button>

                <button
                    onClick={() => { switchTab('items'); }}
                    className={`coolie-hub-card ${activeTab === 'items' ? 'active' : ''}`}
                >
                    <IconBox size={36} color={activeTab === 'items' ? 'var(--md-sys-color-on-secondary-container)' : 'var(--md-sys-color-on-surface-variant)'} />
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: '700', fontSize: '0.925rem' }}>{t.itemsList}</div>
                        {showSubs && <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Items</div>}
                    </div>
                </button>

                <button
                    onClick={() => { switchTab('customers'); }}
                    className={`coolie-hub-card ${activeTab === 'customers' ? 'active' : ''}`}
                >
                    <IconUsers size={36} color={activeTab === 'customers' ? 'var(--md-sys-color-on-secondary-container)' : 'var(--md-sys-color-on-surface-variant)'} />
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: '700', fontSize: '0.925rem' }}>{t.coolieCustomers || t.customers || 'வணிகர்கள்'}</div>
                        {showSubs && <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Merchants</div>}
                    </div>
                </button>

                <button
                    onClick={() => { switchTab('business'); }}
                    className={`coolie-hub-card ${activeTab === 'business' ? 'active' : ''}`}
                >
                    <IconSettings size={36} color={activeTab === 'business' ? 'var(--md-sys-color-on-secondary-container)' : 'var(--md-sys-color-on-surface-variant)'} />
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: '700', fontSize: '0.925rem' }}>{t.settings}</div>
                        {showSubs && <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Settings</div>}
                    </div>
                </button>
            </div>
        </div>
    );

    return (
        <div className="layout-content-area" style={{ flex: 1, overflow: 'auto', background: 'transparent', padding: 0 }}>
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
