<template>
    <form class="max-h-[90vh] h-fit overflow-auto">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50 sticky top-0 z-10">
            <label class="text-base font-semibold text-gray-800"> Check Attendance for {{ datatoedit?.name }}</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>

        <div class="p-4">
            <!-- Attendance Table -->
            <DataTable :value="editableStudents" showGridlines responsiveLayout="scroll">
                <Column field="name" header="No" class="text-nowrap text-center" headerStyle="width: 3rem">
                    <template #body="{ index }">
                        {{ index + 1 }}
                    </template>
                </Column>

                <Column field="name" header="Student Name" class="text-nowrap">
                    <template #body="{ data }">
                        {{ formatStudentName(data.student) }}
                    </template>
                </Column>

                <Column header="Attendance">
                    <template #body="{ data }">
                        <Dropdown v-model="data.attendance" :options="attendanceOptions" optionLabel="label" optionValue="value" placeholder="Select" class="w-[150px]" />
                    </template>
                </Column>

                <Column header="Checked At">
                    <template #body="{ data }">
                        <InputText v-model="data.checking_at" class="w-[180px]" placeholder="YYYY-MM-DD HH:mm" />
                    </template>
                </Column>
                <Column header="Note">
                    <template #body="{ data }">
                        <Textarea v-model="data.note" rows="1" class="w-[250px]" autoResize placeholder="Optional note..." />
                    </template>
                </Column>
            </DataTable>

            <!-- Action Buttons -->
            <div class="py-4 flex items-center justify-end gap-4">
                <Button @click="$emit('close')" label="Cancel" severity="secondary" outlined />
                <Button :label="loading ? 'Submitting...' : 'Submit Attendance'" :disabled="loading" :loading="loading" @click="submitAttendance" />
            </div>
        </div>
    </form>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import moment from 'moment';
import { useFetch } from '@/composible/useFetch';

// --- Props and Emits ---
const props = defineProps({
    datatoedit: {
        type: Object,
        required: true
    }
});
const emit = defineEmits(['close', 'toast', 'save']);

// --- Data Fetching ---
// This composable will be used to POST to the 'attendancereports' collection
const { postData: postAttendanceReport, loading } = useFetch('attendancereports');
// This is needed to format the student names in the table
const { data: students, fetchData: fetchStudents } = useFetch('students');

// --- Component State ---
const attendanceOptions = [
    { label: 'Present', value: 'present' },
    { label: 'Absent', value: 'absent' },
    { label: 'Late', value: 'late' },
    { label: 'Permission', value: 'permission' }
];

// Create a deep, editable copy of the students from the prop, initializing attendance fields
const editableStudents = ref(
    props.datatoedit.students.map((s) => ({
        ...s,
        attendance: s.attendance || 'present', // Default to 'present'
        checking_at: moment().format('YYYY-MM-DD HH:mm'),
        note: s.note || ''
    }))
);

// --- Helper Functions ---
const formatStudentName = (studentData) => {
    const studentId = typeof studentData === 'object' ? studentData?._id : studentData;
    const student = students.value?.find((s) => s._id === studentId);
    return student?.eng_name || 'Loading...';
};

// --- Form Submission ---
const submitAttendance = async () => {
    try {
        // Prepare the payload according to the AttendanceReportSchema
        const payload = {
            class_id: props.datatoedit._id,
            subject_id: props.datatoedit.subject,
            duration: props.datatoedit.duration,
            staff_id: props.datatoedit.staff,
            students: editableStudents.value.map((s) => ({
                student: s.student._id || s.student,
                attendance: s.attendance,
                checking_at: s.checking_at,
                note: s.note
            }))
        };

        // Post the new attendance report to the database
        await postAttendanceReport(payload);

        emit('toast', 'create', 'Attendance submitted successfully.');
        emit('save'); // Notify the parent component that data has changed
        emit('close');
    } catch (error) {
        console.error('Error submitting attendance:', error);
        const message = error.response?.data?.message || 'Failed to submit attendance.';
        emit('toast', 'error', message);
    }
};

// --- Lifecycle Hook ---
onMounted(async () => {
    // Fetch the full student list to ensure names can be displayed correctly
    await fetchStudents();
});
</script>
