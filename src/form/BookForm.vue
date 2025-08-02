<template>
    <form @submit.prevent="handleSubmit" class="w-[320px]">
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">{{ datatoedit ? $t('element.edit') : $t('element.addnew') }}</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>
        <div class="p-4 text-start space-y-4">
            <div>
                <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{{ $t('book.name') }} <span class="text-red-500">*</span></label>
                <InputText class="w-full" :placeholder="$t('book.name')" :required="true" id="name" v-model="formState.name" />
            </div>
            <div>
                <label for="book_type" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{{ $t('book.type') }} <span class="text-red-500">*</span></label>
                <Select filter show-clear class="w-full" :options="book_categories" optionLabel="name" optionValue="_id" :placeholder="$t('book.bookType')" id="book_type" v-model="formState.bookType" />
            </div>
            <div>
                <label for="stock" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{{ datatoedit ? 'Current Stock' : $t('book.quantity') }} <span class="text-red-500">*</span></label>
                <InputNumber show-clear class="w-full" :placeholder="$t('book.quantity')" id="stock" v-model="formState.stock" :disabled="datatoedit" />
            </div>
            <!-- Field for adjusting stock, only shown when editing -->
            <div v-if="datatoedit">
                <label for="adjust_stock" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Adjust Stock By</label>
                <div class="flex items-center gap-2">
                    <Button icon="pi pi-minus" @click="decrementAdjustment" severity="danger" rounded text />
                    <InputText class="w-full text-center font-semibold" v-model="formattedStockAdjustment" />
                    <Button icon="pi pi-plus" @click="incrementAdjustment" severity="success" rounded text />
                </div>
            </div>
            <div>
                <label for="price" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{{ $t('book.price') }} <span class="text-red-500">*</span></label>
                <InputNumber class="w-full" :placeholder="$t('book.price')" :required="true" id="price" v-model="formState.price" mode="currency" currency="USD" locale="en-US" />
            </div>
            <div class="space-y-1 text-start flex items-center gap-4">
                <ToggleSwitch id="status_switch" v-model="formState.status" />
                <label for="status_switch">Is Active</label>
            </div>
        </div>
        <div class="flex justify-end border-t gap-2 p-4">
            <Button :label="$t('element.cancel')" @click="$emit('close')" severity="danger" />
            <Button :label="loading ? $t('element.adding') : $t('element.save')" type="submit" :loading="loading" :disabled="loading" />
        </div>
    </form>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
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
const { postData: postStockHistoryReport } = useFetch('stockhistoryreports');

// --- Component State ---
const formState = ref({
    name: null,
    status: true,
    bookType: null,
    price: null,
    stock: 0
});
const stockAdjustment = ref(0); // New state for the adjustment amount

// --- Computed property for displaying the formatted adjustment value ---
const formattedStockAdjustment = computed({
    get: () => {
        if (stockAdjustment.value > 0) {
            return `+${stockAdjustment.value}`;
        }
        return stockAdjustment.value.toString();
    },
    set: (value) => {
        stockAdjustment.value = parseInt(value) || 0;
    }
});

// --- Stock Adjustment Functions ---
const incrementAdjustment = () => {
    stockAdjustment.value++;
};
const decrementAdjustment = () => {
    stockAdjustment.value--;
};

// --- Form Submission ---
const handleSubmit = async () => {
    try {
        if (props.datatoedit) {
            // --- UPDATE LOGIC ---
            const currentStock = props.datatoedit.stock || 0;
            const adjustment = stockAdjustment.value || 0;
            const newStock = currentStock + adjustment;

            if (newStock < 0) {
                emit('toast', { action: 'error', message: 'Stock cannot be negative.' });
                return; // Stop the submission
            }

            const payload = { ...formState.value, stock: newStock };
            await updateData(payload, props.datatoedit._id);

            // If stock was actually changed, create a history report
            if (adjustment !== 0) {
                const historyPayload = {
                    book_id: props.datatoedit._id,
                    stock_in: adjustment > 0 ? adjustment : 0,
                    stock_out: adjustment < 0 ? Math.abs(adjustment) : 0
                };
                await postStockHistoryReport(historyPayload);
            }
            emit('toast', 'update', 'success');
        } else {
            // --- CREATE LOGIC ---
            const payload = { ...formState.value };
            const newBookResponse = await postData(payload);

            // If the new book has an initial stock, create a stock-in report
            if (newBookResponse && newBookResponse.data?._id && formState.value.stock > 0) {
                const historyPayload = {
                    book_id: newBookResponse.data._id,
                    stock_in: formState.value.stock,
                    stock_out: 0
                };
                await postStockHistoryReport(historyPayload);
            }
            emit('toast', 'create', 'info');
        }

        emit('save'); // Notify parent to refresh its data
        emit('close');
    } catch (error) {
        console.error('Submission error:', error);
        emit('toast', { action: 'error', message: 'Failed to save book data.' });
    }
};

// --- Lifecycle Hook ---
onMounted(async () => {
    await fetchBookCategories();

    if (props.datatoedit) {
        formState.value.name = props.datatoedit.name;
        formState.value.status = props.datatoedit.status;
        formState.value.bookType = props.datatoedit.bookType;
        formState.value.price = props.datatoedit.price;
        formState.value.stock = props.datatoedit.stock || 0;
    }
});
</script>
