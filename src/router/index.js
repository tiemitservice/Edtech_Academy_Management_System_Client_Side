import AppLayout from '@/layout/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';
import Staff from '@/views/Staff.vue';
import Class from '@/views/Class.vue';
import Section from '@/views/Section.vue';
import Profile from '@/form/Profile.vue';
import Room from '@/views/Room.vue';
import StudentList from '@/views/StudentList.vue';
// app

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
// inventory
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

// report

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

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue')
                },

                {
                    path: '/staff',
                    name: 'staff',
                    component: Staff
                },
                {
                    path: '/class',
                    name: 'class',
                    component: Class
                },
                {
                    path: '/section',
                    name: 'section',
                    component: Section
                },
                {
                    path: '/profile',
                    name: 'profile',
                    component: Profile
                },
                {
                    path: '/room',
                    name: 'room',
                    component: Room
                },
                {
                    path: '/studentlist',
                    name: 'studentlist',
                    component: StudentList
                },
                {
                    path: '/studentclassinfo',
                    name: 'studentclassinfo',
                    component: StudentClassInfo
                },
                {
                    path: '/users',
                    name: 'users',
                    component: Users
                },
                {
                    path: '/department',
                    name: 'department',
                    component: Department
                },
                {
                    path: '/subject',
                    name: 'subject',
                    component: Subject
                },
                {
                    path: '/posistion',
                    name: 'posistion',
                    component: Posistion
                },
                {
                    path: '/studentpayment',
                    name: 'studentpayment',
                    component: StudentPayment
                },
                {
                    path: '/assign_teacher_to_class',
                    name: 'assign_teacher_to_class',
                    component: AssignTeacherToClass
                },
                {
                    path: '/assign_student_to_class',
                    name: 'assign_student_to_class',
                    component: AssigneStudentToClass
                },
                {
                    path: '/assign_student_to_teacher',
                    name: 'assign_student_to_teacher',
                    component: AssigneStudentToTeacher
                },
                {
                    path: '/class_transaction',
                    name: 'class_transaction',
                    component: ClassTransaction
                },
                {
                    name: 'schedulelist',
                    path: '/schedulelist',
                    component: ScheduleList
                },
                {
                    name: 'staffpermission',
                    path: '/staffpermission',
                    component: StaffPermission
                },
                {
                    path: '/studentpermission',
                    name: 'studentpermission',
                    component: StudentPermission
                },
                {
                    path: '/staff_attendance',
                    name: 'staffattendance',
                    component: StaffAttendance
                },
                {
                    path: '/student_attendance',
                    name: 'studentattendance',
                    component: StudentAttendance
                },
                {
                    path: '/student_score',
                    name: 'studentscore',
                    component: StudentScore
                },
                {
                    path: '/student_category',
                    name: 'studentcategory',
                    component: StudentCategory
                },
                {
                    path: '/student_class_history',
                    name: 'studentclasshistory',
                    component: StudentClassHistory
                },
                {
                    path: '/book',
                    name: 'book',
                    component: Book
                },
                {
                    path: '/bookcategory',
                    name: 'bookcategory',
                    component: BookCategory
                },
                {
                    path: '/resetpassword',
                    name: 'resetpassword',
                    component: ResetPassword
                },
                {
                    path: '/schoolinfo',
                    name: 'schoolinfo',
                    component: SchoolInfo
                },
                {
                    path: '/courinvoicelist',
                    name: 'courinvoicelist',
                    component: CourInvoiceList
                },
                {
                    path: '/courseinvoice_transaction',
                    name: 'courseinvoice_transaction',
                    component: CourseInvoceTransaction
                },
                {
                    path: '/bookpayment',
                    name: 'bookpayment',
                    component: BookPayment
                },

                {
                    path: '/bookpayment_transaction',
                    name: 'bookpayment_transaction',
                    component: BookPaymentTransaction
                },
                {
                    path: '/discount',
                    name: 'discount',
                    component: Discount
                },
                // report

                {
                    path: '/score_report',
                    name: 'score_report',
                    component: StudentScoreReport
                },
                {
                    path: '/mark_class_report',
                    name: 'mark_class_report',
                    component: MarkClassReport
                },
                {
                    component: ReMarkClassReport,
                    path: '/re_mark_report',
                    name: 're_mark_report'
                },
                {
                    component: AttendanceReport,
                    path: '/attendance_report',
                    name: 'attendance_report'
                },
                {
                    component: BookPaymentReport,
                    path: '/book_payment_report',
                    name: 'book_payment_report'
                },
                {
                    component: StudentPaymentReport,
                    path: '/student_payment_report',
                    name: 'student_payment_report'
                },
                {
                    component: StockInStockOutReport,
                    path: '/stock_history_report',
                    name: 'stock_history_report'
                },
                {
                    component: StudentCompletePaymentReport,
                    path: '/student_complete_payment_report',
                    name: 'student_complete_payment_report'
                },
                {
                    component: TeacherAttendanceReport,
                    path: '/teacher_attendance_report',
                    name: 'teacher_attendance_report'
                },
                {
                    component: TeacherPermissionReport,
                    path: '/teacher_permission_report',
                    name: 'teacher_permission_report'
                },
                {
                    component: PromoteStudentReport,
                    path: '/promote_student_report',
                    name: 'promote_student_report'
                },
                {
                    component: StudentPermissionReport,
                    path: '/student_permission_report',
                    name: 'student_permission_report'
                },
                {
                    component: Holiday,
                    path: '/holiday',
                    name: 'holiday'
                }
                // {
                //     path: '/student_mode',
                //     name: 'student_mode',
                //     redirect: '/studentprofile',
                //     component: StudentMode,
                //     children: [
                //         {
                //             path: '/studentprofile',
                //             name: 'studentprofile',
                //             component: StudentProfile
                //         }
                //     ]
                // },
                // {
                //     path: '/app',
                //     name: 'app',
                //     component: AdminDashbord,
                //     children: [
                //         {
                //             path: 'teacherprofile',
                //             name: 'teacherprofile',
                //             component: TeacherProfile
                //         },
                //         {
                //             path: 'teacherrequest',
                //             name: 'teacherrequest',
                //             component: TeacherRequest
                //         },
                //         {
                //             path: 'teacherclasses',
                //             name: 'teacherclasses',
                //             component: TeacherClasses
                //         },
                //         {
                //             path: 'examination',
                //             name: 'examination',
                //             component: Examination
                //         }
                //     ]
                // }
            ]
        },
        {
            path: '/print_invoice/:id',
            name: 'invoice_invoice',
            component: CourseInvoice
        },
        {
            path: '/book-invoice/:id',
            name: 'book-invoice',
            component: BookInvoice
        },
        {
            path: '/landing',
            name: 'landing',
            component: () => import('@/views/pages/Landing.vue')
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        },
        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        }
        // app router
    ]
});

