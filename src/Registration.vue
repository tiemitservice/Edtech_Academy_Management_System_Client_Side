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

                            <!-- **NEW:** Phone Number Field -->
                            <label for="phoneNumber" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Phone Number</label>
                            <InputText id="phoneNumber" type="text" placeholder="Phone Number" class="w-full md:w-[30rem] mb-8" v-model="phoneNumber" />

                            <label for="password" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Password</label>
                            <Password v-model="password" id="password" placeholder="Password" :toggleMask="true" class="mb-4" fluid :feedback="false"></Password>

                            <Button :disabled="loading" :label="loading ? 'Creating Account...' : 'Create Account'" class="w-full" type="submit"></Button>

                            <div class="text-center mt-4">
                                <span class="text-muted-color">Already have an account? </span>
                                <router-link to="/auth/login" class="font-medium text-primary-500 hover:underline">Sign In</router-link>
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
import { ref, onMounted, computed } from 'vue';
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
import FloatingConfigurator from '@/components/FloatingConfigurator.vue';

// --- Composables ---
const router = useRouter();
const toast = useToast();
const { data: companyData, fetchData: fetchCompanyData } = useFetch('companies');

// --- Component State ---
const name = ref('');
const email = ref('');
const password = ref('');
const phoneNumber = ref(''); // **NEW**
const loading = ref(false);

// --- Default Permissions and Modules for Superadmin ---
const permissionModules = ref([
    // Academic
    { name: 'Classes', actions: ['create', 'read', 'update', 'delete'] },
    { name: 'Class Transaction', actions: ['read'] },
    { name: 'Sessions', actions: ['create', 'read', 'update', 'delete'] },
    { name: 'Subjects', actions: ['create', 'read', 'update', 'delete'] },
    { name: 'Class Schedule', actions: ['read'] },
    { name: 'Assign Teacher to Class', actions: ['update'] },
    { name: 'Assign Student to Class', actions: ['update'] },
    { name: 'Feedback', actions: ['create', 'read', 'update', 'delete'] },
    // Students
    { name: 'Student List', actions: ['create', 'read', 'update', 'delete'] },
    { name: 'Student Category', actions: ['create', 'read', 'update', 'delete'] },
    { name: 'Student Attendance', actions: ['create', 'read', 'update', 'delete'] },
    { name: 'Student Scores', actions: ['create', 'read', 'update', 'delete'] },
    { name: 'Student Permission', actions: ['create', 'read', 'update', 'delete'] },
    { name: 'Student Class Info', actions: ['read'] },
    { name: 'Student Class History', actions: ['read'] },
    // Teacher
    { name: 'Teachers', actions: ['create', 'read', 'update', 'delete'] },
    { name: 'Teacher Attendance', actions: ['create', 'read', 'update', 'delete'] },
    { name: 'Teacher Permission', actions: ['create', 'read', 'update', 'delete'] },
    { name: 'Departments', actions: ['create', 'read', 'update', 'delete'] },
    { name: 'Positions', actions: ['create', 'read', 'update', 'delete'] },
    // Book
    { name: 'Book List', actions: ['create', 'read', 'update', 'delete'] },
    { name: 'Book Categories', actions: ['create', 'read', 'update', 'delete'] },
    // Finance
    { name: 'Student Payments Tracking', actions: ['read'] },
    { name: 'Course Invoice', actions: ['read'] },
    { name: 'Course Payment Transactions', actions: ['read'] },
    { name: 'Book Payment', actions: ['read'] },
    { name: 'Book Payment Transactions', actions: ['read'] },
    // Student Reports
    { name: 'Student Score Report', actions: ['read'] },
    { name: 'Mark Class Report', actions: ['read'] },
    { name: 'Re-Mark Class Report', actions: ['read'] },
    { name: 'Student Attendance Report', actions: ['read'] },
    { name: 'Promote Student Report', actions: ['read'] },
    { name: 'Student Permission Report', actions: ['read'] },
    // Teacher Reports
    { name: 'Teacher Attendance Report', actions: ['read'] },
    { name: 'Teacher Permission Report', actions: ['read'] },
    // Payment Reports
    { name: 'Student Payment Report', actions: ['read'] },
    { name: 'Student Complete Payment Report', actions: ['read'] },
    { name: 'Book Payment Report', actions: ['read'] },
    { name: 'Book Stock History', actions: ['read'] },
    // Settings
    { name: 'Discount', actions: ['create', 'read', 'update', 'delete'] },
    { name: 'User Management', actions: ['create', 'read', 'update', 'delete'] },
    { name: 'Reset Password', actions: ['update'] },
    { name: 'School Holidays', actions: ['create', 'read', 'update', 'delete'] },
    { name: 'School Info', actions: ['update'] }
]);

const defaultPermissions = computed(() => {
    const allPermissions = [];
    permissionModules.value.forEach((module) => {
        module.actions.forEach((action) => {
            allPermissions.push(`${module.name.toLowerCase()}:${action}`);
        });
    });
    return allPermissions;
});

// --- Event Handlers ---
const handleRegister = async () => {
    // **MODIFIED:** Added validation for phone number
    if (!name.value || !email.value || !password.value || !phoneNumber.value) {
        toast.add({ severity: 'warn', summary: 'Validation Error', detail: 'Please fill in all fields.', life: 3000 });
        return;
    }

    try {
        loading.value = true;
        const response = await axios.post(`${url}/api/register`, {
            name: name.value,
            email: email.value,
            password: password.value,
            phoneNumber: phoneNumber.value, // **NEW**
            role: 'superadmin',
            permissions: defaultPermissions.value
        });

        toast.add({ severity: 'success', summary: 'Registration Successful', detail: 'Your account has been created. Please log in.', life: 3000 });

        router.push({ name: 'login' });
    } catch (error) {
        console.error(error);
        const errorMessage = error.response?.data?.error || 'An error occurred during registration.';
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
