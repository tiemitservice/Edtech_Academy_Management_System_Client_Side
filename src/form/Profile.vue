<template>
    <div class="w-full flex flex-col items-center justify-center">
        <div v-if="data" class="w-full overflow-hidden bg-white rounded-lg shadow-lg dark:bg-gray-800 p-2 space-y-4">
            <!-- Profile Image with Upload Functionality -->
            <div class="relative group mx-auto">
                <img class="object-cover object-center w-56 h-56 rounded-full border-2 border-primary mx-auto" :src="form.image" alt="avatar" />
                <div class="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity w-56 h-56 mx-auto">
                    <label class="cursor-pointer text-white text-sm font-medium p-2">
                        {{ isUploading ? 'Uploading...' : 'Change Photo' }}
                        <input type="file" class="hidden" accept="image/*" @change="handleChange" :disabled="isUploading" />
                    </label>
                </div>
            </div>

            <!-- Profile Form -->
            <div class="px-6 py-4 bg-slate-100 dark:bg-slate-800">
                <form @submit.prevent="handleUpdate" class="space-y-4">
                    <!-- Khmer Name -->
                    <div class="space-y-2">
                        <label for="kh_name" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Khmer Name</label>
                        <InputText id="kh_name" v-model="form.kh_name" placeholder="Enter Khmer name" class="w-full" />
                    </div>

                    <!-- English Name -->
                    <div class="space-y-2">
                        <label for="en_name" class="block text-sm font-medium text-gray-700 dark:text-gray-200">English Name</label>
                        <InputText id="en_name" v-model="form.name" placeholder="Enter English name" class="w-full" />
                    </div>

                    <!-- Position -->
                    <div class="space-y-2">
                        <div class="flex items-center text-gray-700 dark:text-gray-200">
                            <svg aria-label="suitcase icon" class="w-6 h-6 fill-current" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 11H10V13H14V11Z" />
                                <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M7 5V4C7 2.89545 7.89539 2 9 2H15C16.1046 2 17 2.89545 17 4V5H20C21.6569 5 23 6.34314 23 8V18C23 19.6569 21.6569 21 20 21H4C2.34314 21 1 19.6569 1 18V8C1 6.34314 2.34314 5 4 5H7ZM9 4H15V5H9V4ZM4 7C3.44775 7 3 7.44769 3 8V14H21V8C21 7.44769 20.5522 7 20 7H4ZM3 18V16H21V18C21 18.5523 20.5522 19 20 19H4C3.44775 19 3 18.5523 3 18Z"
                                />
                            </svg>
                            <label for="position" class="px-2 text-sm font-medium">Position</label>
                        </div>
                        <InputText id="position" v-model="form.position" placeholder="Your position" class="w-full" />
                    </div>

                    <!-- Address -->
                    <div class="space-y-2">
                        <div class="flex items-center text-gray-700 dark:text-gray-200">
                            <svg aria-label="location pin icon" class="w-6 h-6 fill-current" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M16.2721 10.2721C16.2721 12.4813 14.4813 14.2721 12.2721 14.2721C10.063 14.2721 8.27214 12.4813 8.27214 10.2721C8.27214 8.063 10.063 6.27214 12.2721 6.27214C14.4813 6.27214 16.2721 8.063 16.2721 10.2721ZM14.2721 10.2721C14.2721 11.3767 13.3767 12.2721 12.2721 12.2721C11.1676 12.2721 10.2721 11.3767 10.2721 10.2721C10.2721 9.16757 11.1676 8.27214 12.2721 8.27214C13.3767 8.27214 14.2721 9.16757 14.2721 10.2721Z"
                                />
                                <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M5.79417 16.5183C2.19424 13.0909 2.05438 7.3941 5.48178 3.79418C8.90918 0.194258 14.6059 0.0543983 18.2059 3.48179C21.8058 6.90919 21.9457 12.606 18.5183 16.2059L12.3124 22.7241L5.79417 16.5183ZM17.0698 14.8268L12.243 19.8965L7.17324 15.0698C4.3733 12.404 4.26452 7.9732 6.93028 5.17326C9.59603 2.37332 14.0268 2.26454 16.8268 4.93029C19.6267 7.59604 19.7355 12.0269 17.0698 14.8268Z"
                                />
                            </svg>
                            <label for="address" class="px-2 text-sm font-medium">Address</label>
                        </div>
                        <InputText id="address" v-model="form.location" placeholder="Your address" class="w-full" />
                    </div>

                    <!-- Email -->
                    <div class="space-y-2">
                        <div class="flex items-center text-gray-700 dark:text-gray-200">
                            <svg aria-label="email icon" class="w-6 h-6 fill-current" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M3.00977 5.83789C3.00977 5.28561 3.45748 4.83789 4.00977 4.83789H20C20.5523 4.83789 21 5.28561 21 5.83789V17.1621C21 18.2667 20.1046 19.1621 19 19.1621H5C3.89543 19.1621 3 18.2667 3 17.1621V6.16211C3 6.11449 3.00333 6.06765 3.00977 6.0218V5.83789ZM5 8.06165V17.1621H19V8.06199L14.1215 12.9405C12.9499 14.1121 11.0504 14.1121 9.87885 12.9405L5 8.06165ZM6.57232 6.80554H17.428L12.7073 11.5263C12.3168 11.9168 11.6836 11.9168 11.2931 11.5263L6.57232 6.80554Z"
                                />
                            </svg>
                            <label for="email" class="px-2 text-sm font-medium">Email</label>
                        </div>
                        <InputText id="email" v-model="form.email" placeholder="Your email" class="w-full" />
                    </div>

                    <!-- Phone Number -->
                    <div class="space-y-2">
                        <div class="flex items-center text-gray-700 dark:text-gray-200">
                            <svg aria-label="phone icon" class="w-6 h-6 fill-current" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M5 4C5 2.89543 5.89543 2 7 2H17C18.1046 2 19 2.89543 19 4V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V4ZM7 4H17V20H7V4Z" />
                                <path d="M12 19C12.5523 19 13 18.5523 13 18C13 17.4477 12.5523 17 12 17C11.4477 17 11 17.4477 11 18C11 18.5523 11.4477 19 12 19Z" />
                            </svg>
                            <label for="phone" class="px-2 text-sm font-medium">Phone</label>
                        </div>
                        <InputText id="phone" v-model="form.phone" placeholder="Your phone number" class="w-full" />
                    </div>

                    <!-- Submit Button -->
                    <div class="flex justify-end pt-4">
                        <Button type="submit" :loading="isSubmitting" class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"> Update Profile </Button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, reactive, computed } from 'vue';
