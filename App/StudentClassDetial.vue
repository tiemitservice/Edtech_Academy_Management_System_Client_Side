<template>
    <div class="h-[80vh] max-h-[80vh] overflow-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50 sticky top-0 z-10">
            <label class="text-base font-semibold text-gray-800">{{ $t('class.class_details') }}</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded :aria-label="$t('actions.close')" />
        </div>

        <!-- Loading Spinner -->
        <div v-if="loading" class="h-[70vh] flex items-center justify-center">
            <ProgressSpinner strokeWidth="4" />
        </div>

        <!-- Content Area (shown after loading) -->
        <div v-else>
            <div class="p-4" v-if="hasStudents">
                <!-- Data Table -->
                <div>
                    <div class="flex items-center justify-between py-3 w-auto">
                        <div>
                            <label class="text-lg font-semibold text-primary">{{ $t('class.student_list') }}</label>
                        </div>
                        <div>
                            <Button @click="printStudentList" icon="pi pi-print" class="mr-2" :aria-label="$t('actions.print')" />
                            <Button @click="exportStudentListToExcel" icon="pi pi-file-excel" :aria-label="$t('actions.export_excel')" />
                        </div>
                    </div>
                    <DataTable scrollable scrollHeight="400px" :value="activeStudentsInClass" showGridlines stripedRows class="text-nowrap">
                        <Column frozen style="width: 25%" :header="$t('element.num')">
                            <template #body="slotProps">
                                {{ slotProps.index + 1 }}
                            </template>
                        </Column>
                        <Column frozen style="width: 25%" :header="$t('student.kh_name')">
                            <template #body="slotProps">
                                {{ slotProps.data.student?.kh_name || 'N/A' }}
                            </template>
                        </Column>
                        <Column style="width: 25%" :header="$t('student.eng_name')">
                            <template #body="slotProps">
                                {{ slotProps.data.student?.eng_name || 'N/A' }}
                            </template>
                        </Column>
                        <Column style="width: 25%" :header="$t('student.gender')">
                            <template #body="slotProps">
                                {{ slotProps.data.student?.gender || 'N/A' }}
                            </template>
                        </Column>
                        <Column style="width: 25%" :header="$t('student.date_of_birth')">
                            <template #body="slotProps">
                                {{ formatDate2(slotProps.data.student?.date_of_birth) }}
                            </template>
                        </Column>
                        <Column style="width: 25%" :header="$t('student.phone_number')">
                            <template #body="slotProps">
                                {{ slotProps.data.student?.phoneNumber || 'N/A' }}
                            </template>
                        </Column>
                        <Column style="width: 25%" :header="$t('student.attendance_score')">
                            <template #body="slotProps">
                                {{ slotProps.data.attendance_score }}
                            </template>
                        </Column>
                        <Column style="width: 25%" :header="$t('student.assigment_score')">
                            <template #body="slotProps">
                                {{ slotProps.data.assignment_score }}
                            </template>
                        </Column>
                        <Column style="width: 25%" :header="$t('student.home_work')">
                            <template #body="slotProps">
                                {{ slotProps.data.home_work }}
                            </template>
                        </Column>
                        <Column style="width: 25%" :header="$t('student.prentation')">
                            <template #body="slotProps">
                                {{ slotProps.data.presentation }}
                            </template>
                        </Column>
                        <Column style="width: 25%" :header="$t('student.work_book')">
                            <template #body="slotProps">
                                {{ slotProps.data.work_book }}
                            </template>
                        </Column>
                        <Column style="width: 25%" :header="$t('student.practice')">
                            <template #body="slotProps">
                                {{ slotProps.data.class_practice }}
                            </template>
                        </Column>
                        <Column style="width: 25%" :header="$t('student.revision')">
                            <template #body="slotProps">
                                {{ slotProps.data.revision_test }}
                            </template>
                        </Column>
                        <Column style="width: 25%" :header="$t('student.final_exam')">
                            <template #body="slotProps">
                                {{ slotProps.data.final_exam }}
                            </template>
                        </Column>
                        <Column style="width: 25%" :header="$t('student.total_score')">
                            <template #body="slotProps">
                                {{ slotProps.data.total_score }}
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </div>
            <div v-else class="h-[70vh] flex items-center justify-center">
                <div class="text-center text-gray-500">
                    <i class="pi pi-users text-4xl mb-2"></i>
                    <p>{{ $t('class.no_active_students') }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { formatDate2 } from '@/composible/formatDate';
import * as XLSX from 'xlsx';
import NotFound from '@/views/pages/NotFound.vue';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ProgressSpinner from 'primevue/progressspinner'; // 1. Import the spinner
import { useFetch } from '@/composible/useFetch';

// Define props passed from the parent component
const props = defineProps({
    datatoedit: {
        type: Object,
        default: () => ({ students: [] })
    }
});

// 2. Destructure the 'loading' state from the useFetch composable
const { data: allActiveStudents, loading, fetchData: fetchStudents } = useFetch('students');

// This computed property will now hold only the active students who are in the current class
const activeStudentsInClass = computed(() => {
    // Ensure both the class data and the list of all active students are available
    if (!props.datatoedit?.students || !Array.isArray(allActiveStudents.value)) {
        return [];
    }

    // Create a set of active student IDs from the fetched list for efficient lookup
    const activeStudentIds = new Set(allActiveStudents.value.map((s) => s._id));

    // Filter the students from the current class (`datatoedit`)
    // to include only those whose ID is in the activeStudentIds set.
    return props.datatoedit.students.filter((classStudent) => {
        const studentId = classStudent.student?._id || classStudent.student;
        return activeStudentIds.has(studentId);
    });
});

const hasStudents = computed(() => {
    return activeStudentsInClass.value && activeStudentsInClass.value.length > 0;
});

// --- Print and Export Logic using the filtered list ---
const printStudentList = () => {
    if (!hasStudents.value) return;

    const tableHTML = `
        <html>
            <head>
                <title>Student List - ${props.datatoedit.name}</title>
                <style>
                    @media print {
                        @page { size: A4 landscape; margin: 20mm; }
                        body { font-family: 'Arial', sans-serif; font-size: 10px; }
                        h1, h2 { text-align: center; margin-bottom: 20px; font-family: 'Khmer OS', 'Arial', sans-serif; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #000; padding: 6px; text-align: left; }
                        th { background-color: #f0f0f0; }
                    }
                </style>
            </head>
            <body>
                <h1>អ៊ែដធិច អាខាឌឺមី</h1>
                <h2>បញ្ជីឈ្មោះសិស្សក្នុងថ្នាក់ ${props.datatoedit.name}</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Khmer Name</th>
                            <th>English Name</th>
                            <th>Gender</th>
                            <th>Date of Birth</th>
                            <th>Phone Number</th>
                            <th>Attendance</th>
                            <th>Assignment</th>
                            <th>Home Work</th>
                            <th>Presentation</th>
                            <th>Work Book</th>
                            <th>Practice</th>
                            <th>Revision</th>
                            <th>Final Exam</th>
                            <th>Total Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${activeStudentsInClass.value
                            .map(
                                (s) => `
                        <tr>
                            <td>${s.student?.kh_name || ''}</td>
                            <td>${s.student?.eng_name || ''}</td>
                            <td>${s.student?.gender || ''}</td>
                            <td>${formatDate2(s.student?.date_of_birth) || ''}</td>
                            <td>${s.student?.phoneNumber || ''}</td>
                            <td>${s.attendance_score ?? 0}</td>
                            <td>${s.assignment_score ?? 0}</td>
                            <td>${s.home_work ?? 0}</td>
                            <td>${s.presentation ?? 0}</td>
                            <td>${s.work_book ?? 0}</td>
                            <td>${s.class_practice ?? 0}</td>
                            <td>${s.revision_test ?? 0}</td>
                            <td>${s.final_exam ?? 0}</td>
                            <td>${s.total_score ?? 0}</td>
                        </tr>
                    `
                            )
                            .join('')}
                    </tbody>
                </table>
            </body>
        </html>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.open();
    printWindow.document.write(tableHTML);
    printWindow.document.close();
    printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };
};

const exportStudentListToExcel = () => {
    if (!hasStudents.value) return;

    const worksheetData = [
        ['Khmer Name', 'English Name', 'Gender', 'Date of Birth', 'Phone Number', 'Attendance Score', 'Class Practice', 'Home Work', 'Assignment Score', 'Presentation', 'Work Book', 'Revision Test', 'Final Exam', 'Total Score'],
        ...activeStudentsInClass.value.map((s) => [
            s.student?.kh_name || '',
            s.student?.eng_name || '',
            s.student?.gender || '',
            formatDate2(s.student?.date_of_birth),
            s.student?.phoneNumber || '',
            s.attendance_score ?? 0,
            s.class_practice ?? 0,
            s.home_work ?? 0,
            s.assignment_score ?? 0,
            s.presentation ?? 0,
            s.work_book ?? 0,
            s.revision_test ?? 0,
            s.final_exam ?? 0,
            s.total_score ?? 0
            // s.comments || ''
        ])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Student List');

    const columnWidths = worksheetData[0].map(() => ({ wch: 18 }));
    worksheet['!cols'] = columnWidths;

    XLSX.writeFile(workbook, `Student_List_${props.datatoedit.name}.xlsx`);
};

onMounted(async () => {
    // Fetch only active students when the component mounts
    await fetchStudents({ status: true });
});
</script>

<style scoped>
/* Scoped styles can be added here if needed */
</style>
