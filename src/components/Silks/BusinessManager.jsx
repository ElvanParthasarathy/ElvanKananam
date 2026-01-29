import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { IconSave } from '../common/Icons';

function BusinessManager() {
    const [loading, setLoading] = useState(true);
    const [profileId, setProfileId] = useState(null);
    const [formData, setFormData] = useState({
        organization_name: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: 'Tamil Nadu',
        pincode: '',
        phone: '',
        email: '',
        gstin: '',
        website: '',
        marketing_title: '',
        logo: '',
        cgst_rate: 2.5,
        sgst_rate: 2.5
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    async function fetchProfile() {
        setLoading(true);
        // Assuming single organization profile for now or fetch first one
        const { data, error } = await supabase
            .from('organization_profile')
            .select('*')
            .limit(1)
            .single();

        if (error) {
            console.log('No profile found or error:', error.message);
            // It's okay if not found, we will create one on save
        } else if (data) {
            setProfileId(data.id);
            setFormData({
                organization_name: data.organization_name || '',
                address_line1: data.address_line1 || '',
                address_line2: data.address_line2 || '',
                city: data.city || '',
                state: data.state || 'Tamil Nadu',
                pincode: data.pincode || '',
                phone: data.phone || '',
                email: data.email || '',
                gstin: data.gstin || '',
                website: data.website || '',
                marketing_title: data.marketing_title || '',
                logo: data.logo || '',
                cgst_rate: data.cgst_rate || 2.5,
                sgst_rate: data.sgst_rate || 2.5
            });
        }
        setLoading(false);
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, logo: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!formData.organization_name) {
            alert('Organization Name is required');
            return;
        }

        const payload = { ...formData };

        let error;
        if (profileId) {
            const { error: updateError } = await supabase
                .from('organization_profile')
                .update(payload)
                .eq('id', profileId);
            error = updateError;
        } else {
            const { data, error: insertError } = await supabase
                .from('organization_profile')
                .insert([payload])
                .select()
                .single();
            error = insertError;
            if (data) setProfileId(data.id);
        }

        if (error) {
            alert('Error saving profile: ' + error.message);
        } else {
            alert('Organization Profile Saved Successfully');
        }
    };

    if (loading) return <div style={{ padding: '30px' }}>Loading Profile...</div>;

    return (
        <div style={{ padding: '30px', maxWidth: '800px' }}>
            <h2 style={{ fontSize: '24px', margin: '0 0 20px 0', color: 'var(--color-text)' }}>Organization Profile</h2>

            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '30px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                    {/* Logo Upload Section */}
                    <div style={{ gridColumn: 'span 2', marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--color-text-muted)' }}>Organization Logo</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            {formData.logo && (
                                <img
                                    src={formData.logo}
                                    alt="Logo Preview"
                                    style={{ height: '80px', maxWidth: '200px', objectFit: 'contain', border: '1px solid #eee', padding: '5px' }}
                                />
                            )}
                            <input
                                type="file"
                                accept="image/png, image/jpeg, image/svg+xml"
                                onChange={handleLogoChange}
                                style={{
                                    padding: '10px',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '4px',
                                    background: 'var(--color-input-bg)',
                                    color: 'var(--color-text)'
                                }}
                            />
                        </div>
                        <p style={{ fontSize: '12px', color: '#777', marginTop: '5px' }}>Ideally a transparent PNG.</p>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--color-text-muted)' }}>Organization Name *</label>
                        <input
                            type="text"
                            name="organization_name"
                            value={formData.organization_name}
                            onChange={handleChange}
                            className="input-field"
                            style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                        />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--color-text-muted)' }}>Marketing Title (e.g. Handloom Silk Sarees & Rawsilk)</label>
                        <input
                            type="text"
                            name="marketing_title"
                            value={formData.marketing_title}
                            onChange={handleChange}
                            className="input-field"
                            style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                        />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <h3 style={{ fontSize: '16px', margin: '10px 0', borderBottom: '1px solid var(--color-border)', paddingBottom: '5px', color: 'var(--color-text-muted)' }}>Address</h3>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--color-text-muted)' }}>Street 1</label>
                        <input
                            type="text"
                            name="address_line1"
                            value={formData.address_line1}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--color-text-muted)' }}>Street 2</label>
                        <input
                            type="text"
                            name="address_line2"
                            value={formData.address_line2}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--color-text-muted)' }}>City</label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--color-text-muted)' }}>State</label>
                        <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--color-text-muted)' }}>Pincode</label>
                        <input
                            type="text"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                        />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <h3 style={{ fontSize: '16px', margin: '10px 0', borderBottom: '1px solid var(--color-border)', paddingBottom: '5px', color: 'var(--color-text-muted)' }}>Additional Info</h3>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--color-text-muted)' }}>Phone</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--color-text-muted)' }}>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--color-text-muted)' }}>GSTIN</label>
                        <input
                            type="text"
                            name="gstin"
                            value={formData.gstin}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--color-text-muted)' }}>Website</label>
                        <input
                            type="text"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                        />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <h3 style={{ fontSize: '16px', margin: '10px 0', borderBottom: '1px solid var(--color-border)', paddingBottom: '5px', color: 'var(--color-text-muted)' }}>Tax Configuration</h3>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--color-text-muted)' }}>Default CGST (%)</label>
                        <input
                            type="number"
                            step="0.01"
                            name="cgst_rate"
                            value={formData.cgst_rate}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--color-text-muted)' }}>Default SGST (%)</label>
                        <input
                            type="number"
                            step="0.01"
                            name="sgst_rate"
                            value={formData.sgst_rate}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                        />
                    </div>

                    <div style={{ gridColumn: 'span 2', marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            onClick={handleSave}
                            style={{
                                background: 'var(--color-brand-silks)', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '4px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px'
                            }}
                        >
                            <IconSave size={18} /> Save Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BusinessManager;
