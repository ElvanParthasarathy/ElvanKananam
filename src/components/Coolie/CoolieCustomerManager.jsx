import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { IconTrash, IconPlus, IconEdit, IconX, IconSearch } from '../common/Icons';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { showSubtitles } from '../../config/translations';

function CoolieCustomerManager({ t, language }) {
    const showSubs = showSubtitles(language);
    // Language-aware display: Tamil mode shows Tamil first, English/Tanglish shows English first
    const useTamilFirst = language === 'ta_mixed' || language === 'ta_only';
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [filter, setFilter] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Form State
    const [formData, setFormData] = useState({
        name: '', // Customer Name English
        name_tamil: '', // Customer Name Tamil
        company_name: '', // Company Name English
        company_name_tamil: '', // Company Name Tamil
        city: '', // Place English
        city_tamil: '', // Place Tamil
        address: '', // Address English
        address_tamil: '', // Address Tamil
        phone: '',
        type: 'coolie',
        profileType: 'individual' // 'individual' | 'company' | 'both'
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    async function fetchCustomers() {
        setLoading(true);
        const { data, error } = await supabase
            .from('coolie_customers')
            .select('*')
            .eq('type', 'coolie')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching customers:', error);
            setCustomers([]);
        } else {
            setCustomers(data || []);
        }
        setLoading(false);
    }

    const openModal = (customer = null) => {
        if (customer) {
            setEditingCustomer(customer);
            setFormData({
                name: customer.name || '',
                name_tamil: customer.name_tamil || '',
                company_name: customer.company_name || '',
                company_name_tamil: customer.company_name_tamil || '',
                city: customer.city || '',
                city_tamil: customer.city_tamil || '',
                address: customer.address_line1 || '',
                address_tamil: customer.address_tamil || '',
                phone: customer.phone || '',
                type: 'coolie',
                profileType: (customer.name && customer.company_name) ? 'both' : (customer.company_name ? 'company' : 'individual')
            });
        } else {
            setEditingCustomer(null);
            setFormData({
                name: '',
                name_tamil: '',
                company_name: '',
                company_name_tamil: '',
                city: '',
                city_tamil: '',
                address: '',
                address_tamil: '',
                phone: '',
                type: 'coolie',
                profileType: 'individual'
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name && !formData.company_name) {
            showToast(showSubs ? `${t.customerNameEnglish} or ${t.companyNameEnglish} ${t.required} / Customer Name or Company Name is required` : t.orgNameRequired, 'warning');
            return;
        }

        // Use Explicit Columns
        const dbPayload = {
            name: formData.name,
            name_tamil: formData.name_tamil,
            company_name: formData.company_name,
            company_name_tamil: formData.company_name_tamil,

            city: formData.city,
            city_tamil: formData.city_tamil,

            address_line1: formData.address,
            address_tamil: formData.address_tamil,

            phone: formData.phone,
            type: 'coolie'
        };

        let error;
        if (editingCustomer) {
            const { error: updateError } = await supabase
                .from('coolie_customers')
                .update(dbPayload)
                .eq('id', editingCustomer.id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase
                .from('coolie_customers')
                .insert([dbPayload]);
            error = insertError;
        }

        if (error) {
            showToast(`${t.error}: ${error.message}`, 'error');
        } else {
            setIsModalOpen(false);
            fetchCustomers();
        }
    };

    const handleDelete = async (id) => {
        const shouldDelete = await confirm({
            title: showSubs ? `${t.deleteMerchant} / Delete Merchant` : t.deleteMerchant,
            message: showSubs
                ? `${t.deleteMerchantConfirm} \n(Are you sure you want to delete this merchant?)`
                : t.deleteMerchantConfirm,
            confirmText: showSubs ? `${t.delete} / Delete` : t.delete,
            type: 'danger'
        });

        if (!shouldDelete) return;

        const { error } = await supabase
            .from('coolie_customers')
            .delete()
            .eq('id', id);

        if (error) {
            showToast(`${t.error}: ${error.message}`, 'error');
        } else {
            fetchCustomers();
        }
    };

    const filteredCustomers = customers.filter(c => {
        const needle = filter.toLowerCase().trim();
        if (!needle) return true;

        const haystack = [
            c.name,
            c.name_tamil,
            c.company_name,
            c.company_name_tamil,
            c.city,
            c.city_tamil,
            c.address_line1,
            c.address_tamil,
            c.phone
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

        return haystack.includes(needle);
    });

    return (
        <div style={{ padding: isMobile ? '16px' : '24px' }}>
            {/* Header & Search */}
            <div className="coolie-header-wrapper">
                <div className="coolie-title-group">
                    <h2 className="coolie-title">{t.coolieCustomers}</h2>
                    {showSubs && <span className="coolie-subtitle">{t.merchantList}</span>}
                </div>

                <div style={{
                    display: 'flex',
                    gap: '10px',
                    width: isMobile ? '100%' : 'auto',
                    flexDirection: isMobile ? 'column' : 'row'
                }}>
                    <div className="coolie-search-bar" style={{ width: '100%' }}>
                        <IconSearch size={16} color="var(--md-sys-color-on-surface-variant)" />
                        <input
                            type="text"
                            placeholder={!showSubs ? t.searchCustomers : ''}
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="coolie-search-input"
                        />
                        {showSubs && !filter && (
                            <div className="dual-placeholder-overlay" style={{ left: '36px' }}>
                                <span className="dual-placeholder-primary">{t.searchCustomers}</span>
                                <span className="dual-placeholder-sub">Search Merchants</span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="coolie-primary-btn"
                    >
                        <IconPlus size={20} />
                        <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
                            <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{t.newMerchant}</div>
                            {showSubs && <div style={{ fontSize: '0.7rem', fontWeight: '400', opacity: 0.9 }}>New Merchant</div>}
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
                                    <div>{t.customerName}</div>
                                    {showSubs && <div style={{ fontSize: '0.7rem', fontWeight: 'normal' }}>Merchant Name</div>}
                                </th>
                                <th>
                                    <div>{t.companyName}</div>
                                    {showSubs && <div style={{ fontSize: '0.7rem', fontWeight: 'normal' }}>Company Name</div>}
                                </th>
                                <th>
                                    <div>{t.placeCity}</div>
                                    {showSubs && <div style={{ fontSize: '0.7rem', fontWeight: 'normal' }}>Place</div>}
                                </th>
                                <th style={{ width: '100px', textAlign: 'center' }}>
                                    <div>{t.actions}</div>
                                    {showSubs && <div style={{ fontSize: '0.7rem', fontWeight: 'normal' }}>Actions</div>}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: 'var(--md-sys-color-on-surface-variant)' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '1rem', fontWeight: '500' }}>{t.loading}</span>
                                            {showSubs && <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Loading...</span>}
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="coolie-empty">
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--md-sys-color-on-surface)' }}>{t.noMerchants}</div>
                                            {showSubs && <div style={{ fontSize: '0.875rem', color: 'var(--md-sys-color-on-surface-variant)' }}>No merchants found in your database.</div>}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredCustomers.map(customer => {
                                    // Language-aware display
                                    const primaryName = useTamilFirst ? (customer.name_tamil || customer.name) : (customer.name || customer.name_tamil);
                                    const subtitleName = useTamilFirst ? customer.name : customer.name_tamil;
                                    const primaryCompany = useTamilFirst ? (customer.company_name_tamil || customer.company_name) : (customer.company_name || customer.company_name_tamil);
                                    const subtitleCompany = useTamilFirst ? customer.company_name : customer.company_name_tamil;
                                    const primaryCity = useTamilFirst ? (customer.city_tamil || customer.city) : (customer.city || customer.city_tamil);
                                    const subtitleCity = useTamilFirst ? customer.city : customer.city_tamil;

                                    return (
                                        <tr key={customer.id}>
                                            <td style={{ padding: '16px 20px' }}>
                                                <div style={{ fontWeight: '500', color: 'var(--md-sys-color-on-surface)' }}>{primaryName || '-'}</div>
                                                {showSubs && subtitleName && primaryName !== subtitleName && (
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '2px' }}>{subtitleName}</div>
                                                )}
                                            </td>
                                            <td style={{ padding: '16px 20px' }}>
                                                <div style={{ fontWeight: '500', color: 'var(--md-sys-color-on-surface)' }}>{primaryCompany || '-'}</div>
                                                {showSubs && subtitleCompany && primaryCompany !== subtitleCompany && (
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '2px' }}>{subtitleCompany}</div>
                                                )}
                                            </td>
                                            <td style={{ padding: '16px 20px' }}>
                                                <div style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>{primaryCity || '-'}</div>
                                                {showSubs && subtitleCity && primaryCity !== subtitleCity && (
                                                    <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '2px' }}>{subtitleCity}</div>
                                                )}
                                            </td>
                                            <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                                    <button
                                                        onClick={() => openModal(customer)}
                                                        className="coolie-table-btn-delete"
                                                        style={{ color: 'var(--md-sys-color-primary)', background: 'transparent' }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--md-sys-color-surface-container-highest)' }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                                                    >
                                                        <IconEdit size={18} />
                                                    </button>
                                                    <button onClick={() => handleDelete(customer.id)} className="coolie-table-btn-delete"><IconTrash size={18} /></button>
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
                            <span style={{ fontSize: '1rem', fontWeight: '500' }}>{t.loading}</span>
                            {showSubs && <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Loading...</span>}
                        </div>
                    ) : filteredCustomers.length === 0 ? (
                        <div className="coolie-empty">
                            <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--md-sys-color-on-surface)' }}>{t.noMerchants}</div>
                            {showSubs && <div style={{ fontSize: '0.875rem' }}>No merchants found in your database.</div>}
                        </div>
                    ) : (
                        filteredCustomers.map(customer => {
                            // Language-aware display
                            const primaryName = useTamilFirst ? (customer.name_tamil || customer.name) : (customer.name || customer.name_tamil);
                            const subtitleName = useTamilFirst ? customer.name : customer.name_tamil;
                            const primaryCompany = useTamilFirst ? (customer.company_name_tamil || customer.company_name) : (customer.company_name || customer.company_name_tamil);
                            const subtitleCompany = useTamilFirst ? customer.company_name : customer.company_name_tamil;
                            const primaryCity = useTamilFirst ? (customer.city_tamil || customer.city) : (customer.city || customer.city_tamil);
                            const subtitleCity = useTamilFirst ? customer.city : customer.city_tamil;

                            return (
                                <div key={customer.id} className="coolie-card" style={{ gap: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            {primaryCompany && (
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--md-sys-color-primary)' }}>{primaryCompany}</span>
                                                    {showSubs && subtitleCompany && primaryCompany !== subtitleCompany && (
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--md-sys-color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{subtitleCompany}</span>
                                                    )}
                                                </div>
                                            )}

                                            {primaryName && (
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontWeight: '600', fontSize: '0.925rem', color: 'var(--md-sys-color-on-surface)' }}>{primaryName}</span>
                                                    {showSubs && subtitleName && primaryName !== subtitleName && (
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--md-sys-color-on-surface-variant)' }}>{subtitleName}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => openModal(customer)} className="coolie-icon-btn"><IconEdit size={18} /></button>
                                            <button onClick={() => handleDelete(customer.id)} className="coolie-icon-btn danger"><IconTrash size={18} /></button>
                                        </div>
                                    </div>

                                    {primaryCity && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'var(--md-sys-color-surface-container-high)', borderRadius: '8px' }}>
                                            <span style={{ fontSize: '0.875rem', color: 'var(--md-sys-color-on-surface-variant)' }}>📍</span>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--md-sys-color-on-surface)' }}>{primaryCity}</span>
                                                {showSubs && subtitleCity && primaryCity !== subtitleCity && (
                                                    <span style={{ fontSize: '0.7rem', color: 'var(--md-sys-color-on-surface-variant)' }}>{subtitleCity}</span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {customer.phone && (
                                        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--md-sys-color-on-surface)' }}>
                                            📞 {customer.phone}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Modal */}
            {
                isModalOpen && (
                    <div className="coolie-overlay">
                        <div className="coolie-dialog" style={{ width: '600px' }}>
                            <div className="coolie-dialog-header">
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <h3 className="coolie-dialog-title" style={{ fontSize: '1.25rem', fontWeight: '600' }}>{editingCustomer ? t.editMerchant : t.newMerchant}</h3>
                                    {showSubs && <span style={{ fontSize: '0.8rem', color: 'var(--md-sys-color-on-surface-variant)' }}>{editingCustomer ? 'Edit Merchant' : 'New Merchant'}</span>}
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="coolie-icon-btn" style={{ width: '32px', height: '32px', background: 'transparent' }}><IconX size={24} /></button>
                            </div>

                            <div style={{ overflowY: 'auto', maxHeight: '70vh', padding: '1px' }}>
                                {/* Profile Type Selector */}
                                <div style={{
                                    display: 'flex',
                                    gap: isMobile ? '5px' : '15px',
                                    marginBottom: '20px',
                                    padding: '12px',
                                    background: 'var(--md-sys-color-surface-container-low)',
                                    borderRadius: '16px',
                                    flexDirection: isMobile ? 'column' : 'row'
                                }}>
                                    {[
                                        { type: 'individual', tamil: t.individual, english: 'Individual' },
                                        { type: 'company', tamil: t.company, english: 'Company' },
                                        { type: 'both', tamil: t.both, english: 'Company + Individual' }
                                    ].map(option => (
                                        <label key={option.type} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            cursor: 'pointer',
                                            color: 'var(--md-sys-color-on-surface)',
                                            flex: isMobile ? 'none' : 1,
                                            padding: isMobile ? '8px 0' : '0'
                                        }}>
                                            <input
                                                type="radio"
                                                checked={formData.profileType === option.type}
                                                onChange={() => setFormData({ ...formData, profileType: option.type })}
                                                style={{ accentColor: 'var(--md-sys-color-primary)', width: '18px', height: '18px' }}
                                            />
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{option.tamil}</span>
                                                {showSubs && <span style={{ fontSize: '0.75rem', color: 'var(--md-sys-color-on-surface-variant)' }}>{option.english}</span>}
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                                    gap: '16px'
                                }}>
                                    {/* Company Block */}
                                    {(formData.profileType === 'company' || formData.profileType === 'both') && (
                                        <>
                                            <div style={{ gridColumn: 'span 2', fontWeight: 600, color: 'var(--md-sys-color-primary)', marginTop: '8px' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                                                    <span>{t.companyDetails}</span>
                                                    {showSubs && <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--md-sys-color-on-surface-variant)' }}>Company Details</span>}
                                                </div>
                                            </div>
                                            <div className="coolie-input-group">
                                                <label className="coolie-label">
                                                    <div>{t.companyNameTamil}</div>
                                                    {showSubs && <div style={{ fontSize: '0.7rem', fontWeight: 'normal', opacity: 0.8 }}>Company Name (Tamil)</div>}
                                                </label>
                                                <input
                                                    type="text"
                                                    className="coolie-input-field"
                                                    value={formData.company_name_tamil}
                                                    onChange={e => setFormData({ ...formData, company_name_tamil: e.target.value })}
                                                />
                                            </div>
                                            <div className="coolie-input-group">
                                                <label className="coolie-label">
                                                    <div>{t.companyNameEnglish || 'Company Name'}</div>
                                                    {showSubs && <div style={{ fontSize: '0.7rem', fontWeight: 'normal', opacity: 0.8 }}>Company Name (English)</div>}
                                                </label>
                                                <input
                                                    type="text"
                                                    className="coolie-input-field"
                                                    value={formData.company_name}
                                                    onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* Customer Block */}
                                    {(formData.profileType === 'individual' || formData.profileType === 'both') && (
                                        <>
                                            <div style={{ gridColumn: 'span 2', fontWeight: 600, color: 'var(--md-sys-color-primary)', marginTop: '8px' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                                                    <span>{t.customerDetails}</span>
                                                    {showSubs && <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--md-sys-color-on-surface-variant)' }}>Customer Details</span>}
                                                </div>
                                            </div>
                                            <div className="coolie-input-group">
                                                <label className="coolie-label">
                                                    <div>{t.customerNameTamil}</div>
                                                    {showSubs && <div style={{ fontSize: '0.7rem', fontWeight: 'normal', opacity: 0.8 }}>Customer Name (Tamil)</div>}
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
                                                    <div>{t.customerNameEnglish || 'Customer Name'}</div>
                                                    {showSubs && <div style={{ fontSize: '0.7rem', fontWeight: 'normal', opacity: 0.8 }}>Customer Name (English)</div>}
                                                </label>
                                                <input
                                                    type="text"
                                                    className="coolie-input-field"
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* Location Block */}
                                    <div style={{ gridColumn: 'span 2', fontWeight: 600, color: 'var(--md-sys-color-primary)', marginTop: '8px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                                            <span>{t.location}</span>
                                            {showSubs && <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--md-sys-color-on-surface-variant)' }}>Location</span>}
                                        </div>
                                    </div>
                                    <div className="coolie-input-group">
                                        <label className="coolie-label">
                                            <div>{t.placeTamil}</div>
                                            {showSubs && <div style={{ fontSize: '0.7rem', fontWeight: 'normal', opacity: 0.8 }}>Place (Tamil)</div>}
                                        </label>
                                        <input
                                            type="text"
                                            className="coolie-input-field"
                                            value={formData.city_tamil}
                                            onChange={e => setFormData({ ...formData, city_tamil: e.target.value })}
                                        />
                                    </div>
                                    <div className="coolie-input-group">
                                        <label className="coolie-label">
                                            <div>{t.placeEnglish || 'Place'}</div>
                                            {showSubs && <div style={{ fontSize: '0.7rem', fontWeight: 'normal', opacity: 0.8 }}>Place (English)</div>}
                                        </label>
                                        <input
                                            type="text"
                                            className="coolie-input-field"
                                            value={formData.city}
                                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        />
                                    </div>

                                    <div style={{ gridColumn: 'span 2' }}>
                                        <div className="coolie-input-group">
                                            <label className="coolie-label">
                                                <div>{t.addressTamil}</div>
                                                {showSubs && <div style={{ fontSize: '0.7rem', fontWeight: 'normal', opacity: 0.8 }}>Address (Tamil)</div>}
                                            </label>
                                            <textarea
                                                className="coolie-input-field"
                                                value={formData.address_tamil}
                                                onChange={e => setFormData({ ...formData, address_tamil: e.target.value })}
                                                rows={2}
                                                style={{ resize: 'vertical' }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <div className="coolie-input-group">
                                            <label className="coolie-label">
                                                <div>{t.addressEnglish || 'Address'}</div>
                                                {showSubs && <div style={{ fontSize: '0.7rem', fontWeight: 'normal', opacity: 0.8 }}>Address (English)</div>}
                                            </label>
                                            <textarea
                                                className="coolie-input-field"
                                                value={formData.address}
                                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                                rows={2}
                                                style={{ resize: 'vertical' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="coolie-dialog-actions">
                                <button onClick={() => setIsModalOpen(false)} className="coolie-text-btn">
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1.2' }}>
                                        <span>{t.cancel}</span>
                                        {showSubs && <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>Cancel</span>}
                                    </div>
                                </button>
                                <button onClick={handleSave} className="coolie-primary-btn" style={{ height: '48px', padding: '0 24px', width: 'auto' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1.2' }}>
                                        <span>{t.save}</span>
                                        {showSubs && <span style={{ fontSize: '0.65rem', opacity: 0.9 }}>Save</span>}
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

export default CoolieCustomerManager;
