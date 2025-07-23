<template>
    <section class="px-4 mx-auto">
        <div class="flex justify-between items-center mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg flex-wrap">
            <label class="text-lg font-medium text-gray-800 dark:text-white">{{ $t('staff.teacher') }}</label>

            <div class="flex items-center gap-4 flex-wrap">
                <IconField>
                    <InputIcon class="pi pi-search" />
                    <InputText :placeholder="$t('element.Searchbyname')" v-model="searchQuery" />
                </IconField>
                <Dropdown v-model="selectedPosition" filter show-clear :options="positions" option-value="_id" option-label="name" :placeholder="$t('staff.select_position')" />
                <Dropdown v-model="selectedDepartment" filter show-clear :options="departments" option-value="_id" option-label="name" :placeholder="$t('staff.select_department')" />
                <Button :label="$t('element.addnew')" @click="openModal" />
            </div>
        </div>
        <div class="flex flex-col">
            <div class="overflow-x-auto">
                <div class="py-2">
                    <DataTable v-if="tableData.length > 0" :value="tableData" :paginator="true" :rows="50" :rowsPerPageOptions="[50, 100, 250]">
                        <!-- No. Column -->
                        <Column field="displayId" :header="$t('element.num')" sortable style="min-width: 150px">
                            <template #body="slotProps">
                                <p class="font-medium">{{ slotProps.data.displayId }}</p>
                            </template>
                        </Column>

                        <!-- Profile Column -->
                        <Column field="profile" :header="$t('student.profile')" style="min-width: 150px">
                            <template #body="slotProps">
                                <div class="flex items-center space-x-3">
                                    <div class="flex w-16 h-16 items-center justify-center overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
                                        <img :src="slotProps.data?.image ? slotProps.data.image : 'https://placehold.co/64'" :alt="slotProps.data.en_name" />
                                    </div>
                                </div>
                            </template>
                        </Column>

                        <!-- Created At Column -->
                        <Column field="createdAt" :header="$t('element.createdat')" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold rounded-full">
                                    <p>{{ formatDate2(slotProps.data.createdAt) }}</p>
                                </div>
                            </template>
                        </Column>

                        <!-- English Name Column -->
                        <Column field="en_name" :header="$t('staff.eng_name')" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold rounded-full">
                                    <p>{{ slotProps.data.en_name }}</p>
                                </div>
                            </template>
                        </Column>

                        <!-- Khmer Name Column -->
                        <Column field="kh_name" :header="$t('staff.kh_name')" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold rounded-full">
                                    <p>{{ slotProps.data.kh_name }}</p>
                                </div>
                            </template>
                        </Column>
                        <Column field="gender" :header="$t('staff.gender')" sortable style="min-width: 100px">
                            <template #body="slotProps">
                                <p>{{ $t(`gender.${slotProps.data.gender.toLowerCase()}`) }}</p>
                            </template>
                        </Column>

                        <!-- Position Column -->
                        <Column field="position" :header="$t('staff.positsion')" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <p>{{ formatePositionById(slotProps.data.position) }}</p>
                            </template>
                        </Column>

                        <!-- Department Column -->
                        <Column field="department" :header="$t('staff.department')" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <p>{{ formateDepartmentById(slotProps.data.department) }}</p>
                            </template>
                        </Column>

                        <!-- Actions Column -->
                        <Column :header="$t('element.action')" style="min-width: 150px">
                            <template #body="slotProps">
                                <div class="flex space-x-2">
                                    <Button icon="pi pi-info-circle" @click="openStaffModal(slotProps.data)" severity="success" rounded :aria-label="$t('actions.info')" />
                                    <Button icon="pi pi-pencil" severity="warn" rounded :aria-label="$t('element.edit')" @click="handleEdit(slotProps.data)" />
                                    <Button @click="handleDeleteConfirm(slotProps.data._id, slotProps.data)" icon="pi pi-trash" severity="danger" rounded :aria-label="$t('element.delete')" />
                                </div>
                            </template>
                        </Column>
                    </DataTable>

                    <!-- Loading State -->
                    <div v-else-if="loading" class="text-center py-10">
                        <p>{{ $t('element.loading') }}</p>
                    </div>
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
                            <DialogPanel class="transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
                                <div class="">
                                    <Staffform :datatoedit="datatoedit" @close="handleClose" @toast="showToast" />
                                </div>
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
                    <div class="flex min-h-full items-start justify-center p-4 text-center">
                        <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                            <DialogPanel class="w-full transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
                                <div class="mt-2">
                                    <StaffInformation :datatoedit="datatoedit" @close="closeStaffModal" @toast="showToast" />
                                </div>
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
import { ref, onMounted, computed, watch } from 'vue';
import Dropdown from 'primevue/dropdown';
import { useFetch } from '../composible/useFetch';
import { TransitionRoot, TransitionChild, Dialog, DialogPanel } from '@headlessui/vue';
import Staffform from '@/form/Staffform.vue';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import StaffInformation from '@/form/StaffInformation.vue';
import DeleteConfimation from '@/form/DeleteConfimation.vue';
import { useToast } from 'primevue/usetoast';
import { formatDate2 } from '@/composible/formatDate';

