<template>
    <form @submit.prevent="handleSubmit" class="w-[520px] bg-white rounded-lg shadow-md overflow-hidden text-start">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">{{ datatoedit ? 'Edit Invoice' : 'Generate Student Invoice' }}</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>

        <div class="p-5 grid grid-cols-2 gap-4">
            <!-- Student Select -->
            <div class="flex flex-col space-y-1 w-full">
                <label for="student" class="font-medium">Student <span class="text-red-500">*</span></label>
                <Select id="student" v-model="formState.student_id" :options="students" filter optionLabel="eng_name" optionValue="_id" placeholder="Select a student" class="w-full" />
                <small v-if="errors.student_id" class="text-red-500">{{ errors.student_id }}</small>
            </div>

            <!-- Class Select -->
            <div class="flex flex-col space-y-1 w-full">
                <label for="class" class="font-medium">Class <span class="text-red-500">*</span></label>
                <Select id="class" v-model="formState.course_id" :options="classes" filter optionLabel="name" optionValue="_id" placeholder="Select a class" class="w-full" />
                <small v-if="errors.course_id" class="text-red-500">{{ errors.course_id }}</small>
            </div>

            <!-- Price -->
            <div class="flex flex-col space-y-1 w-full">
                <label for="price" class="font-medium">Course Price ($) <span class="text-red-500">*</span></label>
                <InputNumber id="price" v-model="formState.amount" placeholder="Enter price" class="w-full" mode="currency" currency="USD" locale="en-US" />
                <small v-if="errors.amount" class="text-red-500">{{ errors.amount }}</small>
            </div>

            <!-- Discount -->
            <div class="flex flex-col space-y-1 w-full">
                <label for="discount" class="font-medium">Discount (%)</label>
                <Select id="discount" v-model="formState.discount" :options="discounts" filter optionLabel="name" optionValue="discount" placeholder="Select discount" class="w-full" showClear />
            </div>

            <!-- Final Price (Read-only) -->
            <div class="flex flex-col space-y-1 w-full">
                <label class="font-medium">Final Price</label>
                <InputNumber :modelValue="finalPrice" class="w-full bg-gray-100" readonly mode="currency" currency="USD" locale="en-US" />
            </div>

            <!-- Payment Type -->
            <div class="flex flex-col space-y-1 w-full">
                <label for="payment_type" class="font-medium">Payment Type</label>
                <Select id="payment_type" v-model="formState.payment_type" :options="paymentTypes" optionLabel="name" optionValue="value" placeholder="Select payment type" class="w-full" showClear />
            </div>

            <!-- First Payment Date -->
            <div class="flex flex-col space-y-1 w-full">
                <label for="first_payment_date" class="font-medium">First Payment Date</label>
                <Calendar id="first_payment_date" v-model="formState.first_payment_date" dateFormat="yy-mm-dd" showIcon class="w-full" />
            </div>

            <!-- Next Payment Date (Read-only) -->
            <div v-if="nextPaymentDate" class="flex flex-col space-y-1 w-full">
                <label class="font-medium">Next Payment Date</label>
                <InputText :value="nextPaymentDate" class="w-full bg-gray-100" disabled />
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="w-full flex items-center justify-end mt-4 p-4 border-t bg-gray-50">
            <Button @click="$emit('close')" label="Cancel" severity="secondary" outlined class="mr-2" />
            <Button :label="loading ? 'Saving...' : 'Save & Print'" type="submit" :loading="loading" />
        </div>
    </form>
</template>

<script setup>
import { ref, onMounted, computed, reactive, watch } from 'vue';
import { useFetch } from '@/composible/useFetch';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';
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
const { data: students, fetchData: fetchStudents } = useFetch('students');
const { data: classes, fetchData: fetchClasses } = useFetch('classes');
const { data: discounts, fetchData: fetchDiscounts } = useFetch('discounts');
const { postData, updateData, loading } = useFetch('studentinvoicegenerates');
const { postData: postStudentPaymentReport } = useFetch('studentpaymentreports');
const toast = useToast();

