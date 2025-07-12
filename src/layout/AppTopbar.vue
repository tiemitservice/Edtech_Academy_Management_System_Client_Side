<template>
    <div class="layout-topbar hidden-print">
        <div class="layout-topbar-logo-container flex items-center">
            <button class="layout-menu-button layout-topbar-action" @click="toggleMenu">
                <i class="pi pi-bars"></i>
            </button>
            <router-link to="/" class="layout-topbar-logo">
                <div class="text-center">
                    <p class="font-semibold text-primary text-2xl">{{ data && data.length > 0 ? data[0].name : 'School Name' }}</p>
                </div>
            </router-link>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content flex items-center gap-2">
                    <!-- Language Switcher -->
                    <Select v-model="selectedLanguage" :options="languages" optionLabel="name" @change="changeLanguage" class="w-32">
                        <template #value="slotProps">
                            <div v-if="slotProps.value" class="flex items-center">
                                <i :class="slotProps.value.icon" class="mr-2"></i>
                                <div>{{ slotProps.value.name }}</div>
                            </div>
                            <span v-else>
                                {{ slotProps.placeholder }}
                            </span>
                        </template>
                        <template #option="slotProps">
                            <div class="flex items-center">
                                <i :class="slotProps.option.icon" class="mr-2"></i>
                                <div>{{ slotProps.option.name }}</div>
                            </div>
                        </template>
                    </Select>

                    <span class="font-semibold text-primary px-2">
                        {{ user?.name }}
                    </span>

                    <router-link to="/profile" class="layout-topbar-action rounded-full overflow-hidden !size-10 flex items-center justify-center">
                        <img v-if="user?.image" :src="user.image" alt="User Profile" class="w-full h-full object-cover" />
                        <div v-else class="rounded-full border size-10 border-primary flex items-center justify-center">
                            <i class="pi pi-user size-5 object-cover"></i>
                        </div>
                    </router-link>

                    <Button plain @click="handleLogout" class="rounded-full overflow-hidden !size-10">
                        <i class="pi pi-sign-out text-2xl"></i>
                    </Button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useLayout } from '@/layout/composables/layout';
import useAuth from '@/composible/useAuth';
import { useRouter } from 'vue-router';
import { useFetch } from '@/composible/useFetch';
import { onMounted, ref } from 'vue';
// **FIX:** Import vue-i18n to handle translations
import { useI18n } from 'vue-i18n';

const { data, fetchData } = useFetch('companies');

const { toggleMenu } = useLayout();
const { user, logout } = useAuth();
const router = useRouter();
// **FIX:** Get the locale instance from vue-i18n
const { locale } = useI18n();

const handleLogout = () => {
    logout();
    router.push('/auth/login');
};

// --- Language Switcher Logic ---
const languages = ref([
    { name: 'English', code: 'en', icon: 'pi pi-globe' },
    { name: 'ខ្មែរ', code: 'km', icon: 'pi pi-globe' }
]);

// Set the initial selected language based on the current i18n locale
const selectedLanguage = ref(languages.value.find((l) => l.code === locale.value));

const changeLanguage = (event) => {
    const newLang = event.value;
    if (newLang) {
        // **FIX:** Update the i18n locale to trigger translations
        locale.value = newLang.code;
        // **FIX:** Store the preference in localStorage to persist it across sessions
        localStorage.setItem('preferredLanguage', newLang.code);
    }
};

// On component mount, check for a saved language preference
onMounted(async () => {
    await fetchData();
    const savedLangCode = localStorage.getItem('preferredLanguage') || 'en'; // Default to English
    const savedLang = languages.value.find((l) => l.code === savedLangCode);
    if (savedLang) {
        selectedLanguage.value = savedLang;
        locale.value = savedLang.code;
    }
});
</script>

<style lang="scss" scoped>
/* Add any additional styles if needed */
</style>
