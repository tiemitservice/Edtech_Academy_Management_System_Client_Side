<template>
    <section class="px-4 mx-auto w-full">
        <div class="flex justify-between items-center mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg">
            <label class="text-lg font-medium text-gray-800">Assign Student to Teacher</label>

            <div class="flex flex-wrap gap-4 items-center justify-end">
                <IconField>
                    <InputIcon class="pi pi-search" />
                    <InputText v-model="searchQuery" placeholder="Search by name" class="min-w-[200px]" />
                </IconField>
                <Dropdown :options="genders" show-clear option-value="value" v-model="selectGender" option-label="label" placeholder="Filter by gender" class="min-w-[150px]" />
                <Dropdown :options="category" show-clear option-value="_id" v-model="selectCategory" option-label="name" placeholder="Filter by category" class="min-w-[150px]" />
                <DatePicker selectionMode="range" show-button-bar v-model="selectDOB" placeholder="Filter by date of birth" class="min-w-[120px]" />
                <DatePicker selectionMode="range" show-button-bar v-model="selectEntered" placeholder="Filter by entered" class="min-w-[120px]" />
                <Button label="Apply Filter" @click="filterData" />
            </div>
        </div>

        <div class="flex flex-col">
            <div class="overflow-x-auto">
                <div class="py-2" v-if="!loading && data.length > 0">
                    <DataTable v-if="data" :value="data" :paginator="true" :rows="50" :rowsPerPageOptions="[50, 100, 250]">
                        <Column field="id" header="ID" sortable style="min-width: 150px">
                            <template #body="slotProps">
                                <p class="font-medium">{{ slotProps.index + 1 }}</p>
                                <!-- <p class="font-medium">{{ slotProps.data._id }}</p> -->
                            </template>
                        </Column>
                        <Column field="image" header="Profile" style="min-width: 150px">
                            <template #body="slotProps">
                                <div class="flex items-center space-x-3">
                                    <div class="flex items-center justify-center w-16 h-16 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
                                        <img :src="slotProps.data.image || 'https://placehold.co/64'" :alt="slotProps.data.eng_name" class="object-cover w-full h-full" />
                                    </div>
                                </div>
                            </template>
                        </Column>
                        <Column field="eng_name" header="English Name" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <p>{{ slotProps.data.eng_name }}</p>
                            </template>
                        </Column>
                        <Column field="kh_name" header="Khmer Name" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <p>{{ slotProps.data.kh_name }}</p>
                            </template>
                        </Column>

                        <Column field="gender" header="Gender" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <p>{{ slotProps.data.gender }}</p>
                            </template> </Column
                        ><Column field="teacher" header="Teacher" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <p>{{ formatStaffNestedField(slotProps.data.teacher, 'en_name') ? formatStaffNestedField(slotProps.data.teacher, 'en_name') : 'No teacher' }}</p>
                            </template>
                        </Column>
                        <Column field="student_type" header="Student Type" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <p>{{ formatCategoryById(slotProps.data.student_type) }}</p>
                            </template>
                        </Column>

                        <Column header="Actions" style="min-width: 150px">
                            <template #body="slotProps">
                                <div class="flex space-x-2">
                                    <Button icon="pi pi-pencil" severity="warn" rounded aria-label="Edit" @click="handleEdit(slotProps.data)" />
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                </div>
                <div v-else-if="!loading && data.length === 0 && hasFiltered" class="py-10 text-center text-gray-500">
                    <NotFound />
                </div>
                <div v-else class="py-10 text-center text-gray-500">
                    <Laoding />
                </div>
            </div>
        </div>

        <TransitionRoot appear :show="isOpen" as="template">
            <Dialog as="div" @close="closeModal" class="relative z-[99]">
                <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                    <div class="fixed inset-0 bg-black/25" />
                </TransitionChild>
                <div class="fixed inset-0 overflow-y-auto">
                    <div class="flex min-h-full items-start justify-center p-4 text-center">
                        <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                            <DialogPanel class="w-fit transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
                                <AssigneStudentToTeacherForm :datatoedit="datatoedit" @close="handleClose" @toast="showToast" />
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>

        <Toast position="top-right" />
    </section>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import Dropdown from 'primevue/dropdown';
