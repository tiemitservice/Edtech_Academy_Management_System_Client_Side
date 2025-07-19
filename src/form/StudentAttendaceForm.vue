<template>
    <form class="max-h-[90vh] h-fit overflow-auto">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50 sticky top-0 z-10">
            <label class="text-base font-semibold text-gray-800"> {{ $t('student_attendance.check_attendance') }} {{ datatoedit?.name }}</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded :aria-label="$t('actions.close')" />
        </div>

        <div class="p-4">
            <!-- Attendance Table -->
            <DataTable :value="editableStudents" showGridlines responsiveLayout="scroll">
                <Column :header="$t('element.num')" class="text-nowrap text-center" headerStyle="width: 3rem">
                    <template #body="{ index }">
                        {{ index + 1 }}
                    </template>
                </Column>

                <Column :header="$t('student.name')" class="text-nowrap">
                    <template #body="{ data }">
                        {{ formatStudentName(data.student) }}
                    </template>
                </Column>

                <Column :header="$t('student_attendance.status')">
                    <template #body="{ data }">
                        <Dropdown v-model="data.attendance" :options="attendanceOptions" optionLabel="label" optionValue="value" :placeholder="$t('common.select')" class="w-[150px]" />
                    </template>
                </Column>

                <Column :header="$t('student_attendance.checked_at')">
                    <template #body="{ data }">
                        <InputText v-model="data.checking_at" class="w-[180px]" placeholder="YYYY-MM-DD HH:mm" />
                    </template>
                </Column>
                <Column :header="$t('student_attendance.note')">
                    <template #body="{ data }">
                        <Textarea v-model="data.note" rows="1" class="w-[250px]" autoResize :placeholder="$t('student_attendance.optional_note')" />
                    </template>
                </Column>
            </DataTable>

            <!-- Action Buttons -->
            <div class="py-4 flex items-center justify-end gap-4">
                <Button @click="$emit('close')" :label="$t('element.cancel')" severity="secondary" outlined />
                <Button :label="isSubmitting ? $t('student_attendance.submitting') : $t('student_attendance.submit_attendance')" :disabled="isSubmitting" :loading="isSubmitting" @click="submitAttendance" />
            </div>
        </div>
    </form>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import moment from 'moment';
// We will use the generic useFetch composable
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
// Use two separate instances of useFetch for clarity
const { updateData } = useFetch('classes');
const { postData: postAttendanceReport } = useFetch('attendancereports');
const { data: students, fetchData: fetchStudents } = useFetch('students');

// --- Component State ---
const isSubmitting = ref(false); // Local loading state for both API calls
const attendanceOptions = [
    { label: 'Present', value: 'present' },
    { label: 'Absent', value: 'absent' },
    { label: 'Late', value: 'late' },
    { label: 'Permission', value: 'permission' }
];

// Create a deep, editable copy of the students from the prop
const editableStudents = ref(
    props.datatoedit.students.map((s) => {
        const plainStudent = JSON.parse(JSON.stringify(s));
        return {
            ...plainStudent,
            attendance: plainStudent.attendance || 'present',
            checking_at: plainStudent.checking_at || moment().format('YYYY-MM-DD HH:mm'),
            note: plainStudent.note || ''
        };
    })
);

// --- Helper Functions ---
const formatStudentName = (studentData) => {
    const studentId = typeof studentData === 'object' ? studentData?._id : studentData;
    const student = students.value?.find((s) => s._id === studentId);
    return student?.eng_name || 'Loading...';
};

// --- Form Submission ---
// This function now handles both updating the class and posting a new attendance report
const submitAttendance = async () => {
    isSubmitting.value = true;
    try {
        // --- Payload 1: For updating the 'classes' document ---
        const updatePayload = {
            students: editableStudents.value.map((s) => ({
                student: s.student._id || s.student,
                attendance: s.attendance,
                checking_at: s.checking_at,
                note: s.note,
                // Pass existing scores to prevent them from being wiped out
                attendance_score: s.attendance_score,
                class_practice: s.class_practice,
                home_work: s.home_work,
                assignment_score: s.assignment_score,
                presentation: s.presentation,
                revision_test: s.revision_test,
                final_exam: s.final_exam,
                work_book: s.work_book
            }))
        };

        // --- Payload 2: For creating a new 'attendancereports' document ---
        const reportPayload = {
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

        // --- Execute both API calls ---
        // We can run them in parallel for better performance
        await Promise.all([updateData(updatePayload, props.datatoedit._id), postAttendanceReport(reportPayload)]);

        emit('toast', 'update', 'success');
        emit('save'); // Notify parent to refresh data
        emit('close');
    } catch (error) {
        console.error('Error submitting attendance:', error);
        const message = error.response?.data?.message || 'Failed to submit attendance.';
        emit('toast', 'error', message);
    } finally {
        isSubmitting.value = false; // Ensure loading state is turned off
    }
};

// --- Lifecycle Hook ---
onMounted(async () => {
    // Fetch the full student list to ensure names can be displayed correctly
    await fetchStudents();
});
</script>
