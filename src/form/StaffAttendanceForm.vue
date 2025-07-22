<template>
    <!-- MODIFIED: Changed width to be responsive with a max-width -->
    <form @submit.prevent="handleSubmit" class="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden">
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">{{ datatoedit ? $t('element.edit') : $t('element.addnew') }}</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>

        <!-- MODIFIED: Grid now stacks to 1 column on small screens and expands to 2 on medium screens -->
        <div class="p-4 text-start grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- This field will now span the full width on small screens -->
            <div class="md:col-span-1">
                <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{{ $t('student.name') }}</label>
                <InputText id="name" :value="datatoedit?.en_name" disabled class="w-full bg-gray-100" />
            </div>
            <!-- This field will also span the full width on small screens -->
            <div class="md:col-span-1">
                <label for="checking_at" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{{ $t('teacher_attendance.date') }}</label>
                <Calendar id="checking_at" v-model="formState.checking_at" showIcon dateFormat="yy-mm-dd" class="w-full" />
            </div>
            <div class="md:col-span-1">
                <label for="entry-time" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{{ $t('teacher_attendance.entry_time') }} <span class="text-red-500">*</span></label>
                <Calendar id="entry-time" timeOnly required v-model="formState.entry_time" :placeholder="$t('teacher_attendance.entry_time')" class="w-full" />
            </div>
            <div class="md:col-span-1">
                <label for="exit-time" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{{ $t('teacher_attendance.exit_time') }} <span class="text-red-500">*</span></label>
                <Calendar id="exit-time" timeOnly required v-model="formState.exit_time" :placeholder="$t('teacher_attendance.exit_time')" class="w-full" />
            </div>
            <!-- col-span-2 works for both single and multi-column layouts -->
            <div class="col-span-1 md:col-span-2">
                <label for="status" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{{ $t('teacher_attendance.status') }} <span class="text-red-500">*</span></label>
                <Select id="status" :options="attendanceOptions" required v-model="formState.attendance" option-label="name" option-value="value" :placeholder="$t('teacher_attendance.select_attendance')" class="w-full" />
            </div>
            <div class="col-span-1 md:col-span-2">
                <label for="note" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{{ $t('teacher_attendance.note') }}</label>
                <Textarea id="note" v-model="formState.note" :placeholder="$t('teacher_attendance.optional_note')" class="w-full" rows="2" />
            </div>
        </div>
        <div class="flex justify-end border-t gap-2 p-4">
            <Button :label="$t('element.cancel')" @click="$emit('close')" severity="danger" />
            <Button :label="isSubmitting ? $t('element.adding') : $t('element.save')" type="submit" :loading="isSubmitting" :disabled="isSubmitting" />
        </div>
    </form>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useFetch } from '@/composible/useFetch';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';

// --- Props and Emits ---
const props = defineProps({
    datatoedit: {
        // This is the teacher/staff object
        type: Object,
        required: true
    }
});
const emit = defineEmits(['close', 'toast', 'save']);

// --- Composables ---
const { updateData: updateStaff, loading: isSubmitting } = useFetch('staffs'); // Renamed loading for clarity
const { postData: postAttendanceReport } = useFetch('teacherattendancereports');
const toast = useToast();

// --- Component State ---
const formState = ref({
    entry_time: null,
    exit_time: null,
    note: null,
    checking_at: new Date(),
    attendance: 'present' // Default to present
});

const attendanceOptions = ref([
    { name: 'Present', value: 'present' },
    { name: 'Absent', value: 'absent' },
    { name: 'Late', value: 'late' },
    { name: 'Permission', value: 'permission' }
]);

// --- Watchers for real-time validation ---
watch(
    () => formState.value.exit_time,
    (newExitTime) => {
        if (newExitTime && formState.value.entry_time && moment(newExitTime).isBefore(moment(formState.value.entry_time))) {
            toast.add({ severity: 'error', summary: 'Invalid Time', detail: 'Exit time cannot be before entry time.', life: 4000 });
        }
    }
);

watch(
    () => formState.value.entry_time,
    (newEntryTime) => {
        if (newEntryTime && formState.value.exit_time && moment(formState.value.exit_time).isBefore(moment(newEntryTime))) {
            // Clear the invalid exit time to force re-selection
            formState.value.exit_time = null;
            toast.add({ severity: 'warn', summary: 'Time Cleared', detail: 'Exit time was before the new entry time and has been cleared.', life: 4000 });
        }
    }
);

// --- Form Submission ---
const handleSubmit = async () => {
    // Basic validation
    if (!formState.value.entry_time || !formState.value.exit_time || !formState.value.attendance) {
        toast.add({ severity: 'warn', summary: 'Validation Error', detail: 'Entry Time, Exit Time, and Status are required.', life: 3000 });
        return;
    }
    // Time comparison validation before submitting
    if (moment(formState.value.exit_time).isBefore(moment(formState.value.entry_time))) {
        toast.add({ severity: 'error', summary: 'Invalid Time', detail: 'Exit time cannot be before entry time.', life: 4000 });
        return;
    }

    try {
        const entryTimeFormatted = moment(formState.value.entry_time).format('HH:mm');
        const exitTimeFormatted = moment(formState.value.exit_time).format('HH:mm');
        const checkingAtDate = moment(formState.value.checking_at).startOf('day').toDate();

        // Payload to update the main staff record
        const staffUpdatePayload = {
            attendance: formState.value.attendance,
            entry_time: entryTimeFormatted,
            exit_time: exitTimeFormatted,
            note: formState.value.note
        };

        // Payload for the new attendance report
        const reportPayload = {
            teacher_id: props.datatoedit._id,
            entry_time: entryTimeFormatted,
            exit_time: exitTimeFormatted,
            checking_at: checkingAtDate,
            note: formState.value.note,
            attendance_status: formState.value.attendance
        };

        // Execute both operations concurrently
        await Promise.all([updateStaff(staffUpdatePayload, props.datatoedit._id), postAttendanceReport(reportPayload)]);

        toast.add({ severity: 'success', summary: 'Success', detail: 'Attendance recorded successfully.', life: 3000 });
        emit('save');
        emit('close');
    } catch (error) {
        console.error('Error submitting attendance:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to submit attendance.', life: 3000 });
    }
};

// --- Lifecycle Hook ---
onMounted(() => {
    // Pre-fill form with existing data if available
    if (props.datatoedit) {
        formState.value.note = props.datatoedit.note || '';
        formState.value.entry_time = props.datatoedit.entry_time ? moment(props.datatoedit.entry_time, 'HH:mm').toDate() : null;
        formState.value.exit_time = props.datatoedit.exit_time ? moment(props.datatoedit.exit_time, 'HH:mm').toDate() : null;
        formState.value.attendance = props.datatoedit.attendance || 'present';
    }
});
</script>
