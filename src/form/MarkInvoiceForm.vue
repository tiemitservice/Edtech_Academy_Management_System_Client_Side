<template>
    <form @submit.prevent="handleSubmit" class="w-[420px] bg-white rounded-lg shadow-md overflow-hidden">
        <div v-if="datatoedit" class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">{{ $t('student_payment_transaction.return_invoice') }} [ {{ formatClassName(datatoedit?.course_id) }} - {{ formatStudentName(datatoedit?.student_id) }} ]</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>
        <div class="p-4">
            <p class="text-start">{{ $t('student_payment_transaction.are_you_sure_return') }}</p>
        </div>
        <!-- Action Buttons -->
        <div class="flex justify-end border-t gap-2 p-4">
            <Button :label="$t('element.cancel')" @click="$emit('close')" severity="danger" />
            <Button :label="isSubmitting ? $t('element.adding') : $t('element.save')" type="submit" :loading="isSubmitting" :disabled="isSubmitting" />
        </div>
    </form>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useFetch } from '@/composible/useFetch';
import { useRouter } from 'vue-router';

// --- Props and Emits ---
const props = defineProps({
    datatoedit: {
        type: Object,
        default: () => null
    }
});
const emit = defineEmits(['close', 'toast', 'save']);

// --- Composables ---
const router = useRouter();

// --- Data Fetching ---
const { data: classes, fetchData: fetchClasses } = useFetch('classes');
const { data: students, fetchData: fetchStudents } = useFetch('students');
const { data: discounts, fetchData: fetchDiscounts } = useFetch('discounts');
// useFetch instance for updating the original course invoice
const { updateData: updateCourseInvoice } = useFetch('studentinvoicegenerates');
// useFetch instance for creating the new payment report
const { postData: postStudentPaymentReport, loading: isSubmitting } = useFetch('studentpaymentreports');

// --- Component State ---
const price = ref(null);
const discount = ref(null);

// --- Helper Functions ---
const formatClassName = (id) => classes.value?.find((cl) => cl._id === id)?.name || 'N/A';
const formatStudentName = (id) => students.value?.find((st) => st._id === id)?.eng_name || 'Unknown';

// --- Form Submission ---
const handleSubmit = async () => {
    if (!props.datatoedit) {
        console.error('No data to process.');
        return;
    }

    try {
        // 1. Prepare the payload for updating the course invoice
        const courseInvoicePayload = {
            status: true
        };

        // 3. Execute both database operations concurrently
        await updateCourseInvoice(courseInvoicePayload, props.datatoedit._id);

        // 4. Navigate to the printable invoice page on success

        emit('close');
        emit('toast', 'update', 'success');
    } catch (error) {
        console.error('Error processing payment:', error);
        emit('toast', 'error', 'Failed to process payment.');
    }
};

// --- Lifecycle Hook ---
onMounted(async () => {
    // Fetch all necessary data when the component mounts
    await Promise.all([fetchClasses(), fetchStudents(), fetchDiscounts()]);

    // Populate the form with existing data if available
    if (props.datatoedit) {
        console.log('data', props.datatoedit);
    }
});
</script>
