<template>
    <div>
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">{{ $t('student.student_details') }}</label>
            <Button icon="pi pi-times" size="small" severity="danger" @click="$emit('close')" rounded aria-label="Close" />
        </div>

        <div class="p-4 h-[90vh] overflow-y-auto">
            <div class="grid grid-cols-1 gap-4">
                <!-- Profile Image -->
                <div class="bg-white dark:bg-gray-800 p-6">
                    <div class="mb-4">
                        <img class="w-32 h-32 object-cover rounded-full mx-auto" :src="datatoedit?.image || 'https://placehold.co/128'" :alt="datatoedit?.eng_name" />
                    </div>
                    <p class="text-center font-semibold">{{ datatoedit?.eng_name }}</p>
                </div>

                <!-- Information Grid -->
                <div class="w-full border rounded-lg p-5 grid grid-cols-3 gap-4">
                    <!-- Personal Information -->
                    <div class="p-4 border rounded-lg">
                        <h4 class="font-semibold mb-3">{{ $t('student.personal_information') }}</h4>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('student.eng_name') }} :</label>
                            <p>{{ datatoedit?.eng_name }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('student.kh_name') }} :</label>
                            <p>{{ datatoedit?.kh_name }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('student.gender') }} :</label>
                            <p v-if="datatoedit?.gender">{{ $t(`gender.${datatoedit.gender.toLowerCase()}`) }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('student.date_of_birth') }} :</label>
                            <p>{{ formatDate2(datatoedit?.dob) }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('student.day_entered') }} :</label>
                            <p>{{ formatDate2(datatoedit?.date_intered) }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('student.type') }} :</label>
                            <p>{{ formatCategoryNameById(datatoedit?.student_type) }}</p>
                        </div>
                    </div>

                    <!-- Contact Information -->
                    <div class="p-4 border rounded-lg">
                        <h4 class="font-semibold mb-3">{{ $t('student.contact_information') }}</h4>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('student.phone') }} :</label>
                            <p>{{ datatoedit?.phoneNumber }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('staff.email') }} :</label>
                            <p>{{ datatoedit?.email }}</p>
                        </div>
                    </div>

                    <!-- Address Information -->
                    <div class="p-4 border rounded-lg">
                        <h4 class="font-semibold mb-3">{{ $t('student.address_information') }}</h4>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('student.province') }} :</label>
                            <p>{{ getAddressName(datatoedit)?.province }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('student.district') }} :</label>
                            <p>{{ getAddressName(datatoedit)?.district }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('student.commune') }} :</label>
                            <p>{{ getAddressName(datatoedit)?.commune }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('student.village') }} :</label>
                            <p>{{ getAddressName(datatoedit)?.village }}</p>
                        </div>
                    </div>

                    <!-- Living Information -->
                    <div class="p-4 border rounded-lg">
                        <h4 class="font-semibold mb-3">{{ $t('student.living_information') }}</h4>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('student.province') }} :</label>
                            <p>{{ getAddressName(datatoedit)?.province }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('student.district') }} :</label>
                            <p>{{ getAddressName(datatoedit)?.district }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('student.commune') }} :</label>
                            <p>{{ getAddressName(datatoedit)?.commune }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('student.village') }} :</label>
                            <p>{{ getAddressName(datatoedit)?.village }}</p>
                        </div>
                    </div>

                    <!-- Document Information -->
                    <div class="p-4 border rounded-lg">
                        <h4 class="font-semibold mb-3">{{ $t('student.document_information') }}</h4>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('student.document_type') }} :</label>
                            <p>{{ datatoedit?.document_type }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('student.document_number') }} :</label>
                            <p>{{ datatoedit?.document_number }}</p>
                        </div>
                    </div>

                    <!-- Document Image -->
                    <div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <div class="w-[400px] h-[200px] border rounded-lg overflow-hidden">
                                <img :src="datatoedit?.document_image || 'https://placehold.co/400x200'" class="w-full h-full object-contain" alt="Document Image" />
                            </div>
                        </div>
                    </div>

                    <!-- Family Information -->
                    <div class="p-4 border rounded-lg">
                        <h4 class="font-semibold mb-3">{{ $t('student.family_information') }}</h4>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('student.father_name') }} :</label>
                            <p>{{ datatoedit?.father_name }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('student.mother_name') }} :</label>
                            <p>{{ datatoedit?.mother_name }}</p>
                        </div>
                    </div>

                    <!-- Family Contact -->
                    <div class="p-4 border rounded-lg">
                        <h4 class="font-semibold mb-3">{{ $t('student.family_contact_information') }}</h4>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('student.father_phone') }} :</label>
                            <p>{{ datatoedit?.father_phone }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('student.mother_phone') }} :</label>
                            <p>{{ datatoedit?.mother_phone }}</p>
                        </div>
                    </div>

                    <!-- Family Address -->
                    <div class="p-4 border rounded-lg">
                        <h4 class="font-semibold mb-3">{{ $t('student.family_address') }}</h4>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('student.province') }} :</label>
                            <p>{{ getFamilyAddressName(datatoedit).family_province }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('student.district') }} :</label>
                            <p>{{ getFamilyAddressName(datatoedit)?.family_district }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('student.commune') }} :</label>
                            <p>{{ getFamilyAddressName(datatoedit)?.family_commune }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label class="text-lg font-medium text-primary">{{ $t('student.village') }} :</label>
                            <p>{{ getFamilyAddressName(datatoedit)?.family_village }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { onMounted } from 'vue';
import { formatDate2 } from '@/composible/formatDate';
import provinceJson from '@/json/province.json';
import districtJson from '@/json/district.json';
import communeJson from '@/json/commune.json';
import villageJson from '@/json/village.json';
import { useFetch } from '@/composible/useFetch';
export default {
    props: ['datatoedit'],
    setup(props, { emit }) {
        const { data: category, fetchData: fetchCategory } = useFetch('student_categories');
        const formatCategoryNameById = (id) => {
            // 1. Add a guard to ensure 'category.value' is an array and an 'id' was provided.
            if (!Array.isArray(category.value) || !id) {
                return 'N/A';
            }

            // 2. Your original find logic is correct.
            const categoryObj = category.value.find((c) => c._id === id);

            // 3. Return the name or 'N/A' if not found.
            return categoryObj?.name || 'N/A';
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

        function getFamilyAddressName(address) {
            if (!address) return {};

            const provinceObj = provinceJson.find((p) => p.properties.ADMIN_ID1 === address.family_province);
            const districtObj = districtJson.find((d) => d.properties.ADMIN_ID2 === address.family_district);
            const communeObj = communeJson.find((c) => c.properties.ADMIN_ID3 === address.family_commune);
            const villageObj = villageJson.find((v) => v.properties.ADMIN_ID === address.family_village);

            return {
                family_province: provinceObj?.properties.NAME1 || '',
                family_district: districtObj?.properties.NAME2 || '',
                family_commune: communeObj?.properties.NAME3 || '',
                family_village: villageObj?.properties.NAME || '',
                // English versions:
                family_province_en: provinceObj?.properties.NAME_ENG1 || '',
                family_district_en: districtObj?.properties.NAME_ENG2 || '',
                family_commune_en: communeObj?.properties.NAME_ENG3 || '',
                family_village_en: villageObj?.properties.NAME_ENG || ''
            };
        }

        onMounted(async () => {
            if (props.datatoedit) {
                console.log('Data to edit:', props.datatoedit);
            }
            await fetchCategory();
        });
        return {
            formatDate2,
            getAddressName,
            getFamilyAddressName,
            formatCategoryNameById
        };
    }
};
</script>

<style lang="scss" scoped></style>
