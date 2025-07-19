<template>
    <section class="px-4 mx-auto">
        <!-- Header -->
        <div class="py-2 flex flex-col md:flex-row mt-6 mb-4 gap-4 bg-white dark:bg-gray-800 p-4 items-center rounded-lg justify-between hidden-print">
            <label class="text-lg font-medium text-gray-800 dark:text-white">{{ $t('schedule.title') }}</label>
            <Button @click="printSchedule" :label="$t('schedule.printButton')" icon="pi pi-print" />
        </div>

        <!-- Schedule Grid (On-screen display) -->
        <div id="schedule-display" class="bg-white p-4 rounded-lg shadow-md">
            <!-- Print Header -->
            <div class="text-center mb-6 hidden print:block">
                <h1 class="text-2xl font-bold text-primary">{{ $t('schoolName') }}</h1>
                <h2 class="text-lg font-semibold text-gray-700">{{ $t('schedule.weeklySchedule') }}</h2>
            </div>

            <!-- Day Headers with Dates -->
            <div class="grid grid-cols-7 gap-2 border-b-2 border-gray-200 pb-2 mb-4">
                <div v-for="day in daysOfWeek" :key="day.name" class="text-lg text-primary font-bold text-center">
                    <p>{{ $t(`day_of_week.${day.name.toLowerCase()}`) }}</p>
                    <p class="text-sm text-gray-500 font-normal">{{ day.date }}</p>
                </div>
            </div>

            <!-- Schedule Content -->
            <div class="grid grid-cols-7 gap-4 min-h-[70vh]">
                <div v-for="day in daysOfWeek" :key="day.name" class="flex flex-col gap-4 border-r last:border-r-0 pr-4">
                    <div v-if="classesByDay(day.name).length > 0">
                        <div v-for="schedule in classesByDay(day.name)" :key="schedule._id" class="border p-3 rounded-lg bg-primary/5 hover:shadow-lg transition-shadow duration-300 m-3">
                            <p class="font-bold text-primary text-sm">{{ schedule.name }}</p>
                            <p class="text-xs text-gray-600 font-semibold">{{ formatSectionTime(schedule.duration) }}</p>
                            <div class="mt-2 pt-2 border-t text-xs space-y-1">
                                <p>
                                    <span class="font-semibold">{{ $t('staff.teacher') }}:</span> {{ formatStaffName(schedule.staff) }}
                                </p>
                                <p>
                                    <span class="font-semibold">{{ $t('subject.title') }}:</span> {{ formatSubjectName(schedule.subject) }}
                                </p>
                                <p>
                                    <span class="font-semibold">{{ $t('class.studentPlaceholder') }}:</span> {{ schedule.students.length }}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div v-else class="text-gray-400 text-center text-sm pt-4">{{ $t('schedule.noClasses') }}</div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useFetch } from '../composible/useFetch';
import moment from 'moment';
import { useI18n } from 'vue-i18n';

// --- Composables ---
const { t } = useI18n();

// --- Data Fetching ---
const { data: scheduleList, fetchData: fetchClasses } = useFetch('classes');
const { data: sections, fetchData: fetchSections } = useFetch('sections');
const { data: staff, fetchData: fetchStaff } = useFetch('staffs');
const { data: subjects, fetchData: fetchSubjects } = useFetch('subjects');
const { data: holidays, fetchData: fetchHolidays } = useFetch('holidays');

// --- Component State ---
const daysOfWeek = ref([]);

// --- Helper Functions for Display ---
const setupDaysOfWeek = () => {
    const startOfWeek = moment().startOf('isoWeek'); // Starts on Monday
    const days = [];
    for (let i = 0; i < 7; i++) {
        const day = startOfWeek.clone().add(i, 'days');
        days.push({
            name: day.format('dddd'), // Full name like 'Monday'
            date: day.format('DD') // Day of the month like '12'
        });
    }
    daysOfWeek.value = days;
};

const classesByDay = (dayName) => {
    if (!scheduleList.value || !holidays.value) return [];

    const dateForDay = moment().day(dayName);

    return scheduleList.value
        .filter((schedule) => {
            const isCorrectDay = schedule?.day_class?.includes(dayName);
            const isActive = schedule?.mark_as_completed !== false;

            if (!isCorrectDay || !isActive) {
                return false;
            }

            if (schedule.holiday) {
                const holidaySchedule = holidays.value.find((h) => h._id === schedule.holiday);
                if (holidaySchedule && Array.isArray(holidaySchedule.holidays)) {
                    const isHolidayForThisDay = holidaySchedule.holidays.some((holidayDate) => dateForDay.isSame(moment(holidayDate), 'day'));
                    if (isHolidayForThisDay) {
                        return false;
                    }
                }
            }
            return true;
        })
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

    return section.duration;
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
    let tableHTML = `<table class="schedule-table"><thead><tr>`;
    daysOfWeek.value.forEach((day) => {
        tableHTML += `<th>${t(`day_of_week.${day.name.toLowerCase()}`)}<br></th>`;
    });
    tableHTML += `</tr></thead><tbody>`;

    const maxClassesPerDay = Math.max(...daysOfWeek.value.map((day) => classesByDay(day.name).length));
    if (maxClassesPerDay === 0) {
        tableHTML += `<tr><td colspan="${daysOfWeek.value.length}" style="text-align:center;">${t('schedule.noData')}</td></tr>`;
    } else {
        for (let i = 0; i < maxClassesPerDay; i++) {
            tableHTML += `<tr>`;
            daysOfWeek.value.forEach((day) => {
                const dayClasses = classesByDay(day.name);
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
                    tableHTML += `<td></td>`;
                }
            });
            tableHTML += `</tr>`;
        }
    }
    tableHTML += `</tbody></table>`;

    const printWindow = window.open('', '_blank', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Weekly Schedule</title>');
    printWindow.document.write(`
        <style>
            body { font-family: Arial, sans-serif; }
            .schedule-table { width: 100%; border-collapse: collapse; }
            .schedule-table th, .schedule-table td { border: 1px solid #ccc; padding: 8px; text-align: left; vertical-align: top; }
            .schedule-table th { background-color: #f2f2f2; text-align: center; }
            .class-name { font-weight: bold; font-size: 1.1em; margin-bottom: 4px; }
            .class-time { font-style: italic; margin-bottom: 8px; }
            .class-details { font-size: 0.9em; color: #555; }
            @page { size: A4 landscape; margin: 20mm; }
        </style>
    `);
    printWindow.document.write('</head><body>');
    printWindow.document.write(`<h1>${t('schedule.weeklySchedule')}</h1>`);
    printWindow.document.write(tableHTML);
    printWindow.document.write('</body></html>');

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
};

// --- Lifecycle Hook ---
onMounted(async () => {
    setupDaysOfWeek();
    await Promise.all([fetchClasses(), fetchSections(), fetchStaff(), fetchSubjects(), fetchHolidays()]);
});
</script>

<style>
@media print {
    body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }
    .hidden-print {
        display: none !important;
    }
    #schedule-display {
        box-shadow: none;
        border: none;
    }
}
</style>