// Modal state
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const showToast = (action, severity) => {
    const summary = t(`toast.${action}`, t('toast.action')); // Fallback to a generic 'action completed' message
    toast.add({ severity: severity || 'info', summary, life: 3000 });
};
const isOpen = ref(false);
const isStaffOpen = ref(false);
const openStaffModal = (data) => {
    datatoedit.value = data;
    isStaffOpen.value = true;
};
const closeStaffModal = () => {
    isStaffOpen.value = false;
};
const datatoedit = ref(null);
const handleEdit = (data) => {
    datatoedit.value = data;
    openModal();
};
const handleClose = () => {
    isOpen.value = false;
    datatoedit.value = null;
};
function closeModal() {
    isOpen.value = false;
    datatoedit.value = null;
}
function openModal() {
    isOpen.value = true;
}

const toast = useToast();

// Fetch staff and positions
const collection = ref('staffs');
const { data: rawData, loading, error, fetchData } = useFetch(collection.value);
const { data: positions, loading: positionsLoading, error: positionsError, fetchData: fetchPositions } = useFetch('positions');
const { data: departments, loading: departmentLoading, error: departmentError, fetchData: fetchDepartment } = useFetch('departments');
// search
const searchQuery = ref('');

const formateDepartmentById = (id) => {
    const department = departments.value?.find((item) => item._id === id);
    return department ? department.name : 'N/A';
};

const formatePositionById = (id) => {
    const position = positions.value?.find((item) => item._id === id);
    return position ? position.name : 'N/A';
};

const filteredData = computed(() => {
    const q = searchQuery.value.trim().toLowerCase();
    return (
        rawData.value?.filter((item) => {
            const matchesName = !q || item.en_name?.toLowerCase().includes(q) || item.kh_name?.toLowerCase().includes(q);
            const matchesPosition = !selectedPosition.value || item.position === selectedPosition.value;
            const matchesDepartment = !selectedDepartment.value || item.department === selectedDepartment.value;
            return matchesName && matchesPosition && matchesDepartment;
        }) || []
    ); // Ensure it returns an array even if rawData is null
});

// NEW: Computed property to add a sortable ID to the filtered data
const tableData = computed(() => {
    return filteredData.value.map((item, index) => ({
        ...item,
        displayId: index + 1
    }));
});

const selectedPosition = ref(null);
const selectedDepartment = ref(null);

const isDelete = ref(false);
const deleteData = ref(null);
const handleDeleteConfirm = (id, doc) => {
    deleteData.value = id;
    isDelete.value = true;
    datatoedit.value = doc;
};

const handleCloseDelete = () => {
    isDelete.value = false;
    deleteData.value = null;
};

// Fetch data on mount
onMounted(async () => {
    await fetchData();
    await fetchPositions();
    await fetchDepartment();
});
</script>

<style scoped>
.dropdown {
    width: 200px;
}
</style>
