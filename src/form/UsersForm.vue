<template>
    <form @submit.prevent="handleSubmit" enctype="multipart/form-data">
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">
                {{ datatoedit ? $t('element.edit') : $t('element.addnew') }}
            </label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded text aria-label="Close" />
        </div>

        <div class="p-6">
            <div class="grid md:grid-cols-2 gap-8">
                <!-- Profile Picture -->
                <div class="flex flex-col items-center space-y-4">
                    <div class="relative group w-32 h-32">
                        <div v-if="previewImage" class="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg">
                            <img :src="previewImage" alt="Profile Preview" class="w-full h-full object-cover" />
                            <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span class="text-white text-sm font-medium">{{ $t('user.Update_Profile_Picture') }}</span>
                            </div>
                        </div>
                        <div v-else class="w-full h-full rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4a4 4 0 100 8 4 4 0 000-8zm0 10c-3.86 0-7 2.24-7 5v2h14v-2c0-2.76-3.14-5-7-5z" />
                            </svg>
                        </div>
                        <input type="file" accept="image/*" @change="handleImageChange" class="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                    <label class="text-sm font-semibold text-gray-700">{{ $t('user.Update_Profile_Picture') }}</label>
                </div>

                <!-- User Fields -->
                <div class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="flex flex-col space-y-3">
                            <label class="flex flex-col text-sm font-medium text-gray-700 space-y-4">{{ $t('user.name') }}</label>
                            <InputText v-model="form.name" type="text" class="w-full" :placeholder="$t('user.name')" />
                        </div>
                        <div class="flex flex-col space-y-3">
                            <label class="flex flex-col text-sm font-medium text-gray-700 space-y-4">{{ $t('user.email') }}</label>
                            <InputText v-model="form.email" type="email" class="w-full" :placeholder="$t('user.email')" />
                        </div>
                        <div class="flex flex-col space-y-3">
                            <label class="flex flex-col text-sm font-medium text-gray-700 space-y-4">{{ $t('login.password') }}</label>
                            <Password v-model="form.password" :placeholder="$t('login.password')" fluid :toggleMask="true" class="w-full" :feedback="false" />
                        </div>
                        <div class="flex flex-col space-y-3">
                            <label class="flex flex-col text-sm font-medium text-gray-700 space-y-4">{{ $t('student.phone_number') }}</label>
                            <InputText v-model="form.phoneNumber" type="text" class="w-full" :placeholder="$t('student.phone_number')" />
                        </div>
                        <div class="flex flex-col w-full">
                            <label class="flex flex-col text-sm font-medium text-gray-700 space-y-4">{{ $t('user.role') }}</label>
                            <Select v-model="form.role" :options="roles" option-label="name" option-value="_id" :placeholder="$t('user.select_role')" class="w-full" />
                        </div>
                        <!-- status -->
                        <div class="flex flex-col w-full">
                            <label class="flex flex-col text-sm font-medium text-gray-700 space-y-4">{{ $t('element.status') }}</label>
                            <ToggleSwitch aria-labelledby="switch2" v-model="form.status" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Permissions -->
            <div class="mt-8">
                <h3 class="text-lg font-semibold mb-4">{{ $t('user.permissions') }}</h3>
                <div class="space-y-4">
                    <div v-for="group in permissionGroups" :key="group.tKey" class="p-4 border rounded-lg">
                        <div class="flex items-center justify-between mb-3">
                            <h4 class="font-semibold text-gray-800">{{ $t(`menu.${group.tKey}`) }}</h4>
                            <input type="checkbox" :checked="isGroupFullySelected(group)" @change="toggleGroupAll(group)" class="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300" />
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            <div v-for="module in group.modules" :key="module.name" class="flex items-center">
                                <input type="checkbox" :id="`perm-${module.name}`" :checked="isModuleSelected(module)" @change="toggleModule(module)" class="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300" />
                                <label :for="`perm-${module.name}`" class="ml-2 text-sm text-gray-600">{{ $t(`menu.${module.tKey}`) }}</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Submit Button -->
        <div class="p-4 bg-gray-50 border-t">
            <Button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full" :disabled="loading">
                {{ loading ? $t('element.saving') : $t('element.save') }}
            </Button>
            <Button type="button" class="mt-2 w-full" @click="$emit('close')" severity="secondary">
                {{ $t('element.cancel') }}
            </Button>
            <p v-if="error" class="text-red-500 mt-2 text-center">{{ error }}</p>
        </div>
    </form>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { useFetch } from '@/composible/useFetch';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Select from 'primevue/select';

const props = defineProps(['datatoedit']);
const emit = defineEmits(['close', 'save', 'toast']);
const { t } = useI18n();
const { postData: createUser, updateData, loading, error } = useFetch('users');

