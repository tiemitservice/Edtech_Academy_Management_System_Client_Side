<template>
    <form @submit.prevent="handleSubmit" class="w-[420px] bg-white rounded-lg shadow-md overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">Regenerate Invoice</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>

        <div class="px-4 py-5 space-y-5 text-start">
            <div>
                <label for="date" class="block text-sm font-medium text-gray-700 mb-2 text-start"> Are you sure you want to mark this invoice as pending to regenerate it?</label>
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-2 p-4 bg-gray-50 border-t">
            <Button label="Cancel" @click="$emit('close')" severity="danger" outlined />
            <Button :label="isSubmitting ? 'Saving...' : 'Save'" type="submit" :loading="isSubmitting" :disabled="isSubmitting" />
        </div>
    </form>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useFetch } from '@/composible/useFetch';

// Define props and emits for component communication
const props = defineProps({
    datatoedit: {
        type: Object,
        default: () => ({})
    }
});
const emit = defineEmits(['close', 'toast']);

// Composables for data fetching
const { updateData } = useFetch('courseinvoices');

// Component state
const mark_as_completed = ref(true); // Default to false for regeneration
const isSubmitting = ref(false);

/**
 * Handles the form submission to update the invoice status.
 */
const handleSubmit = async () => {
    // Prevent submission if no data is being edited
    if (!props.datatoedit?._id) {
        console.error('No data to edit.');
        return;
    }

    isSubmitting.value = true;
    try {
        const payload = {
            mark_as_completed: mark_as_completed.value
        };

        await updateData(payload, props.datatoedit._id);

        // Notify parent component of success
        emit('toast', 'update');
        emit('close');
    } catch (error) {
        console.error('Error updating invoice:', error);
        // Optionally, emit a toast for the error
        emit('toast', 'error', 'Failed to update invoice.');
    } finally {
        isSubmitting.value = false;
    }
};

/**
 * Lifecycle hook to set the initial state when the component mounts.
 */
onMounted(() => {
    // The form's purpose is to set the status to false (pending),
    // so we initialize the toggle to 'false'.
    mark_as_completed.value = false;
});
</script>
