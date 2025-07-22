<template>
    <div class="layout-topbar hidden-print">
        <div class="layout-topbar-logo-container flex items-center">
            <button class="layout-menu-button layout-topbar-action" @click="toggleMenu">
                <i class="pi pi-bars"></i>
            </button>
            <router-link to="/" class="layout-topbar-logo">
                <div class="text-center">
                    <p class="font-semibold text-primary text-2xl">{{ data && data.length > 0 ? data[0].name : 'School Name' }}</p>
                </div>
            </router-link>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content flex items-center gap-2">
                    <!-- Language Switcher -->
                    <Button rounded severity="secondary" v-tooltip="{ value: 'Confirm to proceed', showDelay: 1000, hideDelay: 300 }" @click="toggleFullScreen" class="rounded-full overflow-hidden !size-10">
                        <i :class="['text-2xl', isFullscreen ? 'pi pi-window-maximize' : 'pi pi-expand']"></i>
                    </Button>
                    <Select v-model="selectedLanguage" :options="languages" optionLabel="name" @change="changeLanguage" class="w-40" placeholder="Select a Language">
                        <template #value="slotProps">
                            <div v-if="slotProps.value" class="flex items-center">
                                <span v-html="slotProps.value.icon" class="mr-2 flex items-center"></span>
                                <div>{{ slotProps.value.name }}</div>
                            </div>
                            <span v-else>
                                {{ slotProps.placeholder }}
                            </span>
                        </template>
                        <template #option="slotProps">
                            <div class="flex items-center">
                                <span v-html="slotProps.option.icon" class="mr-2 flex items-center"></span>
                                <div>{{ slotProps.option.name }}</div>
                            </div>
                        </template>
                    </Select>

                    <!-- Fullscreen Toggle Button -->

                    <span class="font-semibold text-primary px-2">
                        {{ user?.name }}
                    </span>

                    <router-link to="/profile" class="layout-topbar-action rounded-full overflow-hidden !size-10 flex items-center justify-center">
                        <img v-if="user?.image" :src="user.image" alt="User Profile" class="w-full h-full object-cover" />
                        <div v-else class="rounded-full border size-10 border-primary flex items-center justify-center">
                            <i class="pi pi-user size-5 object-cover"></i>
                        </div>
                    </router-link>

                    <Button plain @click="handleLogout" class="rounded-full overflow-hidden !size-10">
                        <i class="pi pi-sign-out text-2xl"></i>
                    </Button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useLayout } from '@/layout/composables/layout';
import useAuth from '@/composible/useAuth';
import { useRouter } from 'vue-router';
import { useFetch } from '@/composible/useFetch';
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { data, fetchData } = useFetch('companies');
const { toggleMenu } = useLayout();
const { user, logout } = useAuth();
const router = useRouter();
const { locale } = useI18n();

const handleLogout = () => {
    logout();
    router.push('/auth/login');
};

