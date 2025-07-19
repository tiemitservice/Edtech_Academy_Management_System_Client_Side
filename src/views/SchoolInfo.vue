<template>
    <form @submit.prevent="handleSubmit">
        <div class="card flex flex-col justify-content-center">
            <div class="flex items-center justify-center gap-5">
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
                        <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">School Logo</label>
                    </div>
                </div>
                <!-- invoice logo  -->
                <div class="border h-32"></div>
                <div>
                    <div class="flex flex-col items-center space-y-4">
                        <div class="relative group w-96 h-32">
                            <div v-if="previewLogo" class="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg">
                                <img :src="previewLogo" alt="Profile Preview" class="w-full h-full object-cover" />
                                <div class="previewLogo inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <span class="text-white text-sm font-medium">Change Image</span>
                                </div>
                            </div>
                            <div v-else class="w-full h-full rounded-lg bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-gray-400">
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                                    />
                                </svg>
                            </div>
                            <input type="file" accept="image/*" @change="handleLogoChange" class="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                        <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Invoice Logo</label>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mx-auto mt-12">
                <div class="field">
                    <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white" for="name">{{ $t('class.name') }} <span class="text-red-500">*</span></label>
                    <InputText size="large" type="text" required id="name" v-model="form.name" placeholder="Name" />
                </div>

                <div class="field">
                    <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white" for="email">{{ $t('login.email') }} <span class="text-red-500">*</span></label>
                    <InputText size="large" type="email" required id="email" v-model="form.email" placeholder="Email" />
                </div>
                <div class="field">
                    <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white" for="phone">{{ $t('student.phone_number') }} <span class="text-red-500">*</span></label>
                    <InputText size="large" type="text" required id="phone" v-model="form.phone" placeholder="Phone" />
                </div>
                <div class="field">
                    <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white" for="address">{{ $t('student.address') }} <span class="text-red-500">*</span></label>
                    <InputText size="large" type="text" required id="address" v-model="form.address" :placeholder="$t('student.address')" />
                </div>
                <!-- currency -->

                <div class="field">
                    <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white" for="currency">{{ $t('element.currency') }} (៛)<span class="text-red-500">*</span></label>
                    <InputNumber size="large" type="text" required id="currency" v-model="form.currencey" placeholder="Currencey" />
                </div>

                <div class="field col-span-2">
                    <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white" for="description">{{ $t('element.description') }}</label>
                    <Textarea placeholder="Description" style="resize: none" rows="10" class="w-full" id="description" v-model="form.description" />
                </div>

                <div class="flex w-full justify-end field col-span-2">
                    <Button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full" :disabled="loading">{{ $t('element.save') }}</Button>
                </div>
                <p v-if="successMessage" class="text-green-500 mt-2 text-center">{{ successMessage }}</p>
                <p v-if="errorMessage" class="text-red-500 mt-2 text-center">{{ errorMessage }}</p>
            </div>
        </div>
    </form>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useFetch } from '@/composible/useFetch';

const { data, fetchData, updateData } = useFetch('companies');

const isUploading = ref(false);
const previewImage = ref(null);
const previewLogo = ref(null);
const selectedImage = ref(null);
const selectedLogo = ref(null);
const successMessage = ref('');
const errorMessage = ref('');

const form = reactive({
    name: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    image: '',
    currencey: '',
    invoice_logo: ''
});

// Load company profile data
onMounted(async () => {
    try {
        await fetchData();
        const company = data.value?.[0]; // Assumes first company

        if (company) {
            Object.assign(form, {
                name: company.name || '',
                khmer_name: company.khmer_name || '',
                email: company.email || '',
                phone: company.phone || '',
                address: company.address || '',
                description: company.description || '',
                image: company.image || '',
                currencey: company.currencey || '',
                invoice_logo: company.invoice_logo || ''
            });
            previewImage.value = company.image || '';
        } else {
            console.warn('No company data found');
        }
    } catch (err) {
        errorMessage.value = 'Failed to load company data.';
        console.error(err);
    }
});

const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        selectedImage.value = file;
        previewImage.value = URL.createObjectURL(file);
    }
};

const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        selectedLogo.value = file;
        previewLogo.value = URL.createObjectURL(file);
    }
};

const handleSubmit = async () => {
    isUploading.value = true;
    successMessage.value = '';
    errorMessage.value = '';

    try {
        const payload = new FormData();
        payload.append('name', form.name);
        payload.append('email', form.email);
        payload.append('phone', form.phone);
        payload.append('address', form.address);
        payload.append('description', form.description);
        payload.append('currencey', form.currencey);
        if (selectedImage.value) {
            payload.append('image', selectedImage.value);
        }

        if (selectedLogo.value) {
            payload.append('invoice_logo', selectedLogo.value);
        }

        const updated = await updateData(payload, data.value?.[0]?._id);
        successMessage.value = 'Company profile updated!';
        form.image = updated.image;
    } catch (err) {
        errorMessage.value = err.response?.data?.error || 'Update failed.';
        console.error(err);
    } finally {
        isUploading.value = false;
    }
};
</script>
