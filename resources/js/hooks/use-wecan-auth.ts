import { usePage } from '@inertiajs/react';
import type { WeCanPageProps } from '@/types/wecan';

/**
 * Returns roles, permissions and access state from Inertia shared data.
 * Matches the project's existing hook style (use-*.ts).
 */
export function useWeCanAuth() {
    const { auth, userRoles, userPermissions, hasAccess } =
        usePage<WeCanPageProps>().props;

    return {
        user: auth.user,
        roles: userRoles ?? [],
        permissions: userPermissions ?? [],
        hasAccess: hasAccess ?? false,
        isAdmin: (userRoles ?? []).includes('admin'),
        isStudent: (userRoles ?? []).includes('student'),
        can: (permission: string) =>
            (userPermissions ?? []).includes(permission),
    };
}
