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
                        <img class="w-32 h-32 object-cover rounded-full mx-auto" :src="datatoedit?.image" />
                    </div>
                    <p class="text-center font-semibold">{{ datatoedit?.eng_name }}</p>
                </div>
                <div class="w-full border rounded-lg p-5 grid grid-cols-3 gap-4">
                    <div class="p-4 border rounded-lg">
                        <h4>Personal Information</h4>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label for="" class="text-lg font-medium text-primary"> English Name : </label>
                            <p>{{ datatoedit?.eng_name }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label for="" class="text-lg font-medium text-primary"> Khmer Name : </label>
                            <p>{{ datatoedit?.kh_name }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label for="" class="text-lg font-medium text-primary"> Gender : </label>
                            <p>{{ datatoedit?.gender }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label for="" class="text-lg font-medium text-primary"> Date of Birth : </label>
                            <p>{{ formatDate2(datatoedit?.dob) }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label for="" class="text-lg font-medium text-primary"> Day Entered : </label>
                            <p>{{ formatDate2(datatoedit?.date_intered) }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label for="" class="text-lg font-medium text-primary"> Type : </label>
                            <p>{{ datatoedit?.student_type }}</p>
                        </div>
                    </div>
                    <div class="p-4 border rounded-lg">
                        <h4>Contact Information</h4>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label for="" class="text-lg font-medium text-primary"> Phone : </label>
                            <p>{{ datatoedit?.phoneNumber }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label for="" class="text-lg font-medium text-primary"> Email : </label>
                            <p>{{ datatoedit?.email }}</p>
                        </div>
                    </div>
                    <div class="p-4 border rounded-lg">
                        <h4>Address Information</h4>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label for="" class="text-lg font-medium text-primary"> Province : </label>
                            <p>{{ getAddressName(datatoedit)?.province }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label for="" class="text-lg font-medium text-primary"> District : </label>
                            <p>{{ getAddressName(datatoedit)?.district }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label for="" class="text-lg font-medium text-primary"> Commune : </label>
                            <p>{{ getAddressName(datatoedit)?.commune }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label for="" class="text-lg font-medium text-primary"> Village : </label>
                            <p>{{ getAddressName(datatoedit)?.village }}</p>
                        </div>
                    </div>
                    <div class="p-4 border rounded-lg">
                        <h4>Living Information</h4>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label for="" class="text-lg font-medium text-primary"> Province : </label>
                            <p>{{ getAddressName(datatoedit)?.province }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label for="" class="text-lg font-medium text-primary"> District : </label>
                            <p>{{ getAddressName(datatoedit)?.district }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label for="" class="text-lg font-medium text-primary"> Commune : </label>
                            <p>{{ getAddressName(datatoedit)?.commune }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label for="" class="text-lg font-medium text-primary"> Village : </label>
                            <p>{{ getAddressName(datatoedit)?.village }}</p>
                        </div>
                    </div>
                    <div class="p-4 border rounded-lg">
                        <h4>Document Information</h4>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label for="" class="text-lg font-medium text-primary"> Document Type : </label>
                            <p>{{ datatoedit?.document_type }}</p>
                        </div>
                        <!-- document Number -->
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label for="" class="text-lg font-medium text-primary"> Document Number : </label>
                            <p>{{ datatoedit?.document_number }}</p>
                        </div>
                    </div>
                    <div>
                        <!-- document Number -->
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <div class="w-[400px] h-[200px] border rounded-lg overflow-hidden">
                                <img :src="datatoedit?.document_image" alt="" />
                            </div>
                        </div>
                    </div>
                    <div class="p-4 border rounded-lg">
                        <h4>Family Information</h4>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label for="" class="text-lg font-medium text-primary"> Father Name : </label>
                            <p>{{ datatoedit?.father_name }}</p>
                        </div>
                        <!-- document Number -->
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label for="" class="text-lg font-medium text-primary"> Mother Name : </label>
                            <p>{{ datatoedit?.mother_name }}</p>
                        </div>
                    </div>
                    <div class="p-4 border rounded-lg">
                        <h4>Family Contact</h4>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label for="" class="text-lg font-medium text-primary"> Father Phone : </label>
                            <p>{{ datatoedit?.father_phone }}</p>
                        </div>
                        <!-- document Number -->
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label for="" class="text-lg font-medium text-primary"> Mother Phone : </label>
                            <p>{{ datatoedit?.mother_phone }}</p>
                        </div>
                    </div>
                    <div class="p-4 border rounded-lg">
                        <h4>Family Address</h4>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label for="" class="text-lg font-medium text-primary"> Province : </label>
                            <p>{{ getFamilyAddressName(datatoedit).family_province }}</p>
                        </div>
                        <!-- document Number -->
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label for="" class="text-lg font-medium text-primary"> District : </label>
                            <p>{{ getFamilyAddressName(datatoedit)?.family_district }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label for="" class="text-lg font-medium text-primary"> Commune : </label>
                            <p>{{ getFamilyAddressName(datatoedit)?.family_commune }}</p>
                        </div>
                        <div class="flex flex-nowrap mb-4 items-center space-x-4">
                            <label for="" class="text-lg font-medium text-primary"> Village : </label>
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
export default {
    props: ['datatoedit'],
    setup(props, { emit }) {
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

        onMounted(() => {
            if (props.datatoedit) {
                console.log('Data to edit:', props.datatoedit);
            }
        });
        return {
            formatDate2,
            getAddressName,
            getFamilyAddressName
        };
    }
};
</script>

<style lang="scss" scoped></style>
