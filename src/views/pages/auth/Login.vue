<template>
    <div>
        <FloatingConfigurator />
        <form @submit.prevent="handleLogin" class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                        <div class="text-center mb-8">
                            <img v-if="companyData && companyData.length > 0" :src="companyData[0]?.invoice_logo" alt="Company Logo" class="mb-8 h-24 w-auto shrink-0 mx-auto" />
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">{{ $t('login.welcome') }}</div>
                            <span class="text-muted-color font-medium">{{ $t('login.signInToContinue') }}</span>
                        </div>

                        <div>
                            <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">{{ $t('login.email') }}</label>
                            <InputText id="email1" type="text" :placeholder="$t('login.emailPlaceholder')" class="w-full md:w-[30rem] mb-8" v-model="email" />

                            <label for="password" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">{{ $t('login.password') }}</label>
                            <Password v-model="password" id="password" :placeholder="$t('login.passwordPlaceholder')" :toggleMask="true" class="mb-4" fluid :feedback="false"></Password>

                            <Button :disabled="loading" :label="loading ? $t('login.signInButtonLoading') : $t('login.signInButton')" class="w-full" type="submit"></Button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import url from '@/composible/api';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/useUserStore';
import { useFetch } from '@/composible/useFetch';
import { useI18n } from 'vue-i18n';

// --- Composables ---
const router = useRouter();
const userStore = useUserStore();
const { t } = useI18n();
const { data: companyData, fetchData: fetchCompanyData } = useFetch('companies');

// --- Component State ---
const email = ref('');
const password = ref('');
const loading = ref(false);
// --- Event Handlers ---
const handleLogin = async () => {
    try {
        loading.value = true;
        const response = await axios.post(`${url}/api/login`, {
            email: email.value,
            password: password.value
        });
        const { token, user } = response.data;

        localStorage.setItem('authToken', token);
        localStorage.setItem('authUser', JSON.stringify(user));

        userStore.setUser(user);
        router.push({ name: 'dashboard' });
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
};

// --- Lifecycle Hook ---
onMounted(async () => {
    await fetchCompanyData();
});
</script>

<style scoped>
.pi-eye,
.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}
</style>