export default router;

// {
//     path: '/uikit/formlayout',
//     name: 'formlayout',
//     component: () => import('@/views/uikit/FormLayout.vue')
// },
// {
//     path: '/uikit/input',
//     name: 'input',
//     component: () => import('@/views/uikit/InputDoc.vue')
// },
// {
//     path: '/uikit/button',
//     name: 'button',
//     component: () => import('@/views/uikit/ButtonDoc.vue')
// },
// {
//     path: '/uikit/table',
//     name: 'table',
//     component: () => import('@/views/uikit/TableDoc.vue')
// },
// {
//     path: '/uikit/list',
//     name: 'list',
//     component: () => import('@/views/uikit/ListDoc.vue')
// },
// {
//     path: '/uikit/tree',
//     name: 'tree',
//     component: () => import('@/views/uikit/TreeDoc.vue')
// },
// {
//     path: '/uikit/panel',
//     name: 'panel',
//     component: () => import('@/views/uikit/PanelsDoc.vue')
// },

// {
//     path: '/uikit/overlay',
//     name: 'overlay',
//     component: () => import('@/views/uikit/OverlayDoc.vue')
// },
// {
//     path: '/uikit/media',
//     name: 'media',
//     component: () => import('@/views/uikit/MediaDoc.vue')
// },
// {
//     path: '/uikit/message',
//     name: 'message',
//     component: () => import('@/views/uikit/MessagesDoc.vue')
// },
// {
//     path: '/uikit/file',
//     name: 'file',
//     component: () => import('@/views/uikit/FileDoc.vue')
// },
// {
//     path: '/uikit/menu',
//     name: 'menu',
//     component: () => import('@/views/uikit/MenuDoc.vue')
// },
// {
//     path: '/uikit/charts',
//     name: 'charts',
//     component: () => import('@/views/uikit/ChartDoc.vue')
// },
// {
//     path: '/uikit/misc',
//     name: 'misc',
//     component: () => import('@/views/uikit/MiscDoc.vue')
// },
// {
//     path: '/uikit/timeline',
//     name: 'timeline',
//     component: () => import('@/views/uikit/TimelineDoc.vue')
// },
// {
//     path: '/pages/empty',
//     name: 'empty',
//     component: () => import('@/views/pages/Empty.vue')
// },
// {
//     path: '/pages/crud',
//     name: 'crud',
//     component: () => import('@/views/pages/Crud.vue')
// },
// {
//     path: '/documentation',
//     name: 'documentation',
//     component: () => import('@/views/pages/Documentation.vue')
// },
