<template>
    <section class="px-4 mx-auto">
        <!-- Header and Add Button -->
        <div class="py-2 flex flex-col md:flex-row mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 items-center rounded-lg justify-between">
            <label class="text-lg font-medium text-gray-800 dark:text-white">{{ $t('holiday.title') }}</label>
            <Button @click="openModal" :label="$t('element.addnew')" />
        </div>

        <!-- Data Table -->
        <div class="flex flex-col" v-if="!loading">
            <div class="overflow-x-auto">
                <div v-if="holidays.length > 0" class="py-2">
                    <DataTable :value="holidays" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 25]">
                        <Column field="year" :header="$t('holiday.date')" sortable style="min-width: 100px"></Column>
                        <Column :header="$t('holiday.date')" style="min-width: 400px">
                            <template #body="{ data }">
                                <div class="flex flex-wrap gap-2">
                                    <Tag v-for="holiday in data.holidays" :key="holiday" :value="formatDate(holiday)" severity="info" class="text-sm"></Tag>
                                </div>
                            </template>
                        </Column>
                        <Column :header="$t('element.action')" style="min-width: 150px">
                            <template #body="slotProps">
                                <div class="flex space-x-2">
                                    <Button icon="pi pi-pencil" severity="warn" rounded aria-label="Edit" @click="handleEdit(slotProps.data)" />
                                    <Button @click="handleDeleteConfirm(slotProps.data._id, slotProps.data)" icon="pi pi-trash" severity="danger" rounded aria-label="Delete" />
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                </div>
                <div v-else>
                    <NotFound message="No holiday records found. Click 'Add New' to get started." />
                </div>
            </div>
        </div>
        <div v-else>
            <Laoding />
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
                                <!-- Holiday Form Component -->
                                <form @submit.prevent="handleSubmit" class="w-[420px]">
                                    <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                                        <label class="text-base font-semibold text-gray-800">
                                            {{ datatoedit ? `${datatoedit.year}` : $t('holiday.addnew') }}
                                        </label>
                                        <Button icon="pi pi-times" size="small" @click="closeModal" severity="danger" rounded aria-label="Close" />
                                    </div>
                                    <div class="p-4 text-start space-y-4">
                                        <div>
                                            <label for="year" class="block mb-2 text-sm font-medium">Year <span class="text-red-500">*</span></label>
                                            <InputText id="year" v-model="formState.year" placeholder="Enter year (e.g., 2025)" class="w-full" />
                                            <small v-if="errors.year" class="text-red-500 mt-1">{{ errors.year }}</small>
                                        </div>
                                        <div>
                                            <label for="holidays" class="block mb-2 text-sm font-medium">{{ $t('holiday.date') }} <span class="text-red-500">*</span></label>
                                            <Calendar v-model="formState.holidays" selectionMode="multiple" :manualInput="false" inline class="w-full" />
                                            <small v-if="errors.holidays" class="text-red-500 mt-1">{{ errors.holidays }}</small>
                                        </div>
                                    </div>
                                    <div class="w-full flex justify-end gap-3 p-4 border-t bg-gray-50">
                                        <Button @click="closeModal" :label="$t('element.cancel')" severity="secondary" outlined />
                                        <Button :label="isSubmitting ? $t('element.saving') : $t('element.addnew')" type="submit" :loading="isSubmitting" />
                                    </div>
                                </form>
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
                                <DeleteConfimation :deleteData="deleteId" :datatoedit="datatoedit" :collection="collection" @close="handleCloseDelete" @toast="showToast" />
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
import { ref, onMounted, reactive, watch } from 'vue';
import { useFetch } from '../composible/useFetch';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';

// Import UI components
import { TransitionRoot, TransitionChild, Dialog, DialogPanel } from '@headlessui/vue';
import DeleteConfimation from '@/form/DeleteConfimation.vue';
import NotFound from './pages/NotFound.vue';
import Laoding from './pages/Laoding.vue';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Calendar from 'primevue/calendar';
import InputText from 'primevue/inputtext';
import Toast from 'primevue/toast';

// --- Component State ---
const collection = ref('holidays');
const isOpen = ref(false);
const isDelete = ref(false);
const datatoedit = ref(null);
const deleteId = ref(null);

import { useI18n } from 'vue-i18n'; // Initialize i18n
const { t } = useI18n();
const toast = useToast();

const showToast = (action, severity) => {
    const summary = t(`toast.${action}`, t('toast.action')); // Fallback to a generic 'action completed' message
    toast.add({ severity: severity || 'info', summary, life: 3000 });
};
// --- Data Fetching ---
const { data: holidays, loading, fetchData } = useFetch(collection.value);
const { postData, updateData, loading: isSubmitting } = useFetch(collection.value);

// --- Form State ---
const formState = reactive({
    year: '',
    holidays: []
});
const errors = ref({});

// --- Helper Functions ---
const formatDate = (date) => moment(date).format('MMM D, YYYY');

// --- Modal and CRUD Handlers ---
const openModal = () => {
    // Reset form state for new entry
    Object.assign(formState, { year: '', holidays: [] });
    datatoedit.value = null;
    errors.value = {};
    isOpen.value = true;
};

const closeModal = () => {
    isOpen.value = false;
    datatoedit.value = null;
};

const handleEdit = (item) => {
    datatoedit.value = item;
    Object.assign(formState, {
        year: item.year,
        holidays: item.holidays.map((d) => moment(d).toDate()) // Convert date strings back to Date objects for the calendar
    });
    errors.value = {};
    isOpen.value = true;
};

const handleDeleteConfirm = (id, doc) => {
    deleteId.value = id;
    datatoedit.value = doc;
    isDelete.value = true;
};

const handleCloseDelete = async (wasDeleted) => {
    isDelete.value = false;
    if (wasDeleted) {
        await fetchData();
    }
};

const validateForm = () => {
    errors.value = {};
    if (!formState.year || !/^\d{4}$/.test(formState.year)) {
        errors.value.year = 'Please enter a valid 4-digit year.';
    }
    if (!formState.holidays || formState.holidays.length === 0) {
        errors.value.holidays = 'Please select at least one holiday date.';
    }
    return Object.keys(errors.value).length === 0;
};

const handleSubmit = async () => {
    if (!validateForm()) {
        toast.add({ severity: 'warn', summary: 'Validation Error', detail: 'Please check the form fields.', life: 3000 });
        return;
    }

    try {
        const payload = {
            year: formState.year,
            // Format dates to YYYY-MM-DD strings for the database
            holidays: formState.holidays.map((d) => moment(d).format('YYYY-MM-DD'))
        };

        if (datatoedit.value) {
            await updateData(payload, datatoedit.value._id);
            // emit('toast', 'update');
        } else {
            await postData(payload);
            // emit('toast', 'create');
        }
        await fetchData();
        closeModal();
    } catch (error) {
        console.error('Error saving holiday:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save holiday data.', life: 3000 });
    }
};

// --- Lifecycle Hook ---
onMounted(fetchData);
</script>
