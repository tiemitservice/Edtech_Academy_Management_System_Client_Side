<template>
    <div>
        <div>
            <div class="flex flex-col gap-4">
                <router-link class="text-lg font-semibold text-primary" to="/studentpermission"> Student Permission </router-link>
                <router-link class="text-lg font-semibold text-primary" to="/studentprofile"> Student Profile </router-link>
            </div>
            <router-view />
        </div>
    </div>
</template>

<script>
import { ref, onMounted, reactive } from 'vue';
import useAuth from '@/composible/useAuth';
import { useFetch } from '@/composible/useFetch';
export default {
    setup() {
        const { user } = useAuth();
        const { data, fetchData, updateUser } = useFetch('students');
        const filters = ref({
            limit: 1,
            page: 1,
            email: ''
        });
        onMounted(async () => {
            if (user.value && user.value.email) {
                filters.value.email = user.value.email;
            } else {
                console.error('No authenticated user or email found!');
                return;
            }
            await fetchData(filters.value);
            let userData = data.value;
            if (Array.isArray(data.value)) {
                userData = data.value[0]; // If data.value is an array
            } else if (data.value?.data && Array.isArray(data.value.data)) {
                userData = data.value.data[0]; // If data.value is an object with a data array
            } else {
                console.error('No data found or invalid data structure!');
                return;
            }
        });
        return {
            user,
            data
        };
    }
};
</script>
