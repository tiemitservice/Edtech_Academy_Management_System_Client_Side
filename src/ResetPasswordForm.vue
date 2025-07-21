<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
        <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
            <div>
                <h2 class="text-2xl font-bold text-center text-gray-800">{{ $t('reset-password.title') }}</h2>
                <p class="mt-2 text-sm text-center text-gray-600">{{ $t('reset-password.subtitle') }}</p>
            </div>
            <form @submit.prevent="handleResetPassword" class="space-y-6">
                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700">{{ $t('reset-password.new_password') }}</label>
                    <Password id="password" v-model="password" fluid :placeholder="$t('reset-password.new_password_placeholder')" :feedback="true" toggleMask class="w-full mt-1" />
                    <small v-if="errors.password" class="text-red-500 mt-1">{{ errors.password }}</small>
                </div>
                <div>
                    <label for="confirmPassword" class="block text-sm font-medium text-gray-700">{{ $t('reset-password.confirm_password') }}</label>
                    <Password id="confirmPassword" v-model="confirmPassword" fluid :placeholder="$t('reset-password.confirm_password_placeholder')" :feedback="false" toggleMask class="w-full mt-1" />
                    <small v-if="errors.confirmPassword" class="text-red-500 mt-1">{{ errors.confirmPassword }}</small>
                </div>
                <div>
                    <Button type="submit" :label="loading ? $t('reset-password.resettings') : $t('reset-password.reset_button')" :loading="loading" class="w-full" />
                </div>
            </form>
        </div>
        <Toast position="top-right" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import Button from 'primevue/button';
import Password from 'primevue/password';
import Toast from 'primevue/toast';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const { t } = useI18n();

const password = ref('');
const confirmPassword = ref('');
const token = ref(null);
const loading = ref(false);
const errors = ref({});

// --- Translation Keys (for your language files) ---
/*

*/

const validateForm = () => {
    errors.value = {};
    if (!password.value) {
        errors.value.password = 'Password is required.';
    }
    if (password.value !== confirmPassword.value) {
        errors.value.confirmPassword = t('reset-password.password_mismatch');
    }
    return Object.keys(errors.value).length === 0;
};

const handleResetPassword = async () => {
    if (!validateForm()) {
        return;
    }
    if (!token.value) {
        toast.add({ severity: 'error', summary: t('reset-password.error_title'), detail: t('reset-password.token_missing'), life: 3000 });
        return;
    }

    loading.value = true;
    try {
        const url = `http://188.166.242.109:5000/api/reset-password/${token.value}`;

        await axios.patch(url, {
            newPassword: password.value,
            passwordConfirm: confirmPassword.value
        });

        toast.add({ severity: 'success', summary: t('reset-password.success_title'), detail: t('reset-password.success_detail'), life: 3000 });

        // Redirect to login page after a short delay
        setTimeout(() => {
            router.push('/login');
        }, 2000);
    } catch (error) {
        console.error('Reset password error:', error);
        const errorMessage = error.response?.data?.message || t('reset-password.error_detail');
        toast.add({ severity: 'error', summary: t('reset-password.error_title'), detail: errorMessage, life: 3000 });
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    // Extract the token from the URL when the component mounts
    token.value = route.params.token;
    console.log('====================================');
    console.log(`Reset Password Token: ${token.value}`);
    console.log('====================================');
});
</script>
