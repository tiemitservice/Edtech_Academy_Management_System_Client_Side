<template>
    <section class="mx-auto w-full p-4">
        <div class="py-2 flex flex-col md:flex-row mb-4 bg-white dark:bg-gray-800 p-4 rounded-lg justify-between items-center">
            <label class="text-lg font-medium text-gray-800 dark:text-white">Schedule List</label>
            <Button @click="printSchedule" label="Print Schedule" icon="pi pi-print" class="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80" />
        </div>

        <div class="flex items-center justify-between w-[90%]">
            <div id="schedule-print" class="overflow-auto w-[1440px] h-[80vh] bg-white p-4">
                <!-- Header -->
                <div class="grid grid-cols-7 gap-2 border-b pb-2 mb-2">
                    <div v-for="day in daysOfWeek" :key="day" class="text-lg text-primary font-semibold text-start px-2">
                        {{ day }}
                    </div>
                </div>
                <!-- Content -->
                <div class="grid grid-cols-7 gap-4">
                    <div v-for="day in daysOfWeek" :key="day" class="flex flex-col gap-2">
                        <div class="flex flex-col gap-2" v-if="classesByDay(day).length > 0">
                            <div v-for="schedule in classesByDay(day)" :key="schedule._id" class="border p-3 rounded-lg bg-gray-50">
                                <span class="link-underline link-underline-black text-black font-medium"> {{ schedule.name }} - {{ formatDuration(schedule.duration) }} </span>
                                <p class="text-gray-600 text-sm">Teacher: {{ formatName(schedule.staff) }}</p>
                                <p class="text-gray-600 text-sm">Total Students: {{ schedule.students.length }}</p>
                            </div>
                        </div>

                        <div v-else class="border p-3 rounded-lg bg-gray-50 text-gray-400 text-center text-sm">No schedule</div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useFetch } from '../composible/useFetch';

const collection = ref('classes');
const { data: scheduleList, loading, error, fetchData } = useFetch(collection.value);
const { data: sections, fetchData: fetchSections } = useFetch('sections');
const { data: staff, fetchData: fetchStaff } = useFetch('staffs');
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const classesByDay = (day) => {
    return scheduleList.value?.filter((schedule) => schedule?.day_class?.includes(day) && schedule?.mark_as_completed === true) || [];
};

const formatDuration = (id) => {
    const section = sections.value?.find((section) => section._id === id);
    return section ? section.duration : 'N/A';
};

const formatName = (id) => {
    const staffMember = staff.value?.find((staff) => staff._id === id);
    return staffMember ? staffMember.en_name : 'Unknown';
};

const printSchedule = () => {
    // Generate table HTML for printing
    let tableHTML = `
        <table class="table">
            <thead>
                <tr class="table-row table-header">
                    ${daysOfWeek.map((day) => `<th class="table-cell">${day}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
    `;

    // Determine the maximum number of classes for any day to align rows
    const maxClasses = Math.max(...daysOfWeek.map((day) => classesByDay(day).length));

    // Generate rows based on the maximum number of classes
    for (let i = 0; i < maxClasses; i++) {
        tableHTML += `<tr class="table-row">`;
        for (const day of daysOfWeek) {
            const schedules = classesByDay(day);
            if (schedules[i]) {
                const schedule = schedules[i];
                tableHTML += `
                    <td class="table-cell">
                        <div style="white-space: nowrap"><strong>${schedule.name} - ${formatDuration(schedule.duration)}</strong></div>
                        <div>Teacher: ${formatName(schedule.staff)}</div>
                        <div>Total Students: ${schedule.students.length}</div>
                    </td>
                `;
            } else {
                tableHTML += `<td class="table-cell">
                        <div class="text-red-500 text-center" style="white-space: nowrap">X</div>
                    </td>`;
            }
        }
        tableHTML += `</tr>`;
    }

    tableHTML += `</tbody></table>`;

    // Store original content and document title
    const originalContent = document.body.innerHTML;
    const originalTitle = document.title;

    // Set document title to suggest PDF filename
    document.title = 'schedule.pdf';

    // Set print content with table
    document.body.innerHTML = `
        <html>
            <head>
                <title>Schedule Print</title>
                <style>
                    body { font-family: Arial, sans-serif; color: #333; margin: 20px; padding: 20px; }
                    .table { width: 100%; border-collapse: collapse; }
                    .table-row { }
                    .table-cell { border: 1px solid #999; padding: 8px; vertical-align: top; }
                    .table-header { background-color: #f3f4f6; font-weight: bold; text-align: left; }
                    .table-cell div { margin-bottom: 4px; }
                    @media print {
                        body { margin: 0; }
                        .table { page-break-inside: auto; }
                    }
                </style>
            </head>
            <body>
               <div class="text-center mb-4">
                    <h1 class='text-primary'>អ៊ែដធិច អាខាឌឺមី</h1>
                  
                    <h2 class="text-lg font-semibold mb-4">Schedule for the Week</h2>
                </div>

                ${tableHTML}
            </body>
        </html>
    `;

    // Trigger print dialog
    window.print();

    // Restore original content and title
    document.body.innerHTML = originalContent;
    document.title = originalTitle;
    window.location.reload();
};

onMounted(async () => {
    await fetchData();
    await fetchSections();
    await fetchStaff();
});
</script>

<!-- <style>
@media print {
    button,
    .no-print {
        display: none !important;
    }
    #schedule-print {
        width: 100%;
        height: auto;
        white-space: nowrap;
    }
}
</style> -->
