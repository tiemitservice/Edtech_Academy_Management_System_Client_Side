<template>
    <div class="bg-gray-100 font-sans">
        <div class="container mx-auto py-8 px-4">
            <!-- Action Buttons (Hidden on Print) -->
            <div class="flex justify-end gap-2 mb-4 hidden-print">
                <Button icon="pi pi-arrow-left" @click="router.back()" label="Back" outlined />
                <Button icon="pi pi-print" @click="handlePrint" label="Print Invoice" />
            </div>

            <!-- A5 Printable Area -->
            <div class="a5-page bg-white p-8 rounded-lg shadow-lg border border-gray-200">
                <!-- Header -->
                <header class="flex justify-between items-center pb-6 border-b">
                    <div>
                        <img :src="companyInfo?.invoice_logo || 'https://placehold.co/150x80?text=Logo'" alt="Company Logo" class="w-32 h-auto" />
                        <h2 class="text-xl font-bold text-gray-800 mt-2">{{ companyInfo?.name || 'Your Company' }}</h2>
                        <p class="text-sm text-gray-500">{{ companyInfo?.address || '123 Street, City, Country' }}</p>
                    </div>
                    <div class="text-right">
                        <h1 class="text-3xl font-bold text-gray-800">INVOICE</h1>
                        <p class="text-sm text-gray-500 mt-1">Invoice #: {{ invoice?._id }}</p>
                        <p class="text-sm text-gray-500">Date: {{ formatDate(invoice?.createdAt) }}</p>
                    </div>
                </header>

                <!-- Billing Info -->
                <section class="flex justify-between mt-8">
                    <div class="text-sm">
                        <h3 class="font-semibold text-gray-800 mb-2">Bill To:</h3>
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
                                <th class="p-3">#</th>
                                <th class="p-3">Book Title</th>
                                <th class="p-3 text-right">Price</th>
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
                            <span class="font-semibold text-gray-600">Subtotal:</span>
                            <span>${{ invoice?.amount?.toFixed(2) }}</span>
                        </div>
                        <div class="flex justify-between py-2 border-b">
                            <span class="font-semibold text-gray-600">Discount ({{ invoice?.discount || 0 }}%):</span>
                            <span>-${{ (invoice?.amount - invoice?.final_price)?.toFixed(2) }}</span>
                        </div>
                        <div class="flex justify-between py-3 bg-gray-100 px-3 rounded mt-2">
                            <span class="font-bold text-lg text-gray-800">Grand Total:</span>
                            <span class="font-bold text-lg text-gray-800">${{ invoice?.final_price?.toFixed(2) }}</span>
                        </div>
                    </div>
                </section>

                <!-- Footer -->
                <footer class="mt-12 pt-6 border-t text-center text-xs text-gray-500">
                    <p>Thank you for your business!</p>
                    <p>{{ companyInfo?.name }} | {{ companyInfo?.phoneNumber }} | {{ companyInfo?.email }}</p>
                </footer>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFetch } from '@/composible/useFetch';
import { useToast } from 'primevue';
import moment from 'moment';

// --- Composables ---
const route = useRoute();
const router = useRouter();
const toast = useToast();

// --- Data Fetching ---
const { data: payments, fetchData: fetchPayments } = useFetch('bookpayments');
const { data: students, fetchData: fetchStudents } = useFetch('students');
const { data: books, fetchData: fetchBooks } = useFetch('books');
const { data: companies, fetchData: fetchCompanies } = useFetch('companies');

// --- Component State ---
const loading = ref(true);
const invoiceId = ref(route.params.id);

// --- Computed Properties ---
// Find the specific invoice from the fetched payments
const invoice = computed(() => {
    return Array.isArray(payments.value) ? payments.value.find((p) => p._id === invoiceId.value) : null;
});

// Get the details for the student on the invoice
const studentInfo = computed(() => {
    if (!invoice.value || !Array.isArray(students.value)) return null;
    return students.value.find((s) => s._id === invoice.value.student_id);
});

// Get the details for each book on the invoice
const bookDetails = computed(() => {
    if (!invoice.value || !Array.isArray(books.value)) return [];
    return invoice.value.book_id.map((bookId) => {
        return books.value.find((b) => b._id === bookId) || { name: 'Unknown Book', price: 0 };
    });
});

// Get company info (assuming one company)
const companyInfo = computed(() => {
    return Array.isArray(companies.value) && companies.value.length > 0 ? companies.value[0] : null;
});

// --- Methods ---
const formatDate = (date) => (date ? moment(date).format('MMMM D, YYYY') : 'N/A');

const handlePrint = () => {
    window.print();
};

// --- Lifecycle Hook ---
onMounted(async () => {
    loading.value = true;
    try {
        // Fetch all necessary data concurrently
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
@media print {
    body {
        background-color: #fff;
    }
    .hidden-print {
        display: none !important;
    }
    .a5-page {
        width: 148mm;
        height: 210mm;
        margin: 0;
        padding: 10mm;
        box-shadow: none;
        border: none;
    }
    @page {
        size: A5;
        margin: 0;
    }
}
</style>
