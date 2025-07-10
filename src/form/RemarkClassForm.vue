<template>
    <form @submit.prevent="handleSubmit" class="w-[420px] bg-white rounded-lg shadow-md overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">Update Class Status</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>

        <div class="px-4 py-5 space-y-5">
            <div>
                <label for="date" class="block text-sm font-medium text-gray-700">Set the re-mark status for this class.</label>
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-2 p-4 border-t bg-gray-50">
            <Button label="Cancel" @click="$emit('close')" severity="secondary" outlined />
            <Button :label="isSubmitting ? 'Saving...' : 'Save'" type="submit" :loading="isSubmitting" :disabled="isSubmitting" />
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
        required: true
    }
});

// Define events this component can emit
const emit = defineEmits(['close', 'toast', 'save']);

// --- Data Fetching ---
// useFetch instance for updating the 'classes' collection
const { updateData: updateClass } = useFetch('classes');
// useFetch instance for creating a new record in the 'markclassreports' collection
const { postData: postMarkClassReport } = useFetch('remarkclassreports');

// --- Component State ---
const mark_as_complete = ref(true);
const isSubmitting = ref(false);

// --- Form Submission ---
const handleSubmit = async () => {
    if (!props.datatoedit?._id) {
        console.error('No class data provided to update.');
        emit('toast', 'error', 'An error occurred.');
        return;
    }

    isSubmitting.value = true;
    try {
        // --- Action 1: Update the class status ---
        const classUpdatePayload = {
            mark_as_completed: true
        };
        const updateClassPromise = updateClass(classUpdatePayload, props.datatoedit._id);

        let reportPromise = Promise.resolve(); // Default to a resolved promise

        // --- Action 2: If marking as complete, create a report ---

        // Validate that the necessary data exists before creating the report
        if (Array.isArray(props.datatoedit.students) && props.datatoedit.students.length > 0 && props.datatoedit.subject) {
            const reportPayload = {
                class_id: props.datatoedit._id,
                subject_id: props.datatoedit.subject,
                duration: props.datatoedit.duration,
                student_id: props.datatoedit.students.map((s) => s.student?._id).filter((id) => id)
            };
            reportPromise = postMarkClassReport(reportPayload);
        } else {
            console.warn('Class has no students or no subject assigned, skipping report creation.');
        }

        // Execute both database operations concurrently
        await Promise.all([updateClassPromise, reportPromise]);

        emit('toast', 'update');
        emit('close');
    } catch (error) {
        console.error('Error processing class completion:', error);
        emit('toast', 'error');
    } finally {
        isSubmitting.value = false;
    }
};

// --- Lifecycle Hook ---
onMounted(() => {
    // Set the initial state of the toggle switch based on the class data being edited
    if (props.datatoedit) {
        // Ensure the value is a boolean, defaulting to false if it's missing
        mark_as_complete.value = !!props.datatoedit.mark_as_completed;
    }
});
</script>