const roles = computed(() => [
    { name: 'admin', _id: 'admin' },
    { name: 'user', _id: 'user' },
    { name: 'superadmin', _id: 'superadmin' }
]);

const permissionModules = ref([
    // Academic Group
    { group: 'academic', tKey: 'classes', name: 'Classes', actions: ['create', 'read', 'update', 'delete'] },
    { group: 'academic', tKey: 'class_transaction', name: 'Class Transaction', actions: ['read'] },
    { group: 'academic', tKey: 'sessions', name: 'Sessions', actions: ['create', 'read', 'update', 'delete'] },
    { group: 'academic', tKey: 'subjects', name: 'Subjects', actions: ['create', 'read', 'update', 'delete'] },
    { group: 'academic', tKey: 'class_schedule', name: 'Class Schedule', actions: ['read'] },
    { group: 'academic', tKey: 'assign_teacher_to_class', name: 'Assign Teacher to Class', actions: ['update'] },
    { group: 'academic', tKey: 'assign_student_to_class', name: 'Assign Student to Class', actions: ['update'] },
    { group: 'academic', tKey: 'feedback', name: 'Feedback', actions: ['create', 'read', 'update', 'delete'] },
    // Students Group
    { group: 'students', tKey: 'student_list', name: 'Student List', actions: ['create', 'read', 'update', 'delete'] },
    { group: 'students', tKey: 'student_category', name: 'Student Category', actions: ['create', 'read', 'update', 'delete'] },
    { group: 'students', tKey: 'student_attendance', name: 'Student Attendance', actions: ['create', 'read', 'update', 'delete'] },
    { group: 'students', tKey: 'student_scores', name: 'Student Scores', actions: ['create', 'read', 'update', 'delete'] },
    { group: 'students', tKey: 'student_permission', name: 'Student Permission', actions: ['create', 'read', 'update', 'delete'] },
    { group: 'students', tKey: 'student_class_info', name: 'Student Class Info', actions: ['read'] },
    { group: 'students', tKey: 'student_class_history', name: 'Student Class History', actions: ['read'] },
    // Teacher Group
    { group: 'teacher', tKey: 'teachers', name: 'Teachers', actions: ['create', 'read', 'update', 'delete'] },
    { group: 'teacher', tKey: 'teacher_attendance', name: 'Teacher Attendance', actions: ['create', 'read', 'update', 'delete'] },
    { group: 'teacher', tKey: 'teacher_permission', name: 'Teacher Permission', actions: ['create', 'read', 'update', 'delete'] },
    { group: 'teacher', tKey: 'departments', name: 'Departments', actions: ['create', 'read', 'update', 'delete'] },
    { group: 'teacher', tKey: 'positions', name: 'Positions', actions: ['create', 'read', 'update', 'delete'] },
    // Book Group
    { group: 'book', tKey: 'book_list', name: 'Book List', actions: ['create', 'read', 'update', 'delete'] },
    { group: 'book', tKey: 'book_categories', name: 'Book Categories', actions: ['create', 'read', 'update', 'delete'] },
    // Finance Group
    { group: 'finance', tKey: 'student_payments_tracking', name: 'Student Payments Tracking', actions: ['read'] },
    // { group: 'finance', tKey: 'course_invoice', name: 'Course Invoice', actions: ['read'] },
    // { group: 'finance', tKey: 'course_payment_transactions', name: 'Course Payment Transactions', actions: ['read'] },
    { group: 'finance', tKey: 'book_payment', name: 'Book Payment', actions: ['read'] },
    { group: 'finance', tKey: 'book_payment_transactions', name: 'Book Payment Transactions', actions: ['read'] },
    // Student Reports Group
    { group: 'student_report', tKey: 'student_score_report', name: 'Student Score Report', actions: ['read'] },
    { group: 'student_report', tKey: 'mark_class_report', name: 'Mark Class Report', actions: ['read'] },
    // { group: 'student_report', tKey: 're_mark_class_report', name: 'Re-Mark Class Report', actions: ['read'] },
    { group: 'student_report', tKey: 'student_attendance_report', name: 'Student Attendance Report', actions: ['read'] },
    { group: 'student_report', tKey: 'promote_student_report', name: 'Promote Student Report', actions: ['read'] },
    { group: 'student_report', tKey: 'student_permission_report', name: 'Student Permission Report', actions: ['read'] },
    // Teacher Reports Group
    { group: 'teacher_report', tKey: 'teacher_attendance_report', name: 'Teacher Attendance Report', actions: ['read'] },
    { group: 'teacher_report', tKey: 'teacher_permission_report', name: 'Teacher Permission Report', actions: ['read'] },
    // Payment Reports Group
    { group: 'payment_report', tKey: 'student_payment_report', name: 'Student Payment Report', actions: ['read'] },
    // { group: 'payment_report', tKey: 'student_complete_payment_report', name: 'Student Complete Payment Report', actions: ['read'] },
    { group: 'payment_report', tKey: 'book_payment_report', name: 'Book Payment Report', actions: ['read'] },
    { group: 'payment_report', tKey: 'book_stock_history', name: 'Book Stock History', actions: ['read'] },
    // Settings Group
    { group: 'settings', tKey: 'discount', name: 'Discount', actions: ['create', 'read', 'update', 'delete'] },
    { group: 'settings', tKey: 'user_management', name: 'User Management', actions: ['create', 'read', 'update', 'delete'] },
    { group: 'settings', tKey: 'reset_password', name: 'Reset Password', actions: ['update'] },
    { group: 'settings', tKey: 'school_holidays', name: 'School Holidays', actions: ['create', 'read', 'update', 'delete'] },
    { group: 'settings', tKey: 'school_info', name: 'School Info', actions: ['update'] }
]);

