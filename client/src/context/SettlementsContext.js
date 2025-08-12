import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import io from 'socket.io-client';

const SettlementsContext = createContext();

export const useSettlements = () => useContext(SettlementsContext);

// Temporary global ref for dashboard refresh
let dashboardRefetchFn = null;
export const registerDashboardRefetch = (fn) => {
    dashboardRefetchFn = fn;
};
export const unregisterDashboardRefetch = () => {
    dashboardRefetchFn = null;
};

export const SettlementsProvider = ({ children }) => {
    const { user } = useAuth();
    const [settlements, setSettlements] = useState(null);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    const refetchSettlements = useCallback(async () => {
        if (!user) {
            setSettlements(null);
            setGroups([]);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const [settlementsRes, groupsRes] = await Promise.all([
                api.get('/settlements'),
                api.get('/groups')
            ]);
            setSettlements(settlementsRes.data);
            setGroups(groupsRes.data);
            console.log('Settlements refetched successfully'); // Debug log
        } catch (error) {
            console.error('Failed to fetch settlements data:', error);
            setSettlements(null);
            setGroups([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        refetchSettlements();
    }, [refetchSettlements]);

    // --- REAL-TIME LOGIC ---
    useEffect(() => {
        if (!user) return;

        const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001', {
            withCredentials: true, // Ensure cookies/auth are sent if needed
        });

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
            socket.emit('userConnected', user.id);
        });

        socket.on('settlementUpdated', (data) => {
            console.log('Settlement update received:', data); // Debug log
            refetchSettlements();

            // Also refresh dashboard if registered
            if (typeof dashboardRefetchFn === 'function') {
                console.log('Triggering dashboard refetch');
                dashboardRefetchFn();
            }
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        return () => {
            socket.off('settlementUpdated');
            socket.disconnect();
        };
    }, [user, refetchSettlements]);

    const value = {
        settlements,
        groups,
        loading,
        refetchSettlements,
        registerDashboardRefetch,
        unregisterDashboardRefetch
    };

    return (
        <SettlementsContext.Provider value={value}>
            {children}
        </SettlementsContext.Provider>
    );
};