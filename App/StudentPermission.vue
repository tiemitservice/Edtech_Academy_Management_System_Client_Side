<template>
    <div>
        <div>
            <h1 class="text-2xl">Hello , Welcome to test mode</h1>
            <!-- <h2 class="text-2xl font-bold mb-4">Teacher Classes</h2> -->
            <div v-if="filteredClasses?.length != 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div v-for="classItem in filteredClasses" :key="classItem._id" @click="handleClass(classItem)" class="cursor-pointer flex flex-col p-4 shadow-lg rounded-lg bg-primary" role="button">
                    <h3 class="text-xl font-semibold text-white">{{ classItem.name }}</h3>
                    <p class="text-white">Students: {{ classItem.students.length }}</p>
                </div>
            </div>
            <Dialog v-model:visible="visible" modal header="Edit Profile" :style="{ width: '25rem' }">
                <StudentClassDetial @close="handleClose" :datatoedit="datatoedit" />
            </Dialog>
        </div>
    </div>
</template>

<script>
import { onMounted, ref, computed } from 'vue';
import useAuth from '@/composible/useAuth';
import { useFetch } from '@/composible/useFetch';
import StudentClassDetial from './StudentClassDetial.vue';
export default {
    components: {
        StudentClassDetial
    },
    setup() {
        const visible = ref(false);
        const datatoedit = ref(null);
        const handleClass = (classItem) => {
            datatoedit.value = classItem;
            visible.value = true;
        };
        const handleClose = () => {
            visible.value = false;
        };
        const { user } = useAuth();
        const { data, fetchData } = useFetch('students');
        const { data: classes, fetchData: fetchClasses } = useFetch('classes');
        const filters = ref({
            limit: 1,
            page: 1,
            email: ''
        });
        const filtersClass = ref({
            status: 'true',
            limit: 10,
            page: 1
        });
        const filteredClasses = computed(() => {
            if (!classes.value || !classes.value.data || !user.value || !user.value.email) {
                return [];
            }

            return classes.value.data.filter((classItem) => {
                const student = classItem.students.find((student) => student.email === user.value.email);
                return student;
            });
        });
        onMounted(async () => {
            if (user.value && user.value.email) {
                filters.value.email = user.value.email;
            } else {
                console.error('No authenticated user or email found!');
                return;
            }
            await fetchData(filters.value);
            await fetchClasses(filtersClass.value);
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
            data,
            classes,
            filters,
            filteredClasses,
            filtersClass,
            handleClass,
            handleClose,
            visible,
            datatoedit
        };
    }
};
</script>

<style lang="scss" scoped></style>
