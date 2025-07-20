<template>
    <div class="bg-gray-100 font-sans">
        <div class="container mx-auto py-8 px-4">
            <!-- Action Buttons (Hidden on Print) -->
            <div class="flex justify-end gap-2 mb-4 hidden-print">
                <Button icon="pi pi-arrow-left" @click="router.back()" :label="$t('element.back')" outlined />
                <Button icon="pi pi-print" @click="handlePrint" :label="$t('element.print_invoice')" />
            </div>

            <!-- A5 Printable Area -->
            <div id="printable-area" class="a5-page bg-white p-8 rounded-lg shadow-lg border border-gray-200">
                <!-- Header -->
                <header class="flex justify-between items-center pb-6 border-b">
                    <div>
                        <img :src="companyInfo?.invoice_logo || 'https://placehold.co/150x80?text=Logo'" alt="Company Logo" class="w-32 h-auto" />
                        <h2 class="text-xl font-bold text-gray-800 mt-2">{{ companyInfo?.name || 'Your Company' }}</h2>
                        <p class="text-sm text-gray-500">{{ companyInfo?.address || '123 Street, City, Country' }}</p>
                    </div>
                    <div class="text-right">
                        <h1 class="text-3xl font-bold text-gray-800">{{ $t('invoice.title') }}</h1>
                        <p class="text-sm text-gray-500 mt-1">{{ $t('invoice.invoice_no') }}: {{ invoice?._id }}</p>
                        <p class="text-sm text-gray-500">{{ $t('invoice.date') }}: {{ formatDate(invoice?.createdAt) }}</p>
                    </div>
                </header>

                <!-- Billing Info -->
                <section class="flex justify-between mt-8">
                    <div class="text-sm">
                        <h3 class="font-semibold text-gray-800 mb-2">{{ $t('invoice.bill_to') }}</h3>
                        <p class="font-bold">{{ studentInfo?.eng_name || 'N/A' }}</p>
                        <p>{{ studentInfo?.phoneNumber || '' }}</p>
                        <p>{{ studentInfo?.email || '' }}</p>
                    </div>
                </section>

                <!-- Items Table -->
                <section class="mt-8">
                    <table class="w-full text-left">
                        <thead>
                            <tr class="bg-gray-100 text-sm font-semibold text-gray-600">
                                <th class="p-3">{{ $t('invoice.item_no') }}</th>
                                <th class="p-3">{{ $t('invoice.book_title') }}</th>
                                <th class="p-3 text-right">{{ $t('invoice.price') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(book, index) in bookDetails" :key="book._id" class="border-b">
                                <td class="p-3 text-sm">{{ index + 1 }}</td>
                                <td class="p-3 text-sm">{{ book.name }}</td>
                                <td class="p-3 text-sm text-right">${{ book.price?.toFixed(2) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                <!-- Totals Section -->
                <section class="flex justify-end mt-8">
                    <div class="w-full max-w-xs text-sm">
                        <div class="flex justify-between py-2 border-b">
                            <span class="font-semibold text-gray-600">{{ $t('invoice.subtotal') }}</span>
                            <span>${{ invoice?.amount?.toFixed(2) }}</span>
                        </div>
                        <div class="flex justify-between py-2 border-b">
                            <span class="font-semibold text-gray-600">{{ $t('invoice.discount') }} ({{ invoice?.discount || 0 }}%):</span>
                            <span>-${{ (invoice?.amount - invoice?.final_price)?.toFixed(2) }}</span>
                        </div>
                        <div class="flex justify-between py-3 bg-gray-100 px-3 rounded mt-2">
                            <span class="font-bold text-lg text-gray-800">{{ $t('invoice.grand_total') }}</span>
                            <span class="font-bold text-lg text-gray-800">${{ invoice?.final_price?.toFixed(2) }}</span>
                        </div>
                    </div>
                </section>

                <!-- Footer -->
                <footer class="mt-12 pt-6 border-t text-center text-xs text-gray-500">
                    <p>{{ $t('invoice.thank_you') }}</p>
                    <p>{{ companyInfo?.name }} | {{ companyInfo?.phoneNumber }} | {{ companyInfo?.email }}</p>
                </footer>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFetch } from '@/composible/useFetch';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import moment from 'moment';
import Button from 'primevue/button';

// --- Composables ---
const route = useRoute();
const router = useRouter();
const toast = useToast();
const { t } = useI18n();

// --- Data Fetching ---
const { data: payments, fetchData: fetchPayments } = useFetch('bookpayments');
const { data: students, fetchData: fetchStudents } = useFetch('students');
const { data: books, fetchData: fetchBooks } = useFetch('books');
const { data: companies, fetchData: fetchCompanies } = useFetch('companies');

// --- Component State ---
const loading = ref(true);
const invoiceId = ref(route.params.id);

// --- Computed Properties ---
const invoice = computed(() => (Array.isArray(payments.value) ? payments.value.find((p) => p._id === invoiceId.value) : null));
const studentInfo = computed(() => {
    if (!invoice.value || !Array.isArray(students.value)) return null;
    return students.value.find((s) => s._id === invoice.value.student_id);
});
const bookDetails = computed(() => {
    if (!invoice.value || !Array.isArray(books.value)) return [];
    return invoice.value.book_id.map((bookId) => books.value.find((b) => b._id === bookId) || { name: 'Unknown Book', price: 0 });
});
const companyInfo = computed(() => (Array.isArray(companies.value) && companies.value.length > 0 ? companies.value[0] : null));

// --- Methods ---
const formatDate = (date) => (date ? moment(date).format('MMMM D, YYYY') : 'N/A');

const handlePrint = async () => {
    await nextTick();
    window.print();
};
// --- Lifecycle Hook ---
onMounted(async () => {
    loading.value = true;
    try {
        await Promise.all([fetchPayments(), fetchStudents(), fetchBooks(), fetchCompanies()]);
    } catch (error) {
        console.error('Failed to fetch invoice data:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Could not load invoice data.', life: 3000 });
    } finally {
        loading.value = false;
    }
});
</script>

<style>
/* A5 Page Layout for Print */
/* style section */
@media print {
    body * {
        visibility: hidden;
    }

    #printable-area,
    #printable-area * {
        visibility: visible;
    }

    #printable-area {
        position: absolute;
        left: 0;
        top: 0;
        width: 148mm;
        height: 210mm;
        padding: 10mm;
    }

    .hidden-print {
        display: none !important;
    }

    @page {
        size: A5;
        margin: 10mm;
    }
}
</style>
