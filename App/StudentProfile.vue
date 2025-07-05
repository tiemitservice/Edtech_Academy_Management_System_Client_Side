<template>
    <div>
        <div class="card">
            <div v-if="upcomingAlerts.length" class="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                <strong>📢 Payment Reminder:</strong>
                <ul class="mt-2 list-disc list-inside">
                    <li v-for="alert in upcomingAlerts" :key="alert._id">
                        Payment for student ID <strong>{{ alert.student }}</strong> is due on <strong>{{ formatDate(alert.next_due_date) }}</strong>
                    </li>
                </ul>
            </div>

            <Tabs value="0">
                <TabList>
                    <Tab value="0">Profile</Tab>
                    <Tab value="1">View Class</Tab>
                    <Tab value="2">View Attendance</Tab>
                    <Tab value="3">View Permission</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel value="0">
                        <div>
                            <h3 class="text-gray-500 font-semibold">Hello, {{ user?.name }} Welcome to test mode</h3>
                        </div>
                        <div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-center">
                                <div :key="index" class="p-4 shadow-lg rounded-lg">
                                    <div class="mx-auto mb-4">
                                        <img v-if="studentRef?.image" :src="'' + studentRef?.image" alt="studentRef.image ? studentRef.item?.image : 'https://placehold.co/40x40'" class="w-16 h-16 rounded-full object-cover mx-auto" />
                                        <img v-else src="https://placehold.co/40x40" alt="https://placehold.co/40x40" class="w-16 h-16 rounded-full object-cover mx-auto" />
                                    </div>
                                    <h3 class="text-xl font-semibold text-primary">English Name: {{ studentRef.eng_name }}</h3>
                                    <h3 class="text-xl font-semibold text-primary">Khmer Name: {{ studentRef.kh_name }}</h3>
                                    <p class="text-primary"><span class="font-semibold">Email:</span> {{ studentRef.email }}</p>
                                    <p class="text-primary"><span class="font-semibold">Phone:</span> {{ studentRef.phoneNumber }}</p>
                                    <p class="text-primary"><span class="font-semibold">Address:</span> {{ studentRef.address }}</p>
                                </div>
                            </div>
                        </div>
                    </TabPanel>
                    <TabPanel value="1">
                        <div>
                            <div>
                                <h1 class="text-2xl">Hello , Welcome to test mode</h1>
                                <!-- <h2 class="text-2xl font-bold mb-4">Teacher Classes</h2> -->
                                <div v-if="filteredClasses?.length != 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div v-for="classItem in filteredClasses" :key="classItem._id" @click="handleClass(classItem)" class="cursor-pointer flex flex-col p-4 shadow-lg rounded-lg bg-primary" role="button">
                                        <h3 class="text-xl font-semibold text-white">{{ classItem.name }}</h3>
                                        <p class="text-white">Students: {{ classItem.students.length }}</p>
                                    </div>
                                </div>
                                <Dialog v-model:visible="visible" modal header="Edit Profile" :style="{ width: '25rem' }">
                                    <StudentClassDetial @close="handleClose" :datatoedit="datatoedit" />
                                </Dialog>
                            </div>
                        </div>
                    </TabPanel>
                    <TabPanel value="2">
                        <div v-if="attendance" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div v-for="(item, index) in attendance" :key="index" class="p-4 shadow-lg rounded-lg">
                                <h3 class="text-xl font-semibold text-primary text-nowrap">Date: {{ formatDate(item.date) }}</h3>
                                <p class="text-primary"><span class="font-semibold">Status:</span> {{ item.status }}</p>
                                <p class="text-primary"><span class="font-semibold">Status:</span> {{ item._id }}</p>

                                <div>
                                    <Button type="button" @click="handleDeleteAttendance(studentRef._id)">Delete</Button>
                                </div>
                            </div>
                            <!-- <pre>
                                {{ attendance }}
                            </pre> -->
                        </div>
                    </TabPanel>
                    <TabPanel value="3">
                        <div class="flex items-start justify-between w-full">
                            <form @submit.prevent="handleSubmit" class="w-1/2">
                                <div class="flex flex-col mb-4">
                                    <label for="reason">
                                        <h3 class="text-xl font-semibold text-primary">Reason</h3>
                                    </label>
                                    <Textarea v-model="reason" placeholder="Reason"></Textarea>
                                </div>
                                <div class="flex flex-col mb-4">
                                    <label for="start_date">
                                        <h3 class="text-xl font-semibold text-primary">Start Date</h3>
                                    </label>
                                    <DatePicker v-model="start_date" selectionMode="range" :minDate="Onlytoday" placeholder="Start Date" />
                                </div>
                                <div>
                                    <Button type="submit">Submit</Button>
                                </div>
                            </form>
                            <div class="w-1/2 p-4">
                                <h2 class="text-2xl font-bold mb-4">Leave History</h2>
                                <div>
                                    <div v-if="studentpermission" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div v-for="(item, index) in studentpermission" :key="index" class="bg-white border p-3 border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 relative w-fit">
                                            <!-- Status indicator -->
                                            <div class="absolute top-0 right-0 w-24 h-24">
                                                <div class="transform rotate-45 text-white font-medium py-1 text-xs text-center bg-primary p-1 rounded-lg mr-2">
                                                    {{ item.permissent_status }}
                                                </div>
                                            </div>

                                            <!-- Student name -->
                                            <h2 class="text-lg font-bold text-primary mb-3">
                                                {{ item.student_id }}
                                            </h2>

                                            <!-- Reason -->
                                            <div class="mb-3">
                                                <span class="text-sm text-gray-500 block">Reason</span>
                                                <p class="text-gray-700">{{ item.reason }}</p>
                                            </div>
                                            <!-- Status -->
                                            <div class="mb-3">
                                                <span class="text-sm text-gray-500 block">Status</span>
                                                <p class="text-gray-700">{{ item.permissent_status }}</p>
                                            </div>
                                            <!-- Date range -->
                                            <div class="mt-4 pt-3 border-t border-gray-100">
                                                <div class="flex items-center text-primary-200 font-medium">
                                                    <p class="text-sm">{{ formatDate(item.start_date) }} - {{ formatDate(item.end_date) }}</p>
                                                </div>
                                                <div>
                                                    <Button @click="handleDelete(item._id)" severity="danger">លុប</Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </div>
    </div>
