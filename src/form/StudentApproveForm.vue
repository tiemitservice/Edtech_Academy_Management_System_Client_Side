<template>
    <form @submit.prevent="handleSubmit" class="w-[420px] bg-white rounded-lg shadow-md overflow-hidden">
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">{{ datatoedit ? 'Approve Permission Request' : 'New Permission Request' }}</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>
        <div class="p-4 text-start space-y-4">
            <div>
                <label for="student" class="block mb-2 text-sm font-medium">Student <span class="text-red-500">*</span></label>
                <Dropdown id="student" :filter="true" v-model="formState.studentId" :options="students" option-value="_id" option-label="eng_name" placeholder="Select Student" class="w-full" />
                <small v-if="errors.studentId" class="text-red-500 mt-1">{{ errors.studentId }}</small>
            </div>
            <div>
                <label for="reason" class="block mb-2 text-sm font-medium">Reason <span class="text-red-500">*</span></label>
                <InputText id="reason" v-model="formState.reason" placeholder="Reason for leave" class="w-full" />
                <small v-if="errors.reason" class="text-red-500 mt-1">{{ errors.reason }}</small>
            </div>
            <div>
                <label for="hold_date" class="block mb-2 text-sm font-medium">Start Date - End Date <span class="text-red-500">*</span></label>
                <Calendar v-model="formState.hold_date" placeholder="Select date range" selectionMode="range" showClear class="w-full" />
                <small v-if="errors.hold_date" class="text-red-500 mt-1">{{ errors.hold_date }}</small>
            </div>
            <div>
                <label for="status" class="block mb-2 text-sm font-medium">Status <span class="text-red-500">*</span></label>
                <Dropdown id="status" v-model="formState.status" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="Select Status" showClear class="w-full" />
            </div>
            <div>
                <label for="approver" class="block mb-2 text-sm font-medium">Approve By</label>
                <Dropdown id="approver" :filter="true" v-model="formState.approve_by" :options="staffs" option-value="_id" option-label="en_name" placeholder="Select Approver" class="w-full" />
            </div>
        </div>
        <div class="w-full flex justify-end gap-3 p-4 border-t bg-gray-50">
            <Button @click="$emit('close')" label="Cancel" severity="secondary" outlined />
            <Button :label="loading ? 'Saving...' : 'Submit'" type="submit" :loading="loading" />
        </div>
    </form>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useFetch } from '@/composible/useFetch';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';
import useAuth from '@/composible/useAuth';

// --- Props and Emits ---
const props = defineProps({
    datatoedit: {
        type: Object,
        default: () => null
    }
});
const emit = defineEmits(['close', 'toast', 'save']);

// --- Composables ---
const { user } = useAuth();
const { postData, updateData, loading } = useFetch('student_permissions');
const { data: students, fetchData: fetchStudents } = useFetch('students');
const { data: staffs, fetchData: fetchStaffs } = useFetch('staffs');
const { postData: postPermissionReport } = useFetch('studentpermissionreports');
const toast = useToast();

// --- Component State ---
const formState = ref({
    studentId: null,
    reason: '',
    hold_date: null,
    status: 'pending',
    approve_by: null
});
const errors = ref({});

const statusOptions = ref([
    { label: 'Pending', value: 'pending' },
    { label: 'Accepted', value: 'accepted' },
    { label: 'Rejected', value: 'rejected' }
]);

// --- Form Validation ---
const validateForm = () => {
    errors.value = {};
    if (!formState.value.studentId) errors.value.studentId = 'Student is required.';
    if (!formState.value.reason) errors.value.reason = 'Reason is required.';
    if (!formState.value.hold_date || formState.value.hold_date.length < 2) {
        errors.value.hold_date = 'Please select a start and end date.';
    }
    return Object.keys(errors.value).length === 0;
};

// --- Form Submission ---
const handleSubmit = async () => {
    if (!validateForm()) {
        toast.add({ severity: 'warn', summary: 'Validation Error', detail: 'Please fill all required fields.', life: 3000 });
        return;
    }

    try {
        const payload = {
            studentId: formState.value.studentId,
            permissent_status: formState.value.status,
            reason: formState.value.reason,
            hold_date: formState.value.hold_date.map((date) => moment(date).format('YYYY-MM-DD')),
            sent_to: formState.value.approve_by
        };

        let reportPromise = Promise.resolve();

        if (props.datatoedit) {
            // --- UPDATE LOGIC ---
            await updateData(payload, props.datatoedit._id);

            if (formState.value.status === 'accepted' || formState.value.status === 'rejected') {
                const reportPayload = {
                    student_id: formState.value.studentId,
                    reason: formState.value.reason,
                    permission_status: formState.value.status,
                    approve_by: formState.value.approve_by || user.value.id
                };
                reportPromise = postPermissionReport(reportPayload);
            }

            await reportPromise;
            emit('toast', 'update');
        } else {
            // --- CREATE LOGIC ---
            await postData(payload);
            emit('toast', 'create');
        }

        emit('save');
        emit('close');
    } catch (error) {
        console.error('Submission error:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save permission request.', life: 3000 });
    }
};

// --- Lifecycle Hook ---
onMounted(async () => {
    await Promise.all([fetchStudents(), fetchStaffs()]);
    if (props.datatoedit) {
        formState.value.studentId = props.datatoedit.studentId;
        formState.value.status = props.datatoedit.permissent_status;
        formState.value.reason = props.datatoedit.reason;
        formState.value.approve_by = props.datatoedit.sent_to;
        formState.value.hold_date = props.datatoedit.hold_date?.map((date) => moment(date).toDate());
    }
});
</script>
