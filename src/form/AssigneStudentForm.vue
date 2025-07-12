<template>
    <form @submit.prevent="handleSubmit" class="w-[320px] bg-white rounded-lg shadow-md overflow-hidden">
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">{{ datatoedit ? 'Edit Assigned Students' : 'Assign Students' }}</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>

        <div class="p-4 space-y-4">
            <div class="flex flex-col text-start">
                <label for="student_list" class="mb-2 font-medium">Students</label>
                <MultiSelect id="student_list" v-model="selectedStudents" :options="students" filter show-clear optionLabel="eng_name" optionValue="_id" placeholder="Select Students" class="w-full" />
                <small v-if="error" class="text-red-500 mt-1">{{ error }}</small>
            </div>
        </div>

        <div class="w-full flex items-center justify-end gap-2 p-4 border-t bg-gray-50">
            <Button label="Cancel" @click="$emit('close')" severity="secondary" outlined /> <Button :label="isSubmitting ? 'Saving...' : 'Save'" type="submit" :loading="isSubmitting" />
        </div>
    </form>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useFetch } from '@/composible/useFetch';

// Define props passed from the parent component
const props = defineProps({
    datatoedit: {
        type: Object,
        default: () => null
    }
});

// Define events this component can emit to the parent
const emit = defineEmits(['close', 'toast', 'save']);

// --- Data Fetching ---
const { data: students, fetchData: fetchStudents } = useFetch('students');
const { updateData, loading: isSubmitting } = useFetch('classes');

// --- Component State ---
const selectedStudents = ref([]); // Holds the array of selected student IDs
const error = ref('');

// --- Form Submission ---
const handleSubmit = async () => {
    error.value = ''; // 1. Get the original list of students with their full data (including scores).

    const originalStudentsWithScores = props.datatoedit.students || []; // 2. Get the new, complete list of student IDs from the MultiSelect component.

    const selectedStudentIds = selectedStudents.value || []; // 3. Build the new payload by merging the old data with the new list.

    const studentsPayload = selectedStudentIds.map((newId) => {
        // Find the original data for this student, if it exists.
        const existingStudentData = originalStudentsWithScores.find((originalStudent) => {
            if (!originalStudent.student) return false;
            return (originalStudent.student._id || originalStudent.student) === newId;
        }); // If we found the student in the original list...

        if (existingStudentData) {
            // ✅ **THE FIX IS HERE**
            // Reconstruct the object to preserve the scores, but ensure the 'student'
            // field is just the ID string, which is what the backend expects for a reference.
            return {
                ...existingStudentData, // Copies all score fields (home_work, etc.)
                student: newId // Overwrites the 'student' object with just its ID
            };
        } // Otherwise, this is a new student. Create a new object for them.

        return { student: newId };
    }); // 4. Prepare and send the request.

    const req = {
        students: studentsPayload
    };

    try {
        if (props.datatoedit?._id) {
            await updateData(req, props.datatoedit._id);
            emit('toast', 'update');
            emit('save'); // Notify parent component to refresh its data
            emit('close');
        } else {
            console.error("This form is intended for editing an existing class, but no 'datatoedit' prop was provided.");
        }
    } catch (e) {
        console.error('Error assigning students:', e);
        emit('toast', 'error');
    }
};

// --- Lifecycle Hook ---
onMounted(async () => {
    // 1. Fetch the list of all available students FIRST.
    await fetchStudents({ status: true }); // 2. THEN, if we are editing a class, populate the multiselect
    // with the students already in that class.

    if (props.datatoedit?.students) {
        // The `datatoedit` prop has a complex structure. We need to extract just the student IDs.
        // The `student` property can be null if a student was deleted from the DB, so we add a check.
        selectedStudents.value = props.datatoedit.students.map((s) => s.student?._id).filter((id) => id); // Filter out any null/undefined IDs to prevent errors
    }
});
</script>
