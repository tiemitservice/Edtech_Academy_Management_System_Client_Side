<template>
    <div class="w-[1040px] max-w-full h-[80vh] max-h-[80vh] overflow-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">Class Details</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>
        <!-- <pre>
            {{ datatoedit?.students }}
        </pre> -->
        <div class="p-4">
            <div class="flex items-center justify-between py-3">
                <div>
                    <h4>
                        <span class="text-lg font-semibold text-primary">Student List</span>
                    </h4>
                </div>
                <div>
                    <!-- print -->
                    <Button @click="printStudentList" icon="pi pi-print" class="mr-2" />
                    <!-- excel export -->
                    <Button @click="exportStudentListToExcel" class="mr-2" icon="pi pi-file-excel" />
                </div>
            </div>
            <div>
                <DataTable :value="datatoedit?.students" showGridlines tableStyle="min-width: 50rem" class="text-nowrap">
                    <Column header="No">
                        <template #body="slotProps">
                            <div class="inline px-3 py-1 text-nowrap">
                                {{ slotProps.index + 1 }}
                            </div>
                        </template>
                    </Column>
                    <Column header="Khmer Name">
                        <template #body="slotProps">
                            <div class="inline px-3 py-1 text-nowrap">
                                {{ formatStudentNestedField(slotProps.data.student._id, 'kh_name') }}
                            </div>
                        </template>
                    </Column>
                    <Column header="English Name">
                        <template #body="slotProps">
                            <div class="inline px-3 py-1 text-nowrap">
                                {{ formatStudentNestedField(slotProps.data.student._id, 'eng_name') }}
                            </div>
                        </template>
                    </Column>
                    <Column header="Gender">
                        <template #body="slotProps">
                            <div class="inline px-3 py-1 text-nowrap">
                                {{ formatStudentNestedField(slotProps.data.student._id, 'gender') }}
                            </div>
                        </template>
                    </Column>
                    <Column header="Date of Birth">
                        <template #body="slotProps">
                            <div class="inline px-3 py-1 text-nowrap">
                                {{ formatDate2(formatStudentNestedField(slotProps.data.student._id, 'date_of_birth')) }}
                            </div>
                        </template>
                    </Column>
                    <Column header="Phone Number">
                        <template #body="slotProps">
                            <div class="inline px-3 py-1 text-nowrap">
                                {{ formatStudentNestedField(slotProps.data.student._id, 'phoneNumber') }}
                            </div>
                        </template>
                    </Column>

                    <Column header="Attendance Score">
                        <template #body="slotProps">
                            <div class="inline px-3 py-1 text-nowrap">
                                {{ slotProps.data.attendance_score }}
                            </div>
                        </template>
                    </Column>
                    <Column header="Assignment Score">
                        <template #body="slotProps">
                            <div class="inline px-3 py-1 text-nowrap">
                                {{ slotProps.data.assignment_score }}
                            </div>
                        </template>
                    </Column>
                    <Column header="Home Work">
                        <template #body="slotProps">
                            <div class="inline px-3 py-1 text-nowrap">
                                {{ slotProps.data.home_work }}
                            </div>
                        </template>
                    </Column>
                    <Column header="Presentation ">
                        <template #body="slotProps">
                            <div class="inline px-3 py-1 text-nowrap">
                                {{ slotProps.data.presentation }}
                            </div>
                        </template>
                    </Column>
                    <Column header="Work Book ">
                        <template #body="slotProps">
                            <div class="inline px-3 py-1 text-nowrap">
                                {{ slotProps.data.work_book }}
                            </div>
                        </template>
                    </Column>
                    <Column header="Practice ">
                        <template #body="slotProps">
                            <div class="inline px-3 py-1 text-nowrap">
                                {{ slotProps.data.class_practice }}
                            </div>
                        </template>
                    </Column>
                    <Column header="Revision ">
                        <template #body="slotProps">
                            <div class="inline px-3 py-1 text-nowrap">
                                {{ slotProps.data.revision_test }}
                            </div>
                        </template>
                    </Column>
                    <Column header="Final Exam ">
                        <template #body="slotProps">
                            <div class="inline px-3 py-1 text-nowrap">
                                {{ slotProps.data.final_exam }}
                            </div>
                        </template>
                    </Column>
                    <Column header="Total Score ">
                        <template #body="slotProps">
                            <div class="inline px-3 py-1 text-nowrap">
                                {{ slotProps.data.total_score }}
                            </div>
                        </template>
                    </Column>
                    <!-- <Column header="Email"></Column> -->
                </DataTable>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useFetch } from '@/composible/useFetch';
import { formatDate2 } from '@/composible/formatDate';
import * as XLSX from 'xlsx';

