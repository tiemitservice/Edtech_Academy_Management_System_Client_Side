<template>
    <form @submit.prevent="handleSubmit" class="w-[320px] bg-white rounded-lg shadow-md overflow-hidden">
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">{{ datatoedit ? 'Edit Assigned Students' : 'Assign Students' }}</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>
        <div class="p-4 space-y-4">
            <div class="flex flex-col text-start">
                <label for="student_list" class="mb-2 font-medium">Students</label>
                <!-- Added v-if to prevent rendering before options are ready -->
                <MultiSelect v-if="!loading" id="student_list" v-model="selectedStudents" :options="availableStudents" filter show-clear optionLabel="eng_name" optionValue="_id" placeholder="Select Students" class="w-full" />
                <div v-else class="w-full p-2 border rounded-md bg-gray-100 text-gray-500">Loading students...</div>
                <small v-if="error" class="text-red-500 mt-1">{{ error }}</small>
            </div>
        </div>
        <div class="w-full flex items-center justify-end gap-2 p-4 border-t bg-gray-50">
            <Button label="Cancel" @click="$emit('close')" severity="secondary" outlined />
            <Button :label="isSubmitting ? 'Saving...' : 'Save'" type="submit" :loading="isSubmitting" />
        </div>
    </form>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useFetch } from '@/composible/useFetch';

// --- Props and Emits ---
const props = defineProps({
    datatoedit: {
        type: Object,
        default: () => null
    }
});
const emit = defineEmits(['close', 'toast', 'save']);

// --- Data Fetching ---
const { data: allStudents, fetchData: fetchStudents, loading: studentsLoading } = useFetch('students');
const { data: allclasses, fetchData: fetchAllClasses, loading: classesLoading } = useFetch('classes');
const { updateData, loading: isSubmitting } = useFetch('classes');

// --- Component State ---
const selectedStudents = ref([]);
const error = ref('');
const loading = computed(() => studentsLoading.value || classesLoading.value);

// --- Computed Properties ---
const availableStudents = computed(() => {
    // Wait until all necessary data is loaded.
    if (loading.value || !props.datatoedit) {
        return [];
    }

    // 1. Get the subject ID of the current class being edited (e.g., 'English' or 'Computer').
    // This handles cases where the subject might be a populated object or just an ID string.
    const currentSubjectId = typeof props.datatoedit.subject === 'object' ? props.datatoedit.subject?._id : props.datatoedit.subject;

    // If the current class has no subject, there are no restrictions, so all students are available.
    if (!currentSubjectId) {
        return allStudents.value;
    }

    // 2. Create a set of all student IDs who are already enrolled in ANY OTHER active class with the SAME subject.
    // These are the students who should be unavailable for selection.
    const unavailableStudentIds = new Set();

    for (const cls of allclasses.value) {
        // Skip if it's the class we're currently editing or if it's already completed.
        if (cls._id === props.datatoedit._id || cls.mark_as_completed !== false) {
            continue;
        }

        // Check if the class has the same subject.
        const classSubjectId = typeof cls.subject === 'object' ? cls.subject?._id : cls.subject;
        if (classSubjectId === currentSubjectId) {
            // If it does, add all its students to the unavailable list.
            for (const student of cls.students) {
                const studentId = student.student?._id || student.student;
                if (studentId) {
                    unavailableStudentIds.add(studentId);
                }
            }
        }
    }

    // 3. Get the IDs of students already in the current class. They should always be selectable.
    const studentsInThisClass = new Set((props.datatoedit.students || []).map((s) => s.student?._id || s.student));

    // 4. A student is available if they are NOT on the unavailable list, OR if they are already part of the current class.
    return allStudents.value.filter((student) => {
        return !unavailableStudentIds.has(student._id) || studentsInThisClass.has(student._id);
    });
});

// --- Form Submission ---
const handleSubmit = async () => {
    error.value = '';
    if (!props.datatoedit?._id) {
        console.error('No class data provided to edit.');
        return;
    }

    try {
        const originalStudents = props.datatoedit.students || [];
        const finalStudentIds = selectedStudents.value || [];

        // Rebuild the student list, preserving data for existing students.
        const studentsPayload = finalStudentIds.map((id) => {
            const existingData = originalStudents.find((s) => (s.student?._id || s.student) === id);
            return existingData || { student: id };
        });

        await updateData({ students: studentsPayload }, props.datatoedit._id);
        emit('toast', 'update');
        emit('save');
        emit('close');
    } catch (e) {
        console.error('Error assigning students:', e);
        emit('toast', 'error');
    }
};

// --- Lifecycle Hooks ---
onMounted(async () => {
    // Fetch all necessary data when the component mounts.
    await Promise.all([fetchStudents({ status: true }), fetchAllClasses()]);
});

// Watch the prop to populate the form when it becomes available.
watch(
    () => props.datatoedit,
    (newData) => {
        if (newData?.students) {
            selectedStudents.value = newData.students.map((s) => s.student?._id || s.student).filter((id) => id);
        } else {
            selectedStudents.value = [];
        }
    },
    { immediate: true, deep: true }
);
</script>
