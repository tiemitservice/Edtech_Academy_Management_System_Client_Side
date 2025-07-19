<template>
    <div class="w-full mx-auto">
        <div class="flex items-center justify-center">
            <form @submit.prevent="handleChangePassword" class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-4 text-center w-full max-w-md">
                <h2 class="text-xl font-semibold mb-4">{{ $t('reset_password.change_password') }}</h2>

                <!-- Current Password -->
                <InputText
                    v-model="form.currentPassword"
                    type="password"
                    :placeholder="$t('reset_password.current_password')"
                    :label="$t('reset_password.current_password')"
                    name="currentPassword"
                    id="currentPassword"
                    required
                    autocomplete="current-password"
                    placeholder=""
                    class="w-full border px-3 py-2 rounded"
                />

                <!-- New Password -->
                <InputText
                    v-model="form.newPassword"
                    type="password"
                    :placeholder="$t('reset_password.new_password')"
                    :label="$t('reset_password.new_password')"
                    name="newPassword"
                    id="newPassword"
                    required
                    autocomplete="new-password"
                    class="w-full border px-3 py-2 rounded"
                />

                <!-- Confirm Password -->
                <InputText
                    v-model="form.confirmPassword"
                    type="password"
                    :placeholder="$t('reset_password.confirm_password')"
                    :label="$t('reset_password.confirm_password')"
                    name="confirmPassword"
                    id="confirmPassword"
                    required
                    autocomplete="Confirm New Password"
                    class="w-full border px-3 py-2 rounded"
                />

                <!-- Submit Button -->
                <Button type="submit" class="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded w-full" :disabled="loading">
                    {{ loading ? $t('reset_password.updating') : $t('reset_password.change_password') }}
                </Button>

                <!-- Success & Error Messages -->
                <p v-if="successMessage" class="text-green-600 text-sm">
                    {{ successMessage }}
                </p>
                <p v-if="errorMessage" class="text-red-500 text-sm">
                    {{ errorMessage }}
                </p>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import axios from 'axios';

const form = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
});

const token = ref(localStorage.getItem('authToken')); // 🔐 Grab token from storage
const loading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const handleChangePassword = async () => {
    errorMessage.value = '';
    successMessage.value = '';

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
        errorMessage.value = 'All fields are required.';
        return;
    }

    if (form.newPassword !== form.confirmPassword) {
        errorMessage.value = 'Passwords do not match.';
        return;
    }

    loading.value = true;
    try {
        const res = await axios.patch('http://localhost:5000/api/change-password', {
            token: token.value, // 🔐 Include token in body
            currentPassword: form.currentPassword,
            newPassword: form.newPassword
        });

        successMessage.value = res.data.message || 'Password changed successfully.';
        form.currentPassword = '';
        form.newPassword = '';
        form.confirmPassword = '';
    } catch (err) {
        errorMessage.value = err.response?.data?.error || 'Password change failed.';
    } finally {
        loading.value = false;
    }
};
</script>
