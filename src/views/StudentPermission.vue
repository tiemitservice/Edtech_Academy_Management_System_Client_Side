<template>
    <section class="px-4 mx-auto">
        <!-- <p class="mt-1 text-lg text-gray-800">Staff list</p> -->
        <!-- <pre>
            {{ data }}
        </pre> -->
        <div class="flex justify-between items-center mt-6 mb-4 gap-4 bg-white p-4 rounded-lg">
            <label class="text-lg font-medium text-gray-800 dark:text-white">Student Permissions List</label>
            <Button @click="openModal" label="Add new" />
        </div>

        <div class="flex flex-col">
            <div class="overflow-x-auto">
                <div class="py-2">
                    <DataTable v-if="data" :value="data" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 25]">
                        <Column field="_id" header="ID" sortable style="min-width: 150px">
                            <template #body="slotProps">
                                <p class="font-medium">{{ slotProps.data._id }}</p>
                            </template>
                        </Column>

                        <Column field="studentId" header="Student" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold rounded-full">{{ formatStaffNestedField(slotProps.data.studentId, 'eng_name') }}</div>
                            </template>
                        </Column>

                        <!-- reason -->
                        <Column field="reason" header="Reason" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold rounded-full">{{ slotProps.data.reason }}</div>
                            </template>
                        </Column>

                        <!-- status -->
                        <Column field="permissent_status" header="Status" sortable style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="inline px-3 py-1 text-lg font-semibold rounded-full">
                                    <Tag v-if="slotProps.data.permissent_status === 'accepted'" severity="success" value="Accepted"></Tag>
                                    <Tag v-if="slotProps.data.permissent_status === 'rejected'" severity="danger" value="Rejected"></Tag>
                                    <Tag v-if="slotProps.data.permissent_status === 'pending'" severity="warn" value="Pending"></Tag>
                                </div>
                            </template>
                        </Column>

                        <Column header="Actions" style="min-width: 150px">
                            <template #body="slotProps">
                                <div class="flex space-x-2">
                                    <Button icon="pi pi-inbox" severity="warn" rounded aria-label="Edit" @click="handleEdit(slotProps.data)" />
                                    <Button @click="handleDeleteConfirm(slotProps.data._id, slotProps.data)" icon="pi pi-trash" severity="danger" rounded aria-label="Delete" />
                                </div>
                            </template>
                        </Column>
                    </DataTable>
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
                                    <StudentApproveForm :datatoedit="datatoedit" @close="handleClose" @toast="showToast" />
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
                            <DialogPanel class="w-fit transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
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
import { ref, onMounted } from 'vue';
import { useFetch } from '../composible/useFetch';
import { TransitionRoot, TransitionChild, Dialog, DialogPanel } from '@headlessui/vue';
import { useToast } from 'primevue/usetoast';
import DeleteConfimation from '@/form/DeleteConfimation.vue';
import StudentApproveForm from '@/form/StudentApproveForm.vue';
const isOpen = ref(false);
const datatoedit = ref(null);
const collection = ref('student_permissions');
const { data: staffs, fetchData: fetchStaff } = useFetch('students');

const formatStaffNestedField = (id, fieldPath, fallback = 'Unknown') => {
    const staff = staffs.value?.find((staff) => staff._id === id);
    if (!staff) return fallback;

    const fields = fieldPath.split('.');
    const result = fields.reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : undefined), staff);

    if (Array.isArray(result)) return result.join(', ');
    return result ?? fallback;
};
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
const isDelete = ref(false);
const deleteData = ref(null);
const handleDeleteConfirm = async (id, doc) => {
    deleteData.value = id;
    datatoedit.value = doc;
    isDelete.value = true;
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

const closeModal = async () => {
    isOpen.value = false;
    datatoedit.value = null;
    await fetchData();
};
function openModal() {
    isOpen.value = true;
}
const { data, loading, error, fetchData } = useFetch(collection.value);
const filters = ref({
    page: 1,
    limit: 50,
    search: '',
    searchColumn: ['start_time', 'end_time']
});

onMounted(async () => {
    await fetchStaff();
    await fetchData();
});
</script>