// --- Language Switcher Logic ---
const languages = ref([
    {
        name: 'English',
        code: 'en',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><rect x="1" y="4" width="30" height="24" rx="4" ry="4" fill="#071b65"></rect><path d="M5.101,4h-.101c-1.981,0-3.615,1.444-3.933,3.334L26.899,28h.101c1.981,0,3.615-1.444,3.933-3.334L5.101,4Z" fill="#fff"></path><path d="M22.25,19h-2.5l9.934,7.947c.387-.353,.704-.777,.929-1.257l-8.363-6.691Z" fill="#b92932"></path><path d="M1.387,6.309l8.363,6.691h2.5L2.316,5.053c-.387,.353-.704,.777-.929,1.257Z" fill="#b92932"></path><path d="M5,28h.101L30.933,7.334c-.318-1.891-1.952-3.334-3.933-3.334h-.101L1.067,24.666c.318,1.891,1.952,3.334,3.933,3.334Z" fill="#fff"></path><rect x="13" y="4" width="6" height="24" fill="#fff"></rect><rect x="1" y="13" width="30" height="6" fill="#fff"></rect><rect x="14" y="4" width="4" height="24" fill="#b92932"></rect><rect x="14" y="1" width="4" height="30" transform="translate(32) rotate(90)" fill="#b92932"></rect><path d="M28.222,4.21l-9.222,7.376v1.414h.75l9.943-7.94c-.419-.384-.918-.671-1.471-.85Z" fill="#b92932"></path><path d="M2.328,26.957c.414,.374,.904,.656,1.447,.832l9.225-7.38v-1.408h-.75L2.328,26.957Z" fill="#b92932"></path><path d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z" opacity=".15"></path><path d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z" fill="#fff" opacity=".2"></path></svg>'
    },
    {
        name: 'ភាសាខ្មែរ',
        code: 'km',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><path fill="#ce2c2d" d="M1 8H31V24H1z"></path><path d="M5,4H27c2.208,0,4,1.792,4,4v2H1v-2c0-2.208,1.792-4,4-4Z" fill="#0f299c"></path><path d="M5,22H27c2.208,0,4,1.792,4,4v2H1v-2c0-2.208,1.792-4,4-4Z" transform="rotate(180 16 25)" fill="#0f299c"></path><path d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z" opacity=".15"></path><path d="M23,19.56h-.349v-.676h-.349v-.577h-.347v-.435h-.207v-.337c-1.181,.12-.041-2.08-.268-2.706-.088-.009-.162,.047-.201,.106,.061-.16-.094-.609-.184-.242h-.181v-.487c-.454,.425-.108,.088-.26-.33-.01,.067-.09,.196-.123,.185,.068-.165,.156-.285,.036-.509-.147,.466,.042-.047-.102-.253-.007,.054-.06,.209-.069,.197,.05-.796-.769-.795-.718,0-.009,.012-.062-.143-.069-.197-.143,.206,.045,.719-.102,.253-.121,.225-.033,.344,.036,.509-.033,.011-.113-.117-.123-.184-.152,.419,.194,.755-.26,.33v.852h-.219c.024-.097-.19-.093-.159,.002h-1.3l.002-.783c-.201,.078-.192,.183-.189,.307-.227,.098-.265-.318-.043-.304v-.323c-.041,.009-.158,.007-.262,.165v-.082c-.137-.012-.138,.117-.141,.367h-.036c-.098-.348,.306-.505,.096-.845-.337,.542,.262-.405-.03-.57-.267,.722,.085-.266-.144-.401-.175,.661,.045-.217-.104-.27-.232,.429,.065-.11-.094-.215-.166,.279-.063-.112-.049-.184h-.062l.022-.171h-.079l.019-.142h-.137l.013-.144h-.125c.031-.286-.322-.285-.292,0h-.125l.013,.144h-.137l.019,.142h-.079l.022,.171h-.061c.01,.067,.107,.463-.049,.184-.157,.11,.136,.646-.096,.208-.149,.101,.081,.885-.102,.277-.229,.134,.123,1.124-.144,.401-.292,.164,.307,1.112-.03,.57-.21,.341,.195,.498,.096,.845h-.017c-.001-.267,0-.377-.149-.367v.081c-.104-.156-.22-.154-.261-.164v.323c.218-.019,.188,.401-.034,.304,.006-.127,.003-.227-.197-.306v.783h-1.297c.031-.095-.183-.099-.159-.002h-.218v-.852c-.454,.425-.108,.088-.26-.33-.01,.067-.09,.196-.123,.184,.068-.165,.156-.285,.036-.509-.146,.466,.042-.047-.102-.253-.007,.054-.06,.209-.069,.197,.05-.796-.769-.795-.718,0-.009,.012-.062-.143-.069-.197-.143,.206,.045,.719-.102,.253-.121,.225-.032,.344,.036,.509-.033,.011-.113-.117-.123-.185-.152,.419,.194,.755-.26,.33v.487h-.181c-.09-.368-.245,.083-.184,.242-.039-.058-.114-.115-.201-.106-.227,.626,.914,2.824-.269,2.706v.337h-.207v.438l-.347-.003v.578h-.349v.676s-.349,0-.349,0v.724h2.493c.235,0,.683,0,.918,0h0s3.131,0,3.131,0h0c.235,0,.683,0,.918,0h0s3.125,0,3.125,0h0c.235,0,.683,0,.918,0h0s2.499,0,2.499,0v-.724Z" fill="#fff"></path><path d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z" fill="#fff" opacity=".2"></path></svg>'
    }
]);
const selectedLanguage = ref(languages.value.find((l) => l.code === locale.value));

const changeLanguage = (event) => {
    const newLang = event.value;
    if (newLang) {
        locale.value = newLang.code;
        localStorage.setItem('preferredLanguage', newLang.code);
    }
};

// --- Fullscreen Toggle Logic ---
const isFullscreen = ref(false);

const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((err) => {
            alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
};

// This function updates the state when fullscreen changes (e.g., by pressing Esc)
const onFullScreenChange = () => {
    isFullscreen.value = !!document.fullscreenElement;
};

// --- Lifecycle Hooks ---
onMounted(async () => {
    await fetchData();
    const savedLangCode = localStorage.getItem('preferredLanguage') || 'en';
    const savedLang = languages.value.find((l) => l.code === savedLangCode);
    if (savedLang) {
        selectedLanguage.value = savedLang;
        locale.value = savedLang.code;
    }
    // Add event listener for fullscreen changes
    document.addEventListener('fullscreenchange', onFullScreenChange);
});

onBeforeUnmount(() => {
    // Clean up the event listener when the component is destroyed
    document.removeEventListener('fullscreenchange', onFullScreenChange);
});
</script>

<style lang="scss" scoped>
/* Add any additional styles if needed */
</style>
