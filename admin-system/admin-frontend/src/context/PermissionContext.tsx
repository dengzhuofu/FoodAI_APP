import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface PermissionContextType {
    permissions: string[];
    setPermissions: (perms: string[]) => void;
    hasPermission: (perm: string) => boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider = ({ children }: { children: ReactNode }) => {
    const [permissions, setPermissions] = useState<string[]>([]);

    // Load from localStorage on init if available
    useEffect(() => {
        const stored = localStorage.getItem('permissions');
        if (stored) {
            try {
                setPermissions(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse permissions", e);
            }
        }
    }, []);

    const hasPermission = (perm: string) => {
        // Super admin bypass or check list
        // Assuming 'super_admin' role gives all permissions, but here we just check the list
        // If we want a super admin bypass, we should check roles too. 
        // For now, let's assume the backend returns ALL permissions for super admin in the list.
        return permissions.includes(perm);
    };

    const updatePermissions = (perms: string[]) => {
        setPermissions(perms);
        localStorage.setItem('permissions', JSON.stringify(perms));
    };

    return (
        <PermissionContext.Provider value={{ permissions, setPermissions: updatePermissions, hasPermission }}>
            {children}
        </PermissionContext.Provider>
    );
};

export const usePermissions = () => {
    const context = useContext(PermissionContext);
    if (!context) {
        throw new Error('usePermissions must be used within a PermissionProvider');
    }
    return context;
};
