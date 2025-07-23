<template>
    <section class="px-4 mx-auto w-full">
        <div class="py-2 flex flex-col md:flex-row justify-between items-center mb-4 gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg">
            <label class="text-lg font-medium text-gray-800 dark:text-white text-nowrap">{{ $t('student.title') }}</label>

            <!-- Left: All filters and search in a row, wrap on small screens -->
            <div class="flex flex-wrap gap-4 items-start justify-end">
                <IconField>
                    <InputIcon class="pi pi-search" />
                    <InputText v-model="searchQuery" :placeholder="$t('element.Searchbyname')" class="min-w-[100px]" />
                </IconField>
                <Dropdown :options="genders" show-clear option-value="value" v-model="selectGender" option-label="label" :placeholder="$t('student.filter_by_gender')" class="min-w-[150px]" />
                <Dropdown :options="category" show-clear option-value="_id" v-model="selectCategory" option-label="name" :placeholder="$t('student.filter_by_category')" class="min-w-[150px]" />
                <DatePicker selectionMode="range" show-button-bar v-model="selectDOB" :placeholder="$t('student.filter_date_of_birth')" class="min-w-[120px]" />
                <DatePicker selectionMode="range" show-button-bar v-model="selectEntered" :placeholder="$t('student.filter_by_entered')" class="min-w-[120px]" />
                <Button :label="$t('element.filter')" @click="filterData" />

                <div class="flex-shrink-0">
                    <Button @click="openModal" :label="$t('element.addnew')" class="!text-white w-[100px]" />
                </div>
            </div>
        </div>

        <div class="flex flex-col">
            <div class="overflow-x-auto">
                <div class="py-2" v-if="!studentLoading && data.length > 0">
                    <DataTable :value="data" :paginator="true" :rows="50" :rowsPerPageOptions="[50, 100, 250]">
                        <!-- Column for row number -->
                        <Column field="displayId" :header="$t('element.num')" sortable style="min-width: 50px">
                            <template #body="slotProps">
                                <p class="font-medium">{{ slotProps.data.displayId }}</p>
                            </template>
                        </Column>

                        <!-- Column for student profile image -->
                        <Column field="image" :header="$t('student.profile')" style="min-width: 100px">
                            <template #body="slotProps">
                                <div class="flex items-center space-x-3">
                                    <div class="flex items-center justify-center w-16 h-16 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
                                        <img :src="slotProps.data.image || 'https://placehold.co/64'" :alt="slotProps.data.eng_name" class="object-cover w-full h-full" />
                                    </div>
                                </div>
                            </template>
                        </Column>

                        <!-- Column for date entered -->
                        <Column field="date_intered" :header="$t('student.day_entered')" sortable style="min-width: 50px">
                            <template #body="slotProps">
                                <p>{{ formatDate2(slotProps.data.date_intered) }}</p>
                            </template>
                        </Column>

                        <!-- Column for English name -->
                        <Column field="eng_name" :header="$t('student.eng_name')" sortable style="min-width: 100px">
                            <template #body="slotProps">
                                <p>{{ slotProps.data.eng_name }}</p>
                            </template>
                        </Column>

                        <!-- Column for Khmer name -->
                        <Column field="kh_name" :header="$t('student.kh_name')" sortable style="min-width: 100px">
                            <template #body="slotProps">
                                <p>{{ slotProps.data.kh_name }}</p>
                            </template>
                        </Column>

                        <!-- Column for gender -->
                        <Column field="gender" :header="$t('student.gender')" sortable style="min-width: 100px">
                            <template #body="slotProps">
                                <p>{{ $t(`gender.${slotProps.data.gender.toLowerCase()}`) }}</p>
                            </template>
                        </Column>

                        <!-- Column for student type -->
                        <Column field="student_type" :header="$t('student.type')" sortable style="min-width: 100px">
                            <template #body="slotProps">
                                <p>{{ formatCategoryById(slotProps.data.student_type) }}</p>
                            </template>
                        </Column>

                        <!-- Column for status -->
                        <Column field="status" :header="$t('element.status')" sortable style="min-width: 100px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold text-nowrap">
                                    <Tag :severity="slotProps.data.status ? 'success' : 'danger'" :value="slotProps.data.status ? $t('element.active') : $t('element.inactive')"></Tag>
                                </div>
                            </template>
                        </Column>

                        <!-- Column for actions -->
                        <Column :header="$t('element.action')" style="min-width: 150px">
                            <template #body="slotProps">
                                <div class="flex space-x-2">
                                    <Button icon="pi pi-info-circle" @click="openStaffModal(slotProps.data)" severity="success" rounded :aria-label="$t('actions.info')" />
                                    <Button icon="pi pi-pencil" severity="warn" rounded :aria-label="$t('actions.edit')" @click="handleEdit(slotProps.data)" />
                                    <Button @click="handleDeleteConfirm(slotProps.data._id, slotProps.data)" icon="pi pi-trash" severity="danger" rounded :aria-label="$t('actions.delete')" />
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                </div>
                <!-- No data state -->
                <div v-else-if="!studentLoading && data.length === 0 && hasFiltered" class="py-10 text-center text-gray-500">
                    <NotFound />
                </div>
                <!-- Loading state -->
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
                                <StudentForm :datatoedit="datatoedit" @close="handleClose" @toast="showToast" />
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>

        <TransitionRoot appear :show="isStaffOpen" as="template">
            <Dialog as="div" @close="closeStaffModal" class="relative z-[99]">
                <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                    <div class="fixed inset-0 bg-black/25" />
                </TransitionChild>
                <div class="fixed inset-0 overflow-y-auto">
                    <div class="flex min-h-full items-start justify-center p-4 text-center w-full">
                        <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                            <DialogPanel class="w-[70%] transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
                                <StudentDetails :datatoedit="datatoedit" @close="closeStaffModal" />
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>
        <TransitionRoot appear :show="isDelete" as="template">
            <Dialog as="div" @close="handleCloseDelete" class="relative z-[99]">
                <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                    <div class="fixed inset-0 bg-black/25" />
                </TransitionChild>

                <div class="fixed inset-0 overflow-y-auto">
                    <div class="flex min-h-full items-start justify-center p-4 text-center">
                        <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                            <DialogPanel class="w-fit transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
                                <div class="mt-2">
                                    <DeleteConfimation :deleteData="deleteData" :datatoedit="datatoedit" :collection="collection" @close="handleCloseDelete" @toast="showToast" />
                                </div>
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
import { useFetch } from '../composible/useFetch';
import { TransitionRoot, TransitionChild, Dialog, DialogPanel } from '@headlessui/vue';
import StudentForm from '@/form/StudentForm.vue';
import DeleteConfimation from '@/form/DeleteConfimation.vue';
import StudentDetails from './StudentDetails.vue';
import NotFound from './pages/NotFound.vue';
import Laoding from './pages/Laoding.vue';
import { useToast } from 'primevue';
import { formatDate2 } from '@/composible/formatDate';
import moment from 'moment';
import { useUserStore } from '@/store/useUserStore';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const showToast = (action, severity) => {
    const summary = t(`toast.${action}`, t('toast.action')); // Fallback to a generic 'action completed' message
    toast.add({ severity: severity || 'info', summary, life: 3000 });
};
const userStore = useUserStore();
if (userStore.hasPermission('student:create')) {
    console.log('You have permission to create student');
}

