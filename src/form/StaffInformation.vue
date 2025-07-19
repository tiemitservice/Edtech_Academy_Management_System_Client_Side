<template>
    <div>
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">Student Details</label>
            <Button icon="pi pi-times" size="small" severity="danger" @click="$emit('close')" rounded aria-label="Close" />
        </div>

        <div class="p-4 h-[90vh] overflow-y-auto">
            <div class="grid grid-cols-1 gap-4">
                <div class="bg-white dark:bg-gray-800 p-6">
                    <div class="mb-4">
                        <img class="w-32 h-32 object-cover rounded-full mx-auto" :src="datatoedit?.image || 'https://placehold.co/128'" :alt="datatoedit?.en_name" />
                    </div>
                    <p class="text-center font-semibold">{{ datatoedit?.en_name }}</p>
                </div>
                <div class="w-full border rounded-lg p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <!-- Personal Information -->
                    <div class="p-4 border rounded-lg">
                        <h4 class="font-semibold mb-3">{{ $t('student.personal_information') }}</h4>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('staff.eng_name') }}:</label>
                            <p>{{ datatoedit?.en_name }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('staff.kh_name') }}:</label>
                            <p>{{ datatoedit?.kh_name }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('staff.gender') }}:</label>
                            <p v-if="datatoedit?.gender">{{ datatoedit.gender }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('staff.date_of_birth') }}:</label>
                            <p>{{ formatDate2(datatoedit?.dob) }}</p>
                        </div>
                    </div>

                    <!-- Contact Information -->
                    <div class="p-4 border rounded-lg">
                        <h4 class="font-semibold mb-3">{{ $t('staff.contact_information') }}</h4>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('staff.phone_number') }}:</label>
                            <p>{{ datatoedit?.phoneNumber }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('staff.email') }}:</label>
                            <p>{{ datatoedit?.email }}</p>
                        </div>
                    </div>

                    <!-- Place of Birth -->
                    <div class="p-4 border rounded-lg">
                        <h4 class="font-semibold mb-3">{{ $t('staff.place_of_birth') }}</h4>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('staff.province') }}:</label>
                            <p>{{ getPlaceOfBirthAddressName(datatoedit)?.province }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('staff.district') }}:</label>
                            <p>{{ getPlaceOfBirthAddressName(datatoedit)?.district }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('staff.commune') }}:</label>
                            <p>{{ getPlaceOfBirthAddressName(datatoedit)?.commune }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('staff.village') }}:</label>
                            <p>{{ getPlaceOfBirthAddressName(datatoedit)?.village }}</p>
                        </div>
                    </div>

                    <!-- Living Information -->
                    <div class="p-4 border rounded-lg">
                        <h4 class="font-semibold mb-3">{{ $t('staff.living_information') }}</h4>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('staff.province') }}:</label>
                            <p>{{ getAddressName(datatoedit)?.province }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('staff.district') }}:</label>
                            <p>{{ getAddressName(datatoedit)?.district }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('staff.commune') }}:</label>
                            <p>{{ getAddressName(datatoedit)?.commune }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('staff.village') }}:</label>
                            <p>{{ getAddressName(datatoedit)?.village }}</p>
                        </div>
                    </div>

                    <!-- Working Information -->
                    <div class="p-4 border rounded-lg">
                        <h4 class="font-semibold mb-3">{{ $t('staff.working_information') }}</h4>
                        <div class="flex flex-nowrap mb-4 items-start space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('staff.work_day') }}:</label>
                            <div class="w-[300px] grid grid-cols-3 items-start gap-4">
                                <Tag v-for="(work_day, index) in datatoedit?.workday" :key="index" :severity="workdayColors[work_day]" :value="$t(`day_of_week.${work_day.toLowerCase()}`)" rounded />
                            </div>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('staff.positsion') }}:</label>
                            <p>{{ formatePositionById(datatoedit?.position) }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('staff.department') }}:</label>
                            <p>{{ formateDepartmentById(datatoedit?.department) }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('staff.day_entered') }}:</label>
                            <p>{{ formatDate2(datatoedit?.date_intered) }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { formatDate2 } from '@/composible/formatDate';
import provinceJson from '@/json/province.json';
import districtJson from '@/json/district.json';
import communeJson from '@/json/commune.json';
import villageJson from '@/json/village.json';
import { useFetch } from '@/composible/useFetch';
export default {
    props: ['datatoedit'],
    setup(props, { emit }) {
        const user = ref(null);
        const workdayColors = {
            Monday: 'success',
            Tuesday: 'success',
            Wednesday: 'success',
            Thursday: 'success',
            Friday: 'success',
            Saturday: 'danger',
            Sunday: 'danger'
        };
        const { data: positions, loading: positionsLoading, error: positionsError, fetchData: fetchPositions } = useFetch('positions');
        const { data: departments, loading: departmentLoading, error: departmentError, fetchData: fetchDepartment } = useFetch('departments');

        const formateDepartmentById = (id) => {
            const department = departments.value.find((item) => item._id === id);
            return department ? department.name : 'N/A';
        };

        const formatePositionById = (id) => {
            const position = positions.value.find((item) => item._id === id);
            return position ? position.name : 'N/A';
        };
        function getAddressName(address) {
            if (!address) return {};

            const provinceObj = provinceJson.find((p) => p.properties.ADMIN_ID1 === address.province);
            const districtObj = districtJson.find((d) => d.properties.ADMIN_ID2 === address.district);
            const communeObj = communeJson.find((c) => c.properties.ADMIN_ID3 === address.commune);
            const villageObj = villageJson.find((v) => v.properties.ADMIN_ID === address.village);

            return {
                province: provinceObj?.properties.NAME1 || '',
                district: districtObj?.properties.NAME2 || '',
                commune: communeObj?.properties.NAME3 || '',
                village: villageObj?.properties.NAME || '',
                // English versions:
                province_en: provinceObj?.properties.NAME_ENG1 || '',
                district_en: districtObj?.properties.NAME_ENG2 || '',
                commune_en: communeObj?.properties.NAME_ENG3 || '',
                village_en: villageObj?.properties.NAME_ENG || ''
            };
        }

        function getPlaceOfBirthAddressName(address) {
            if (!address) return {};

            const provinceObj = provinceJson.find((p) => p.properties.ADMIN_ID1 === address.st_birth_province);
            const districtObj = districtJson.find((d) => d.properties.ADMIN_ID2 === address.st_birth_district);
            const communeObj = communeJson.find((c) => c.properties.ADMIN_ID3 === address.st_birth_commune);
            const villageObj = villageJson.find((v) => v.properties.ADMIN_ID === address.st_birth_village);

            return {
                province: provinceObj?.properties.NAME1 || '',
                district: districtObj?.properties.NAME2 || '',
                commune: communeObj?.properties.NAME3 || '',
                village: villageObj?.properties.NAME || '',
                // English versions:
                province_en: provinceObj?.properties.NAME_ENG1 || '',
                district_en: districtObj?.properties.NAME_ENG2 || '',
                commune_en: communeObj?.properties.NAME_ENG3 || '',
                village_en: villageObj?.properties.NAME_ENG || ''
            };
        }

        onMounted(async () => {
            if (props.datatoedit) {
                user.value = props.datatoedit;
                console.log('StaffInformation mounted', props.datatoedit);
            }
            await fetchDepartment();
            await fetchPositions();
        });

        return { user, formatDate2, getAddressName, getPlaceOfBirthAddressName, workdayColors, formateDepartmentById, formatePositionById };
    }
};
</script>
