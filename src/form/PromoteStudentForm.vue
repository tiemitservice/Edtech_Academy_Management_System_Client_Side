<template>
    <form @submit.prevent="handleSubmit" class="w-[420px] bg-white rounded-lg shadow-md overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">Promote Students to New Class</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>

        <div class="p-4 text-start space-y-4">
            <!-- From Class (Disabled) -->
            <div>
                <label for="from_class" class="block mb-2 text-sm font-medium text-gray-900">From Class</label>
                <InputText id="from_class" :value="datatoedit?.name" class="w-full" disabled />
            </div>

            <!-- Student Selection -->
            <div>
                <label for="student_list" class="block mb-2 text-sm font-medium text-gray-900"> Students to Promote <span class="text-red-500">*</span> </label>
                <MultiSelect
                    id="student_list"
                    v-model="selectedStudentIds"
                    :options="studentsInFromClass"
                    filter
                    show-clear
                    optionLabel="student.eng_name"
                    optionValue="student._id"
                    placeholder="Select students to promote"
                    class="w-full"
                    :disabled="!datatoedit || studentsInFromClass.length === 0"
                />
                <small v-if="!datatoedit || studentsInFromClass.length === 0" class="text-gray-500 mt-1"> This class has no students to promote. </small>
            </div>

            <!-- To Class (Selectable) -->
            <div>
                <label for="to_class" class="block mb-2 text-sm font-medium text-gray-900"> To Class <span class="text-red-500">*</span> </label>
                <Select id="to_class" filter show-clear class="w-full" :options="availableClasses" optionLabel="name" optionValue="_id" placeholder="Select a destination class" v-model="toClassId" />
            </div>
            <small v-if="error" class="text-red-500 mt-1">{{ error }}</small>
        </div>

        <!-- Action Buttons -->
        <div class="w-full flex justify-end gap-3 p-4 border-t bg-gray-50">
            <Button @click="$emit('close')" label="Cancel" severity="secondary" outlined />
            <Button :label="loading ? 'Promoting...' : 'Promote Selected Students'" type="submit" :loading="loading" />
        </div>
    </form>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useFetch } from '@/composible/useFetch';

// --- Props and Emits ---
const props = defineProps({
    datatoedit: {
        // This is the "From Class" object
        type: Object,
        required: true
    }
});
const emit = defineEmits(['close', 'save', 'toast']);

// --- Data Fetching ---
const { data: allclasses, loading, fetchData } = useFetch('classes');
const { updateData } = useFetch('classes');
const { postData: postPromoteReport } = useFetch('promotestudentreports');

// --- Component State ---
const toClassId = ref(null);
const selectedStudentIds = ref([]); // <-- NEW: Stores the IDs of students to be promoted
const error = ref('');

// --- Computed Properties ---

// Returns a list of students who are currently in the "from" class.
const studentsInFromClass = computed(() => {
    // Ensure students array exists and each student object is valid
    return (props.datatoedit?.students || []).filter((s) => s.student && s.student._id && s.student.eng_name);
});

// Filters the list of all classes to find suitable destination classes.
// A class is available if it's not the original class and it is currently empty.
const availableClasses = computed(() => {
    if (!Array.isArray(allclasses.value)) {
        return [];
    }
    return allclasses.value.filter((cls) => {
        const isNotEmpty = cls.students && cls.students.length > 0;
        const isOriginalClass = cls._id === props.datatoedit?._id;
        return !isNotEmpty && !isOriginalClass;
    });
});

// --- Form Submission ---
const handleSubmit = async () => {
    error.value = '';

    // 1. Validation
    if (!selectedStudentIds.value || selectedStudentIds.value.length === 0) {
        error.value = 'Please select at least one student to promote.';
        return;
    }
    if (!toClassId.value) {
        error.value = 'Please select a destination class.';
        return;
    }

    try {
        const fromClass = props.datatoedit;
        const toClass = allclasses.value.find((c) => c._id === toClassId.value);

        if (!fromClass || !toClass) {
            error.value = 'Could not find source or destination class.';
            return;
        }

        // 2. Prepare Payloads

        // Create a new list for the "from" class that EXCLUDES the students being promoted.
        const remainingStudentsInFromClass = fromClass.students.filter((s) => !selectedStudentIds.value.includes(s.student?._id));

        // Create a list of students to add to the "to" class.
        // This resets their scores and other class-specific data.
        const studentsToAddToToClass = selectedStudentIds.value.map((id) => ({ student: id }));

        // Final student list for the destination class
        const finalStudentsInToClass = [...(toClass.students || []), ...studentsToAddToToClass];

        // Payloads for the API calls
        const fromClassPayload = { students: remainingStudentsInFromClass };
        const toClassPayload = { students: finalStudentsInToClass };
        const reportPayload = {
            from_class_id: fromClass._id,
            class_id: toClassId.value,
            students: selectedStudentIds.value.map((id) => ({ student: id }))
        };

        // 3. Execute all database operations concurrently for efficiency
        await Promise.all([
            updateData(toClassPayload, fromClass._id), // Update the original class
            updateData(toClassPayload, toClassId.value), // Update the destination class
            postPromoteReport(reportPayload) // Create the promotion report
        ]);

        // 4. Emit events on success
        emit('toast', 'update', 'Students promoted successfully!');
        emit('save'); // To trigger any parent component refresh logic
        emit('close');
    } catch (e) {
        console.error('Error promoting students:', e);
        error.value = 'An error occurred during the promotion.';
        emit('toast', 'error', 'Promotion failed.');
    }
};

// --- Lifecycle Hook ---
onMounted(() => {
    // Fetch all classes when the component is mounted
    fetchData();
});
</script>
