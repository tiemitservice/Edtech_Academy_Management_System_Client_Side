import AppLayout from '@/layout/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/store/useUserStore';

// Import all your page components
import Staff from '@/views/Staff.vue';
import Class from '@/views/Class.vue';
import Section from '@/views/Section.vue';
import Profile from '@/form/Profile.vue';
import Room from '@/views/Room.vue';
import StudentList from '@/views/StudentList.vue';
import StudentPayment from '@/views/StudentPayment.vue';
import StudentAttendance from '@/views/StudentAttendance.vue';
import StudentScore from '@/views/StudentScore.vue';
import StudentClassInfo from '@/views/StudentClassInfo.vue';
import StudentClassHistory from '@/views/StudentClassHistory.vue';
import StudentCategory from '@/views/StudentCategory.vue';
import AssignTeacherToClass from '@/views/AssignTeacherToClass.vue';
import AssigneStudentToClass from '@/views/AssigneStudentToClass.vue';
import ScheduleList from '@/views/ScheduleList.vue';
import AssigneStudentToTeacher from '@/views/AssigneStudentToTeacher.vue';
import ClassTransaction from '@/views/ClassTransaction.vue';
import StaffPermission from '@/views/StaffPermission.vue';
import StudentPermission from '@/views/StudentPermission.vue';
import Book from '@/views/Book.vue';
import BookCategory from '@/views/BookCategory.vue';
import Department from '@/views/Department.vue';
import Posistion from '@/views/Posistion.vue';
import Subject from '@/views/Subject.vue';
import StaffAttendance from '@/views/StaffAttendance.vue';
import CourInvoiceList from '@/views/CourInvoiceList.vue';
import Users from '@/views/Users.vue';
import SchoolInfo from '@/views/SchoolInfo.vue';
import ResetPassword from '@/views/ResetPassword.vue';
import Holiday from '@/views/Holiday.vue';
import CourseInvoice from '@/views/CourseInvoice.vue';
import CourseInvoceTransaction from '@/views/CourseInvoceTransaction.vue';
import BookPayment from '@/views/BookPayment.vue';
import BookPaymentTransaction from '@/views/BookPaymentTransaction.vue';
import BookInvoice from '@/views/BookInvoice.vue';
import Discount from '@/views/Discount.vue';
import StudentScoreReport from '@/Reports/StudentScoreReport.vue';
import MarkClassReport from '@/Reports/MarkClassReport.vue';
import ReMarkClassReport from '@/Reports/ReMarkClassReport.vue';
import AttendanceReport from '@/Reports/AttendanceReport.vue';
import BookPaymentReport from '@/Reports/BookPaymentReport.vue';
import StudentPaymentReport from '@/Reports/StudentPaymentReport.vue';
import StockInStockOutReport from '@/Reports/StockInStockOutReport.vue';
import StudentCompletePaymentReport from '@/Reports/StudentCompletePaymentReport.vue';
import TeacherAttendanceReport from '@/Reports/TeacherAttendanceReport.vue';
import TeacherPermissionReport from '@/Reports/TeacherPermissionReport.vue';
import PromoteStudentReport from '@/Reports/PromoteStudentReport.vue';
import StudentPermissionReport from '@/Reports/StudentPermissionReport.vue';
import FeedBack from '@/views/FeedBack.vue';
import StudentTrackingPayment from '@/views/StudentTrackingPayment.vue';
import Registration from '@/Registration.vue';
import ResetPasswordForm from '@/ResetPasswordForm.vue';
const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            children: [
                { path: '/', name: 'dashboard', component: () => import('@/views/Dashboard.vue') },
                // Academic
                { path: '/class', name: 'class', component: Class, meta: { permission: 'classes:read' } },
                { path: '/class_transaction', name: 'class_transaction', component: ClassTransaction, meta: { permission: 'class transaction:read' } },
                { path: '/section', name: 'section', component: Section, meta: { permission: 'sessions:read' } },
                { path: '/subject', name: 'subject', component: Subject, meta: { permission: 'subjects:read' } },
                { path: '/schedulelist', name: 'schedulelist', component: ScheduleList, meta: { permission: 'class schedule:read' } },
                { path: '/assign_teacher_to_class', name: 'assign_teacher_to_class', component: AssignTeacherToClass, meta: { permission: 'assign teacher to class:update' } },
                { path: '/assign_student_to_class', name: 'assign_student_to_class', component: AssigneStudentToClass, meta: { permission: 'assign student to class:update' } },
                { path: '/feedback', name: 'feedback', component: FeedBack, meta: { permission: 'feedback:read' } },
                // Students
                { path: '/studentlist', name: 'studentlist', component: StudentList, meta: { permission: 'student list:read' } },
                { path: '/student_category', name: 'studentcategory', component: StudentCategory, meta: { permission: 'student category:read' } },
                { path: '/student_attendance', name: 'studentattendance', component: StudentAttendance, meta: { permission: 'student attendance:read' } },
                { path: '/student_score', name: 'studentscore', component: StudentScore, meta: { permission: 'student scores:read' } },
                { path: '/studentpermission', name: 'studentpermission', component: StudentPermission, meta: { permission: 'student permission:read' } },
                { path: '/studentclassinfo', name: 'studentclassinfo', component: StudentClassInfo, meta: { permission: 'student class info:read' } },
                { path: '/student_class_history', name: 'studentclasshistory', component: StudentClassHistory, meta: { permission: 'student class history:read' } },
                // Teacher
                { path: '/staff', name: 'staff', component: Staff, meta: { permission: 'teachers:read' } },
                { path: '/staff_attendance', name: 'staffattendance', component: StaffAttendance, meta: { permission: 'teacher attendance:read' } },
                { path: '/staffpermission', name: 'staffpermission', component: StaffPermission, meta: { permission: 'teacher permission:read' } },
                { path: '/department', name: 'department', component: Department, meta: { permission: 'departments:read' } },
                { path: '/posistion', name: 'posistion', component: Posistion, meta: { permission: 'positions:read' } },
                // Book
                { path: '/book', name: 'book', component: Book, meta: { permission: 'book list:read' } },
                { path: '/bookcategory', name: 'bookcategory', component: BookCategory, meta: { permission: 'book categories:read' } },
                // Finance
                { path: '/studentpayment', name: 'studentpayment', component: StudentPayment, meta: { permission: 'student payments tracking:read' } },
                { path: '/courinvoicelist', name: 'courinvoicelist', component: CourInvoiceList, meta: { permission: 'course invoice:read' } },
                { path: '/courseinvoice_transaction', name: 'courseinvoice_transaction', component: CourseInvoceTransaction, meta: { permission: 'course payment transactions:read' } },
                { path: '/bookpayment', name: 'bookpayment', component: BookPayment, meta: { permission: 'book payment:read' } },
                { path: '/bookpayment_transaction', name: 'bookpayment_transaction', component: BookPaymentTransaction, meta: { permission: 'book payment transactions:read' } },
                // Reports
                { path: '/score_report', name: 'score_report', component: StudentScoreReport, meta: { permission: 'student score report:read' } },
                { path: '/mark_class_report', name: 'mark_class_report', component: MarkClassReport, meta: { permission: 'mark class report:read' } },
                { path: '/re_mark_report', name: 're_mark_report', component: ReMarkClassReport, meta: { permission: 're-mark class report:read' } },
                { path: '/attendance_report', name: 'attendance_report', component: AttendanceReport, meta: { permission: 'student attendance report:read' } },
                { path: '/book_payment_report', name: 'book_payment_report', component: BookPaymentReport, meta: { permission: 'book payment report:read' } },
                { path: '/student_payment_report', name: 'student_payment_report', component: StudentPaymentReport, meta: { permission: 'student payment report:read' } },
                { path: '/stock_history_report', name: 'stock_history_report', component: StockInStockOutReport, meta: { permission: 'book stock history:read' } },
                { path: '/student_complete_payment_report', name: 'student_complete_payment_report', component: StudentCompletePaymentReport, meta: { permission: 'student complete payment report:read' } },
                { path: '/teacher_attendance_report', name: 'teacher_attendance_report', component: TeacherAttendanceReport, meta: { permission: 'teacher attendance report:read' } },
                { path: '/teacher_permission_report', name: 'teacher_permission_report', component: TeacherPermissionReport, meta: { permission: 'teacher permission report:read' } },
                { path: '/promote_student_report', name: 'promote_student_report', component: PromoteStudentReport, meta: { permission: 'promote student report:read' } },
                { path: '/student_permission_report', name: 'student_permission_report', component: StudentPermissionReport, meta: { permission: 'student permission report:read' } },
                // Settings
                { path: '/discount', name: 'discount', component: Discount, meta: { permission: 'discount:read' } },
                { path: '/users', name: 'users', component: Users, meta: { permission: 'user management:read' } },
                { path: '/resetpassword', name: 'resetpassword', component: ResetPassword, meta: { permission: 'reset password:update' } },
                { path: '/holiday', name: 'holiday', component: Holiday, meta: { permission: 'school holidays:read' } },
                { path: '/schoolinfo', name: 'schoolinfo', component: SchoolInfo, meta: { permission: 'school info:update' } },
                { path: '/profile', name: 'profile', component: Profile } // Accessible to all logged-in users
            ]
        },
        // Public pages (no layout)
        { path: '/reset-password/:token', name: 'resetPassword', component: ResetPasswordForm },
        { path: '/print_invoice/:id', name: 'invoice_invoice', component: CourseInvoice },
        { path: '/book-invoice/:id', name: 'book-invoice', component: BookInvoice },
        { path: '/landing', name: 'landing', component: () => import('@/views/pages/Landing.vue') },
        { path: '/auth/login', name: 'login', component: () => import('@/views/pages/auth/Login.vue') },
        { path: '/auth/register', name: 'register', component: Registration },
        // Error pages
        { path: '/auth/access', name: 'accessDenied', component: () => import('@/views/pages/auth/Access.vue') },
        { path: '/auth/error', name: 'error', component: () => import('@/views/pages/auth/Error.vue') },
        { path: '/:pathMatch(.*)*', name: 'notfound', component: () => import('@/views/pages/NotFound.vue') }
    ]
});