const collection = ref('students');
const { data: rawData, fetchData, loading: studentLoading } = useFetch(collection.value);
const { data: category, fetchData: fetchCategory } = useFetch('student_categories');
const isOpen = ref(false);
const isStaffOpen = ref(false);
const datatoedit = ref(null);
const toast = useToast();

const openModal = async () => {
    datatoedit.value = null;
    isOpen.value = true;
};
const closeModal = () => {
    isOpen.value = false;
    datatoedit.value = null;
};
const openStaffModal = (data) => {
    datatoedit.value = data;
    isStaffOpen.value = true;
};
const closeStaffModal = () => {
    isStaffOpen.value = false;
    datatoedit.value = null;
};
const handleEdit = (data) => {
    datatoedit.value = data;
    isOpen.value = true;
};
const handleClose = async () => {
    isOpen.value = false;
    datatoedit.value = null;
};

const formatCategoryById = (id) => {
    return category.value?.find((item) => item._id === id)?.name;
};

const searchQuery = ref('');
const selectGender = ref(null);
const genders = ref([
    { label: t('gender.male'), value: 'Male' },
    { label: t('gender.female'), value: 'Female' }
]);
const selectDOB = ref(null);
const selectCategory = ref(null);
const hasFiltered = ref(false);

const selectEntered = ref([moment().startOf('year').toDate(), moment().endOf('year').toDate()]);
const data = ref([]);
watch(
    rawData,
    () => {
        filterData(); // Re-apply filters whenever real-time data changes
    },
    { deep: true }
);

const filterData = () => {
    studentLoading.value = true; // Set loading to true at the start
    hasFiltered.value = false;

    setTimeout(() => {
        const q = searchQuery.value.trim().toLowerCase();

        const filtered =
            rawData.value?.filter((item) => {
                const matchesName = !q || item.eng_name?.toLowerCase().includes(q) || item.kh_name?.toLowerCase().includes(q);

                const matchesGender = !selectGender.value || item.gender === selectGender.value;

                const matchesCategory = !selectCategory.value || item.student_type === selectCategory.value;

                let matchesDOB = true;
                if (selectDOB.value?.length === 2 && selectDOB.value[0] && selectDOB.value[1]) {
                    const dob = new Date(item.date_of_birth);
                    const [start, end] = selectDOB.value;
                    matchesDOB = dob >= new Date(start) && dob <= new Date(end);
                }

                let matchesEntered = true;
                if (selectEntered.value?.length === 2 && selectEntered.value[0] && selectEntered.value[1]) {
                    const entered = new Date(item.date_intered);
                    const [start, end] = selectEntered.value;
                    matchesEntered = entered >= new Date(start) && entered <= new Date(end);
                }

                return matchesName && matchesGender && matchesDOB && matchesEntered && matchesCategory;
            }) || [];

        // UPDATED: Map over the filtered results to add a sortable 'displayId'
        data.value = filtered.map((item, index) => ({
            ...item,
            displayId: index + 1
        }));

        studentLoading.value = false;
        hasFiltered.value = true;
    }, 500);
};
watch(searchQuery, () => {
    filterData(); // Live search on typing
});

const isDelete = ref(false);
const deleteData = ref(null);
const handleDeleteConfirm = async (id, doc) => {
    deleteData.value = id;
    isDelete.value = true;
    datatoedit.value = doc; // Store the document to be deleted for confirmation
};
const handleCloseDelete = async () => {
    isDelete.value = false;
    deleteData.value = null;
};

// Fetch data on mount
onMounted(async () => {
    // UPDATED: Fetch data first, then the watcher will trigger the initial filter
    await fetchCategory();
    await fetchData();
});
</script>
