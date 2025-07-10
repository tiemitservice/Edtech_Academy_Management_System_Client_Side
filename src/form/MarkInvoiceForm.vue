<template>
    <form @submit.prevent="handleSubmit" class="w-[420px] bg-white rounded-lg shadow-md overflow-hidden">
        <div v-if="datatoedit" class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">Print Invoice [ {{ formatClassName(datatoedit?.course_id) }} - {{ formatStudentName(datatoedit?.student_id) }} ]</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>

        <div class="p-5 space-y-4">
            <div class="flex flex-col items-start">
                <label for="price" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Course Price ($)<span class="text-red-500">*</span></label>
                <InputNumber placeholder="Course Price" :required="true" class="w-full" id="price" v-model="price" />
            </div>
            <!-- Apply discount -->
            <div class="flex flex-col text-start">
                <label for="discount" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Apply Discount (%)<span class="text-red-500"></span></label>
                <Select id="discount" placeholder="Select a discount type" filter show-clear :options="discounts" v-model="discount" optionLabel="name" optionValue="discount" class="w-full" />
            </div>
            <div class="flex flex-col items-start">
                <label for="final_price" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Final Price <span class="text-red-500"></span></label>
                <InputNumber placeholder="Final Price" suffix=" $" :required="true" class="w-full" id="final_price" v-model="finalPrice" readonly />
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-2 p-4">
            <Button label="Cancel" @click="$emit('close')" severity="danger" outlined />
            <Button :label="isSubmitting ? 'Processing...' : 'Print'" type="submit" :loading="isSubmitting" :disabled="isSubmitting" />
        </div>
    </form>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
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
const { updateData: updateCourseInvoice } = useFetch('courseinvoices');
// useFetch instance for creating the new payment report
const { postData: postStudentPaymentReport, loading: isSubmitting } = useFetch('studentpaymentreports');

// --- Component State ---
const price = ref(null);
const discount = ref(null);

// --- Computed Properties ---
const finalPrice = computed(() => {
    if (price.value == null) return 0;
    if (discount.value == null || discount.value === 0) return price.value;
    const discountAmount = (price.value * discount.value) / 100;
    return price.value - discountAmount;
});

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
            amount: price.value,
            discount: discount.value || 0,
            mark_as_completed: true,
            final_price: finalPrice.value
        };

        // 2. Prepare the payload for creating the new student payment report
        const reportPayload = {
            student_id: props.datatoedit.student_id,
            course_id: props.datatoedit.course_id,
            amount: price.value,
            discount: discount.value || 0,
            final_price: finalPrice.value,
            status: true
        };

        // 3. Execute both database operations concurrently
        await Promise.all([updateCourseInvoice(courseInvoicePayload, props.datatoedit._id), postStudentPaymentReport(reportPayload)]);

        // 4. Navigate to the printable invoice page on success
        router.push({ name: 'invoice_invoice', params: { id: props.datatoedit._id } });

        emit('close');
        emit('toast', 'update');
        emit('save'); // Notify parent to refresh data
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
        price.value = props.datatoedit.amount;
        discount.value = props.datatoedit.discount;
    }
});
</script>
