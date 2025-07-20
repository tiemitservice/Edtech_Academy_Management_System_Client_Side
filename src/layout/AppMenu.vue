<template>
    <ul class="layout-menu !z-20 hidden-print">
        <div class="size-40 overflow-hidden mx-auto">
            <img class="object-contain" :src="data && data.length > 0 ? data[0].image : ''" alt="Company Logo" />
        </div>
        <div class="w-full flex items-center justify-center">
            <span class="font-semibold text-primary px-2 text-center">
                {{ data && data.length > 0 ? data[0].name : '' }}
            </span>
        </div>
        <div class="mt-14">
            <template v-for="(item, i) in model" :key="item">
                <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
                <li v-if="item.separator" class="menu-separator"></li>
            </template>
        </div>
    </ul>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'; // Import computed
import { useI18n } from 'vue-i18n';
import AppMenuItem from './AppMenuItem.vue';
import { useUserStore } from '@/store/useUserStore';
import { useFetch } from '@/composible/useFetch';

const { t } = useI18n();
const { data, fetchData } = useFetch('companies');

onMounted(async () => {
    await fetchData();
});
const userStore = useUserStore();

// Wrap the model definition in a computed property
const model = computed(() =>
    [
        {
            label: t('menu.home'),
            items: [{ label: t('menu.dashboard'), icon: 'pi pi-fw pi-home', to: '/' }]
        },
        // Academic Section
        (userStore.isSuperadmin ||
            userStore.hasPermission('classes:read') ||
            userStore.hasPermission('class transaction:read') ||
            userStore.hasPermission('sessions:read') ||
            userStore.hasPermission('subjects:read') ||
            userStore.hasPermission('class schedule:read') ||
            userStore.hasPermission('assign teacher to class:update') ||
            userStore.hasPermission('assign student to class:update') ||
            userStore.hasPermission('feedback:read')) && {
            label: t('menu.academic'),
            items: [
                (userStore.isSuperadmin || userStore.hasPermission('classes:read')) && { label: t('menu.classes'), icon: 'pi pi-book', to: '/class' },
                (userStore.isSuperadmin || userStore.hasPermission('class transaction:read')) && { label: t('menu.class_transaction'), icon: 'pi pi-bookmark', to: '/class_transaction' },
                (userStore.isSuperadmin || userStore.hasPermission('sessions:read')) && { label: t('menu.sessions'), icon: 'pi pi-clock', to: '/section' },
                (userStore.isSuperadmin || userStore.hasPermission('subjects:read')) && { label: t('menu.subjects'), icon: 'pi pi-book', to: '/subject' },
                (userStore.isSuperadmin || userStore.hasPermission('class schedule:read')) && { label: t('menu.class_schedule'), icon: 'pi pi-calendar', to: '/schedulelist' },
                (userStore.isSuperadmin || userStore.hasPermission('assign teacher to class:update')) && { label: t('menu.assign_teacher_to_class'), icon: 'pi pi-user-plus', to: '/assign_teacher_to_class' },
                (userStore.isSuperadmin || userStore.hasPermission('assign student to class:update')) && { label: t('menu.assign_student_to_class'), icon: 'pi pi-user-plus', to: '/assign_student_to_class' },
                (userStore.isSuperadmin || userStore.hasPermission('feedback:read')) && { label: t('menu.feedback'), icon: 'pi pi-comment', to: '/feedback' }
            ].filter(Boolean)
        },
        // Students Section
        (userStore.isSuperadmin ||
            userStore.hasPermission('student list:read') ||
            userStore.hasPermission('student category:read') ||
            userStore.hasPermission('student attendance:read') ||
            userStore.hasPermission('student scores:read') ||
            userStore.hasPermission('student permission:read') ||
            userStore.hasPermission('student class info:read') ||
            userStore.hasPermission('student class history:read')) && {
            label: t('menu.students'),
            items: [
                (userStore.isSuperadmin || userStore.hasPermission('student list:read')) && { label: t('menu.student_list'), icon: 'pi pi-users', to: '/studentlist' },
                (userStore.isSuperadmin || userStore.hasPermission('student category:read')) && { label: t('menu.student_category'), icon: 'pi pi-bookmark', to: '/student_category' },
                (userStore.isSuperadmin || userStore.hasPermission('student attendance:read')) && { label: t('menu.student_attendance'), icon: 'pi pi-calendar-check', to: '/student_attendance' },
                (userStore.isSuperadmin || userStore.hasPermission('student scores:read')) && { label: t('menu.student_scores'), icon: 'pi pi-chart-line', to: '/student_score' },
                (userStore.isSuperadmin || userStore.hasPermission('student permission:read')) && { label: t('menu.student_permission'), icon: 'pi pi-envelope-open', to: '/studentpermission' },
                (userStore.isSuperadmin || userStore.hasPermission('student class info:read')) && { label: t('menu.student_class_info'), icon: 'pi pi-info-circle', to: '/studentclassinfo' },
                (userStore.isSuperadmin || userStore.hasPermission('student class history:read')) && { label: t('menu.student_class_history'), icon: 'pi pi-history', to: '/student_class_history' }
            ].filter(Boolean)
        },
        // Teacher Section
        (userStore.isSuperadmin ||
            userStore.hasPermission('teachers:read') ||
            userStore.hasPermission('teacher attendance:read') ||
            userStore.hasPermission('teacher permission:read') ||
            userStore.hasPermission('departments:read') ||
            userStore.hasPermission('positions:read')) && {
            label: t('menu.teacher'),
            items: [
                (userStore.isSuperadmin || userStore.hasPermission('teachers:read')) && { label: t('menu.teachers'), icon: 'pi pi-user', to: '/staff' },
                (userStore.isSuperadmin || userStore.hasPermission('teacher attendance:read')) && { label: t('menu.teacher_attendance'), icon: 'pi pi-calendar-check', to: '/staff_attendance' },
                (userStore.isSuperadmin || userStore.hasPermission('teacher permission:read')) && { label: t('menu.teacher_permission'), icon: 'pi pi-envelope-open', to: '/staffpermission' },
                (userStore.isSuperadmin || userStore.hasPermission('departments:read')) && { label: t('menu.departments'), icon: 'pi pi-sitemap', to: '/department' },
                (userStore.isSuperadmin || userStore.hasPermission('positions:read')) && { label: t('menu.positions'), icon: 'pi pi-briefcase', to: '/posistion' }
            ].filter(Boolean)
        },
        // Book Section
        (userStore.isSuperadmin || userStore.hasPermission('book list:read') || userStore.hasPermission('book categories:read')) && {
            label: t('menu.book'),
            items: [
                (userStore.isSuperadmin || userStore.hasPermission('book list:read')) && { label: t('menu.book_list'), icon: 'pi pi-book', to: '/book' },
                (userStore.isSuperadmin || userStore.hasPermission('book categories:read')) && { label: t('menu.book_categories'), icon: 'pi pi-tags', to: '/bookcategory' }
            ].filter(Boolean)
        },
        // Finance Section
        (userStore.isSuperadmin ||
            userStore.hasPermission('student payments tracking:read') ||
            userStore.hasPermission('course invoice:read') ||
            userStore.hasPermission('course payment transactions:read') ||
            userStore.hasPermission('book payment:read') ||
            userStore.hasPermission('book payment transactions:read')) && {
            label: t('menu.finance'),
            items: [
                (userStore.isSuperadmin || userStore.hasPermission('student payments tracking:read')) && { label: t('menu.student_payments_tracking'), icon: 'pi pi-money-bill', to: '/studentpayment' },
                (userStore.isSuperadmin || userStore.hasPermission('course invoice:read')) && { label: t('menu.student_payments_transactions'), icon: 'pi pi-file', to: '/courinvoicelist' },
                (userStore.isSuperadmin || userStore.hasPermission('book payment:read')) && { label: t('menu.book_payment'), icon: 'pi pi-credit-card', to: '/bookpayment' },
                (userStore.isSuperadmin || userStore.hasPermission('book payment transactions:read')) && { label: t('menu.book_payment_transactions'), icon: 'pi pi-minus-circle', to: '/bookpayment_transaction' }
            ].filter(Boolean)
        },
        // Student Report Section
        (userStore.isSuperadmin ||
            userStore.hasPermission('student score report:read') ||
            userStore.hasPermission('mark class report:read') ||
            userStore.hasPermission('re-mark class report:read') ||
            userStore.hasPermission('student attendance report:read') ||
            userStore.hasPermission('promote student report:read') ||
            userStore.hasPermission('student permission report:read')) && {
            label: t('menu.student_report'),
            items: [
                (userStore.isSuperadmin || userStore.hasPermission('student score report:read')) && { label: t('menu.student_score_report'), icon: 'pi pi-chart-line', to: '/score_report' },
                (userStore.isSuperadmin || userStore.hasPermission('mark class report:read')) && { label: t('menu.mark_class_report'), icon: 'pi pi-chart-line', to: '/mark_class_report' },
                (userStore.isSuperadmin || userStore.hasPermission('student attendance report:read')) && { label: t('menu.student_attendance_report'), icon: 'pi pi-calendar-check', to: '/attendance_report' },
                (userStore.isSuperadmin || userStore.hasPermission('promote student report:read')) && { label: t('menu.promote_student_report'), icon: 'pi pi-envelope-open', to: '/promote_student_report' },
                (userStore.isSuperadmin || userStore.hasPermission('student permission report:read')) && { label: t('menu.student_permission_report'), icon: 'pi pi-envelope-open', to: '/student_permission_report' }
            ].filter(Boolean)
        },
        // Teacher Report Section
        (userStore.isSuperadmin || userStore.hasPermission('teacher attendance report:read') || userStore.hasPermission('teacher permission report:read')) && {
            label: t('menu.teacher_report'),
            items: [
                (userStore.isSuperadmin || userStore.hasPermission('teacher attendance report:read')) && { label: t('menu.teacher_attendance_report'), icon: 'pi pi-calendar-check', to: '/teacher_attendance_report' },
                (userStore.isSuperadmin || userStore.hasPermission('teacher permission report:read')) && { label: t('menu.teacher_permission_report'), icon: 'pi pi-envelope-open', to: '/teacher_permission_report' }
            ].filter(Boolean)
        },
        // Payment Report Section
        (userStore.isSuperadmin ||
            userStore.hasPermission('student payment report:read') ||
            userStore.hasPermission('student complete payment report:read') ||
            userStore.hasPermission('book payment report:read') ||
            userStore.hasPermission('book stock history:read')) && {
            label: t('menu.payment_report'),
            items: [
                (userStore.isSuperadmin || userStore.hasPermission('student payment report:read')) && { label: t('menu.student_payment_report'), icon: 'pi pi-chart-line', to: '/student_payment_report' },
                (userStore.isSuperadmin || userStore.hasPermission('book payment report:read')) && { label: t('menu.book_payment_report'), icon: 'pi pi-chart-line', to: '/book_payment_report' },
                (userStore.isSuperadmin || userStore.hasPermission('book stock history:read')) && { label: t('menu.book_stock_history'), icon: 'pi pi-chart-line', to: '/stock_history_report' }
            ].filter(Boolean)
        },
        // Settings Section
        (userStore.isSuperadmin ||
            userStore.hasPermission('discount:read') ||
            userStore.hasPermission('user management:read') ||
            userStore.hasPermission('reset password:update') ||
            userStore.hasPermission('school holidays:read') ||
            userStore.hasPermission('school info:update')) && {
            label: t('menu.settings'),
            items: [
                (userStore.isSuperadmin || userStore.hasPermission('discount:read')) && { label: t('menu.discount'), icon: 'pi pi-percent', to: '/discount' },
                (userStore.isSuperadmin || userStore.hasPermission('user management:read')) && { label: t('menu.user_management'), icon: 'pi pi-users', to: '/users' },
                (userStore.isSuperadmin || userStore.hasPermission('reset password:update')) && { label: t('menu.reset_password'), icon: 'pi pi-key', to: '/resetpassword' },
                (userStore.isSuperadmin || userStore.hasPermission('school holidays:read')) && { label: t('menu.school_holidays'), icon: 'pi pi-calendar-times', to: '/holiday' },
                (userStore.isSuperadmin || userStore.hasPermission('school info:update')) && { label: t('menu.school_info'), icon: 'pi pi-info-circle', to: '/schoolinfo' }
            ].filter(Boolean)
        }
    ].filter(Boolean)
);
</script>

<style lang="scss" scoped></style>
