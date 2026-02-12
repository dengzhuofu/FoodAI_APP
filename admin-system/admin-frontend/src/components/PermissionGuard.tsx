import React, { ReactNode } from 'react';
import { usePermissions } from '../context/PermissionContext';

interface PermissionGuardProps {
    permission: string;
    children: ReactNode;
    fallback?: ReactNode;
}

const PermissionGuard = ({ permission, children, fallback = null }: PermissionGuardProps) => {
    const { hasPermission } = usePermissions();

    if (!hasPermission(permission)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};

export default PermissionGuard;
