<template>
    <div class="p-4 space-y-6">
        <!-- Header -->
        <div class="text-center md:text-left">
            <h1 class="text-3xl font-bold text-primary">{{ $t('dashboard.welcomeMessage') }}</h1>
            <p class="text-gray-500">{{ $t('dashboard.welcomeSubtitle') }}</p>
        </div>

        <!-- Stat Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <!-- Total Students Card -->
            <div class="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-500">{{ $t('dashboard.stats.totalStudents') }}</p>
                    <p class="text-3xl font-bold text-gray-800">{{ studentCount }}</p>
                </div>
                <div class="bg-blue-100 text-blue-600 p-3 rounded-full">
                    <i class="pi pi-users text-2xl"></i>
                </div>
            </div>

            <!-- Total Teachers Card -->
            <div class="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-500">{{ $t('dashboard.stats.totalTeachers') }}</p>
                    <p class="text-3xl font-bold text-gray-800">{{ staffCount }}</p>
                </div>
                <div class="bg-green-100 text-green-600 p-3 rounded-full">
                    <i class="pi pi-user text-2xl"></i>
                </div>
            </div>

            <!-- Total Classes Card -->
            <div class="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-500">{{ $t('dashboard.stats.totalClasses') }}</p>
                    <p class="text-3xl font-bold text-gray-800">{{ classCount }}</p>
                </div>
                <div class="bg-orange-100 text-orange-600 p-3 rounded-full">
                    <i class="pi pi-book text-2xl"></i>
                </div>
            </div>

            <!-- Total Subjects Card -->
            <div class="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-500">{{ $t('dashboard.stats.totalSubjects') }}</p>
                    <p class="text-3xl font-bold text-gray-800">{{ subjectCount }}</p>
                </div>
                <div class="bg-purple-100 text-purple-600 p-3 rounded-full">
                    <i class="pi pi-bookmark text-2xl"></i>
                </div>
            </div>

            <!-- Total Books Card -->
            <div class="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-500">{{ $t('dashboard.stats.totalBooks') }}</p>
                    <p class="text-3xl font-bold text-gray-800">{{ bookCount }}</p>
                </div>
                <div class="bg-cyan-100 text-cyan-600 p-3 rounded-full">
                    <i class="pi pi-book text-2xl"></i>
                </div>
            </div>

            <!-- Total Sold Books Card -->
            <div class="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-500">{{ $t('dashboard.stats.soldBooks') }}</p>
                    <p class="text-3xl font-bold text-gray-800">{{ soldBookCount }}</p>
                </div>
                <div class="bg-teal-100 text-teal-600 p-3 rounded-full">
                    <i class="pi pi-shopping-cart text-2xl"></i>
                </div>
            </div>

            <!-- Course Invoices Card -->
            <div class="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-500">{{ $t('dashboard.stats.courseInvoices') }}</p>
                    <p class="text-3xl font-bold text-gray-800">{{ courseInvoiceCount }}</p>
                </div>
                <div class="bg-pink-100 text-pink-600 p-3 rounded-full">
                    <i class="pi pi-file text-2xl"></i>
                </div>
            </div>
        </div>

        <!-- Chart and Quick Actions -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Students per Class Chart -->
            <div class="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('dashboard.chart.title') }}</h3>
                <Chart type="bar" :data="chartData" :options="chartOptions" />
            </div>

            <!-- Quick Actions -->
            <div class="bg-white p-6 rounded-lg shadow-md">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('dashboard.quickActions.title') }}</h3>
                <div class="space-y-3">
                    <router-link to="/studentlist" class="block w-full">
                        <Button :label="$t('dashboard.quickActions.addStudent')" icon="pi pi-user-plus" class="w-full justify-center" outlined />
                    </router-link>
                    <router-link to="/staff" class="block w-full">
                        <Button :label="$t('dashboard.quickActions.addTeacher')" icon="pi pi-user-plus" class="w-full justify-center" outlined />
                    </router-link>
                    <router-link to="/class" class="block w-full">
                        <Button :label="$t('dashboard.quickActions.createClass')" icon="pi pi-plus-circle" class="w-full justify-center" outlined />
                    </router-link>
                    <router-link to="/student_attendance" class="block w-full">
                        <Button :label="$t('dashboard.quickActions.takeAttendance')" icon="pi pi-calendar-check" class="w-full justify-center" outlined />
                    </router-link>
                </div>
            </div>
        </div>
        <div>
            <ScheduleList />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useFetch } from '@/composible/useFetch';
import Chart from 'primevue/chart';
import ScheduleList from './ScheduleList.vue';
import { useI18n } from 'vue-i18n';

// Initialize i18n
const { t } = useI18n();

// --- Data Fetching ---
const { data: students, fetchData: fetchStudents } = useFetch('students');
const { data: staffs, fetchData: fetchStaffs } = useFetch('staffs');
const { data: classes, fetchData: fetchClasses } = useFetch('classes');
const { data: subjects, fetchData: fetchSubjects } = useFetch('subjects');
const { data: books, fetchData: fetchBooks } = useFetch('books');
const { data: bookPaymentReports, fetchData: fetchBookPaymentReports } = useFetch('bookpaymentreports');
const { data: courseInvoices, fetchData: fetchCourseInvoices } = useFetch('studentpaymentreports');

// --- Computed Properties for Stats ---
const studentCount = computed(() => students.value?.length || 0);
const staffCount = computed(() => staffs.value?.length || 0);
const classCount = computed(() => classes.value?.length || 0);
const subjectCount = computed(() => subjects.value?.length || 0);
const bookCount = computed(() => books.value?.length || 0);
const soldBookCount = computed(() => bookPaymentReports.value?.length || 0);
const courseInvoiceCount = computed(() => courseInvoices.value?.length || 0);

// --- Chart Data and Options ---
const chartData = computed(() => {
    // First, filter for classes where mark_as_completed is true
    const completedClasses = classes.value?.filter((c) => c.mark_as_completed === true) || [];

    // Then, create the labels and data from the filtered array
    const classLabels = completedClasses.map((c) => c.name);
    const studentCounts = completedClasses.map((c) => c.students.length);

    return {
        labels: classLabels,
        datasets: [
            {
                label: t('dashboard.chart.title'),
                backgroundColor: '#42A5F5',
                borderColor: '#1E88E5',
                data: studentCounts
            }
        ]
    };
});

const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                stepSize: 1
            }
        }
    },
    plugins: {
        legend: {
            display: false
        }
    }
});

// --- Lifecycle Hook ---
onMounted(async () => {
    // Fetch all necessary data when the component mounts
    await Promise.all([fetchStudents(), fetchStaffs(), fetchClasses(), fetchSubjects(), fetchBooks(), fetchBookPaymentReports(), fetchCourseInvoices()]);
});
</script>

<style scoped>
/* Additional custom styles can go here if needed */
</style>
