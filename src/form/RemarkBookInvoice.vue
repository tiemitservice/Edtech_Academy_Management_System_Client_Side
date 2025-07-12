<template>
    <form @submit.prevent="handleSubmit" class="w-[420px] bg-white rounded-lg shadow-md overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">Regenerate Invoice</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>

        <!-- Confirmation Message -->
        <div class="p-4 space-y-4 text-start">
            <p>Are you sure you want to mark this invoice as pending?</p>
            <p v-if="props.datatoedit?.book_amount > 0">
                This will return <strong>{{ props.datatoedit.book_amount }}</strong> book(s) to the inventory.
            </p>
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

// Define events this component can emit to the parent
const emit = defineEmits(['close', 'toast', 'save']);

// --- Data Fetching ---
// useFetch instance for updating the 'bookpayments' collection
const { updateData: updateBookPayment } = useFetch('bookpayments');
// useFetch instance for fetching and updating the 'books' collection
const { data: books, fetchData: fetchBooks, updateData: updateBookStock } = useFetch('books');

// --- Component State ---
const isSubmitting = ref(false);

// --- Form Logic ---
const handleSubmit = async () => {
    // Validate that we have the necessary data to proceed
    if (!props.datatoedit?._id || !props.datatoedit.book_id?.length) {
        console.error('No data or books to process for stock return.');
        emit('toast', 'error', 'Invalid data provided.');
        return;
    }

    isSubmitting.value = true;
    try {
        // 1. Mark the book payment as not completed (pending)
        const paymentUpdatePayload = {
            mark_as_completed: false,
            transaction: 'undo'
        };
        await updateBookPayment(paymentUpdatePayload, props.datatoedit._id);

        // 2. Return the books to stock
        // First, ensure we have the latest book data to get the correct current stock
        await fetchBooks();

        // Create an array of promises, one for each stock update
        const stockUpdatePromises = props.datatoedit.book_id
            .map((bookId) => {
                const bookToUpdate = books.value.find((b) => b._id === bookId);

                // Ensure we found the book in our fetched list before trying to update it
                if (bookToUpdate) {
                    // The payload for the PATCH request to update the stock
                    const stockReturnPayload = { stock: bookToUpdate.stock + 1 };
                    return updateBookStock(stockReturnPayload, bookId);
                }
                console.warn(`Book with ID ${bookId} not found for stock update.`);
                return null;
            })
            .filter((p) => p !== null); // Filter out any null promises if a book wasn't found

        // Execute all stock updates concurrently for efficiency
        if (stockUpdatePromises.length > 0) {
            await Promise.all(stockUpdatePromises);
        }

        // 3. Notify the parent component of success
        emit('toast', 'update', 'Invoice regenerated and stock returned.');
        emit('save'); // Notify parent to refresh its data
        emit('close');
    } catch (error) {
        console.error('Error regenerating invoice:', error);
        emit('toast', 'error', 'Failed to regenerate invoice.');
    } finally {
        isSubmitting.value = false;
    }
};
</script>
