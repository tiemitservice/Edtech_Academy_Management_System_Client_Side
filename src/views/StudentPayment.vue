<template>
    <section class="px-4 mx-auto">
        <div class="py-2 flex flex-col md:flex-row mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 items-center rounded-lg justify-between">
            <label class="text-lg font-medium text-gray-800 dark:text-white">Student Payments Tracking</label>
            <div class="flex items-center gap-4 flex-wrap justify-end">
                <IconField>
                    <InputIcon class="pi pi-search" />
                    <InputText placeholder="Search by name" v-model="searchQuery" class="w-full" />
                </IconField>
                <Select v-model="selectedPaymentType" :options="paymentTypes" option-value="value" option-label="name" show-clear placeholder="Filter by payment type" class="min-w-[180px]" />
                <Button @click="openModal" label="Add new" />
            </div>
        </div>

        <div class="flex flex-col" v-if="data">
            <div class="overflow-x-auto">
                <div class="py-2" v-if="!loading && data.length > 0">
                    <DataTable :value="data" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 25]">
                        <Column field="_id" header="No" sortable style="min-width: 150px">
                            <template #body="slotProps">
                                <div class="p-3 rounded" :class="getHighlightClass(slotProps.data)">
                                    <p class="font-medium">{{ slotProps.index + 1 }}</p>
                                </div>
                            </template>
                        </Column>

                        <Column field="eng_name" header="Name" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="px-3 py-1 text-lg font-semibold text-nowrap rounded" :class="getHighlightClass(slotProps.data)">{{ slotProps.data?.eng_name }}</div>
                            </template>
                        </Column>

                        <Column field="payment_date" header="Payment Date" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="px-3 py-1 text-lg font-semibold text-nowrap rounded" :class="getHighlightClass(slotProps.data)">{{ slotProps.data?.payment_date ? formatDate2(slotProps.data?.payment_date) : 'N/A' }}</div>
                            </template>
                        </Column>
                        <Column field="next_payment_date" header="Next Payment Date" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="px-3 py-1 text-lg font-semibold text-nowrap rounded" :class="getHighlightClass(slotProps.data)">{{ slotProps.data?.next_payment_date ? formatDate2(slotProps.data.next_payment_date) : 'N/A' }}</div>
                            </template>
                        </Column>
                        <Column field="payment_type" header=" Payment Type" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="px-3 py-1 text-lg font-semibold text-nowrap rounded" :class="getHighlightClass(slotProps.data)">
                                    {{ slotProps.data?.payment_type ?? 'N/A' }}
                                </div>
                            </template>
                        </Column>

                        <Column header="Actions" style="min-width: 150px">
                            <template #body="slotProps">
                                <div class="flex space-x-2 p-1 rounded" :class="getHighlightClass(slotProps.data)">
                                    <Button icon="pi pi-pencil" severity="warn" rounded aria-label="Edit" @click="handleEdit(slotProps.data)" />
                                    <Button
                                        :disabled="!slotProps.data?.next_payment_date && !slotProps.data?.payment_date && !slotProps.data?.payment_type"
                                        @click="handleReset(slotProps.data._id, slotProps.data)"
                                        icon="pi pi-file-export
"
                                        severity="danger"
                                        rounded
                                        aria-label="Delete"
                                    />
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                </div>
                <div v-else-if="!loading && data.length === 0 && hasFiltered">
                    <NotFound />
                </div>
                <div v-else>
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
                            <DialogPanel class="w-fit transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl transition-all">
                                <div class="mt-2">
                                    <StudentsMarkPayment :datatoedit="datatoedit" @close="handleClose" @toast="showToast" />
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>

        <TransitionRoot appear :show="isReset" as="template">
            <Dialog as="div" @close="handleCloseReset" class="relative z-[99]">
                <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                    <div class="fixed inset-0 bg-black/25" />
                </TransitionChild>

                <div class="fixed inset-0 overflow-y-auto">
                    <div class="flex min-h-full items-start justify-center p-4 text-center">
                        <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                            <DialogPanel class="w-fit transform overflow-hidden text-left align-middle shadow-xl transition-all">
                                <div class="mt-2">
                                    <ResetPaymentForm :datatoedit="datatoedit" :collection="collection" @close="handleCloseReset" @toast="showToast" />
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
import StudentsMarkPayment from '@/form/StudentsMarkPayment.vue';
import ResetPaymentForm from '@/form/ResetPaymentForm.vue';
import NotFound from './pages/NotFound.vue';
import Laoding from './pages/Laoding.vue';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';
import { formatDate2 } from '@/composible/formatDate';

const collection = ref('students');
const { data: rawData, loading, error, fetchData } = useFetch(collection.value);

const data = ref([]);
const searchQuery = ref('');
const selectedPaymentType = ref(null);
const hasFiltered = ref(false);
const isOpen = ref(false);
const datatoedit = ref(null);
const isDelete = ref(false);
const deleteData = ref(null);
const toast = useToast();

const paymentTypes = ref([
    { name: 'Quarter', value: 'Quarter' },
    { name: 'Monthly', value: 'Monthly' }
]);

/**
 * Determines the CSS class for a table cell based on its payment status.
 * @param {object} data - The data for the current row.
 * @returns {string|null} The CSS class to apply, or null if no special styling is needed.
 */
const getHighlightClass = (data) => {
    if (!data.next_payment_date) return null;

    const today = moment().startOf('day');
    const nextPayment = moment(data.next_payment_date, 'YYYY-MM-DD').startOf('day');

    if (!nextPayment.isValid()) return null;

    // Highlight in red if the payment is overdue.
    if (nextPayment.isBefore(today)) {
        return 'text-[#DC2626]';
    }

    // Highlight in yellow if the payment is due within the next 5 days.
    const daysUntilPayment = nextPayment.diff(today, 'days');
    if (daysUntilPayment >= 0 && daysUntilPayment <= 5) {
        return ' text-[#F97316]';
    }

    return null;
};

const filterData = () => {
    loading.value = true;
    hasFiltered.value = false;
    setTimeout(() => {
        const q = (searchQuery.value || '').trim().toLowerCase();
        const paymentTypeFilter = selectedPaymentType.value;

        data.value =
            rawData.value?.filter((item) => {
                const studentName = item.eng_name || '';
                const matchesName = !q || studentName.toLowerCase().includes(q);
                const matchesPaymentType = !paymentTypeFilter || item.payment_type === paymentTypeFilter;
                return matchesName && matchesPaymentType;
            }) || [];

        loading.value = false;
        hasFiltered.value = true;
    }, 500);
};

// Watch for changes in filters and raw data to re-apply filtering
watch([searchQuery, selectedPaymentType, rawData], filterData, { deep: true });

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

const handleDeleteConfirm = async (id, doc) => {
    deleteData.value = id;
    isDelete.value = true;
    datatoedit.value = doc;
};
const handleCloseDelete = async () => {
    isDelete.value = false;
    await fetchData();
};
const isReset = ref(false);
const handleReset = async (id, doc) => {
    isReset.value = true;
    datatoedit.value = doc;
};
const handleCloseReset = async () => {
    isReset.value = false;
};
const handleEdit = (data) => {
    datatoedit.value = data;
    openModal();
};
const handleClose = () => {
    isOpen.value = false;
};
function closeModal() {
    isOpen.value = false;
    datatoedit.value = null;
}
function openModal() {
    isOpen.value = true;
}

onMounted(async () => {
    await fetchData();
    filterData();
});
</script>
