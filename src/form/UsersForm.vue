<template>
    <form @submit.prevent="handleSubmit" class="space-y-6 p-6 max-w-5xl mx-auto" enctype="multipart/form-data">
        <!-- User Info Section -->
        <div class="grid md:grid-cols-2 gap-8">
            <!-- Profile Picture -->
            <div>
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
                        <Password v-model="form.password" placeholder="Password" :toggleMask="true" fluid class="w-full" :feedback="false" />
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

        <!-- Permissions Table -->
        <div>
            <h3 class="text-lg font-semibold mb-4">Permissions</h3>
            <div class="overflow-auto rounded-lg shadow-sm border">
                <table class="min-w-full table-auto text-sm text-left">
                    <thead class="bg-gray-100">
                        <tr>
                            <th class="border px-4 py-2">Module (Select All)</th>
                            <th class="border px-4 py-2 text-center">Create</th>
                            <th class="border px-4 py-2 text-center">Read</th>
                            <th class="border px-4 py-2 text-center">Update</th>
                            <th class="border px-4 py-2 text-center">Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="module in permissionModules" :key="module" class="hover:bg-gray-50">
                            <td class="border-b border-r px-4 py-2 font-medium flex items-center justify-between">
                                <label for="">
                                    {{ module }}
                                </label>
                                <input type="checkbox" :checked="isModuleFullySelected(module)" @change="toggleModuleAll(module)" />
                            </td>
                            <td class="px-4 border py-2 font-medium">
                                <div class="flex items-center justify-center">
                                    <input type="checkbox" :value="`${module.toLowerCase()}:create`" v-model="form.permissions" />
                                </div>
                            </td>
                            <td class="border px-4 py-2 font-medium">
                                <div class="flex items-center justify-center">
                                    <input type="checkbox" :value="`${module.toLowerCase()}:read`" v-model="form.permissions" />
                                </div>
                            </td>
                            <td class="border px-4 py-2 font-medium">
                                <div class="flex items-center justify-center">
                                    <input type="checkbox" :value="`${module.toLowerCase()}:update`" v-model="form.permissions" />
                                </div>
                            </td>
                            <td class="border px-4 py-2 font-medium">
                                <div class="flex items-center justify-center">
                                    <input type="checkbox" :value="`${module.toLowerCase()}:delete`" v-model="form.permissions" />
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Submit Button -->
        <Button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full" :disabled="loading">
            {{ loading ? 'Saving...' : 'Save' }}
        </Button>

        <!-- Error Message -->
        <p v-if="error" class="text-red-500 mt-2 text-center">{{ error }}</p>
    </form>
</template>
<script>
import { ref, reactive, onMounted } from 'vue';
import { useFetch } from '../composible/useFetch';

export default {
    props: ['datatoedit'],
    setup(props) {
        const { postData: createUser, updateData, loading, error } = useFetch('users');

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

        const roles = ref([
            { name: 'Admin', _id: 'admin' },
            { name: 'User', _id: 'user' },
            { name: 'Teacher', _id: 'teacher' },
            { name: 'Student', _id: 'student' },
            { name: 'Superadmin', _id: 'superadmin' }
        ]);

        const permissionModules = ref([
            'Student List',
            'Student Attendance',
            'Student Scores',
            'Student Permission',
            'Student Class Info',
            'Student Class History',
            'Student Payments',
            'Teacher List',
            'Teacher Attendance',
            'Teacher Permission',
            'Classes',
            'Class Transaction',
            'Class Schedule',
            'Subjects',
            'Sessions',
            'Assign Teacher to Class',
            'Assign Student to Class',
            'Assign Student to Teacher',
            'Books',
            'Book Categories',
            'Expenses',
            'Income',
            'Payment Transactions',
            'User Management',
            'Reset Password',
            'School Holidays',
            'Departments',
            'Positions'
        ]);

        const selectedImage = ref(null);
        const previewImage = ref(null);

        const handleImageChange = (event) => {
            const file = event.target.files[0];
            if (file) {
                selectedImage.value = file;
                previewImage.value = URL.createObjectURL(file);
            }
        };

        const isModuleFullySelected = (module) => {
            const base = module.toLowerCase();
            return ['create', 'read', 'update', 'delete'].every((action) => form.permissions.includes(`${base}:${action}`));
        };

        const toggleModuleAll = (module) => {
            const base = module.toLowerCase();
            const perms = ['create', 'read', 'update', 'delete'].map((action) => `${base}:${action}`);
            const allSelected = perms.every((p) => form.permissions.includes(p));

            if (allSelected) {
                form.permissions = form.permissions.filter((p) => !perms.includes(p));
            } else {
                form.permissions = [...new Set([...form.permissions, ...perms])];
            }
        };

        const handleSubmit = async () => {
            const payload = new FormData();

            for (const key in form) {
                if (key === 'password' && !form[key]) continue;
                payload.append(key, form[key]);
            }

            payload.append('permissions', JSON.stringify(form.permissions));

            if (selectedImage.value) {
                payload.append('image', selectedImage.value);
            }

            try {
                if (props.datatoedit) {
                    await updateData(payload, props.datatoedit._id);
                } else {
                    await createUser(payload);
                }
            } catch (err) {
                console.error('Error submitting:', err);
            }
        };

        onMounted(() => {
            if (props.datatoedit) {
                previewImage.value = props.datatoedit.image;
                form.name = props.datatoedit.name;
                form.email = props.datatoedit.email;
                form.password = props.datatoedit.password;
                form.phoneNumber = props.datatoedit.phoneNumber;
                form.role = props.datatoedit?.role;
                form.is_reminder = props.datatoedit.is_reminder;
                form.status = props.datatoedit.status;

                const rawPerms = props.datatoedit.permissions;
                const normalized = [];

                if (Array.isArray(rawPerms)) {
                    rawPerms.forEach((p) => {
                        try {
                            const parsed = JSON.parse(p);
                            if (Array.isArray(parsed)) {
                                normalized.push(...parsed);
                            } else if (typeof parsed === 'string') {
                                normalized.push(...parsed.split(',').map((x) => x.trim()));
                            }
                        } catch {
                            normalized.push(...p.split(',').map((x) => x.trim()));
                        }
                    });
                } else if (typeof rawPerms === 'string') {
                    try {
                        const parsed = JSON.parse(rawPerms);
                        if (Array.isArray(parsed)) {
                            normalized.push(...parsed);
                        } else {
                            normalized.push(...rawPerms.split(',').map((x) => x.trim()));
                        }
                    } catch {
                        normalized.push(...rawPerms.split(',').map((x) => x.trim()));
                    }
                }

                form.permissions = [...new Set(normalized)];
            }
            console.log('====================================');
            console.log(form.permissions);
            console.log('====================================');
        });

        return {
            form,
            roles,
            loading,
            error,
            selectedImage,
            previewImage,
            permissionModules,
            handleImageChange,
            handleSubmit,
            isModuleFullySelected,
            toggleModuleAll
        };
    }
};
</script>