// Dynamically create permission groups based on the 'group' property
const permissionGroups = computed(() => {
    const groups = {};
    permissionModules.value.forEach((module) => {
        if (!groups[module.group]) {
            groups[module.group] = {
                tKey: module.group,
                modules: []
            };
        }
        groups[module.group].modules.push(module);
    });
    return Object.values(groups);
});

const form = reactive({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: '',
    is_reminder: true,
    status: true,
    permissions: []
});

const selectedImage = ref(null);
const previewImage = ref(null);

const getCanonicalPermission = (module) => {
    const action = module.actions.includes('read') ? 'read' : module.actions[0];
    return `${module.name.toLowerCase()}:${action}`;
};

watch(
    () => form.role,
    (newRole) => {
        if (newRole === 'superadmin') {
            const allPermissions = permissionModules.value.map((module) => getCanonicalPermission(module));
            form.permissions = [...new Set(allPermissions)];
        }
    }
);

const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        selectedImage.value = file;
        previewImage.value = URL.createObjectURL(file);
    }
};

const isModuleSelected = (module) => form.permissions.includes(getCanonicalPermission(module));
const toggleModule = (module) => {
    const perm = getCanonicalPermission(module);
    if (isModuleSelected(module)) {
        form.permissions = form.permissions.filter((p) => p !== perm);
    } else {
        form.permissions.push(perm);
    }
};

const isGroupFullySelected = (group) => group.modules.every((module) => isModuleSelected(module));
const toggleGroupAll = (group) => {
    const groupIsSelected = isGroupFullySelected(group);
    const groupPermissions = group.modules.map((module) => getCanonicalPermission(module));
    if (groupIsSelected) {
        form.permissions = form.permissions.filter((p) => !groupPermissions.includes(p));
    } else {
        form.permissions = [...new Set([...form.permissions, ...groupPermissions])];
    }
};

const handleSubmit = async () => {
    const payload = new FormData();
    for (const key in form) {
        if (key === 'password' && !form[key]) continue;
        if (key === 'permissions') {
            form.permissions.forEach((permission) => payload.append('permissions', permission));
        } else {
            payload.append(key, form[key]);
        }
    }
    if (selectedImage.value) {
        payload.append('image', selectedImage.value);
    }

    try {
        if (props.datatoedit) {
            await updateData(payload, props.datatoedit._id);
            emit('toast', 'update', 'success');
        } else {
            await createUser(payload);
            emit('toast', 'create', 'info');
        }
        emit('save');
        emit('close');
    } catch (err) {
        console.error('Error submitting:', err);
    }
};

onMounted(() => {
    if (props.datatoedit) {
        previewImage.value = props.datatoedit.image;
        form.name = props.datatoedit.name;
        form.email = props.datatoedit.email;
        form.phoneNumber = props.datatoedit.phoneNumber;
        form.role = props.datatoedit.role;
        form.is_reminder = props.datatoedit.is_reminder;
        form.status = props.datatoedit.status;

        const flattenAndParse = (arr) => {
            let result = [];
            if (!Array.isArray(arr)) return result;
            for (const item of arr) {
                if (Array.isArray(item)) {
                    result.push(...flattenAndParse(item));
                } else if (typeof item === 'string') {
                    try {
                        const parsed = JSON.parse(item);
                        result.push(...flattenAndParse(Array.isArray(parsed) ? parsed : [parsed]));
                    } catch (e) {
                        result.push(...item.split(',').map((p) => p.trim()));
                    }
                }
            }
            return result;
        };
        const rawPerms = props.datatoedit.permissions || [];
        const parsedPermissions = flattenAndParse(rawPerms);
        form.permissions = [...new Set(parsedPermissions)];
    }
});
</script>
