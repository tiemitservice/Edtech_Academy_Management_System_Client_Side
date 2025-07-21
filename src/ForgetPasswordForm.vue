<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
        <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
            <div>
                <h2 class="text-2xl font-bold text-center text-gray-800">{{ $t('forgot_password.title') }}</h2>
                <p class="mt-2 text-sm text-center text-gray-600">{{ $t('forgot_password.subtitle') }}</p>
            </div>
            <form @submit.prevent="handleForgotPassword" class="space-y-6">
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700">{{ $t('forgot_password.email_label') }}</label>
                    <InputText id="email" v-model="email" type="email" :placeholder="$t('forgot_password.email_placeholder')" class="w-full mt-1" required />
                </div>
                <div>
                    <Button type="submit" :label="loading ? $t('forgot_password.sending') : $t('forgot_password.send_link_button')" :loading="loading" class="w-full" />
                </div>
                <div class="text-center">
                    <router-link to="/auth/login" class="text-sm font-medium text-primary hover:underline">
                        {{ $t('forgot_password.back_to_login') }}
                    </router-link>
                </div>
            </form>
        </div>
        <Toast position="top-right" />
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Toast from 'primevue/toast';

const toast = useToast();
const { t } = useI18n();

const email = ref('');
const loading = ref(false);

const handleForgotPassword = async () => {
    if (!email.value) {
        return;
    }

    loading.value = true;
    try {
        // const url = `http://localhost:5000/api/forget-password`;
        const url = `http://188.166.242.109:5000/api/forget-password`;
        await axios.post(url, {
            email: email.value
        });

        // For security reasons, show a generic success message whether the email exists or not.
        toast.add({
            severity: 'success',
            summary: t('forgot_password.success_title'),
            detail: t('forgot_password.success_detail'),
            life: 5000
        });
        email.value = ''; // Clear the input field
    } catch (error) {
        console.error('Forgot password error:', error);
        // Also show a generic message on error to prevent email enumeration
        toast.add({
            severity: 'success',
            summary: t('forgot_password.success_title'),
            detail: t('forgot_password.success_detail'),
            life: 5000
        });
    } finally {
        loading.value = false;
    }
};
</script>
