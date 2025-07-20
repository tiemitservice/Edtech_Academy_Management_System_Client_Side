<template>
    <!-- Main container with a background color for screen view -->
    <div class="flex flex-col min-h-screen items-center bg-gray-100 dark:bg-gray-900">
        <!-- This container holds the buttons and will be hidden during printing -->
        <div class="flex w-[820px] items-center justify-between mx-auto py-4 hidden-print">
            <div class="flex justify-end gap-2 mb-4 hidden-print">
                <Button icon="pi pi-arrow-left" @click="router.back()" :label="$t('element.back')" outlined />
                <Button icon="pi pi-print" @click="handlePrint" :label="$t('element.print_invoice')" />
            </div>
        </div>

        <!-- This is the A5 printable area -->
        <div v-if="invoice" class="w-[820px] mx-auto p-6 border text-sm leading-relaxed font-khmer bg-white print-page">
            <!-- Header -->
            <div class="flex items-center justify-center border-4 border-white">
                <img class="w-40 h-40" :src="companies[0]?.invoice_logo" alt="Company Logo" onerror="this.style.display='none'" />
            </div>
            <div class="flex justify-between items-center border-b pb-2 mb-4">
                <h1 class="text-lg font-bold">បង្កាន់ដៃបង់ប្រាក់ (RECEIPT)</h1>
                <div class="flex items-center text-lg">
                    <span class="mr-2">បង្កាន់ដៃលេខៈ</span>
                    <span class="px-4 font-semibold"> 00{{ invoice?.invoice_id }}</span>
                </div>
            </div>

            <!-- User Info -->
            <div class="space-y-2 mb-6">
                <div class="flex items-center text-lg">
                    <span class="font-semibold w-32">លោក/លោកស្រី:</span>
                    <p>{{ formatStudentName(invoice.student_id) }}</p>
                </div>
                <div class="flex items-center text-lg">
                    <span class="font-semibold w-32">អាយុ:</span>
                    <p>{{ calculateAge(studentDetails?.date_of_birth) }} ឆ្នាំ</p>
                </div>
                <div class="flex items-center text-lg">
                    <span class="font-semibold w-32">ភេទ:</span>
                    <p>{{ studentDetails?.gender }}</p>
                </div>
                <div class="flex items-center text-lg">
                    <span class="font-semibold w-32">កម្រិតសិក្សា:</span>
                    <p>{{ formatClassName(invoice.course_id) }}</p>
                </div>
                <div class="flex items-center text-lg">
                    <span class="font-semibold w-40 text-nowrap">ភ្ជាប់ជាមួយសៀវភៅ:</span>
                    <label class="mr-4"><input type="checkbox" class="mr-1" />ភ្ជាប់</label>
                    <label><input type="checkbox" class="mr-1" />មិនភ្ជាប់</label>
                </div>
                <div class="flex items-center text-lg text-nowrap">
                    <span class="font-semibold pr-5">Phone Number / Telegram:</span>
                    <p>{{ studentDetails?.phoneNumber || '.........................' }}</p>
                </div>
                <div class="flex items-center text-lg">
                    <span class="font-semibold w-32">ម៉ោងសិក្សា:</span>
                    <p>{{ classDetails?.day_class?.join(', ') || '.........................' }}</p>
                </div>
            </div>

            <!-- Footer Info -->
            <div class="flex items-center text-lg mb-4 space-x-4">
                <span class="font-semibold w-32">បានបង់ប្រាក់ចំនួន:</span>
                <span> {{ invoice.final_price }} $ </span>
                <span>{{ formatNumber(companies[0]?.currencey * invoice.final_price, 'km-KH') }} ៛</span>
            </div>

            <div class="flex items-center text-lg mb-6">
                <div>
                    <label class="font-semibold underline">កាលបរិច្ឆេទ៖ ​</label>
                </div>
                <div class="flex items-center">
                    <span class="">ថ្ងៃទី</span>
                    <span class="mx-2">{{ formatDateParts(invoice.createdAt).day }}</span>
                    <span>ខែ</span>
                    <span class="mx-2">{{ formatDateParts(invoice.createdAt).month }}</span>
                    <span>ឆ្នាំ</span>
                    <span>{{ formatDateParts(invoice.createdAt).year }}</span>
                </div>
            </div>

            <div class="text-right text-lg">
                <span>អ្នកទទួលប្រាក់</span>
            </div>

            <!-- Notes -->
            <div class="mt-8 border-t pt-4 text-lg space-y-1">
                <div>
                    <label class="mr-2 font-semibold underline">ចំណាំ</label>
                </div>
                <div>- ទឹកប្រាក់ដែលបានបង់មិនអាចដកវីញបានទេ</div>
                <div>- ការបង់ប្រាក់រៀល 1$ = {{ formatNumber(companies[0]?.currencey, 'km-KH') }} រៀល</div>
                <div>- លេខទូរស័ព្ទ៖ 099 54 54 49 / 086 54 54 49</div>
            </div>
        </div>
        <div v-else-if="!loading" class="text-center p-8">
            <p>Invoice not found.</p>
        </div>
        <div v-else class="text-center p-8">
            <i class="pi pi-spin pi-spinner text-3xl"></i>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFetch } from '@/composible/useFetch';
