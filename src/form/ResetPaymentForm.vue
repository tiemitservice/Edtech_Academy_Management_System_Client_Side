<template>
    <form @submit.prevent="handleSubmit" class="w-[420px] bg-white rounded-lg shadow-md overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">Complete Payment & Print</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>

        <div class="px-4 py-5 space-y-5 text-start">
            <div>
                <label for="date" class="block text-sm font-medium text-gray-700 mb-2 text-start"> Are you sure you want to mark this payment as completed? </label>
                <p class="text-sm text-gray-500">This will create a final payment report and take you to the print page.</p>
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-2 p-4 bg-gray-50 border-t">
            <Button label="Cancel" @click="$emit('close')" severity="secondary" outlined />
            <Button :label="isSubmitting ? 'Processing...' : 'Print'" type="submit" :loading="isSubmitting" :disabled="isSubmitting" />
        </div>
    </form>
</template>

<script setup>
import { ref } from 'vue';
import { useFetch } from '@/composible/useFetch';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

// --- Props and Emits ---
const props = defineProps({
    datatoedit: {
        // This is the course invoice object
        type: Object,
        required: true
    }
});
const emit = defineEmits(['close', 'toast', 'save']);

// --- Composables ---
const router = useRouter();
const toast = useToast();
// To update the original course invoice
const { updateData, loading: isSubmitting } = useFetch('studentinvoicegenerates');
// To create the new payment report
const { postData: postStudentPaymentReport } = useFetch('studentpaymentreports');

// --- Form Submission ---
const handleSubmit = async () => {
    if (!props.datatoedit?._id) {
        console.error('No invoice data provided to process.');
        toast.add({ severity: 'error', summary: 'Error', detail: 'No invoice data to process.', life: 3000 });
        return;
    }

    try {
        // 1. Payload to mark the original invoice as completed
        const invoiceUpdatePayload = {
            status: false
        };

        // 2. Payload for the new historical payment report
        const reportPayload = {
            student_id: props.datatoedit.student_id,
            course_id: props.datatoedit.course_id,
            amount: props.datatoedit.amount,
            discount: props.datatoedit.discount,
            final_price: props.datatoedit.final_price,
            status: true // Mark the report as a completed payment
        };

        // 3. Execute both database operations concurrently for efficiency
        await Promise.all([updateData(invoiceUpdatePayload, props.datatoedit._id), postStudentPaymentReport(reportPayload)]);

        // 4. Navigate to the printable invoice page after success
        router.push({ name: 'invoice_invoice', params: { id: props.datatoedit._id } });

        emit('toast', 'update', 'Payment finalized and report created.');
        emit('save'); // Notify parent to refresh its data
        emit('close');
    } catch (error) {
        console.error('Error completing payment:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to complete payment.', life: 3000 });
    }
};
</script>
