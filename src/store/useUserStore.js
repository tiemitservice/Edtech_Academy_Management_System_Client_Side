import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
    state: () => ({
        user: null,
        permissions: []
    }),

    getters: {
        /**
         * Checks if the current user has the 'superadmin' role.
         * @param {object} state The store's state.
         * @returns {boolean} True if the user is a superadmin, false otherwise.
         */
        isSuperadmin(state) {
            return state.user?.role === 'superadmin';
        }
    },

    actions: {
        setUser(user) {
            this.user = user;
            this.permissions = this.normalizePermissions(user?.permissions || []);
        },

        /**
         * Normalizes permissions from the backend, which might be a JSON string
         * or a comma-separated string, into a flat array.
         * @param {Array<string>} rawPermissions The raw permissions array from the user object.
         * @returns {Array<string>} A flattened, unique array of permission strings.
         */
        normalizePermissions(rawPermissions) {
            const normalized = [];

            rawPermissions.forEach((perm) => {
                try {
                    // Handle permissions stored as a JSON string array (e.g., "[\"p1\",\"p2\"]")
                    if (perm.startsWith('[')) {
                        const parsed = JSON.parse(perm);
                        if (Array.isArray(parsed)) normalized.push(...parsed);
                        // Handle permissions stored as a simple comma-separated string
                    } else if (typeof perm === 'string') {
                        normalized.push(...perm.split(','));
                    }
                } catch (e) {
                    console.warn('Could not parse invalid permission entry:', perm);
                }
            });

            // Return a unique set of permissions
            return [...new Set(normalized)];
        },

        /**
         * Checks if the user has a specific permission.
         * @param {string} key The permission key to check for.
         * @returns {boolean} True if the user has the permission.
         */
        hasPermission(key) {
            return this.permissions.includes(key);
        }
    }
});