import { formatDateParts, calculateAge } from '@/composible/formatDate';
import { formatNumber } from '@/composible/useFormat';

// --- Composables ---
const route = useRoute();
const router = useRouter();
const id = ref(route.params.id);

// --- Data Fetching ---
// **MODIFIED:** Now fetches a single invoice, not the whole list.
const { data: invoiceData, fetchData: fetchCourseInvoice, loading } = useFetch('studentinvoicegenerates');
const { data: classes, fetchData: fetchClasses } = useFetch('classes');
const { data: students, fetchData: fetchStudents } = useFetch('students');
const { data: companies, fetchData: fetchCompanies } = useFetch('companies');

// --- Component State ---
// This ref will hold the single invoice object.
const invoice = ref(null);

// --- Computed Properties for details ---
const studentDetails = computed(() => {
    if (!invoice.value || !Array.isArray(students.value)) return null;
    return students.value.find((s) => s._id === invoice.value.student_id);
});

const classDetails = computed(() => {
    if (!invoice.value || !Array.isArray(classes.value)) return null;
    return classes.value.find((c) => c._id === invoice.value.course_id);
});

// --- Methods ---
const handlePrint = async () => {
    await nextTick(); // ensure DOM is fully rendered
    window.print();
};

const formatClassName = (classId) => {
    if (!classId || !Array.isArray(classes.value)) return 'Unknown';
    return classes.value.find((c) => c._id === classId)?.name || 'Unknown';
};

const formatStudentName = (studentId) => {
    if (!studentId || !Array.isArray(students.value)) return 'Unknown';
    return students.value.find((s) => s._id === studentId)?.kh_name || 'Unknown';
};

// --- Lifecycle Hook ---
onMounted(async () => {
    // Fetch all necessary data concurrently.
    await Promise.all([
        fetchClasses(),
        fetchStudents(),
        fetchCompanies(),
        // **MODIFIED:** Fetch only the specific invoice by its ID.
        fetchCourseInvoice({ _id: id.value })
    ]);

    // After fetching, assign the single invoice object to our ref.
    // The API returns an array even for a single item, so we take the first element.
    if (Array.isArray(invoiceData.value) && invoiceData.value.length > 0) {
        invoice.value = invoiceData.value[0];
    }
});
</script>

<style>
/* Styles for the print layout */
@media print {
    /* Hide non-print elements */
    .hidden-print,
    .hidden-print * {
        display: none !important;
    }

    /* Force only the .print-page to show */
    body * {
        visibility: hidden;
    }

    .print-page,
    .print-page * {
        visibility: visible;
    }

    .print-page {
        position: absolute;
        top: 0;
        left: 0;
        width: 148mm;
        height: 210mm;
        padding: 10mm;
        margin: 0 auto;
        box-shadow: none;
        border: none;
        background-color: white !important;
        page-break-after: always;
    }

    @page {
        size: A5;
        margin: 10mm;
    }

    body {
        margin: 0;
        padding: 0;
        background: white;
    }
}
</style>
