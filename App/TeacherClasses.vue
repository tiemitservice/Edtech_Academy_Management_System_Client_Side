<template>
    <div class="p-4">
        <h2 class="text-2xl font-bold mb-4">Teacher Classes</h2>
        <div v-if="filteredClasses?.length != 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="classItem in filteredClasses" :key="classItem._id" @click="handleClass(classItem)" class="cursor-pointer flex flex-col p-4 shadow-lg rounded-lg bg-primary" role="button">
                <h3 class="text-xl font-semibold text-white">{{ classItem.name }}</h3>
                <p class="text-white">Students: {{ classItem.students.length }}</p>
            </div>
        </div>
        <div v-else class="text-center">
            <p class="text-gray-500">No classes available.</p>
        </div>
        <TransitionRoot appear :show="isClass" as="template">
            <Dialog as="div" @close="handleClose" class="relative z-[99]">
                <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                    <div class="fixed inset-0 bg-black/25" />
                </TransitionChild>
                <div class="fixed inset-0 overflow-y-auto">
                    <div class="flex min-h-full items-start justify-center p-4 text-center">
                        <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                            <DialogPanel class="w-full transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                                <div class="mt-2">
                                    <TeacherClassDetail :datatoedit="datatoedit" @close="handleClose" />
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import useAuth from '@/composible/useAuth';
import { useFetch } from '@/composible/useFetch';
import { TransitionRoot, TransitionChild, Dialog, DialogPanel } from '@headlessui/vue';
import TeacherClassDetail from './TeacherClassDetail.vue';
import socket from '@/composible/socket';

// Reactive state
const isClass = ref(false);
const datatoedit = ref(null);
const loading = ref(true);
const error = ref(null);

// Authentication
const { user } = useAuth();

// Data fetching
const { data: staffData, fetchData: fetchStaff } = useFetch('staffs');
const { data: classes, fetchData: fetchClasses } = useFetch('classes');
// Filters
const filtersClass = ref({
    status: 'true',
    limit: 10,
    page: 1
});

const filters = ref({
    status: 'true',
    limit: 1,
    page: 1
});

// Computed property to filter classes by user's email
const filteredClasses = computed(() => {
    if (!classes.value || !classes.value || !user.value || !user.value.email) {
        return [];
    }

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    return classes.value.filter((classItem) => {
        const staff = classItem.staff;
        return staff && staff.email === user.value.email && Array.isArray(staff.workday) && staff.workday.includes(today);
    });
});

// Functions
const handleClass = (data) => {
    console.log('Opening modal for class:', data);
    datatoedit.value = data;
    isClass.value = true;
};

const handleClose = () => {
    isClass.value = false;
    datatoedit.value = null; // Reset to avoid stale data
};

const handleDatabaseUpdate = async () => {
    try {
        await fetchClasses(filtersClass.value);
        console.log('Database updated successfully');
    } catch (error) {
        console.error('Error updating database:', error);
    }
};
// Lifecycle hook
onMounted(async () => {
    socket.on('database_realTime', handleDatabaseUpdate);

    if (!user.value || !user.value.email) {
        console.error('No authenticated user or email found!');
        error.value = 'Authentication required to view classes.';
        loading.value = false;
        return;
    }

    filters.value.email = user.value.email;

    try {
        await Promise.all([fetchStaff(filters.value), fetchClasses(filtersClass.value)]);
        console.log('Fetched classes:', classes.value);
        console.log('Filtered classes:', filteredClasses.value);
    } catch (err) {
        console.error('Error fetching data:', err);
        error.value = 'Failed to load classes. Please try again.';
    } finally {
        loading.value = false;
    }
});
</script>
