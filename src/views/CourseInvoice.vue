<template>
    <!-- Main container with a background color for screen view -->
    <div class="flex flex-col min-h-screen items-center bg-gray-100 dark:bg-gray-900">
        <!-- This container holds the buttons and will be hidden during printing -->
        <div class="flex w-[820px] items-center justify-between mx-auto py-4 hidden-print">
            <div>
                <Button icon="pi pi-arrow-left" @click="router.go(-1)"></Button>
            </div>
            <div>
                <Button icon="pi pi-print" @click="handlePrint"></Button>
            </div>
        </div>

        <!-- This is the A5 printable area -->
        <div class="w-[820px] mx-auto p-6 border text-sm leading-relaxed font-khmer bg-white print-page">
            <!-- Header -->
            <div class="flex items-center justify-center border-4 border-white">
                <img class="w-40 h-40" :src="companies[0]?.invoice_logo" alt="Company Logo" onerror="this.style.display='none'" />
            </div>
            <div class="flex justify-between items-center border-b pb-2 mb-4">
                <h1 class="text-lg font-bold">បង្កាន់ដៃបង់ប្រាក់ (RECEIPT)</h1>
                <div class="flex items-center text-lg">
                    <span class="mr-2">បង្កាន់ដៃលេខៈ</span>
                    <span class="px-4 font-semibold">{{ id }}</span>
                </div>
            </div>

            <!-- User Info -->
            <div class="space-y-2 mb-6">
                <div class="flex items-center text-lg">
                    <span class="font-semibold w-32">លោក/លោកស្រី:</span>
                    <p>{{ formatStudentNestedField(invoice?.student_id, 'kh_name') }}</p>
                </div>
                <div class="flex items-center text-lg">
                    <span class="font-semibold w-32">អាយុ:</span>
                    <p>{{ calculateAge(formatStudentNestedField(invoice?.student_id, 'date_of_birth')) }} ឆ្នាំ</p>
                </div>
                <div class="flex items-center text-lg">
                    <span class="font-semibold w-32">ភេទ:</span>
                    <p>{{ formatStudentNestedField(invoice?.student_id, 'gender') }}</p>
                </div>
                <div class="flex items-center text-lg">
                    <span class="font-semibold w-32">កម្រិតសិក្សា:</span>
                    <p>{{ formatClassName(invoice?.course_id, 'name') }}</p>
                </div>

                <div class="flex items-center text-lg">
                    <span class="font-semibold w-40 text-nowrap">ភ្ជាប់ជាមួយសៀវភៅ:</span>
                    <label class="mr-4"><input type="checkbox" class="mr-1" />ភ្ជាប់</label>
                    <label><input type="checkbox" class="mr-1" />មិនភ្ជាប់</label>
                </div>

                <div class="flex items-center text-lg text-nowrap">
                    <span class="font-semibold pr-5">Phone Number / Telegram:</span>
                    <p>{{ formatStudentNestedField(invoice?.student_id, 'phoneNumber') || '.........................' }}</p>
                </div>

                <div class="flex items-center text-lg">
                    <span class="font-semibold w-32">ម៉ោងសិក្សា:</span>
                    <p>{{ formatClassName(invoice?.course_id, 'day_class') || '.........................' }}</p>
                </div>
            </div>

            <!-- Footer Info -->
            <div class="flex items-center text-lg mb-4 space-x-4">
                <span class="font-semibold w-32">បានបង់ប្រាក់ចំនួន:</span>
                <span> {{ invoice?.final_price }} $ </span>
                <span>{{ formatNumber(companies[0]?.currencey * invoice?.final_price, 'km-KH') }} ៛</span>
            </div>

            <div class="flex items-center text-lg mb-6">
                <div>
                    <label class="font-semibold underline">កាលបរិច្ឆេទ៖ ​</label>
                </div>
                <div class="flex items-center">
                    <span class="">ថ្ងៃទី</span>
                    <span class="mx-2">{{ formatDateParts(invoice?.createdAt).day }}</span>

                    <span>ខែ</span>
                    <span class="mx-2">{{ formatDateParts(invoice?.createdAt).month }}</span>

                    <span>ឆ្នាំ</span>
                    <span>{{ formatDateParts(invoice?.createdAt).year }}</span>
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
    </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFetch } from '@/composible/useFetch';
import { formatDateParts, calculateAge } from '@/composible/formatDate';
import { formatNumber } from '@/composible/useFormat';

export default {
    setup() {
        const route = useRoute();
        const router = useRouter();
        const id = ref(route.params.id);
        const { data: classes, fetchData: fetchClasses } = useFetch('classes');
        const { data: students, fetchData: fetchStudents } = useFetch('students');
        const { data: courseinvoices, fetchData: fetchCourseInvoices } = useFetch('courseinvoices');
        const { data: companies, fetchData: fetchCompanies } = useFetch('companies');

        const handlePrint = () => {
            window.print();
        };

        const invoice = computed(() => courseinvoices.value?.find((invoice) => invoice._id === id.value));

        const formatClassName = (id, fieldPath, fallback = 'Unknown') => {
            const className = classes.value?.find((cl) => cl._id?.toString() === id?.toString());
            if (!className) return fallback;
            try {
                const result = fieldPath.split('.').reduce((obj, key) => obj?.[key], className);
                return Array.isArray(result) ? result.join(', ') : (result ?? fallback);
            } catch (err) {
                return fallback;
            }
        };

        const formatStudentNestedField = (id, fieldPath, fallback = 'Unknown') => {
            const student = students.value?.find((s) => s._id?.toString() === id?.toString());
            if (!student) return fallback;
            try {
                const result = fieldPath.split('.').reduce((obj, key) => obj?.[key], student);
                return Array.isArray(result) ? result.join(', ') : (result ?? fallback);
            } catch (err) {
                return fallback;
            }
        };

        onMounted(async () => {
            await fetchClasses();
            await fetchStudents();
            await fetchCourseInvoices();
            await fetchCompanies();
        });

        return { id, formatClassName, formatStudentNestedField, invoice, formatDateParts, calculateAge, companies, formatNumber, handlePrint, router };
    }
};
</script>

<style>
/* Styles for the print layout */
@media print {
    /* Hide elements that should not be printed */
    .hidden-print {
        display: none !important;
    }

    /* Reset body styles for printing */
    body {
        background-color: #fff;
        margin: 0;
        padding: 0;
    }

    /* Define the A5 page size and layout */
    .print-page {
        width: 148mm;
        height: 210mm;
        margin: 0 auto; /* Center the page */
        padding: 10mm; /* Add some padding */
        border: none;
        box-shadow: none;
        overflow: hidden; /* Hide any overflowing content */
        page-break-after: always; /* Ensure each .print-page is on a new sheet */
    }

    /* Ensure the main app container doesn't interfere */
    #app,
    .flex.flex-col.min-h-screen {
        padding: 0;
        margin: 0;
        background-color: transparent;
    }
}
</style>
