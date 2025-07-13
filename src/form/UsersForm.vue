<template>
    <form @submit.prevent="handleSubmit" enctype="multipart/form-data">
        <!-- User Info -->
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">{{ datatoedit ? 'Edit User' : 'Add New User' }}</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>

        <div class="p-6">
            <div class="grid md:grid-cols-2 gap-8">
                <!-- Profile Picture -->
                <div class="flex flex-col items-center space-y-4">
                    <div class="relative group w-32 h-32">
                        <div v-if="previewImage" class="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg">
                            <img :src="previewImage" alt="Profile Preview" class="w-full h-full object-cover" />
                            <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span class="text-white text-sm font-medium">Change Photo</span>
                            </div>
                        </div>
                        <div v-else class="w-full h-full rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4a4 4 0 100 8 4 4 0 000-8zm0 10c-3.86 0-7 2.24-7 5v2h14v-2c0-2.76-3.14-5-7-5z" />
                            </svg>
                        </div>
                        <input type="file" accept="image/*" @change="handleImageChange" class="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                    <label class="text-sm font-semibold text-gray-700">Update Profile Picture</label>
                </div>

                <!-- User Fields -->
                <div class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Full Name</label>
                            <InputText v-model="form.name" type="text" class="w-full" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Email</label>
                            <InputText v-model="form.email" type="email" class="w-full" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Password</label>
                            <Password v-model="form.password" placeholder="Password" fluid :toggleMask="true" class="w-full" :feedback="false" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Phone Number</label>
                            <InputText v-model="form.phoneNumber" type="text" class="w-full" />
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700">Role</label>
                            <Select v-model="form.role" :options="roles" option-label="name" option-value="_id" placeholder="Select a role" class="w-full" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Permissions -->
            <div class="mt-8">
                <h3 class="text-lg font-semibold mb-4">Permissions</h3>
                <div class="space-y-4">
                    <div v-for="group in permissionGroups" :key="group.name" class="p-4 border rounded-lg">
                        <div class="flex items-center justify-between mb-3">
                            <h4 class="font-semibold text-gray-800">{{ group.name }}</h4>
                            <input type="checkbox" :checked="isGroupFullySelected(group)" @change="toggleGroupAll(group)" class="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300" />
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            <div v-for="module in group.modules" :key="module.name" class="flex items-center">
                                <input type="checkbox" :id="`perm-${module.name}`" :checked="isModuleSelected(module)" @change="toggleModule(module)" class="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300" />
                                <label :for="`perm-${module.name}`" class="ml-2 text-sm text-gray-600">{{ module.name }}</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Submit Button -->
        <div class="p-4 bg-gray-50 border-t">
            <Button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full" :disabled="loading">
                {{ loading ? 'Saving...' : 'Save Changes' }}
            </Button>
            <p v-if="error" class="text-red-500 mt-2 text-center">{{ error }}</p>
        </div>
    </form>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useFetch } from '@/composible/useFetch';

const props = defineProps(['datatoedit']);
const emit = defineEmits(['close', 'save']);
const { postData: createUser, updateData, loading, error } = useFetch('users');

const roles = ref([
    { name: 'Admin', _id: 'admin' },
    { name: 'User', _id: 'user' },
    { name: 'Teacher', _id: 'teacher' },
    { name: 'Student', _id: 'student' },
    { name: 'Superadmin', _id: 'superadmin' }
]);

// This detailed list is used to determine the canonical permission for each module.
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

// Group modules for the UI
const permissionGroups = ref([
    { name: 'Academic', modules: permissionModules.value.slice(0, 8) },
    { name: 'Students', modules: permissionModules.value.slice(8, 15) },
    { name: 'Teacher', modules: permissionModules.value.slice(15, 20) },
    { name: 'Book', modules: permissionModules.value.slice(20, 22) },
    { name: 'Finance', modules: permissionModules.value.slice(22, 27) },
    { name: 'Student Reports', modules: permissionModules.value.slice(27, 33) },
    { name: 'Teacher Reports', modules: permissionModules.value.slice(33, 35) },
    { name: 'Payment Reports', modules: permissionModules.value.slice(35, 39) },
    { name: 'Settings', modules: permissionModules.value.slice(39, 44) }
]);

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

// Gets the primary permission string for a module (e.g., 'classes:read')
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

const isModuleSelected = (module) => {
    return form.permissions.includes(getCanonicalPermission(module));
};

const toggleModule = (module) => {
    const perm = getCanonicalPermission(module);
    if (isModuleSelected(module)) {
        form.permissions = form.permissions.filter((p) => p !== perm);
    } else {
        form.permissions.push(perm);
    }
};

const isGroupFullySelected = (group) => {
    return group.modules.every((module) => isModuleSelected(module));
};

const toggleGroupAll = (group) => {
    const groupIsSelected = isGroupFullySelected(group);
    const groupPermissions = group.modules.map((module) => getCanonicalPermission(module));

    if (groupIsSelected) {
        // Deselect all in group
        form.permissions = form.permissions.filter((p) => !groupPermissions.includes(p));
    } else {
        // Select all in group
        form.permissions = [...new Set([...form.permissions, ...groupPermissions])];
    }
};

const handleSubmit = async () => {
    const payload = new FormData();

    // Append all form fields to the payload
    for (const key in form) {
        if (key === 'password' && !form[key]) continue; // Skip empty password

        // **FIX:** Append permissions correctly instead of stringifying them.
        // This sends them as a proper array to the backend.
        if (key === 'permissions') {
            form.permissions.forEach((permission) => {
                payload.append('permissions', permission);
            });
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
        } else {
            await createUser(payload);
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

        // **IMPORTANT:** This parsing logic is still needed to handle
        // the old, badly formatted data that already exists in your database.
        const flattenAndParse = (arr) => {
            let result = [];
            if (!Array.isArray(arr)) return result;

            for (const item of arr) {
                if (Array.isArray(item)) {
                    result.push(...flattenAndParse(item));
                } else if (typeof item === 'string') {
                    try {
                        // Try to parse the string as JSON first
                        const parsed = JSON.parse(item);
                        result.push(...flattenAndParse(Array.isArray(parsed) ? parsed : [parsed]));
                    } catch (e) {
                        // If it's not JSON, it might be a simple comma-separated or single permission
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
