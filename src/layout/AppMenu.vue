<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';
import { useUserStore } from '@/store/useUserStore';

const userStore = useUserStore();
const model = ref([
    {
        label: 'Home',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
    },
    {
        label: 'Academic',
        items: [
            { label: 'Classes', icon: 'pi pi-book', to: '/class' },
            { label: 'Class Transaction', icon: 'pi pi-bookmark', to: '/class_transaction' },
            { label: 'Sessions', icon: 'pi pi-clock', to: '/section' },
            { label: 'Subjects', icon: 'pi pi-book', to: '/subject' },
            { label: 'Class Schedule', icon: 'pi pi-calendar', to: '/schedulelist' },
            { label: 'Assign Teacher to Class', icon: 'pi pi-user-plus', to: '/assign_teacher_to_class' },
            { label: 'Assign Student to Class', icon: 'pi pi-user-plus', to: '/assign_student_to_class' },
            { label: 'Assign Student to Teacher', icon: 'pi pi-user-plus', to: '/assign_student_to_teacher' }
        ]
    },
    {
        label: 'Students',
        items: [
            userStore.hasPermission('student:read') && {
                label: 'Student List',
                icon: 'pi pi-users',
                to: '/studentlist'
            },
            userStore.hasPermission('student attendance:read') && {
                label: 'Student Attendance',
                icon: 'pi pi-calendar-check',
                to: '/student_attendance'
            },
            userStore.hasPermission('student scores:read') && {
                label: 'Student Scores',
                icon: 'pi pi-chart-line',
                to: '/student_score'
            },
            userStore.hasPermission('student permission:read') && {
                label: 'Student Permission',
                icon: 'pi pi-envelope-open',
                to: '/studentpermission'
            },
            userStore.hasPermission('student class info:read') && {
                label: 'Student Class Info',
                icon: 'pi pi-info-circle',
                to: '/studentclassinfo'
            },
            userStore.hasPermission('student class history:read') && {
                label: 'Student Class History',
                icon: 'pi pi-history',
                to: '/student_class_history'
            },
            userStore.hasPermission('student payments:read') && {
                label: 'Student Payments',
                icon: 'pi pi-wallet',
                to: '/studentpayment'
            }
        ].filter(Boolean) // ✅ Removes any `false` items
    },
    {
        label: 'Staff',
        items: [
            { label: 'Teachers', icon: 'pi pi-user', to: '/staff' },
            { label: 'Teacher Attendance', icon: 'pi pi-calendar-check', to: '/staff_attendance' },
            { label: 'Teacher Permission', icon: 'pi pi-envelope-open', to: '/staffpermission' },
            { label: 'Departments', icon: 'pi pi-sitemap', to: '/department' },
            { label: 'Positions', icon: 'pi pi-briefcase', to: '/posistion' }
        ]
    },
    {
        label: 'Inventory',
        items: [
            { label: 'Books', icon: 'pi pi-book', to: '/book' },
            { label: 'Book Categories', icon: 'pi pi-tags', to: '/bookcategory' }
        ]
    },
    {
        label: 'Finance',
        items: [
            { label: 'Student Payments', icon: 'pi pi-money-bill', to: '/studentpayment' },
            { label: 'Expenses', icon: 'pi pi-minus-circle', to: '/expense' },
            { label: 'Income', icon: 'pi pi-plus-circle', to: '/income' },
            { label: 'Payment Transactions', icon: 'pi pi-credit-card', to: '/payment_transaction' }
        ]
    },
    {
        label: 'Settings',
        items: [
            { label: 'User Management', icon: 'pi pi-users', to: '/users' },
            { label: 'Reset Password', icon: 'pi pi-key', to: '/resetpassword' },
            { label: 'School Holidays', icon: 'pi pi-calendar-times', to: '/holiday' }
        ]
    }
]);
</script>

<template>
    <ul class="layout-menu !z-20 hidden-print">
        <div class="size-48 overflow-hidden mx-auto">
            <img class="w-full h-full" src="../assets/logo.png" alt="" />
        </div>

        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
