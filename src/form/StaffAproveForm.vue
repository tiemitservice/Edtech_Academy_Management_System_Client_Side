<template>
    <form @submit.prevent="handleSubmit" class="w-[420px] bg-white rounded-lg shadow-md overflow-hidden">
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">{{ datatoedit ? $t('element.edit') : $t('element.addnew') }}</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>
        <div class="p-4 text-start space-y-4">
            <div>
                <label for="staff" class="block mb-2 text-sm font-medium">Staff <span class="text-red-500">*</span></label>
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
                <Calendar :min-date="new Date()" id="hold_date" v-model="formState.hold_date" placeholder="Select date range" selectionMode="range" showClear class="w-full" />
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
        <div class="flex justify-end border-t gap-2 p-4">
            <Button :label="$t('element.cancel')" @click="$emit('close')" severity="danger" />
            <Button :label="isSubmitting ? $t('element.adding') : $t('element.save')" type="submit" :loading="isSubmitting" :disabled="isSubmitting" />
        </div>
    </form>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
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
const emit = defineEmits(['close', 'toast', 'save']);

// --- Composables ---
const { user } = useAuth();
const { postData, updateData, loading } = useFetch('staffpermissions');
const { data: staffs, fetchData: fetchStaffs } = useFetch('users');
const { postData: postPermissionReport } = useFetch('teacherpermissionreports');
const toast = useToast();

// --- Component State ---
const formState = reactive({
    staff: null,
    reason: '',
    hold_date: null,
    status: 'pending',
    note: ''
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
    if (!formState.staff) errors.value.staff = 'Staff is required.';
    if (!formState.reason) errors.value.reason = 'Reason is required.';
    if (!formState.hold_date || formState.hold_date?.length < 2) {
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
            staff: formState.staff,
            status: formState.status,
            reason: formState.reason,
            hold_date: formState.hold_date.map((date) => moment(date).format('YYYY-MM-DD')),
            note: formState.note
        };

        if (props.datatoedit) {
            // --- UPDATE LOGIC ---
            await updateData(payload, props.datatoedit._id);

            // **CORRECTED LOGIC:** Only create a report if the status is being set to 'accepted' or 'rejected'.
            if (formState.status === 'accepted' || formState.status === 'rejected') {
                const reportPayload = {
                    teacher_id: formState.staff,
                    reason: formState.reason,
                    hold_date: payload.hold_date,
                    permission_status: formState.status,
                    note: formState.note,
                    approve_by: user.value.id // The user performing the action
                };
                await postPermissionReport(reportPayload);
            }
            emit('toast', 'update');
        } else {
            // --- CREATE LOGIC ---
            // When creating a new request, it's usually 'pending' and doesn't need a report yet.
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
        formState.staff = props.datatoedit.staff;
        formState.status = props.datatoedit.status;
        formState.reason = props.datatoedit.reason;
        formState.note = props.datatoedit.note;
        formState.hold_date = props.datatoedit.hold_date?.map((date) => moment(date).toDate());
    }
});
</script>