</template>

<script>
import { onMounted, ref, computed, watchEffect } from 'vue';
import useAuth from '@/composible/useAuth';
import { useFetch } from '@/composible/useFetch';
import StudentClassDetial from './StudentClassDetial.vue';
import { formatDate } from '@/composible/formatDate';
export default {
    components: {
        StudentClassDetial
    },
    setup() {
        let Onlytoday = new Date();

        const visible = ref(false);
        const datatoedit = ref(null);
        const today = new Date();
        const reason = ref(null);
        const start_date = ref(null);

        const handleClass = (classItem) => {
            datatoedit.value = classItem;
            visible.value = true;
        };
        const handleClose = () => {
            visible.value = false;
        };
        const { user } = useAuth();
        const { data, fetchData } = useFetch('students');
        const { data: classes, fetchData: fetchClasses } = useFetch('classes');
        const { data: attendance, fetchData: fetchAttendance, deleteData: deleteAttendance } = useFetch('attendances');
        const { data: studentpermission, fetchData: fetchstudentpermission, postData: postPermission, deleteData } = useFetch('student_permissions');
        const { data: payment, fetchData: fetchPayment } = useFetch('student_payments');
        const formatName = (id) => {
            const student = data.value?.find((student) => student._id === id);
            return student ? student.eng_name : 'Unknown';
        };

        const filtersAttendance = ref({
            limit: 50,
            page: 1
        });

        const filters = ref({
            limit: 50,
            page: 1,
            email: user.value?.email
        });
        const filtersClass = ref({
            status: 'true',
            limit: 10,
            page: 1
        });

        const handleDeleteAttendance = async (id) => {
            try {
                await deleteAttendance(id);
                console.log('Attendance deleted successfully');
            } catch (error) {
                console.error('Error deleting attendance:', error);
            }
        };

        const filteredClasses = computed(() => {
            if (!classes.value || !classes.value || !user.value || !user.value.email) {
                return [];
            }

            return classes.value.filter((classItem) => {
                const student = classItem.students.find((student) => student.email === user.value.email);
                return student;
            });
        });
        const handleDelete = async (id) => {
            try {
                await deleteData(id);
                console.log('Deleted successfully');
            } catch (error) {
                console.error('Error deleting data:', error);
            }
        };
        const studentIds = computed(() => {
            return (data.value || []).map((student) => student?.student_id);
        });

        const student_Id = ref(null);
        const teacher_Id = ref(null);
        const filtersStudentPermission = ref({
            limit: 50,
            page: 1
        });

        const studentRef = ref([]);
        onMounted(async () => {
            // Step 1: Fetch students and attendance data
            await fetchData(); // get student(s) by email
            await fetchAttendance(); // get all attendance records
            await fetchPayment(); // get all payment records
            await fetchClasses(); // get all classes
            const matchedStudent = data.value.find((student) => student.email === user.value.email);
            studentRef.value = matchedStudent;
            console.log('studentpermission', studentpermission.value);

            if (!user.value || !user.value.email) {
                console.error('No authenticated user or email found!');
                return;
            }

            // filters.value.email = user.value.email;

            // Step 2: Get student ID
            let studentId = null;
            let teacherId = null;
            if (data.value && Array.isArray(data.value)) {
                const student = data.value.find((s) => s.email === user.value.email);
                if (student) {
                    studentId = student._id;
                    teacherId = student.teacher?._id;
                } else {
                    console.error('Student not found for the authenticated user!');
                    return;
                }
            } else {
                console.error('Invalid student data structure!');
                return;
            }
            await fetchstudentpermission(filtersStudentPermission.value);

            if (studentpermission.value && Array.isArray(studentpermission.value)) {
                studentpermission.value = studentpermission.value.filter((item) => item.studentId === studentId);
                console.log('studentpermission', studentpermission.value);
            } else {
                console.error('Invalid student permission data structure!');
            }
            if (payment.value) {
                payment.value = payment.value.filter((item) => item.student === studentId);
            } else {
                console.error('Invalid payment data structure!');
            }
            student_Id.value = studentId;
            teacher_Id.value = teacherId;
            console.log('teacher_Id.value', teacher_Id.value);
        });

        const upcomingAlerts = computed(() => {
            const today = new Date();

            const alertStart = new Date();
            alertStart.setDate(today.getDate() + 3);
            alertStart.setHours(0, 0, 0, 0);

            const alertEnd = new Date();
            alertEnd.setDate(today.getDate() + 3);
            alertEnd.setHours(23, 59, 59, 999);

            return payment.value.filter((p) => {
                const dueDate = new Date(p.next_due_date);
                return dueDate >= alertStart && dueDate <= alertEnd;
            });
        });

        const handleSubmit = async () => {
            try {
                const [start, end] = start_date.value; // Destructure the range
                const req = {
                    studentId: student_Id.value,
                    reason: reason.value,
                    start_date: start, // First date as start_date
                    end_date: end, // Second date as end_date
                    sent_to: data.value[0]?.teacher?._id,
                    student_id: data.value[0]?._id,
                    permissent_status: 'pending'
                };
                await postPermission(req);
            } catch (error) {
                console.log('error', error);
            }
        };
        return {
            data,
            classes,
            filters,
            filteredClasses,
            filtersClass,
            handleClass,
            handleClose,
            visible,
            datatoedit,
            user,
            formatDate,
            Onlytoday,
            reason,
            start_date,
            handleSubmit,
            attendance,
            studentpermission,
            formatName,

            handleDelete,
            studentIds,
            handleDeleteAttendance,
            studentRef,
            payment,
            upcomingAlerts
        };
    }
};
</script>
