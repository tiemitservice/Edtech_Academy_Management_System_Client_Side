<template>
    <section class="px-4 mx-auto">
        <div class="py-2 flex flex-col md:flex-row mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 items-center rounded-lg justify-between">
            <label class="text-lg font-medium text-gray-800 dark:text-white">{{ $t('student_category.title') }}</label>

            <Button @click="openModal" :label="$t('element.addnew')" />
        </div>

        <div class="flex flex-col">
            <div class="overflow-x-auto">
                <div class="py-2">
                    <DataTable v-if="tableData.length > 0" :value="tableData" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 25]">
                        <Column field="displayId" :header="$t('element.num')" sortable style="min-width: 150px">
                            <template #body="slotProps">
                                <p class="font-medium">{{ slotProps.data.displayId }}</p>
                            </template>
                        </Column>

                        <Column field="name" :header="$t('student_category.name')" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold rounded-full">{{ slotProps.data?.name }}</div>
                            </template>
                        </Column>

                        <Column :header="$t('element.action')" style="min-width: 150px">
                            <template #body="slotProps">
                                <div class="flex space-x-2">
                                    <Button icon="pi pi-pencil" severity="warn" rounded :aria-label="$t('element.edit')" @click="handleEdit(slotProps.data)" />
                                    <Button @click="handleDeleteConfirm(slotProps.data._id, slotProps.data)" icon="pi pi-trash" severity="danger" rounded :aria-label="$t('actions.delete')" />
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                    <div v-else-if="loading" class="text-center py-10">
                        <Spinner />
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
                            <DialogPanel class="w-fit transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl transition-all">
                                <div>
                                    <StudentCategoryForm :datatoedit="datatoedit" @close="handleClose" @toast="showToast" />
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
                                <div>
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
import { ref, onMounted, watch } from 'vue'; // Added watch
import { useFetch } from '../composible/useFetch';
import { TransitionRoot, TransitionChild, Dialog, DialogPanel } from '@headlessui/vue';
import DeleteConfimation from '@/form/DeleteConfimation.vue';
import { useToast } from 'primevue/usetoast';
import StudentCategoryForm from '@/form/StudentCategoryForm.vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const isOpen = ref(false);
const datatoedit = ref(null);
const collection = ref('student_categories');

const toast = useToast();
const showToast = (action, severity) => {
    const summary = t(`toast.${action}`, t('toast.action')); // Fallback to a generic 'action completed' message
    toast.add({ severity: severity || 'info', summary, life: 3000 });
};

const isDelete = ref(false);
const deleteData = ref(null);
const handleDeleteConfirm = async (id, doc) => {
    deleteData.value = id;
    isDelete.value = true;
    datatoedit.value = doc;
};
const handleCloseDelete = async () => {
    isDelete.value = false;
    deleteData.value = null;
    await fetchData();
};
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

// data is the raw data from the server
const { data, loading, error, fetchData } = useFetch(collection.value);

// tableData is the processed data for the DataTable
const tableData = ref([]);

// Watch for changes in the raw data and process it for the table
watch(
    data,
    (newData) => {
        if (Array.isArray(newData)) {
            // Map over the new data to add a stable 'displayId' for sorting
            tableData.value = newData.map((item, index) => ({
                ...item,
                displayId: index + 1
            }));
        }
    },
    { immediate: true, deep: true }
);

onMounted(async () => {
    await fetchData();
});
</script>
