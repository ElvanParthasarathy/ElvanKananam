import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { IconTrash, IconPlus, IconEdit, IconX, IconSearch, IconRefresh } from '../common/Icons';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { showSubtitles } from '../../config/translations';

function CustomerManager({ t, language }) {
    const showSubs = showSubtitles(language);
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [filter, setFilter] = useState('');
    const [fetchingGst, setFetchingGst] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        company_name: '',
        gstin: '',
        place_of_supply: 'Tamil Nadu',
        address_line1: '',
        city: '',
        phone: '',
        email: '',
        type: 'silks'
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    async function fetchCustomers() {
        setLoading(true);
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('type', 'silks')
            .order('name', { ascending: true });

        if (error) console.error('Error fetching customers:', error);
        else setCustomers(data || []);
        setLoading(false);
    }

    const openModal = (customer = null) => {
        if (customer) {
            setEditingCustomer(customer);
            setFormData({
                name: customer.name || '',
                company_name: customer.company_name || '',
                gstin: customer.gstin || '',
                place_of_supply: customer.place_of_supply || 'Tamil Nadu',
                address_line1: customer.address_line1 || '',
                city: customer.city || '',
                phone: customer.phone || '',
                email: customer.email || '',
                type: 'silks'
            });
        } else {
            setEditingCustomer(null);
            setFormData({
                name: '',
                company_name: '',
                gstin: '',
                place_of_supply: 'Tamil Nadu',
                address_line1: '',
                city: '',
                phone: '',
                email: '',
                type: 'silks'
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name) {
            showToast(showSubs ? `${t.customerNameRequired || 'வணிகர் பெயர் தேவை'} / Merchant Name is required` : (t.customerNameRequired || 'வணிகர் பெயர் தேவை'), 'warning');
            return;
        }

        const payload = { ...formData, type: 'silks' };

        let error;
        if (editingCustomer) {
            const { error: updateError } = await supabase
                .from('customers')
                .update(payload)
                .eq('id', editingCustomer.id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase
                .from('customers')
                .insert([payload]);
            error = insertError;
        }

        if (error) {
            showToast(`${t.error || 'பிழை'}: ${error.message}`, 'error');
        } else {
            setIsModalOpen(false);
            fetchCustomers();
        }
    };

    const fetchGstDetails = async () => {
        if (!formData.gstin) {
            showToast(showSubs ? 'முதலில் GSTIN-ஐ உள்ளிடவும் / Please enter a GSTIN first' : 'முதலில் GSTIN-ஐ உள்ளிடவும்', 'warning');
            return;
        }

        setFetchingGst(true);
        // Simulation of GST API call
        setTimeout(() => {
            const gstin = formData.gstin.toUpperCase();
            const mockDb = {
                '33AAAAA0000A1Z5': { name: 'Sivaram', company_name: 'SRI SIVARAM SILK SAREES', city: 'Kanchipuram', state: 'Tamil Nadu', address: '123 Gandhi Road' },
                '33ABCDE1234F1Z5': { name: 'Test User', company_name: 'ELVAN TEXTILES', city: 'Salem', state: 'Tamil Nadu', address: '456 Textile Park' }
            };

            const result = mockDb[gstin];
            if (result) {
                setFormData(prev => ({
                    ...prev,
                    name: prev.name || result.name,
                    company_name: result.company_name,
                    city: result.city,
                    place_of_supply: result.state,
                    address_line1: result.address
                }));
            } else {
                showToast('GSTIN details not found in mock database. Try: 33AAAAA0000A1Z5', 'info');
            }
            setFetchingGst(false);
        }, 1200);
    };

    const handleDelete = async (id) => {
        const shouldDelete = await confirm({
            title: showSubs ? `${t.deleteCustomer || 'வணிகரை நீக்க'} / Delete Merchant` : (t.deleteCustomer || 'வணிகரை நீக்க'),
            message: showSubs
                ? `${t.deleteCustomerConfirm || 'நீங்கள் இந்த வணிகரை கண்டிப்பாக நீக்க விரும்புகிறீர்களா?'} \n(Are you sure you want to delete this merchant? This action cannot be undone.)`
                : (t.deleteCustomerConfirm || 'நீங்கள் இந்த வணிகரை கண்டிப்பாக நீக்க விரும்புகிறீர்களா?'),
            confirmText: showSubs ? `${t.delete || 'நீக்க'} / Delete` : (t.delete || 'நீக்க'),
            type: 'danger'
        });

        if (!shouldDelete) return;

        const { error } = await supabase
            .from('customers')
            .delete()
            .eq('id', id);

        if (error) {
            showToast(`${t.error || 'பிழை'}: ${error.message}`, 'error');
        } else {
            fetchCustomers();
        }
    };

    const filteredCustomers = customers.filter(c =>
        (c.name && c.name.toLowerCase().includes(filter.toLowerCase())) ||
        (c.company_name && c.company_name.toLowerCase().includes(filter.toLowerCase())) ||
        (c.gstin && c.gstin.toLowerCase().includes(filter.toLowerCase()))
    );

    return (
        <div style={{ padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontSize: '24px', margin: 0, color: 'var(--color-text)' }}>{t.silksCustomers || 'பட்டு வணிகர்கள்'}</h2>
                    {showSubs && <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Slks Merchants</span>}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ position: 'relative' }}>
                        <IconSearch size={16} style={{ position: 'absolute', left: '10px', top: '8px', color: 'var(--color-text-muted)' }} />
                        <input
                            type="text"
                            placeholder={showSubs ? `${t.searchPlaceholder || 'தேடுக…'} Search...` : (t.searchPlaceholder || 'தேடுக…')}
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            style={{ padding: '8px 10px 8px 30px', border: '1px solid var(--color-border)', borderRadius: '4px', height: '32px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                        />
                    </div>
                    <button
                        onClick={() => openModal()}
                        style={{ background: 'var(--color-brand-silks)', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', height: '32px' }}
                    >
                        <IconPlus size={16} />
                        <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
                            <div>{t.newCustomer || 'புதிய வணிகர்'}</div>
                            {showSubs && <div style={{ fontSize: '10px', fontWeight: 'normal', opacity: 0.9 }}>New Merchant</div>}
                        </div>
                    </button>
                </div>
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
                                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.company || 'நிறுவனம்'}</div>
                                {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Company / GSTIN</div>}
                            </th>
                            <th style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.city || 'ஊர்'}</div>
                                {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>City</div>}
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
                        ) : filteredCustomers.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--color-text)' }}>{t.noCustomers || 'வணிகர்கள் இல்லை'}</div>
                                        {showSubs && <div style={{ fontSize: '13px' }}>No merchants found.</div>}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredCustomers.map(customer => (
                                <tr key={customer.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <td style={{ padding: '12px 20px', color: 'var(--color-text)' }}>
                                        <div>{customer.name}</div>
                                        {showSubs && <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 'normal' }}>Merchant Name</div>}
                                    </td>
                                    <td style={{ padding: '12px 20px', color: 'var(--color-text)' }}>
                                        <div>{customer.company_name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{customer.gstin}</div>
                                    </td>
                                    <td style={{ padding: '12px 20px', color: 'var(--color-text)' }}>{customer.city}</td>
                                    <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => openModal(customer)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', marginRight: '10px' }}
                                        >
                                            <IconEdit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(customer.id)}
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
                    <div style={{ background: 'var(--color-surface)', padding: '20px', borderRadius: '5px', width: '500px', maxWidth: '90%', border: '1px solid var(--color-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ margin: 0, color: 'var(--color-text)', fontSize: '18px' }}>{editingCustomer ? (t.editMerchant || t.editCustomer || 'வணிகர் விவரங்களை மாற்றுக') : (t.newMerchant || t.newCustomer || 'புதிய வணிகர்')}</h3>
                                {showSubs && <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{editingCustomer ? 'Edit Merchant' : 'New Merchant'}</div>}
                            </div>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><IconX size={20} /></button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--color-text-muted)' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.primaryContact || 'முதன்மை தொடர்பு'} *</div>
                                    {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Primary Contact *</div>}
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '3px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                                />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--color-text-muted)' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.companyName || 'நிறுவன பெயர்'}</div>
                                    {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Company Name</div>}
                                </label>
                                <input
                                    type="text"
                                    value={formData.company_name}
                                    onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '3px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--color-text-muted)' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>GSTIN</div>
                                    {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>GSTIN</div>}
                                </label>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <input
                                        type="text"
                                        placeholder="33AAAAA0000A1Z5"
                                        value={formData.gstin}
                                        onChange={e => setFormData({ ...formData, gstin: e.target.value })}
                                        style={{ flex: 1, padding: '8px', border: '1px solid var(--color-border)', borderRadius: '3px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                                    />
                                    <button
                                        onClick={fetchGstDetails}
                                        disabled={fetchingGst}
                                        title="Fetch Business Name"
                                        style={{
                                            padding: '8px', background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                                            borderRadius: '3px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: fetchingGst ? '#ccc' : 'var(--color-text-primary)'
                                        }}
                                    >
                                        <IconRefresh size={16} className={fetchingGst ? 'spin' : ''} />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--color-text-muted)' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.city || 'ஊர்'}</div>
                                    {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>City</div>}
                                </label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '3px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                                />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--color-text-muted)' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.address || 'முகவரி'}</div>
                                    {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Address</div>}
                                </label>
                                <textarea
                                    value={formData.address_line1}
                                    onChange={e => setFormData({ ...formData, address_line1: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '3px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                                    rows={2}
                                />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--color-text-muted)' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.placeOfSupply || 'வழங்கும் இடம்'}</div>
                                    {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Place of Supply</div>}
                                </label>
                                <input
                                    type="text"
                                    value={formData.place_of_supply}
                                    onChange={e => setFormData({ ...formData, place_of_supply: e.target.value })}
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

export default CustomerManager;
