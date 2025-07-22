<template>
    <div class="w-full mx-auto flex items-center justify-center">
        <div class="flex items-center gap-3">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-4 text-center">
                <!-- Image Preview & Change -->
                <div class="relative group w-fit mx-auto">
                    <img v-if="previewImage || form.image" class="object-cover object-center w-40 h-40 rounded-full border-2 border-primary" :src="previewImage || form.image" alt="User Avatar" />

                    <div v-else class="w-40 h-40 rounded-full border-2 border-primary flex items-center justify-center bg-gray-100">
                        <i class="pi pi-user text-gray-400" style="font-size: 5rem"></i>
                    </div>

                    <div class="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity w-40 h-40">
                        <label class="cursor-pointer text-white text-sm font-medium p-2">
                            {{ isUploading ? 'Uploading...' : 'Change Photo' }}
                            <input type="file" class="hidden" accept="image/*" @change="handleImageChange" :disabled="isUploading" />
                        </label>
                    </div>
                </div>

                <!-- User Form -->
                <div class="space-y-3">
                    <InputText v-model="form.name" class="w-full border rounded px-3 py-2" type="text" placeholder="Full Name" />
                    <InputText v-model="form.email" class="w-full border rounded px-3 py-2" type="email" placeholder="Email" />
                    <InputText v-model="form.phoneNumber" class="w-full border rounded px-3 py-2" type="text" placeholder="Phone Number" />
                </div>

                <!-- Save Button -->
                <div class="pt-4 space-y-2">
                    <Button @click="handleSubmit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full" :disabled="isUploading">
                        {{ isUploading ? $t('element.saving') : $t('element.save') }}
                    </Button>
                    <p v-if="successMessage" class="text-green-600">{{ successMessage }}</p>
                    <p v-if="errorMessage" class="text-red-500">{{ errorMessage }}</p>
                </div>
            </div>
            <!-- <ResetPassword /> -->
        </div>

        <!-- <Button @click="handleLogout"> Logout </Button> -->
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useFetch } from '@/composible/useFetch';
import useAuth from '@/composible/useAuth';
import ResetPassword from '@/views/ResetPassword.vue';
import { useRouter } from 'vue-router';
const { user, logout } = useAuth();
const { updateData } = useFetch('users');

const isUploading = ref(false);
const previewImage = ref(null);
const selectedImage = ref(null);
const successMessage = ref('');
const errorMessage = ref('');
const router = useRouter();
const form = reactive({
    name: '',
    email: '',
    phoneNumber: '',
    image: ''
});

const handleSubmit = async () => {
    isUploading.value = true;
    successMessage.value = '';
    errorMessage.value = '';

    try {
        const payload = new FormData();
        payload.append('name', form.name);
        payload.append('email', form.email);
        payload.append('phoneNumber', form.phoneNumber);

        if (selectedImage.value) {
            payload.append('image', selectedImage.value);
        }

        const updated = await updateData(payload, user.value?.id);
        successMessage.value = 'Profile updated successfully!';

        user.value = updated;
    } catch (err) {
        errorMessage.value = err.response?.data?.error || 'Update failed.';
        console.error(err);
    } finally {
        isUploading.value = false;
    }
};
const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        selectedImage.value = file;
        previewImage.value = URL.createObjectURL(file);
    }
};
onMounted(() => {
    console.log('User:', user.value);

    // Pre-fill form with logged-in user data
    form.name = user.value?.name || '';
    form.email = user.value?.email || '';
    form.phoneNumber = user.value?.phoneNumber || '';
    form.image = user.value?.image || '';
    previewImage.value = user.value?.image || '';
});
</script>
