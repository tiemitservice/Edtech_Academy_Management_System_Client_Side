<template>
    <div>
        <FloatingConfigurator />
        <form @submit.prevent="handleRegister" class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                        <div class="text-center mb-8">
                            <img v-if="companyData && companyData.length > 0" :src="companyData[0]?.invoice_logo" alt="Company Logo" class="mb-8 h-24 w-auto shrink-0 mx-auto" />
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Create an Account</div>
                            <span class="text-muted-color font-medium">Create your account to get started</span>
                        </div>

                        <div>
                            <label for="name" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Name</label>
                            <InputText id="name" type="text" placeholder="Your Name" class="w-full md:w-[30rem] mb-8" v-model="name" />

                            <label for="email" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
                            <InputText id="email" type="email" placeholder="Email address" class="w-full md:w-[30rem] mb-8" v-model="email" />

                            <label for="password" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Password</label>
                            <Password v-model="password" id="password" placeholder="Password" :toggleMask="true" class="mb-4" fluid :feedback="false"></Password>

                            <Button :disabled="loading" :label="loading ? 'Creating Account...' : 'Create Account'" class="w-full" type="submit"></Button>

                            <div class="text-center mt-4">
                                <span class="text-muted-color">Already have an account? </span>
                                <router-link to="/login" class="font-medium text-primary-500 hover:underline">Sign In</router-link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
        <Toast position="top-right" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import url from '@/composible/api';
import { useRouter } from 'vue-router';
import { useFetch } from '@/composible/useFetch';
import { useToast } from 'primevue/usetoast';

// PrimeVue components
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Toast from 'primevue/toast';

// --- Composables ---
const router = useRouter();
const toast = useToast();
const { data: companyData, fetchData: fetchCompanyData } = useFetch('companies');

// --- Component State ---
const name = ref('');
const email = ref('');
const password = ref('');
const loading = ref(false);

// --- Default Permissions and Modules for Superadmin ---
const defaultPermissions = ref([
    '"classes:create","classes:read","classes:update","classes:delete","class transaction:read","sessions:create","sessions:read","sessions:update","sessions:delete","subjects:create","subjects:read","subjects:update","subjects:delete","class schedule:read","assign teacher to class:update","assign student to class:update","feedback:create","feedback:read","feedback:update","feedback:delete","student list:create","student list:read","student list:update","student list:delete","student category:create","student category:read","student category:update","student category:delete","student attendance:create","student attendance:read","student attendance:update","student attendance:delete","student scores:create","student scores:read","student scores:update","student scores:delete","student permission:create","student permission:read","student permission:update","student permission:delete","student class info:read","student class history:read","teachers:create","teachers:read","teachers:update","teachers:delete","teacher attendance:create","teacher attendance:read","teacher attendance:update","teacher attendance:delete","teacher permission:create","teacher permission:read","teacher permission:update","teacher permission:delete","departments:create","departments:read","departments:update","departments:delete","positions:create","positions:read","positions:update","positions:delete","book list:create","book list:read","book list:update","book list:delete","book categories:create","book categories:read","book categories:update","book categories:delete","student payments tracking:read","course invoice:read","course payment transactions:read","book payment:read","book payment transactions:read","student score report:read","mark class report:read","re-mark class report:read","student attendance report:read","promote student report:read","student permission report:read","teacher attendance report:read","teacher permission report:read","student payment report:read","student complete payment report:read","book payment report:read","book stock history:read","discount:create","discount:read","discount:update","discount:delete","user management:create","user management:read","user management:update","user management:delete","reset password:update","school holidays:create","school holidays:read","school holidays:update","school holidays:delete","school info:update" '
]);

const defaultModules = ref(['Dashboard', 'Classes', 'Students', 'Teachers', 'Library', 'Finance', 'Reports', 'Settings']);

// --- Event Handlers ---
const handleRegister = async () => {
    if (!name.value || !email.value || !password.value) {
        toast.add({ severity: 'warn', summary: 'Validation Error', detail: 'Please fill in all fields.', life: 3000 });
        return;
    }

    try {
        loading.value = true;
        const response = await axios.post(`${url}/api/register`, {
            name: name.value,
            email: email.value,
            password: password.value,
            role: 'superadmin', // Default role as requested
            permissions: defaultPermissions.value, // Add default permissions
            modules: defaultModules.value // Add default modules
        });

        toast.add({ severity: 'success', summary: 'Registration Successful', detail: 'Your account has been created. Please log in.', life: 3000 });

        // Redirect to the login page after successful registration
        router.push({ name: 'login' });
    } catch (error) {
        console.error(error);
        const errorMessage = error.response?.data?.message || 'An error occurred during registration.';
        toast.add({ severity: 'error', summary: 'Registration Failed', detail: errorMessage, life: 3000 });
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
