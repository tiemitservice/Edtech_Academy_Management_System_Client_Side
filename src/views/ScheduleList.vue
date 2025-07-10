<template>
    <section class="px-4 mx-auto">
        <!-- Header -->
        <div class="py-2 flex flex-col md:flex-row mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 items-center rounded-lg justify-between hidden-print">
            <label class="text-lg font-medium text-gray-800 dark:text-white">Class Schedule</label>
            <Button @click="printSchedule" label="Print Schedule" icon="pi pi-print" />
        </div>

        <!-- Schedule Grid (On-screen display) -->
        <div id="schedule-display" class="bg-white p-4 rounded-lg shadow-md">
            <!-- Day Headers -->
            <div class="grid grid-cols-7 gap-2 border-b-2 border-gray-200 pb-2 mb-4">
                <div v-for="day in daysOfWeek" :key="day" class="text-lg text-primary font-bold text-center">
                    {{ day }}
                </div>
            </div>

            <!-- Schedule Content -->
            <div class="grid grid-cols-7 gap-4 min-h-[70vh]">
                <div v-for="day in daysOfWeek" :key="day" class="flex flex-col gap-4 border-r last:border-r-0 pr-4">
                    <div v-if="classesByDay(day).length > 0">
                        <div v-for="schedule in classesByDay(day)" :key="schedule._id" class="border p-3 rounded-lg bg-primary/5 hover:shadow-lg transition-shadow duration-300 m-3">
                            <p class="font-bold text-primary text-sm">{{ schedule.name }}</p>
                            <p class="text-xs text-gray-600 font-semibold">{{ formatSectionTime(schedule.duration) }}</p>
                            <div class="mt-2 pt-2 border-t text-xs space-y-1">
                                <p><span class="font-semibold">Teacher:</span> {{ formatStaffName(schedule.staff) }}</p>
                                <p><span class="font-semibold">Subject:</span> {{ formatSubjectName(schedule.subject) }}</p>
                                <p><span class="font-semibold">Students:</span> {{ schedule.students.length }}</p>
                            </div>
                        </div>
                    </div>
                    <div v-else class="text-gray-400 text-center text-sm pt-4">No classes</div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useFetch } from '../composible/useFetch';
import moment from 'moment';

// --- Data Fetching ---
const { data: scheduleList, fetchData: fetchClasses } = useFetch('classes');
const { data: sections, fetchData: fetchSections } = useFetch('sections');
const { data: staff, fetchData: fetchStaff } = useFetch('staffs');
const { data: subjects, fetchData: fetchSubjects } = useFetch('subjects');

// --- Component State ---
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// --- Helper Functions for Display ---
const classesByDay = (day) => {
    if (!scheduleList.value) return [];
    return scheduleList.value
        .filter((schedule) => schedule?.day_class?.includes(day) && schedule?.mark_as_completed !== false)
        .sort((a, b) => {
            const sectionA = sections.value?.find((s) => s._id === a.duration);
            const sectionB = sections.value?.find((s) => s._id === b.duration);
            if (!sectionA || !sectionB || !sectionA.start_time || !sectionB.start_time) return 0;
            return moment(sectionA.start_time, 'HH:mm').diff(moment(sectionB.start_time, 'HH:mm'));
        });
};

const formatSectionTime = (sectionId) => {
    if (!sections.value) return 'N/A';
    const section = sections.value.find((s) => s._id === sectionId);

    return `${section?.duration} `;
};

const formatStaffName = (staffId) => {
    if (!staff.value) return 'N/A';
    return staff.value.find((s) => s._id === staffId)?.en_name || 'Unassigned';
};

const formatSubjectName = (subjectId) => {
    if (!subjects.value) return 'N/A';
    return subjects.value.find((s) => s._id === subjectId)?.name || 'N/A';
};

// --- Print Functionality ---
const printSchedule = () => {
    // 1. Generate the HTML for the table
    let tableHTML = `<table class="schedule-table"><thead><tr>`;
    daysOfWeek.forEach((day) => {
        tableHTML += `<th>${day}</th>`;
    });
    tableHTML += `</tr></thead><tbody>`;

    const maxClassesPerDay = Math.max(...daysOfWeek.map((day) => classesByDay(day).length));
    if (maxClassesPerDay === 0) {
        tableHTML += `<tr><td colspan="${daysOfWeek.length}" style="text-align:center;">No schedule data available.</td></tr>`;
    } else {
        for (let i = 0; i < maxClassesPerDay; i++) {
            tableHTML += `<tr>`;
            daysOfWeek.forEach((day) => {
                const dayClasses = classesByDay(day);
                const schedule = dayClasses[i];
                if (schedule) {
                    tableHTML += `<td>
                        <div class="class-name">${schedule.name}</div>
                        <div class="class-time">${formatSectionTime(schedule.duration)}</div>
                        <div class="class-details">
                            Teacher: ${formatStaffName(schedule.staff)}<br>
                            Subject: ${formatSubjectName(schedule.subject)}<br>
                            Students: ${schedule.students.length}
                        </div>
                    </td>`;
                } else {
                    tableHTML += `<td></td>`; // Empty cell if no class at this index
                }
            });
            tableHTML += `</tr>`;
        }
    }
    tableHTML += `</tbody></table>`;

    // 2. Create the full HTML document for printing
    const printWindow = window.open('', '_blank', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Weekly Schedule</title>');
    printWindow.document.write(`
        <style>
            body { font-family: Arial, sans-serif; }
            .schedule-table { width: 100%; border-collapse: collapse; }
            .schedule-table th, .schedule-table td { border: 1px solid #ccc; padding: 8px; text-align: left; vertical-align: top; }
            .schedule-table th { background-color: #f2f2f2; }
            .class-name { font-weight: bold; font-size: 1.1em; margin-bottom: 4px; }
            .class-time { font-style: italic; margin-bottom: 8px; }
            .class-details { font-size: 0.9em; color: #555; }
            @page { size: A4 landscape; margin: 20mm; }
        </style>
    `);
    printWindow.document.write('</head><body>');
    printWindow.document.write('<h1>Weekly Class Schedule</h1>');
    printWindow.document.write(tableHTML);
    printWindow.document.write('</body></html>');

    // 3. Trigger the print dialog
    printWindow.document.close(); // Necessary for some browsers
    printWindow.focus(); // Necessary for some browsers
    printWindow.print();
    printWindow.close();
};

// --- Lifecycle Hook ---
onMounted(async () => {
    // Fetch all necessary data concurrently when the component mounts
    await Promise.all([fetchClasses(), fetchSections(), fetchStaff(), fetchSubjects()]);
});
</script>

<style>
/* This style block is now only for potential on-screen adjustments if needed.
   Print styles are handled by the printSchedule function. */
</style>
