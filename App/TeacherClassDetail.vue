<template>
    <div>
        <div class="card">
            <!-- {{ studentPermission }} -->
            <Tabs value="0">
                <TabList>
                    <Tab value="0">Student List</Tab>
                    <Tab value="1">Student Score</Tab>
                    <Tab value="2">Student Attendance</Tab>
                    <Tab value="3">Student Permmission</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel value="0">
                        <div class="card">
                            <DataTable :value="filteredStudents" tableStyle="min-width: 50rem">
                                <Column field="id" header="ID">
                                    <template #body="slotProps"> {{ slotProps.index + 1 }} </template>
                                </Column>
                                <Column field="name" header="Kh Name">
                                    <template #body="slotProps">
                                        <div class="inline px-3 py-1 text-lg font-semibold rounded-full">{{ slotProps.data.kh_name }}</div>
                                    </template>
                                </Column>
                                <Column field="category" header="Eng Name">
                                    <template #body="slotProps">
                                        <div class="inline px-3 py-1 text-lg font-semibold rounded-full">{{ slotProps.data.eng_name }}</div>
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </TabPanel>
                    <TabPanel value="1">
                        <div class="card">
                            <DataTable :value="filteredStudents" tableStyle="min-width: 50rem">
                                <Column field="id" header="ID">
                                    <template #body="slotProps"> {{ slotProps.index + 1 }} </template>
                                </Column>
                                <Column field="name" header="Kh Name">
                                    <template #body="slotProps">
                                        <div class="inline px-3 py-1 text-lg font-semibold rounded-full">{{ slotProps.data.kh_name }}</div>
                                    </template>
                                </Column>
                                <Column field="category" header="Eng Name">
                                    <template #body="slotProps">
                                        <div class="inline px-3 py-1 text-lg font-semibold rounded-full">{{ slotProps.data.eng_name }}</div>
                                    </template>
                                </Column>

                                <Column field="attendance" header="Attendance">
                                    <template #body="slotProps">
                                        <div>
                                            <div class="inline px-3 py-1 text-lg font-semibold">{{ slotProps.data.attendence }}</div>
                                        </div>
                                    </template>
                                </Column>
                                <Column field="quiz_score" header="Quiz Score">
                                    <template #body="slotProps">
                                        <div class="flex gap-3 text-nowrap">
                                            <InputNumber :disabled="!isInterScore || score_id !== slotProps.data._id" v-model="slotProps.data.quiz_score" class="w-fit" />
                                            <div>
                                                <Button @click="handleReEnterScore(slotProps.data._id)">Re-Enter Score</Button>
                                            </div>
                                        </div>
                                    </template>
                                </Column>

                                <Column field="midterm_score" header="Midterm Score">
                                    <template #body="slotProps">
                                        <div class="flex items-center gap-3 text-nowrap">
                                            <InputNumber :disabled="!isInterScore || score_id !== slotProps.data._id" v-model="slotProps.data.midterm_score" class="w-fit" />
                                            <div>
                                                <Button @click="handleReEnterScore(slotProps.data._id)">Re-Enter Score</Button>
                                            </div>
                                        </div>
                                    </template>
                                </Column>

                                <Column field="final_score" header="Final Score">
                                    <template #body="slotProps">
                                        <div class="flex items-center gap-3 text-nowrap">
                                            <InputNumber :disabled="!isInterScore || score_id !== slotProps.data._id" v-model="slotProps.data.final_score" class="w-fit" />
                                            <div>
                                                <Button @click="handleReEnterScore(slotProps.data._id)">Re-Enter Score</Button>
                                            </div>
                                        </div>
                                    </template>
                                </Column>

                                <Column field="score" header="Total Score">
                                    <template #body="slotProps">
                                        <div class="inline px-3 py-1 text-lg font-semibold rounded-full">{{ slotProps.data.total_attendance_score }}</div>
                                    </template>
                                </Column>
                                <Column field="score" header="Action">
                                    <template #body="slotProps">
                                        <div class="flex gap-3">
                                            <Button v-if="!isInterScore" label="បញ្ចូលពិន្ទុ" rounded aria-label="Edit" severity="success" @click="handleEnterScore(slotProps.data._id)" />

                                            <div class="flex gap-3 items-center justify-center text-nowrap" v-else-if="isInterScore && score_id === slotProps.data._id">
                                                <Button label="បោះបង់" @click="isInterScore = false" rounded aria-label="Cancel" severity="warn" />
                                                <Button label="រក្សារទុក" @click.prevent="handleUpdateScore(slotProps.data)" rounded aria-label="Save" severity="primary" />
                                            </div>
                                        </div>
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </TabPanel>
                    <TabPanel value="2">
                        <div class="card">
                            <DataTable :value="filteredStudentForAttendance" tableStyle="min-width: 50rem">
                                <Column field="id" header="ID">
                                    <template #body="slotProps"> {{ slotProps.index + 1 }} </template>
                                </Column>
                                <Column field="name" header="Kh Name">
                                    <template #body="slotProps">
                                        <div class="inline px-3 py-1 text-lg font-semibold rounded-full">{{ slotProps.data.kh_name }}</div>
                                    </template>
                                </Column>
                                <Column field="category" header="Eng Name">
                                    <template #body="slotProps">
                                        <div class="inline px-3 py-1 text-lg font-semibold rounded-full">{{ slotProps.data.eng_name }}</div>
                                    </template>
                                </Column>
                                <Column field="Attendance" header="Attendance">
                                    <template #body="slotProps">
                                        <div class="flex items-center gap-2">
                                            <Select showClear placeholder="Select Attendance" v-model="attendanceSelections[slotProps.data._id]" optionLabel="label" optionValue="value" :options="studentEnum" />
                                            <Button @click="handleUpdateStudent(slotProps.data?._id)">Save</Button>
                                        </div>
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </TabPanel>
                    <TabPanel value="3">
                        <div class="card">
                            <DataTable :value="studentPermission" tableStyle="min-width: 50rem">
                                <Column field="id" header="ID">
                                    <template #body="slotProps"> {{ slotProps.index + 1 }} </template>
                                </Column>
                                <Column field="name" header="Kh Name">
                                    <template #body="slotProps">
                                        <div class="inline px-3 py-1 text-lg font-semibold rounded-full">{{ slotProps.data.studentId }}</div>
                                    </template>
                                </Column>
                                <Column field="reason" header="Reason">
                                    <template #body="slotProps">
                                        <div class="inline px-3 py-1 text-lg font-semibold rounded-full">{{ slotProps?.data.reason }}</div>
                                    </template>
                                </Column>
                                <Column field="permissent_status" header="Status">
                                    <template #body="slotProps">
                                        <div class="inline px-3 py-1 text-lg font-semibold rounded-full">{{ slotProps?.data.permissent_status }}</div>
                                    </template>
                                </Column>
                                <Column header="Action">
                                    <template #body="slotProps">
                                        <Button @click="handleUpdatePermission(slotProps.data?._id)" class="p-button-success">Accept</Button>
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </div>
    </div>
