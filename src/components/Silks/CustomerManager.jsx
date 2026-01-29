import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { IconTrash, IconPlus, IconEdit, IconX, IconSearch, IconRefresh } from '../common/Icons';

function CustomerManager() {
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
        email: ''
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    async function fetchCustomers() {
        setLoading(true);
        const { data, error } = await supabase
            .from('customers')
            .select('*')
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
                email: customer.email || ''
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
                email: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name) {
            alert('Customer Name is required');
            return;
        }

        const payload = { ...formData };

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
            alert('Error saving customer: ' + error.message);
        } else {
            setIsModalOpen(false);
            fetchCustomers();
        }
    };

    const fetchGstDetails = async () => {
        if (!formData.gstin) {
            alert('Please enter a GSTIN first');
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
                alert('GSTIN details not found in mock database. Try: 33AAAAA0000A1Z5');
            }
            setFetchingGst(false);
        }, 1200);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this customer?')) return;

        const { error } = await supabase
            .from('customers')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Error deleting customer: ' + error.message);
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
                <h2 style={{ fontSize: '24px', margin: 0, color: 'var(--color-text)' }}>Customers</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ position: 'relative' }}>
                        <IconSearch size={16} style={{ position: 'absolute', left: '10px', top: '8px', color: 'var(--color-text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            style={{ padding: '8px 10px 8px 30px', border: '1px solid var(--color-border)', borderRadius: '4px', height: '32px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                        />
                    </div>
                    <button
                        onClick={() => openModal()}
                        style={{ background: 'var(--color-brand-silks)', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', height: '32px' }}
                    >
                        <IconPlus size={16} /> New Customer
                    </button>
                </div>
            </div>

            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                        <tr>
                            <th style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--color-text-muted)' }}>Primary Contact</th>
                            <th style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--color-text-muted)' }}>Company Name</th>
                            <th style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--color-text-muted)' }}>GSTIN</th>
                            <th style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--color-text-muted)' }}>City</th>
                            <th style={{ padding: '12px 20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading...</td></tr>
                        ) : filteredCustomers.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No customers found.</td></tr>
                        ) : (
                            filteredCustomers.map(customer => (
                                <tr key={customer.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <td style={{ padding: '12px 20px', color: 'var(--color-text)' }}>{customer.name}</td>
                                    <td style={{ padding: '12px 20px', color: 'var(--color-text)' }}>{customer.company_name}</td>
                                    <td style={{ padding: '12px 20px', color: 'var(--color-text)' }}>{customer.gstin}</td>
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
                            <h3 style={{ margin: 0, color: 'var(--color-text)' }}>{editingCustomer ? 'Edit Customer' : 'New Customer'}</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><IconX size={20} /></button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500', color: 'var(--color-text-muted)' }}>Primary Contact *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '3px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                                />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500', color: 'var(--color-text-muted)' }}>Company Name</label>
                                <input
                                    type="text"
                                    value={formData.company_name}
                                    onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '3px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500', color: 'var(--color-text-muted)' }}>GSTIN</label>
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
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500', color: 'var(--color-text-muted)' }}>City</label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '3px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                                />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500', color: 'var(--color-text-muted)' }}>Address</label>
                                <textarea
                                    value={formData.address_line1}
                                    onChange={e => setFormData({ ...formData, address_line1: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '3px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                                    rows={2}
                                />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500', color: 'var(--color-text-muted)' }}>Place of Supply</label>
                                <input
                                    type="text"
                                    value={formData.place_of_supply}
                                    onChange={e => setFormData({ ...formData, place_of_supply: e.target.value })}
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

export default CustomerManager;
