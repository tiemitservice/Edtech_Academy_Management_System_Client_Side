<script setup>
import { useLayout } from '@/layout/composables/layout';
import useAuth from '@/composible/useAuth';
import { useRouter } from 'vue-router';
import { Button } from 'primevue';
const { toggleMenu, toggleDarkMode, isDarkTheme } = useLayout();
const { user, logout } = useAuth();
const router = useRouter();
const handleLogout = () => {
    logout();
    router.push('/auth/login');
};
console.log('====================================');
console.log(user.value);
console.log('====================================');
</script>

<template>
    <div class="layout-topbar hidden-print">
        <div class="layout-topbar-logo-container flex items-center">
            <button class="layout-menu-button layout-topbar-action" @click="toggleMenu">
                <i class="pi pi-bars"></i>
            </button>
            <router-link to="/" class="layout-topbar-logo">
                <div class="text-center">
                    <p class="font-semibold text-primary text-2xl">អ៊ែដធិច អាខាឌឺមី</p>
                </div>
            </router-link>
        </div>

        <div class="layout-topbar-actions">
            <!-- <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
                    <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button>
                <div class="relative">
                    <button
                        v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
                        type="button"
                        class="layout-topbar-action layout-topbar-action-highlight"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <AppConfigurator />
                </div>
            </div> -->

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content flex items-center">
                    <span class="font-semibold text-primary px-2">
                        {{ user?.name }}
                    </span>

                    <router-link to="/profile" class="layout-topbar-action rounded-full overflow-hidden !size-10">
                        <img :src="user?.image" alt="" />
                    </router-link>

                    <Button plain @click="handleLogout" class="rounded-full overflow-hidden !size-10">
                        <i class="pi pi-sign-out text-2xl"></i>
                    </Button>
                </div>
            </div>
        </div>
    </div>
</template>