export default {
    props: ['datatoedit'],
    setup(props, { emit }) {
        const { data: students, fetchData: fetchStudents } = useFetch('students');
        const { data: staffs, fetchData: fetchStaff } = useFetch('staffs');

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

        const formatStudentName = (id) => {
            const student = students.value?.find((student) => student._id === id);
            return student ? student.en_name : 'Unknown';
        };
        onMounted(async () => {
            await Promise.allSettled([fetchStaff(), fetchStudents()]);
            if (props.datatoedit) {
                console.log('Editing class:', props.datatoedit);
            }
        });

        const printStudentList = () => {
            const tableHTML = `
  <html>
    <head>
      <title>Student List</title>
      <style>
        @media print {
          @page {
            size: A4 portrait;
            margin: 20mm;
            padding: 8px;
          }
          body {
            font-family: 'Arial', sans-serif;
            font-size: 12px;
            margin: 0;
            padding: 0;
            color: #000;
          }
          h2 {
            text-align: center;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #000;
            padding: 8px 6px;
            text-align: left;
            vertical-align: top;
            white-space: nowrap;
          }
          th {
            background-color: #f0f0f0;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
        }
      </style>
    </head>
    <body>
      <h1 style="
        text-align: center;
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 10px;
        color: rgb(10, 0, 142);
        font-family: 'Khmer OS', 'Arial', sans-serif;">
        អ៊ែដធិច អាខាឌឺមី
      </h1>
      <h2>បញ្ជីឈ្មោះសិស្ស</h2>
      <table>
        <thead>
          <tr>
            <th>Khmer Name</th>
            <th>English Name</th>
            <th>Gender</th>
            <th>Date of Birth</th>
            <th>Phone Number</th>
            <th>Attendance Score</th>
            <th>Assignment Score</th>
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
      .map((student) => {
          const st = students.value?.find((s) => s._id === student.student._id);
          return `
        <tr>
          <td>${formatStudentNestedField(st?._id, 'kh_name') || st?.kh_name || ''}</td>
          <td>${formatStudentNestedField(st?._id, 'eng_name') || st?.eng_name || ''}</td>
          <td>${formatStudentNestedField(st?._id, 'gender') || st?.gender || ''}</td>
          <td>${formatDate2(formatStudentNestedField(st?._id, 'date_of_birth')) || ''}</td>
          <td>${formatStudentNestedField(st?._id, 'phoneNumber') || st?.phoneNumber || ''}</td>
          <td>${student.attendance_score}</td>
          <td>${student.assignment_score}</td>
          <td>${student.home_work}</td>
          <td>${student.presentation}</td>
          <td>${student.work_book}</td>
          <td>${student.class_practice}</td>
          <td>${student.revision_test}</td>
          <td>${student.final_exam}</td>
          <td>${student.total_score}</td>
        </tr>
      `;
      })
      .join('')}
</tbody>
      </table>
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
            const studentData = props.datatoedit.students;

            const worksheetData = [
                ['Khmer Name', 'English Name', 'Gender', 'Date of Birth', 'Phone Number', 'Attendance Score', 'Class Practice', 'Home Work', 'Assignment Score', 'Presentation', 'Work Book', 'Revision Test', 'Final Exam', 'Total Score', 'Comments'],
                ...studentData.map((s) => {
                    const st = students.value?.find((std) => std._id === s.student || std._id === s.student?._id);
                    return [
                        st?.kh_name || '',
                        st?.eng_name || '',
                        st?.gender || '',
                        formatDate2(st?.date_of_birth),
                        st?.phoneNumber || '',
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
                    ];
                })
            ];

            const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Student List');

            // Auto-width columns
            const columnWidths = worksheetData[0].map(() => ({ wch: 18 }));
            worksheet['!cols'] = columnWidths;

            XLSX.writeFile(workbook, 'Student_List.xlsx');
        };

        return { formatStudentNestedField, formatStudentName, formatDate2, printStudentList, exportStudentListToExcel };
    }
};
</script>

<style scoped>
@media print {
    @page {
        size: A4 landscape; /* Change from portrait to landscape */
        margin: 20mm;
        padding: 8px;
    }
    body {
        font-family: 'Arial', sans-serif;
        font-size: 12px;
        margin: 0;
        padding: 0;
        color: #000;
    }
    h2 {
        text-align: center;
        margin-bottom: 20px;
    }
    table {
        width: 100%;
        border-collapse: collapse;
    }
    th,
    td {
        border: 1px solid #000;
        padding: 8px 6px;
        text-align: left;
        vertical-align: top;
        white-space: nowrap;
    }
    th {
        background-color: #f0f0f0;
    }
    tr:nth-child(even) {
        background-color: #f9f9f9;
    }
}
</style>