import { useFetch } from '../composible/useFetch';
import { TransitionRoot, TransitionChild, Dialog, DialogPanel } from '@headlessui/vue';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import AssigneStudentToTeacherForm from '@/form/AssigneStudentToTeacherForm.vue';
import { useToast } from 'primevue';
import moment from 'moment';
import NotFound from './pages/NotFound.vue';
import Laoding from './pages/Laoding.vue';
// Modal state
const isOpen = ref(false);
const datatoedit = ref(null);
const toast = useToast();
const showToast = (action, severity) => {
    let summary;
    switch (action) {
        case 'create':
            severity = 'success';
            summary = ' Created Success';
            break;
        case 'update':
            severity = 'info';
            summary = ' Updated Success';
            break;
        case 'delete':
            summary = ' Deleted Success';
            break;
        case 'asociate':
            severity = 'warn';
            summary = ' Please delete the associated data first';
            break;
        default:
            severity = 'info';
            summary = 'Action Completed';
    }

    toast.add({
        severity: severity,
        summary: summary,
        life: 3000
    });
};

// Fetch staff and related data
const collection = ref('students');
const { data: rawData, loading, fetchData } = useFetch(collection.value);
const { data: category, fetchData: fetchCategory } = useFetch('student_categories');
const { data: staffData, fetchData: fetchStaff } = useFetch('staffs');
const searchQuery = ref('');
const selectGender = ref(null);
const genders = ref([
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' }
]);
const selectDOB = ref(null);
const selectCategory = ref(null);

const formatCategoryById = (id) => {
    const cate = category.value.find((item) => item._id === id);
    return cate ? cate.name : 'N/A';
};
const formatStaffNestedField = (id, fieldPath, fallback = 'No teacher') => {
    const staff = staffData.value?.find((s) => s._id?.toString() === id?.toString());
    if (!staff) return fallback;

    try {
        const result = fieldPath.split('.').reduce((obj, key) => obj?.[key], staff);
        return Array.isArray(result) ? result.join(', ') : (result ?? fallback);
    } catch (err) {
        return fallback;
    }
};
const data = ref([]);
const hasFiltered = ref(false);

const selectEntered = ref([moment().startOf('year').toDate(), moment().endOf('year').toDate()]);
const filterData = () => {
    loading.value = false;
    hasFiltered.value = false;

    setTimeout(() => {
        const q = searchQuery.value.trim().toLowerCase();

        data.value =
            rawData.value?.filter((item) => {
                const matchesName = !q || item.eng_name?.toLowerCase().includes(q) || item.kh_name?.toLowerCase().includes(q);

                const matchesGender = !selectGender.value || item.gender === selectGender.value;
                const matchesCategory = !selectCategory.value || item?.student_type === selectCategory.value;

                let matchesDOB = true;
                if (selectDOB.value?.length === 2) {
                    const dob = new Date(item.date_of_birth);
                    const [start, end] = selectDOB.value;
                    matchesDOB = dob >= new Date(start) && dob <= new Date(end);
                }

                let matchesEntered = true;
                if (selectEntered.value?.length === 2) {
                    const entered = new Date(item.date_intered);
                    const [start, end] = selectEntered.value;
                    matchesEntered = entered >= new Date(start) && entered <= new Date(end);
                }

                return matchesName && matchesGender && matchesDOB && matchesEntered && matchesCategory;
            }) || [];

        loading.value = false;
        hasFiltered.value = true;
    }, 400);
};
const openModal = async () => {
    datatoedit.value = null;
    isOpen.value = true;
    await fetchData();
};
const closeModal = () => {
    isOpen.value = false;
    datatoedit.value = null;
};

const handleEdit = (data) => {
    datatoedit.value = data;
    isOpen.value = true;
};
const handleClose = () => {
    isOpen.value = false;
    datatoedit.value = null;
    filterData();
};

watch(searchQuery, () => {
    filterData(); // Live search on typing
});
// Fetch data on mount
onMounted(async () => {
    await Promise.allSettled([fetchData(), fetchCategory(), fetchStaff()]);
    filterData();
});
</script>