// --- Reactive Form State ---
const formState = reactive({
    student_id: null,
    course_id: null,
    amount: 0,
    discount: 0,
    payment_type: null,
    first_payment_date: null
});
const errors = ref({});

// --- Static Data ---
const paymentTypes = ref([
    { name: 'Quarter', value: 'Quarter' },
    { name: 'Monthly', value: 'Monthly' }
]);

// --- Computed Properties ---
const finalPrice = computed(() => {
    const amount = formState.amount || 0;
    const discountPercent = formState.discount || 0;
    const discountAmount = amount * (discountPercent / 100);
    return amount - discountAmount;
});

const nextPaymentDate = computed(() => {
    if (formState.payment_type && formState.first_payment_date) {
        const date = moment(formState.first_payment_date);
        if (formState.payment_type === 'Monthly') {
            return date.add(1, 'months').format('YYYY-MM-DD');
        } else if (formState.payment_type === 'Quarter') {
            return date.add(3, 'months').format('YYYY-MM-DD');
        }
    }
    return null;
});

// --- Form Validation and Submission ---
const validateForm = () => {
    errors.value = {};
    if (!formState.student_id) errors.value.student_id = 'Student is required.';
    if (!formState.course_id) errors.value.course_id = 'Class is required.';
    if (!formState.amount || formState.amount <= 0) errors.value.amount = 'Price must be greater than zero.';
    return Object.keys(errors.value).length === 0;
};

const handleSubmit = async () => {
    if (!validateForm()) {
        toast.add({ severity: 'warn', summary: 'Validation Error', detail: 'Please fill all required fields.', life: 3000 });
        return;
    }

    try {
        const invoicePayload = {
            ...formState,
            final_price: finalPrice.value,
            next_payment_date: nextPaymentDate.value,
            first_payment_date: formState.first_payment_date ? moment(formState.first_payment_date).format('YYYY-MM-DD') : null
        };

        const reportPayload = {
            student_id: formState.student_id,
            course_id: formState.course_id,
            amount: formState.amount,
            discount: formState.discount || 0,
            final_price: finalPrice.value,
            status: true
        };

        let invoiceId;

        if (props.datatoedit) {
            await Promise.all([updateData(invoicePayload, props.datatoedit._id), postStudentPaymentReport(reportPayload)]);
            emit('toast', 'update');
            invoiceId = props.datatoedit._id;
        } else {
            const newInvoiceResponse = await postData(invoicePayload);
            invoiceId = newInvoiceResponse.data?._id;
            await postStudentPaymentReport({ ...reportPayload, invoice_id: invoiceId }); // Optionally link report to invoice
            emit('toast', 'create');
        }

        emit('save');
        emit('close');

        if (invoiceId) {
            router.push({ name: 'invoice_invoice', params: { id: invoiceId } });
        }
    } catch (error) {
        console.error('Error saving invoice:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save the invoice.', life: 3000 });
    }
};

// --- Lifecycle Hook ---
watch(
    () => props.datatoedit,
    (newData) => {
        if (newData) {
            formState.student_id = newData.student_id;
            formState.course_id = newData.course_id;
            formState.amount = newData.amount;
            formState.discount = newData.discount;
            formState.payment_type = newData.payment_type;
            formState.first_payment_date = newData.first_payment_date ? moment(newData.first_payment_date).toDate() : null;
        } else {
            Object.assign(formState, {
                student_id: null,
                course_id: null,
                amount: 0,
                discount: 0,
                payment_type: null,
                first_payment_date: null
            });
        }
    },
    { immediate: true, deep: true }
);

onMounted(async () => {
    const activeFilter = { status: true };
    await Promise.all([fetchStudents(activeFilter), fetchClasses(activeFilter), fetchDiscounts(activeFilter)]);
});
</script>
