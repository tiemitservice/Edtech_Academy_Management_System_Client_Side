// stores/useUserStore.js
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
    state: () => ({
        user: null,
        permissions: []
    }),

    actions: {
        setUser(user) {
            this.user = user;
            this.permissions = this.normalizePermissions(user?.permissions || []);
        },

        normalizePermissions(rawPermissions) {
            const normalized = [];

            rawPermissions.forEach((perm) => {
                try {
                    if (perm.startsWith('[')) {
                        const parsed = JSON.parse(perm);
                        if (Array.isArray(parsed)) normalized.push(...parsed);
                    } else if (typeof perm === 'string') {
                        normalized.push(...perm.split(','));
                    }
                } catch (e) {
                    console.warn('Invalid permission entry:', perm);
                }
            });

            return [...new Set(normalized)]; // remove duplicates
        },

        hasPermission(key) {
            return this.permissions.includes(key);
        }
    }
});
