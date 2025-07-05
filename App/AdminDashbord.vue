<template>
    <div class="w-full h-full bg-gray-100 p-4">
        <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between bg-white shadow-md rounded-lg p-4">
                <div class="flex flex-col gap-2">
                    <h1 class="text-2xl">
                        Hello
                        <span class="text-primary font-semibold">
                            {{ user?.name }}
                        </span>
                        , Welcome to test mode
                    </h1>
                </div>
                <div v-for="(item, index) in data.data" :key="index" class="flex items-center gap-4">
                    <div class="">
                        <div class="rounded-full overflow-hidden bg-gray-200 w-16 h-16">
                            <img class="object-cover w-full h-full" :src="item.image" alt="" />
                        </div>
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <router-link to="/app/teacherprofile" class="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition">
                    <h2 class="text-xl font-semibold">Profile</h2>
                    <p class="text-gray-500">View and manage your profile.</p>
                </router-link>
                <router-link to="/app/teacherclasses" class="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition">
                    <h2 class="text-xl font-semibold">Classes</h2>
                    <p class="text-gray-500">Manage your classes.</p>
                </router-link>
                <router-link to="/app/examination" class="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition">
                    <h2 class="text-xl font-semibold">Examination</h2>
                    <p class="text-gray-500">Manage examinations.</p>
                </router-link>
                <router-link to="/app/teacherrequest" class="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition">
                    <h2 class="text-xl font-semibold">Form Request</h2>
                    <p class="text-gray-500">Submit and view form requests.</p>
                </router-link>
                <!-- main router -->
            </div>
            <div>
                <router-view></router-view>
            </div>
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
        const { data, fetchData, updateUser } = useFetch('staffs');
        const filters = ref({
            status: 'true',
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

<style lang="scss" scoped></style>
