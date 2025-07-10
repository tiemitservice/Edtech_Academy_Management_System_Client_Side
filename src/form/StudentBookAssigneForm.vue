<template>
    <form @submit.prevent="handleSubmit" class="w-[420px] bg-white rounded-lg shadow-md overflow-hidden">
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">{{ datatoedit ? 'Edit Book Payment' : 'Create Book Payment' }}</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>
        <div class="p-4 space-y-4">
            <div class="flex flex-col text-start">
                <label for="student_list" class="mb-2 font-medium">Student</label>
                <Select id="student_list" v-model="formState.student_id" :options="students" filter show-clear optionLabel="eng_name" optionValue="_id" placeholder="Select a Student" class="w-full" :disabled="!!datatoedit" />
                <small v-if="errors.student_id" class="text-red-500 mt-1">{{ errors.student_id }}</small>
            </div>
            <div class="flex flex-col text-start">
                <label for="book_list" class="mb-2 font-medium">Books</label>
                <MultiSelect id="book_list" v-model="formState.book_ids" :options="availableBooks" filter show-clear optionLabel="name" optionValue="_id" placeholder="Select Books" class="w-full" />
                <small v-if="errors.book_ids" class="text-red-500 mt-1">{{ errors.book_ids }}</small>
            </div>

            <div class="flex flex-col text-start">
                <label for="discount" class="mb-2 font-medium">Discount</label>
                <Select id="discount" v-model="formState.discount" :options="discounts" filter show-clear optionLabel="name" optionValue="discount" placeholder="Select Discount" class="w-full" />
            </div>

            <div class="text-start">
                <p class="font-medium">
                    Total Price: <span class="font-bold text-lg text-green-600">${{ formState.final_price.toFixed(2) }}</span>
                </p>
            </div>
        </div>
        <div class="w-full flex items-center justify-end gap-2 p-4 border-t bg-gray-50">
            <Button @click="$emit('close')" label="Cancel" severity="secondary" outlined />
            <Button :label="isSubmitting ? 'Saving...' : 'Save'" type="submit" :loading="isSubmitting" />
        </div>
    </form>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useFetch } from '@/composible/useFetch';
import { useRouter } from 'vue-router';

// Define props passed from the parent component
const props = defineProps({
    datatoedit: {
        type: Object,
        default: () => null
    }
});

const emit = defineEmits(['close', 'toast', 'save']);
const router = useRouter();

// --- Data Fetching ---
const { data: students, fetchData: fetchStudents } = useFetch('students');
const { data: books, fetchData: fetchBooks } = useFetch('books');
const { postData: postBookPayment, updateData: updateBookPayment } = useFetch('bookpayments');
const { data: discounts, fetchData: fetchDiscounts } = useFetch('discounts');
const { updateData: updateBookStock } = useFetch('books');
const { postData: postBookPaymentReport } = useFetch('bookpaymentreports');
// **NEW:** A separate useFetch instance for creating stock history reports
const { postData: postStockHistoryReport } = useFetch('stockhistoryreports');

// --- Component State ---
const formState = ref({
    student_id: null,
    book_ids: [],
    discount: null,
    final_price: 0
});
const errors = ref({});
const isSubmitting = ref(false);

// --- Computed Properties ---
const availableBooks = computed(() => {
    return Array.isArray(books.value) ? books.value.filter((b) => b.stock > 0) : [];
});

// --- Watchers ---
watch(
    [() => formState.value.book_ids, () => formState.value.discount],
    ([newBookIds, newDiscount]) => {
        if (!newBookIds || !Array.isArray(books.value)) {
            formState.value.final_price = 0;
            return;
        }
        const baseTotal = newBookIds.reduce((sum, bookId) => {
            const book = books.value.find((b) => b._id === bookId);
            return sum + (book ? book.price : 0);
        }, 0);

        if (newDiscount && newDiscount > 0) {
            const discountAmount = baseTotal * (newDiscount / 100);
            formState.value.final_price = baseTotal - discountAmount;
        } else {
            formState.value.final_price = baseTotal;
        }
    },
    { deep: true }
);

// --- Form Logic ---
const validateForm = () => {
    errors.value = {};
    if (!formState.value.student_id) {
        errors.value.student_id = 'Please select a student.';
    }
    if (!formState.value.book_ids || formState.value.book_ids.length === 0) {
        errors.value.book_ids = 'Please select at least one book.';
    }
    return Object.keys(errors.value).length === 0;
};

const handleSubmit = async () => {
    if (!validateForm()) return;

    isSubmitting.value = true;
    try {
        const baseTotal = formState.value.book_ids.reduce((sum, bookId) => {
            const book = books.value.find((b) => b._id === bookId);
            return sum + (book ? book.price : 0);
        }, 0);

        const payload = {
            student_id: formState.value.student_id,
            book_id: formState.value.book_ids,
            book_amount: formState.value.book_ids.length,
            amount: baseTotal,
            discount: formState.value.discount || 0,
            final_price: formState.value.final_price,
            mark_as_completed: true
        };

        let invoiceId;

        if (props.datatoedit) {
            await updateBookPayment(payload, props.datatoedit._id);
            emit('toast', 'update');
            invoiceId = props.datatoedit._id;
        } else {
            const newPaymentResponse = await postBookPayment(payload);
            invoiceId = newPaymentResponse.data?._id;

            // Create individual book payment reports
            const reportPromises = formState.value.book_ids.map((bookId) => {
                const book = books.value.find((b) => b._id === bookId);
                if (!book) return null;

                const discountPercentage = formState.value.discount || 0;
                const finalBookPrice = book.price * (1 - discountPercentage / 100);

                const reportPayload = {
                    student_id: formState.value.student_id,
                    book_id: bookId,
                    amount: book.price,
                    discount: discountPercentage,
                    final_price: finalBookPrice
                };
                return postBookPaymentReport(reportPayload);
            });

            // Update stock for each book
            const stockUpdatePromises = formState.value.book_ids.map((bookId) => {
                const book = books.value.find((b) => b._id === bookId);
                if (book && book.stock > 0) {
                    const stockUpdatePayload = { stock: book.stock - 1 };
                    return updateBookStock(stockUpdatePayload, bookId);
                }
                return null;
            });

            // **NEW:** Create a stock history report for each book sold
            const stockHistoryPromises = formState.value.book_ids.map((bookId) => {
                const historyPayload = {
                    book_id: bookId,
                    stock_out: 1 // Record 1 item sold
                };
                return postStockHistoryReport(historyPayload);
            });

            // Execute all promises concurrently
            await Promise.all([...reportPromises, ...stockUpdatePromises, ...stockHistoryPromises].filter((p) => p));
            emit('toast', 'create');
        }

        emit('save');
        emit('close');

        if (invoiceId) {
            router.push(`/book-invoice/${invoiceId}`);
        }
    } catch (e) {
        console.error('Error saving book payment:', e);
        emit('toast', 'error');
    } finally {
        isSubmitting.value = false;
    }
};

// --- Lifecycle Hook ---
onMounted(async () => {
    await Promise.all([fetchStudents(), fetchBooks(), fetchDiscounts()]);
    if (props.datatoedit) {
        formState.value.student_id = props.datatoedit.student_id;
        formState.value.book_ids = props.datatoedit.book_id || [];
        formState.value.discount = props.datatoedit.discount;
    }
});
</script>