import useAuth from '@/composible/useAuth';
import { useFetch } from '@/composible/useFetch';

// Using composables
const { user } = useAuth();
const { data, fetchData, updateUser } = useFetch('staffs');

// UI state
const isUploading = ref(false);
const isSubmitting = ref(false);
const imagePreview = ref(null);

// Filters for the data fetch
const filters = ref({
    status: 'true',
    limit: 1,
    page: 1,
    email: ''
});

// Form data with additional fields
const form = reactive({
    name: '',
    kh_name: '',
    location: '',
    email: '',
    image: null,
    phone: '',
    position: '',
    department: '',
    image: null
});

// Handle image change with preview
const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        isUploading.value = true;
        form.image = file;

        // Create image preview
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.value = e.target.result;
            isUploading.value = false;
        };
        reader.readAsDataURL(file);

        console.log('Selected image:', form.image);
    }
};

onMounted(async () => {
    try {
        // Set the email filter to the authenticated user's email
        if (user.value && user.value.email) {
            filters.value.email = user.value.email;
        } else {
            console.error('No authenticated user or email found!');
            return;
        }

        await fetchData(filters.value);

        // Handle data structure variations
        let userData = data.value;
        if (Array.isArray(data.value)) {
            userData = data.value[0]; // If data.value is an array
        } else if (data.value?.data && Array.isArray(data.value.data)) {
            userData = data.value.data[0]; // If data.value is an object with a data array
        } else {
            console.error('No data found or invalid data structure!');
            return;
        }

        // Populate the form with user data
        form.image = userData?.image || null;
        form.name = userData?.en_name || userData?.name || 'N/A';
        form.kh_name = userData?.kh_name || 'N/A';
        form.location = userData?.address || userData?.location || 'N/A';
        form.email = userData?.email || 'N/A';
        form.image = userData?.image || null; // Use null for image if not present
        form.phone = userData?.phoneNumber || userData?.phone || 'N/A';
        form.position = userData?.posistion || userData?.position || 'N/A';
    } catch (error) {
        console.error('Error fetching data:', error);
    }
});

const handleUpdate = async () => {
    isSubmitting.value = true;

    const payload = new FormData();

    // Append all fields to FormData
    payload.append('name', form.name);
    payload.append('kh_name', form.kh_name);
    payload.append('location', form.location);
    payload.append('address', form.location); // Using location for address
    payload.append('email', form.email);
    payload.append('phoneNumber', form.phone);
    payload.append('posistion', form.position); // Note: "posistion" is spelled as in original code

    // Append the profile image if it exists
    if (form.image instanceof File) {
        payload.append('image', form.image);
    } else if (form.image && typeof form.image === 'string') {
        payload.append('image', form.image); // Handle existing image URL if not a new file
    }

    try {
        const userId = data.value?.data?.[0]?._id || data.value?.[0]?._id;
        if (!userId) {
            throw new Error('No user ID found for update');
        }

        await updateUser(payload, userId);
        console.log('User updated successfully');
        console.log('FormData:', payload);

        // Show success message (you can add a toast notification here)
    } catch (error) {
        console.error('Error updating user:', error);
        // Show error message
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<style scoped>
/* Add any component-specific styles here */
.bg-primary {
    background-color: var(--primary-color, #4f46e5);
}

.border-primary {
    border-color: var(--primary-color, #4f46e5);
}

.bg-primary-dark {
    background-color: var(--primary-dark-color, #4338ca);
}

/* Add transition for hover effects */
.transition-colors {
    transition: background-color 0.3s ease;
}

.transition-opacity {
    transition: opacity 0.3s ease;
}
</style>
