import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { IconTrash, IconPlus, IconEdit, IconX, IconSearch } from '../common/Icons';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { showSubtitles } from '../../config/translations';

function CoolieCustomerManager({ t, language }) {
    const showSubs = showSubtitles(language);
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

        if (error) console.error('Error fetching customers:', error);
        else {
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

    const filteredCustomers = customers.filter(c =>
        c.name?.toLowerCase().includes(filter.toLowerCase()) ||
        c.company_name?.toLowerCase().includes(filter.toLowerCase()) ||
        c.city?.toLowerCase().includes(filter.toLowerCase()) ||
        c.phone?.includes(filter)
    );

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
                    <h2 style={{ fontSize: isMobile ? '1.2rem' : '22px', fontWeight: '600', margin: 0, color: 'var(--color-text)' }}>{t.coolieCustomers}</h2>
                    {showSubs && <span style={{ fontSize: '13px', color: '#6b7280' }}>{t.merchantList}</span>}
                </div>

                <div style={{
                    display: 'flex',
                    gap: '10px',
                    width: isMobile ? '100%' : 'auto',
                    flexDirection: isMobile ? 'column' : 'row'
                }}>
                    <div className="autocomplete-wrapper" style={{ flex: 1 }}>
                        <IconSearch size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', zSubIndex: 10 }} />
                        <input
                            type="text"
                            placeholder={!showSubs ? t.searchCustomers : ''}
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            style={{
                                padding: '8px 12px 8px 36px',
                                borderRadius: '8px',
                                border: '1px solid var(--color-border)',
                                background: 'var(--color-surface)',
                                color: 'var(--color-text)',
                                width: '100%',
                                height: '44px'
                            }}
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
                        style={{
                            background: '#e65100',
                            color: 'white',
                            border: 'none',
                            padding: '8px 20px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            height: '44px',
                            justifyContent: 'center'
                        }}
                    >
                        <IconPlus size={20} />
                        <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
                            <div style={{ fontWeight: '700', fontSize: '13px' }}>{t.newMerchant}</div>
                            {showSubs && <div style={{ fontSize: '10px', fontWeight: '400', opacity: 0.9 }}>New Merchant</div>}
                        </div>
                    </button>
                </div>
            </div>

            {/* Desktop Table View */}
            {!isMobile && (
                <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                            <tr>
                                <th style={{ padding: '15px 20px', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text)' }}>{t.language}</div>
                                    {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Language</div>}
                                </th>
                                <th style={{ padding: '15px 20px', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text)' }}>{t.customerName}</div>
                                    {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Merchant Name</div>}
                                </th>
                                <th style={{ padding: '15px 20px', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text)' }}>{t.companyName}</div>
                                    {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Company Name</div>}
                                </th>
                                <th style={{ padding: '15px 20px', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text)' }}>{t.placeCity}</div>
                                    {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Place</div>}
                                </th>
                                <th style={{ padding: '15px 20px', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text)' }}>{t.address}</div>
                                    {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Address</div>}
                                </th>
                                <th style={{ padding: '15px 20px', width: '100px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text)' }}>{t.actions}</div>
                                    {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Actions</div>}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '16px', fontWeight: '500' }}>{t.loading}</span>
                                            {showSubs && <span style={{ fontSize: '13px', opacity: 0.8 }}>Loading...</span>}
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-text)' }}>{t.noMerchants}</div>
                                            {showSubs && <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>No merchants found in your database.</div>}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredCustomers.map(customer => {
                                    return (
                                        <React.Fragment key={customer.id}>
                                            <tr style={{ borderBottom: '1px solid var(--color-border-light)', background: 'var(--color-surface)' }}>
                                                <td style={{ padding: '12px 20px', color: 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: 'bold' }}>{t.tamil}</td>
                                                <td style={{ padding: '12px 20px', color: 'var(--color-text)' }}>{customer.name_tamil || '-'}</td>
                                                <td style={{ padding: '12px 20px', color: 'var(--color-text)' }}>{customer.company_name_tamil || '-'}</td>
                                                <td style={{ padding: '12px 20px', color: 'var(--color-text)' }}>{customer.city_tamil || '-'}</td>
                                                <td style={{ padding: '12px 20px', color: 'var(--color-text)' }}>{customer.address_tamil || '-'}</td>
                                                <td style={{ padding: '12px 20px', textAlign: 'center', verticalAlign: 'middle' }} rowSpan="2">
                                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                                        <button onClick={() => openModal(customer)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><IconEdit size={16} /></button>
                                                        <button onClick={() => handleDelete(customer.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)' }}><IconTrash size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr style={{ borderBottom: '2px solid var(--color-border)', background: 'var(--color-bg-subtle)' }}>
                                                <td style={{ padding: '12px 20px', color: 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: 'bold' }}>{t.english}</td>
                                                <td style={{ padding: '12px 20px', color: 'var(--color-text)' }}>{customer.name}</td>
                                                <td style={{ padding: '12px 20px', color: 'var(--color-text)' }}>{customer.company_name || '-'}</td>
                                                <td style={{ padding: '12px 20px', color: 'var(--color-text)' }}>{customer.city || '-'}</td>
                                                <td style={{ padding: '12px 20px', color: 'var(--color-text)' }}>{customer.address_line1 || '-'}</td>
                                            </tr>
                                        </React.Fragment>
                                    )
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
                        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                                <span style={{ fontSize: '15px', fontWeight: '600' }}>{t.loading}</span>
                                {showSubs && <span style={{ fontSize: '12px', opacity: 0.8 }}>Loading...</span>}
                            </div>
                        </div>
                    ) : filteredCustomers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                                <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--color-text)' }}>{t.noMerchants}</div>
                                {showSubs && <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>No merchants found in your database.</div>}
                            </div>
                        </div>
                    ) : (
                        filteredCustomers.map(customer => {
                            return (
                                <div key={customer.id} style={{
                                    background: 'var(--color-surface)',
                                    borderRadius: '12px',
                                    border: '1px solid var(--color-border)',
                                    padding: '16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            {customer.company_name_tamil && (
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontWeight: '700', fontSize: '16px', color: 'var(--color-primary)' }}>{customer.company_name_tamil}</span>
                                                    {showSubs && <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{customer.company_name}</span>}
                                                </div>
                                            )}
                                            {!customer.company_name_tamil && customer.company_name && (
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontWeight: '700', fontSize: '16px', color: 'var(--color-primary)' }}>{customer.company_name}</span>
                                                </div>
                                            )}

                                            {customer.name_tamil && (
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontWeight: '600', fontSize: '15px' }}>{customer.name_tamil}</span>
                                                    {showSubs && <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{customer.name}</span>}
                                                </div>
                                            )}
                                            {!customer.name_tamil && customer.name && (
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontWeight: '600', fontSize: '15px' }}>{customer.name}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => openModal(customer)} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '8px', color: 'var(--color-text-muted)' }}><IconEdit size={18} /></button>
                                            <button onClick={() => handleDelete(customer.id)} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '8px', color: 'var(--color-danger)' }}><IconTrash size={18} /></button>
                                        </div>
                                    </div>

                                    {(customer.city_tamil || customer.city) && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'var(--color-bg)', borderRadius: '8px' }}>
                                            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>📍</span>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: '13px', fontWeight: '600' }}>{customer.city_tamil || customer.city}</span>
                                                {showSubs && <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{customer.city}</span>}
                                            </div>
                                        </div>
                                    )}

                                    {customer.phone && (
                                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text)' }}>
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
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'var(--color-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
                    }}>
                        <div style={{
                            background: 'var(--color-surface)',
                            padding: isMobile ? '20px 15px' : '20px',
                            borderRadius: '12px',
                            width: '600px',
                            maxWidth: '90%',
                            border: '1px solid var(--color-border)',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ margin: 0, color: 'var(--color-text)', fontSize: '18px' }}>{editingCustomer ? t.editMerchant : t.newMerchant}</h3>
                                    {showSubs && <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{editingCustomer ? 'Edit Merchant' : 'New Merchant'}</span>}
                                </div>
                                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><IconX size={20} /></button>
                            </div>

                            {/* Profile Type Selector */}
                            <div style={{
                                display: 'flex',
                                gap: isMobile ? '5px' : '15px',
                                marginBottom: '20px',
                                padding: '10px',
                                background: 'var(--color-bg)',
                                borderRadius: '8px',
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
                                        color: 'var(--color-text)',
                                        flex: isMobile ? 'none' : 1,
                                        padding: isMobile ? '8px 0' : '0'
                                    }}>
                                        <input
                                            type="radio"
                                            checked={formData.profileType === option.type}
                                            onChange={() => setFormData({ ...formData, profileType: option.type })}
                                            style={{ accentColor: '#e65100', marginTop: '4px' }}
                                        />
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '14px', fontWeight: '600' }}>{option.tamil}</span>
                                            {showSubs && <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{option.english}</span>}
                                        </div>
                                    </label>
                                ))}
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                                gap: '15px'
                            }}>
                                {/* Company Block */}
                                {(formData.profileType === 'company' || formData.profileType === 'both') && (
                                    <>
                                        <div style={{ gridColumn: 'span 2', fontWeight: 600, color: 'var(--color-text-muted)', marginTop: '5px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                                                <span>{t.companyDetails}</span>
                                                {showSubs && <span style={{ fontSize: '11px', fontWeight: 'normal', color: 'var(--color-text-muted)' }}>Company Details</span>}
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                                                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.companyNameTamil}</div>
                                                {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Company Name (Tamil)</div>}
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.company_name_tamil}
                                                onChange={e => setFormData({ ...formData, company_name_tamil: e.target.value })}
                                                style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '3px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                                                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.companyNameEnglish || 'Company Name'}</div>
                                                {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Company Name (English)</div>}
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.company_name}
                                                onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                                                style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '3px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Customer Block */}
                                {(formData.profileType === 'individual' || formData.profileType === 'both') && (
                                    <>
                                        <div style={{ gridColumn: 'span 2', fontWeight: 600, color: 'var(--color-text-muted)', marginTop: '5px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                                                <span>{t.customerDetails}</span>
                                                {showSubs && <span style={{ fontSize: '11px', fontWeight: 'normal', color: 'var(--color-text-muted)' }}>Customer Details</span>}
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                                                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.customerNameTamil}</div>
                                                {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Customer Name (Tamil)</div>}
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
                                                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.customerNameEnglish || 'Customer Name'}</div>
                                                {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Customer Name (English)</div>}
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '3px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Location Block */}
                                <div style={{ gridColumn: 'span 2', fontWeight: 600, color: 'var(--color-text-muted)', marginTop: '5px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                                        <span>{t.location}</span>
                                        {showSubs && <span style={{ fontSize: '11px', fontWeight: 'normal', color: 'var(--color-text-muted)' }}>Location</span>}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.placeTamil}</div>
                                        {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Place (Tamil)</div>}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.city_tamil}
                                        onChange={e => setFormData({ ...formData, city_tamil: e.target.value })}
                                        style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '3px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.placeEnglish || 'Place'}</div>
                                        {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Place (English)</div>}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '3px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                                    />
                                </div>

                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.addressTamil}</div>
                                        {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Address (Tamil)</div>}
                                    </label>
                                    <textarea
                                        value={formData.address_tamil}
                                        onChange={e => setFormData({ ...formData, address_tamil: e.target.value })}
                                        style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '3px', background: 'var(--color-input-bg)', color: 'var(--color-text)', resize: 'vertical' }}
                                        rows={2}
                                    />
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.addressEnglish || 'Address'}</div>
                                        {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Address (English)</div>}
                                    </label>
                                    <textarea
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '3px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                                        rows={2}
                                    />
                                </div>
                            </div>

                            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 15px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer', color: 'var(--color-text)' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1.2' }}>
                                        <span>{t.cancel}</span>
                                        {showSubs && <span style={{ fontSize: '10px', opacity: 0.7 }}>Cancel</span>}
                                    </div>
                                </button>
                                <button onClick={handleSave} style={{ padding: '8px 15px', background: '#e65100', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1.2' }}>
                                        <span>{t.save}</span>
                                        {showSubs && <span style={{ fontSize: '10px', opacity: 0.9 }}>Save</span>}
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