</template>

<script>
import { onMounted, ref, computed } from 'vue';
import useAuth from '@/composible/useAuth';
import { useFetch } from '@/composible/useFetch';
import { formatDate } from '@/composible/formatDate';
import { all } from 'axios';
export default {
    props: ['datatoedit'],
    setup(props) {
        // Reactive state
        const { user } = useAuth();
        const { data: students, fetchData: fetchStudents } = useFetch('students');
        const { data: studentForAttendance, fetchData: fetchStudentForAttendance, updateData: updateAttendance } = useFetch('students');
        const { data: attendance, fetchData: fetchAttendance, postData: postAttendance } = useFetch('attendances');
        const { data: studentPermission, fetchData: fetchStudentPermission, updateData: updatePermission } = useFetch('student_permissions');
        const { data: staffData, fetchData: fetchStaff } = useFetch('staffs');

        const filtersStaff = ref({
            limit: 10,
            page: 1,
            email: user.value?.email
        });

        const filters = ref({
            // status: 'true',
            limit: 5,
            page: 1
        });
        const filtersStudentForAttendance = ref({
            // status: 'true',
            limit: 10,
            page: 1
        });
        const attentdanceSelections = ref({
            // status: 'true',
            limit: 10,
            page: 1
        });

        const data = ref([]);

        const filteredStudents = computed(() => {
            const allStudents = students.value;
            const studentIdsInClass = props.datatoedit?.students.map((student) => student._id) || [];

            return allStudents
                .filter((student) => studentIdsInClass.includes(student._id))
                .map((student) => ({
                    ...student,
                    quiz_score: null,
                    midterm_score: null,
                    final_score: null
                }));
        });

        const filteredStudentForAttendance = computed(() => {
            const allStudents = studentForAttendance.value;
            const studentIdsInClass = props.datatoedit?.students.map((student) => student._id) || [];

            return allStudents.filter((student) => studentIdsInClass.includes(student._id));
        });
        const studentEnum = [
            { label: 'Present', value: 'present' },
            { label: 'Absent', value: 'absent' },
            { label: 'Late', value: 'late' },
            { label: 'Excused', value: 'excused' }
        ];

        const handleUpdateStudent = async (studentId) => {
            const selectedAttendance = attendanceSelections.value[studentId];
            if (!selectedAttendance) {
                console.warn('No attendance selected for student:', studentId);
                return;
            }

            let todayScore = 0;
            if (selectedAttendance === 'present') {
                todayScore = 1;
            } else if (selectedAttendance === 'excused') {
                todayScore = 0.5;
            }

            // FIX: Assume studentForAttendance.value is the array
            const student = studentForAttendance.value?.find((s) => s._id === studentId);
            const currentTotal = student?.total_attendance_score || 0;
            const newTotal = currentTotal + todayScore;

            const updatePayload = {
                attendence_enum: selectedAttendance,
                attendence_date: new Date().toISOString(),
                attendence: todayScore,
                total_attendance_score: newTotal
            };

            try {
                await updateAttendance(updatePayload, studentId);

                const attendanceLogPayload = {
                    student_id: studentId,
                    set_by: user.value?.id,
                    status: selectedAttendance
                };

                await postAttendance(attendanceLogPayload);
            } catch (error) {
                console.error(`Error handling attendance for student ${studentId}:`, error);
            }
        };
        const finalScore = ref(null);
        const midtermScore = ref(null);
        const quizScore = ref(null); // Initialize quizScore

        const teacherIds = computed(() => {
            return (data.value || []).map((t) => t?._id);
        });

        const filtersStudentPermission = ref({
            limit: 10,
            page: 1
        });

        const attendanceSelections = ref({});

        const handleUpdatePermission = async (i) => {
            try {
                const req = {
                    permissent_status: 'accepted'
                };
                await updatePermission(req, i);
            } catch (error) {
                console.log(error);
            }
        };

        const isInterScore = ref(false);
        const score_id = ref(null);
        const scoreMode = ref('insert_more'); // 'insert_more' or 'replace'
        const oldScores = ref({}); // store old scores before edit

        const handleEnterScore = (id) => {
            const student = props.datatoedit?.students.find((s) => s._id === id);
            if (student) {
                oldScores.value = {
                    quiz_score: student.quiz_score || 0,
                    midterm_score: student.midterm_score || 0,
                    final_score: student.final_score || 0
                };
            }
            score_id.value = id;
            isInterScore.value = true;
            scoreMode.value = 'insert_more';
        };

        const handleReEnterScore = (id, type) => {
            const student = props.datatoedit?.students.find((s) => s._id === id);
            if (student) {
                oldScores.value = {
                    quiz_score: student.quiz_score || 0,
                    midterm_score: student.midterm_score || 0,
                    final_score: student.final_score || 0
                };
                if (type === 'quiz') student.quiz_score = null;
                if (type === 'midterm') student.midterm_score = null;
                if (type === 'final') student.final_score = null;
            }
            score_id.value = id;
            isInterScore.value = true;
            scoreMode.value = 'replace';
        };

        const handleUpdateScore = async (student) => {
            try {
                const req = {
                    final_score: student.final_score || 0,
                    midterm_score: student.midterm_score || 0,
                    quiz_score: student.quiz_score || 0,
                    score_status: scoreMode.value,
                    old_final_score: oldScores.value.final_score || 0,
                    old_midterm_score: oldScores.value.midterm_score || 0,
                    old_quiz_score: oldScores.value.quiz_score || 0
                };

                await updateAttendance(req, student._id); // call your API

                isInterScore.value = false;
                score_id.value = null;
                scoreMode.value = 'insert_more'; // reset
                oldScores.value = {};
            } catch (error) {
                console.error('Failed to update score:', error);
            }
        };

        // const updateStudentScore = async (req, res) => {
        //     try {
        //         const { id } = req.params;
        //         const { final_score, midterm_score, quiz_score, score_status } = req.body;

        //         const student = await Student.findById(id);

        //         if (!student) {
        //             return res.status(404).json({ message: 'Student not found' });
        //         }

        //         // Default to 0 if any old scores are missing
        //         const oldFinal = student.old_final_score || 0;
        //         const oldMidterm = student.old_midterm_score || 0;
        //         const oldQuiz = student.old_quiz_score || 0;

        //         let total = student.total_attendance_score || 0;

        //         if (score_status === 'replace') {
        //             // Subtract old, add new
        //             total = total - (oldFinal + oldMidterm + oldQuiz) + (final_score + midterm_score + quiz_score);
        //         } else if (score_status === 'insert_more') {
        //             // Just add new score
        //             total = total + final_score + midterm_score + quiz_score;
        //         }

        //         // Save scores
        //         student.final_score = final_score;
        //         student.midterm_score = midterm_score;
        //         student.quiz_score = quiz_score;

        //         // Update old scores
        //         student.old_final_score = final_score;
        //         student.old_midterm_score = midterm_score;
        //         student.old_quiz_score = quiz_score;

        //         // Update total score and status
        //         student.total_attendance_score = total;
        //         student.score_status = score_status;

        //         await student.save();

        //         res.status(200).json({ message: 'Score updated', student });
        //     } catch (error) {
        //         console.error('Update failed:', error);
        //         res.status(500).json({ message: 'Server error' });
        //     }
        // };

        onMounted(async () => {
            // Fetch students data
            await fetchStudents(filters.value);
            await fetchStudentForAttendance(filtersStudentForAttendance.value);
            await fetchAttendance(attentdanceSelections.value);
            await fetchStaff(filtersStaff.value);
            if (props.datatoedit) {
                data.value = props.datatoedit.students;
                data.value = props.datatoedit.students.map((student) => ({
                    ...student,
                    final_score: student.final_score ?? null,
                    midterm_score: student.midterm_score ?? null,
                    quiz_score: student.quiz_score ?? null
                }));

                attendanceSelections.value = props.datatoedit.students.reduce((acc, student) => {
                    acc[student._id] = student.attendence_enum || null;
                    return acc;
                }, {});
            }
            attendanceSelections.value = props.datatoedit.students.reduce((acc, student) => {
                acc[student._id] = student.attendence_enum || null;
                return acc;
            }, {});
            if (studentPermission.value && Array.isArray(teacherIds.value)) {
                studentPermission.value = studentPermission.value.filter((item) => {
                    return teacherIds.value.includes(item.sent_to?._id);
                });
            }
            await fetchStudentPermission(filtersStudentPermission.value);

            console.log('Student Permission:', studentPermission.value);
        });
        return {
            staffData,
            studentPermission,
            data,
            user,
            attendance,
            students,
            filteredStudents,
            filteredStudentForAttendance,
            studentEnum,
            handleUpdateStudent,
            attendanceSelections,
            handleUpdatePermission,
            handleEnterScore,
            isInterScore,
            score_id,
            handleUpdateScore,
            finalScore,
            midtermScore,
            quizScore,
            handleReEnterScore
        };
    }
};
</script>

<style lang="scss" scoped></style>
