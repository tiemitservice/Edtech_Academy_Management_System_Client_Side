<template>
    <form @submit.prevent="handleSubmit" class="w-[420px] bg-white rounded-lg shadow-md overflow-hidden">
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">{{ datatoedit ? 'Edit Staff Permission' : 'New Staff Permission' }}</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>
        <div class="p-4 text-start space-y-4">
            <div>
                <label for="staff" class="block mb-2 text-sm font-medium">Staff <span class="text-red-500">*</span></label>
                <!-- FIX: Provide a fallback empty array to prevent errors before data loads -->
                <Dropdown id="staff" :filter="true" v-model="formState.staff" :options="staffs || []" option-value="_id" option-label="name" placeholder="Select Staff" class="w-full" />
                <small v-if="errors.staff" class="text-red-500 mt-1">{{ errors.staff }}</small>
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
                <label for="note" class="block mb-2 text-sm font-medium">Note</label>
                <Textarea id="note" v-model="formState.note" placeholder="Optional note..." rows="2" class="w-full" />
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
import useAuth from '@/composible/useAuth';
import moment from 'moment';

// --- Props and Emits ---
const props = defineProps({
    datatoedit: {
        type: Object,
        default: () => null
    }
});
const { user } = useAuth();
const emit = defineEmits(['close', 'toast', 'save']);

// --- Data Fetching ---
const { postData, updateData, loading } = useFetch('staffpermissions');
const { data: staffs, fetchData: fetchStaffs } = useFetch('users');
// **NEW:** A separate useFetch instance for creating the report
const { postData: postPermissionReport } = useFetch('teacherpermissionreports');

// --- Component State ---
const formState = ref({
    staff: null,
    reason: '',
    hold_date: null,
    status: 'pending',
    note: ''
});
const errors = ref({});
const toast = useToast();

const statusOptions = ref([
    { label: 'Pending', value: 'pending' },
    { label: 'Accepted', value: 'accepted' },
    { label: 'Rejected', value: 'rejected' }
]);

// --- Form Validation ---
const validateForm = () => {
    errors.value = {};
    if (!formState.value.staff) errors.value.staff = 'Staff is required.';
    if (!formState.value.reason) errors.value.reason = 'Reason is required.';
    if (!formState.value.hold_date || formState.value.hold_date?.length < 2) {
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
            staff: formState.value.staff,
            status: formState.value.status,
            reason: formState.value.reason,
            hold_date: formState.value.hold_date.map((date) => moment(date).format('YYYY-MM-DD')),
            note: formState.value.note
        };

        let reportPromise = Promise.resolve();

        if (props.datatoedit) {
            // --- UPDATE LOGIC ---
            await updateData(payload, props.datatoedit._id);

            // If status is changed to accepted or rejected, create a report
            if (formState.value.status === 'accepted' || formState.value.status === 'rejected') {
                const reportPayload = {
                    ...payload,
                    teacher_id: payload.staff, // Matching the report schema field name
                    permission_id: props.datatoedit._id, // Link to the original request
                    reason: props.datatoedit.reason,
                    hold_date: props.datatoedit.hold_date,
                    permission_status: props.datatoedit.status,
                    aprove_by: user.value.id
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
    await fetchStaffs();
    if (props.datatoedit) {
        formState.value.staff = props.datatoedit.staff;
        formState.value.status = props.datatoedit.status;
        formState.value.reason = props.datatoedit.reason;
        formState.value.note = props.datatoedit.note;
        formState.value.hold_date = props.datatoedit.hold_date?.map((date) => moment(date).toDate());
    }
});
</script>
