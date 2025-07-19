<template>
    <section class="px-4 mx-auto">
        <!-- Header and Filter Controls -->
        <div class="flex justify-between items-center mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg flex-wrap">
            <label class="text-lg font-medium text-gray-800 dark:text-white">{{ $t('teacher_permission.title') }}</label>

            <div class="flex items-center gap-4 flex-wrap">
                <!-- Filter by Staff Name -->
                <IconField>
                    <InputIcon class="pi pi-search" />
                    <InputText :placeholder="$t('element.Searchbyname')" v-model="searchQuery" class="min-w-[180px]" />
                </IconField>
                <!-- Filter by a single day -->
                <div class="flex items-center gap-2">
                    <Calendar v-model="filterDate" :placeholder="$t('element.createdat')" dateFormat="yy-mm-dd" showIcon inputId="date_filter" />
                </div>
                <!-- Apply Filter Button -->
                <Button @click="applyFilters" :label="$t('element.filter')" />
                <!-- Add New Button -->
                <Button @click="openModal" :label="$t('element.addnew')" />
            </div>
        </div>

        <div class="flex flex-col">
            <div class="overflow-x-auto">
                <div class="py-2" v-if="!loading">
                    <DataTable v-if="filteredData.length > 0" :value="filteredData" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 25]">
                        <Column :header="$t('element.num')" style="min-width: 50px">
                            <template #body="slotProps">{{ slotProps.index + 1 }}</template>
                        </Column>
                        <Column field="staff" :header="$t('teacher_permission.teacher')" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg">{{ formatStaffName(slotProps.data.staff) }}</div>
                            </template>
                        </Column>
                        <Column field="reason" :header="$t('teacher_permission.reason')" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg">{{ slotProps.data.reason }}</div>
                            </template>
                        </Column>
                        <Column field="hold_date" :header="$t('teacher_permission.holder_date')" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <p v-if="Array.isArray(slotProps.data.hold_date)">
                                    {{ slotProps.data.hold_date.map((d) => new Date(d).toLocaleDateString()).join(' - ') }}
                                </p>
                            </template>
                        </Column>
                        <Column field="status" :header="$t('element.status')" class="capitalize" sortable style="min-width: 150px">
                            <template #body="slotProps">
                                <Tag :severity="getStatusSeverity(slotProps.data.status)" :value="slotProps.data.status.toLowerCase()"></Tag>
                            </template>
                        </Column>
                        <Column :header="$t('element.action')" style="min-width: 150px">
                            <template #body="slotProps">
                                <div class="flex space-x-2">
                                    <Button icon="pi pi-inbox" severity="warn" rounded :aria-label="$t('element.edit')" @click="handleEdit(slotProps.data)" />
                                    <Button @click="handleDeleteConfirm(slotProps.data._id, slotProps.data)" icon="pi pi-trash" severity="danger" rounded :aria-label="$t('element.delete')" />
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                    <div v-else>
                        <NotFound :message="$t('teacher_permission.no_requests_found')" />
                    </div>
                </div>
                <div v-else>
                    <Laoding />
                </div>
            </div>
        </div>
        <!-- Add/Edit Modal -->
        <TransitionRoot appear :show="isOpen" as="template">
            <Dialog as="div" @close="closeModal" class="relative z-[99]">
                <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                    <div class="fixed inset-0 bg-black/25" />
                </TransitionChild>
                <div class="fixed inset-0 overflow-y-auto">
                    <div class="flex min-h-full items-start justify-center p-4 text-center">
                        <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                            <DialogPanel class="w-fit transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl transition-all">
                                <div class="mt-2">
                                    <StaffAproveForm :datatoedit="datatoedit" @close="handleClose" @toast="showToast" />
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>

        <!-- Delete Confirmation Modal -->
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
                                    <DeleteConfimation :deleteData="deleteId" :datatoedit="datatoedit" :collection="collection" @close="handleCloseDelete" @toast="showToast" />
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
import { useToast } from 'primevue/usetoast';
import Calendar from 'primevue/calendar';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import StaffAproveForm from '@/form/StaffAproveForm.vue';
import DeleteConfimation from '@/form/DeleteConfimation.vue';
import NotFound from './pages/NotFound.vue';
import Laoding from './pages/Laoding.vue';
import moment from 'moment';
import { useI18n } from 'vue-i18n'; // Initialize i18n
const { t } = useI18n();
const showToast = (action, severity) => {
    const summary = t(`toast.${action}`, t('toast.action')); // Fallback to a generic 'action completed' message
    toast.add({ severity: severity || 'info', summary, life: 3000 });
};
const isOpen = ref(false);
const datatoedit = ref(null);
const collection = ref('staffpermissions');
const { data: staffs, fetchData: fetchStaff } = useFetch('users');

// Refs for filters
const filterDate = ref(new Date());
const searchQuery = ref('');

const { data: rawData, loading, error, fetchData } = useFetch(collection.value);
const filteredData = ref([]);

const formatStaffName = (staffId) => {
    const staff = staffs.value?.find((s) => s._id === staffId);
    return staff ? staff?.name : 'Unknown';
};

const getStatusSeverity = (status) => {
    switch (status) {
        case 'accepted':
            return 'success';
        case 'rejected':
            return 'danger';
        case 'pending':
            return 'warn';
        default:
            return 'info';
    }
};

const toast = useToast();

const isDelete = ref(false);
const deleteId = ref(null);
const handleDeleteConfirm = (id, doc) => {
    deleteId.value = id;
    datatoedit.value = doc;
    isDelete.value = true;
};

const handleCloseDelete = async (wasDeleted) => {
    isDelete.value = false;
    deleteId.value = null;
    datatoedit.value = null;
    if (wasDeleted) {
        await fetchData(); // Refetch all data
    }
};

const handleEdit = (doc) => {
    isOpen.value = true;
    datatoedit.value = doc;
};

const handleClose = async (wasSaved) => {
    isOpen.value = false;
    datatoedit.value = null;
    if (wasSaved) {
        await fetchData(); // Refetch all data
    }
};

const closeModal = () => {
    isOpen.value = false;
    datatoedit.value = null;
};

function openModal() {
    datatoedit.value = null;
    isOpen.value = true;
}

const applyFilters = () => {
    let dataToFilter = [...rawData.value];

    // Filter by date
    if (filterDate.value) {
        const selectedDate = moment(filterDate.value);
        dataToFilter = dataToFilter.filter((item) => moment(item.created_at).isSame(selectedDate, 'day'));
    }

    // Filter by staff name
    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        dataToFilter = dataToFilter.filter((item) => formatStaffName(item.staff).toLowerCase().includes(q));
    }

    filteredData.value = dataToFilter;
};

// Watch for changes on the raw data and search query to re-apply filters automatically
watch([rawData, searchQuery, filterDate], () => {
    applyFilters();
});

onMounted(async () => {
    await fetchStaff();
    await fetchData(); // Fetch all data initially
});
</script>
