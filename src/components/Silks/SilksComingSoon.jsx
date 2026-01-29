import React, { useEffect, useState } from 'react';
import { IconHome } from '../common/Icons';
import { supabase } from '../../config/supabaseClient';

function SilksComingSoon({ onHome, t }) {
    const [status, setStatus] = useState('loading'); // 'loading', 'connected', 'error'
    const [itemCount, setItemCount] = useState(0);

    useEffect(() => {
        async function checkConnection() {
            try {
                // Try to fetch items
                // Use count: 'exact', head: true to get just the count without downloading data
                const { count, error } = await supabase.from('items').select('*', { count: 'exact', head: true });

                if (error) {
                    console.error('Supabase Error:', error);
                    setStatus('error');
                } else {
                    setStatus('connected');
                    setItemCount(count || 0);
                }
            } catch (err) {
                console.error('Connection Error:', err);
                setStatus('error');
            }
        }
        checkConnection();
    }, []);

    return (
        <div className="editor-wrapper" style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            padding: '20px'
        }}>
            <div className="card" style={{ padding: '40px', maxWidth: '500px', width: '100%' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '10px', color: 'var(--color-primary)' }}>Sri Jaipriya Silks</h1>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: 'var(--color-text)' }}>Billing System</h2>

                <div style={{
                    background: 'var(--color-bg-alt)',
                    padding: '20px',
                    borderRadius: '16px',
                    marginBottom: '30px'
                }}>
                    <span style={{
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        color: 'var(--color-text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '2px'
                    }}>
                        Coming Soon
                    </span>
                    <p style={{ marginTop: '10px', opacity: 0.8 }}>
                        We are currently implementing the new invoice system with Supabase integration.
                    </p>

                    <div style={{ marginTop: '20px', padding: '15px', background: 'var(--color-bg)', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid var(--color-border)' }}>
                        {status === 'loading' && <span>Connecting to Database...</span>}
                        {status === 'connected' && <span style={{ color: 'var(--color-success, green)', fontWeight: 'bold' }}>✓ Database Connected ({itemCount} items found)</span>}
                        {status === 'error' && (
                            <div style={{ color: 'var(--color-danger, red)' }}>
                                <div>✗ Connection Failed</div>
                                <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>Make sure you ran the SQL Schema script!</div>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    className="btn btn-primary"
                    onClick={onHome}
                    style={{ width: '100%', justifyContent: 'center' }}
                >
                    <IconHome size={20} />
                    Back to Home
                </button>
            </div>
        </div>
    );
}

export default SilksComingSoon;
