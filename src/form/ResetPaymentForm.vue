<template>
    <form @submit.prevent="handleSubmit" class="w-[420px] bg-white rounded-lg shadow-md overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">Complete Student Payment</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>

        <div class="px-4 py-5 space-y-5 text-start">
            <div>
                <label for="date" class="block text-sm font-medium text-gray-700 mb-2 text-start"> Are you sure you want to mark this payment as completed?</label>
                <p class="text-sm text-gray-500">This will create a payment report and reset the student's payment dates.</p>
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-2 p-4 bg-gray-50 border-t">
            <Button label="Cancel" @click="$emit('close')" severity="secondary" outlined />
            <Button :label="isSubmitting ? 'Saving...' : 'Save and Finalize'" type="submit" :loading="isSubmitting" :disabled="isSubmitting" />
        </div>
    </form>
</template>

<script setup>
import { ref } from 'vue';
import { useFetch } from '@/composible/useFetch';
import moment from 'moment';

// --- Props and Emits ---
const props = defineProps({
    datatoedit: {
        // Expecting the full student object
        type: Object,
        required: true
    }
});
const emit = defineEmits(['close', 'toast', 'save']);

// --- Data Fetching ---
// To update the student record after processing
const { updateData: updateStudent } = useFetch('students');
// To create the new payment report
const { postData: postPaymentReport, loading: isSubmitting } = useFetch('studentcompletepaymentreports');

// --- Form Submission ---
const handleSubmit = async () => {
    if (!props.datatoedit?._id) {
        console.error('No student data provided to process.');
        emit('toast', 'error', 'An error occurred.');
        return;
    }

    try {
        // 1. Prepare the payload for the new report using data from the student object
        const reportPayload = {
            student_id: props.datatoedit._id,
            payment_date: props.datatoedit.payment_date ? moment(props.datatoedit.payment_date).format('YYYY-MM-DD') : null,
            payment_type: props.datatoedit.payment_type,
            next_payment_date: props.datatoedit.next_payment_date ? moment(props.datatoedit.next_payment_date).format('YYYY-MM-DD') : null,
            mark_status: 'done'
        };

        // 2. Prepare the payload to reset the student's payment fields
        const studentResetPayload = {
            payment_date: null,
            payment_type: null,
            next_payment_date: null
        };

        // 3. Execute both operations: create the report, then update the student record.
        await postPaymentReport(reportPayload);
        await updateStudent(studentResetPayload, props.datatoedit._id);

        // 4. Notify parent and close
        emit('toast', 'update', 'Payment finalized and report created.');

        emit('close');
    } catch (error) {
        console.error('Error finalizing payment:', error);
        emit('toast', 'error', 'Failed to finalize payment.');
    }
};
</script>