// Navigation Guard
router.beforeEach((to, from, next) => {
    const publicPages = ['/auth/login', '/auth/register', '/landing'];

    // --- FIX: Check if the path is the reset password route ---
    const isResetPasswordRoute = to.path.startsWith('/reset-password');

    // An auth token is required if the page is not public AND it's not the reset password route
    const authRequired = !publicPages.includes(to.path) && !isResetPasswordRoute;

    const loggedIn = localStorage.getItem('authToken');
    const userStore = useUserStore();

    // Initialize user from localStorage if not already in store
    if (loggedIn && !userStore.user) {
        const storedUser = localStorage.getItem('authUser');
        if (storedUser) {
            userStore.setUser(JSON.parse(storedUser));
        }
    }

    // Redirect to login if trying to access a restricted page without being logged in
    if (authRequired && !loggedIn) {
        return next('/auth/login');
    }

    // If the route requires a permission check
    if (to.meta.permission) {
        // Allow superadmin access to everything
        if (userStore.isSuperadmin) {
            return next();
        }
        // Check if the user has the required permission
        if (userStore.hasPermission(to.meta.permission)) {
            return next();
        } else {
            // Redirect to access denied page if permission is not granted
            return next('/auth/access');
        }
    }

    // For all other cases, allow navigation
    next();
});

export default router;
