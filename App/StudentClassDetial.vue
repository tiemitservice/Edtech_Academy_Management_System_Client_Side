<template>
    <div class="min-w-[1200px] w-full max-w-full h-[80vh] max-h-[80vh] overflow-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50 sticky top-0 z-10">
            <label class="text-base font-semibold text-gray-800">Class Details</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>

        <div class="p-4" v-if="hasStudents">
            <!-- Action Buttons -->
            <div class="flex items-center justify-between py-3">
                <div>
                    <label class="text-lg font-semibold text-primary">Student List</label>
                </div>
                <div v-if="hasStudents">
                    <Button @click="printStudentList" icon="pi pi-print" class="mr-2" aria-label="Print" />
                    <Button @click="exportStudentListToExcel" icon="pi pi-file-excel" aria-label="Export to Excel" />
                </div>
            </div>

            <!-- Data Table or Not Found Message -->
            <div>
                <DataTable :value="datatoedit?.students" showGridlines tableStyle="min-width: 50rem" class="text-nowrap">
                    <Column header="No" style="width: 3rem">
                        <template #body="slotProps">
                            {{ slotProps.index + 1 }}
                        </template>
                    </Column>
                    <Column header="Khmer Name">
                        <template #body="slotProps">
                            {{ slotProps.data.student?.kh_name || 'N/A' }}
                        </template>
                    </Column>
                    <Column header="English Name">
                        <template #body="slotProps">
                            {{ slotProps.data.student?.eng_name || 'N/A' }}
                        </template>
                    </Column>
                    <Column header="Gender">
                        <template #body="slotProps">
                            {{ slotProps.data.student?.gender || 'N/A' }}
                        </template>
                    </Column>
                    <Column header="Date of Birth">
                        <template #body="slotProps">
                            {{ formatDate2(slotProps.data.student?.date_of_birth) }}
                        </template>
                    </Column>
                    <Column header="Phone Number">
                        <template #body="slotProps">
                            {{ slotProps.data.student?.phoneNumber || 'N/A' }}
                        </template>
                    </Column>
                    <Column header="Attendance Score">
                        <template #body="slotProps">
                            {{ slotProps.data.attendance_score }}
                        </template>
                    </Column>
                    <Column header="Assignment Score">
                        <template #body="slotProps">
                            {{ slotProps.data.assignment_score }}
                        </template>
                    </Column>
                    <Column header="Home Work">
                        <template #body="slotProps">
                            {{ slotProps.data.home_work }}
                        </template>
                    </Column>
                    <Column header="Presentation">
                        <template #body="slotProps">
                            {{ slotProps.data.presentation }}
                        </template>
                    </Column>
                    <Column header="Work Book">
                        <template #body="slotProps">
                            {{ slotProps.data.work_book }}
                        </template>
                    </Column>
                    <Column header="Practice">
                        <template #body="slotProps">
                            {{ slotProps.data.class_practice }}
                        </template>
                    </Column>
                    <Column header="Revision">
                        <template #body="slotProps">
                            {{ slotProps.data.revision_test }}
                        </template>
                    </Column>
                    <Column header="Final Exam">
                        <template #body="slotProps">
                            {{ slotProps.data.final_exam }}
                        </template>
                    </Column>
                    <Column header="Total Score">
                        <template #body="slotProps">
                            {{ slotProps.data.total_score }}
                        </template>
                    </Column>
                </DataTable>
                <!-- This v-else now correctly shows when there are no students -->
            </div>
        </div>
        <div v-else style="width: 1200px; height: 80vh" class="h-[80vh] flex items-center justify-center">
            <p>No students found</p>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { formatDate2 } from '@/composible/formatDate';
import * as XLSX from 'xlsx';
import NotFound from '@/views/pages/NotFound.vue';

// Define props passed from the parent component
const props = defineProps({
    datatoedit: {
        type: Object,
        default: () => ({ students: [] })
    }
});

// Computed property to safely check if there are students to display
const hasStudents = computed(() => {
    return props.datatoedit && Array.isArray(props.datatoedit.students) && props.datatoedit.students.length > 0;
});

// --- Print and Export Logic ---

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
                        ${props.datatoedit.students
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
        ['Khmer Name', 'English Name', 'Gender', 'Date of Birth', 'Phone Number', 'Attendance Score', 'Class Practice', 'Home Work', 'Assignment Score', 'Presentation', 'Work Book', 'Revision Test', 'Final Exam', 'Total Score', 'Comments'],
        ...props.datatoedit.students.map((s) => [
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
            s.total_score ?? 0,
            s.comments || ''
        ])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Student List');

    const columnWidths = worksheetData[0].map(() => ({ wch: 18 }));
    worksheet['!cols'] = columnWidths;

    XLSX.writeFile(workbook, `Student_List_${props.datatoedit.name}.xlsx`);
};
</script>

<style scoped>
/* Scoped styles can be added here if needed */
</style>
