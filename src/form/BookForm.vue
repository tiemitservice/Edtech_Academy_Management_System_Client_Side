<template>
    <form @submit.prevent="handleSubmit" class="w-[320px]">
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">{{ datatoedit ? 'Edit Book' : 'Add New Book' }}</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>
        <div class="p-4 text-start space-y-4">
            <div>
                <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Book Name <span class="text-red-500">*</span></label>
                <InputText class="w-full" placeholder="Book Name" :required="true" id="name" v-model="formState.name" />
            </div>
            <div>
                <label for="book_type" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Book Type <span class="text-red-500">*</span></label>
                <Select filter show-clear class="w-full" :options="book_categories" optionLabel="name" optionValue="_id" placeholder="Book Type" id="book_type" v-model="formState.bookType" />
            </div>
            <div>
                <label for="stock" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Book Stock <span class="text-red-500">*</span></label>
                <InputNumber show-clear class="w-full" placeholder="Stock Quantity" id="stock" v-model="formState.stock" />
            </div>
            <div>
                <label for="price" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Price <span class="text-red-500">*</span></label>
                <InputNumber class="w-full" placeholder="Price" :required="true" id="price" v-model="formState.price" mode="currency" currency="USD" locale="en-US" />
            </div>
            <div class="space-y-1 text-start flex items-center gap-4">
                <ToggleSwitch id="status_switch" v-model="formState.status" />
                <label for="status_switch">Is Active</label>
            </div>
        </div>
        <div class="w-full flex justify-end gap-3 p-4">
            <Button :label="loading ? 'Saving...' : 'Submit'" type="submit" :disabled="loading" />
            <Button @click="$emit('close')" label="Cancel" severity="secondary" outlined />
        </div>
    </form>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useFetch } from '@/composible/useFetch';

// --- Props and Emits ---
const props = defineProps({
    datatoedit: {
        type: Object,
        default: () => null
    }
});
const emit = defineEmits(['close', 'toast', 'save']);

// --- Data Fetching ---
const { postData, updateData, loading } = useFetch('books');
const { data: book_categories, fetchData: fetchBookCategories } = useFetch('book_categories');
// A separate useFetch instance for creating stock history reports
const { postData: postStockHistoryReport } = useFetch('stockhistoryreports');

// --- Component State ---
const formState = ref({
    name: null,
    status: true,
    bookType: null,
    price: null,
    stock: null
});

// --- Form Submission ---
const handleSubmit = async () => {
    try {
        const payload = {
            name: formState.value.name,
            status: formState.value.status,
            bookType: formState.value.bookType,
            price: formState.value.price,
            stock: formState.value.stock
        };

        if (props.datatoedit) {
            // --- UPDATE LOGIC ---
            const oldStock = props.datatoedit.stock || 0;
            const newStock = formState.value.stock || 0;
            const stockDifference = newStock - oldStock;

            await updateData(payload, props.datatoedit._id);

            // If stock was increased, create a stock-in history report
            if (stockDifference > 0) {
                const historyPayload = {
                    book_id: props.datatoedit._id,
                    stock_in: stockDifference
                };
                await postStockHistoryReport(historyPayload);
            }
            emit('toast', 'update');
        } else {
            // --- CREATE LOGIC ---
            const newBookResponse = await postData(payload);

            // If the new book was created successfully and has an initial stock,
            // create a stock-in history report for that initial amount.
            if (newBookResponse && newBookResponse.data?._id && formState.value.stock > 0) {
                const historyPayload = {
                    book_id: newBookResponse.data._id,
                    stock_in: formState.value.stock
                };
                await postStockHistoryReport(historyPayload);
            }
            emit('toast', 'create');
        }

        emit('save'); // Notify parent to refresh its data
        emit('close');
    } catch (error) {
        console.error('Submission error:', error);
        emit('toast', 'error', 'Failed to save book data.');
    }
};

// --- Lifecycle Hook ---
onMounted(async () => {
    // Fetch book categories for the dropdown
    await fetchBookCategories();

    // If editing, populate the form with the existing data
    if (props.datatoedit) {
        formState.value.name = props.datatoedit.name;
        formState.value.status = props.datatoedit.status;
        formState.value.bookType = props.datatoedit.bookType;
        formState.value.price = props.datatoedit.price;
        formState.value.stock = props.datatoedit.stock;
    }
});
</script>
