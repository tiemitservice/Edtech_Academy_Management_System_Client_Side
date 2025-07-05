<template>
    <form @submit.prevent="handleSubmit" class="w-full max-w-[1040px] h-fit overflow-auto">
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">{{ datatoedit ? 'Edit Teacher' : 'Add New Teacher' }}</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>

        <!-- Profile Image Section -->
        <div class="w-full flex items-center justify-center py-4">
            <div class="flex flex-col items-center space-y-3">
                <div v-if="previewUrl" class="size-32 overflow-hidden mx-auto rounded-full border-2 border-gray-300">
                    <img :src="previewUrl" alt="Profile Preview" class="object-cover w-full h-full" />
                </div>
                <div v-else class="size-32 overflow-hidden mx-auto rounded-full border-2 border-gray-300">
                    <img src="https://placehold.co/128" alt="Placeholder" class="object-cover w-full h-full" />
                </div>
                <input
                    type="file"
                    id="image"
                    @change="handleChange"
                    class="block w-full px-3 py-1.5 text-sm text-gray-600 dark:bg-gray-900 bg-white border border-gray-300 rounded-lg file:bg-gray-200 file:text-gray-900 file:text-sm file:px-4 file:py-1 file:border-none file:rounded-full dark:text-gray-300 placeholder-gray-400/70 dark:placeholder-gray-500 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300"
                />
            </div>
        </div>

        <!-- Form Fields -->
        <div class="grid grid-cols-2 md:grid-cols-2 gap-6 p-4">
            <!-- Personal Information -->
            <div>
                <h4 class="text-lg font-medium">Personal Information</h4>
                <div class="border grid grid-cols-2 p-2 rounded gap-4">
                    <div class="flex flex-col space-y-1">
                        <label for="kh_name" class="text-sm font-medium">Khmer Name</label>
                        <InputText id="kh_name" type="text" placeholder="Khmer name" v-model="kh_name" />
                    </div>
                    <div class="flex flex-col space-y-1">
                        <label for="eng_name" class="text-sm font-medium">English Name</label>
                        <InputText id="eng_name" type="text" placeholder="English name" v-model="eng_name" />
                    </div>
                    <div class="flex flex-col space-y-1">
                        <label for="selectedGender" class="text-sm font-medium">Gender</label>
                        <Select id="selectedGender" v-model="selectedGender" :options="gender" optionLabel="name" optionValue="name" placeholder="Select a Gender" class="w-full" />
                    </div>
                    <div class="flex flex-col space-y-1">
                        <label for="date_of_birth" class="text-sm font-medium">Date of Birth</label>
                        <DatePicker id="date_of_birth" dateFormat="dd/mm/yy" v-model="date_of_birth" placeholder="Date of birth" showButtonBar />
                    </div>
                </div>
            </div>
            <!-- Contact and Employment Details -->
            <div>
                <h4 class="text-lg font-medium">Contact & Employment Details</h4>
                <div class="border grid grid-cols-2 p-2 rounded gap-4">
                    <div class="flex flex-col space-y-1">
                        <label for="phoneNumber" class="text-sm font-medium">Phone Number</label>
                        <InputText id="phoneNumber" type="text" placeholder="Phone number" v-model="phoneNumber" />
                    </div>
                    <div class="flex flex-col space-y-1">
                        <label for="email" class="text-sm font-medium">Email</label>
                        <InputText id="email" type="email" placeholder="Email" v-model="email" />
                    </div>
                    <div class="flex flex-col space-y-1">
                        <label for="selectedPosition" class="text-sm font-medium">Position</label>
                        <Select id="selectedPosition" filter show-clear v-model="selectedPosition" :options="position" optionLabel="name" optionValue="_id" placeholder="Select a Position" class="w-full" />
                    </div>
                    <div class="flex flex-col space-y-1">
                        <label for="selectedDepartment" class="text-sm font-medium">Department</label>
                        <Select id="selectedDepartment" v-model="selectedDepartment" :options="department" filter show-clear optionLabel="name" optionValue="_id" placeholder="Select a Department" class="w-full" />
                    </div>
                    <div class="flex flex-col space-y-1">
                        <label for="workdaySelected" class="text-sm font-medium">Work Day</label>
                        <MultiSelect id="workdaySelected" v-model="workdaySelected" :options="workDay" optionLabel="name" optionValue="name" placeholder="Select a Work Day" class="w-full" />
                    </div>
                    <div class="flex flex-col space-y-1">
                        <label for="salary" class="text-sm font-medium">Salary</label>
                        <InputText id="salary" type="number" placeholder="Salary" v-model="salary" />
                    </div>
                    <div class="flex flex-col space-y-1">
                        <label for="date_entered" class="text-sm font-medium">Date Entered</label>
                        <DatePicker id="date_entered" v-model="date_entered" placeholder="Date entered" showButtonBar />
                    </div>
                </div>
            </div>
            <!-- Place of Birth -->
            <div>
                <h4 class="text-lg font-medium">Place of Birth</h4>
                <div class="border grid grid-cols-2 p-2 rounded gap-4">
                    <div class="flex flex-col space-y-1">
                        <label for="selectedProvince" class="text-sm font-medium">Province</label>
                        <Select
                            filter="true"
                            id="selectedProvince"
                            v-model="selectedLivingProvince"
                            :options="living_provinces"
                            optionLabel="properties.NAME1"
                            optionValue="properties.ADMIN_ID1"
                            placeholder="Select Province"
                            showClear
                            class="w-full"
                        />
                    </div>
                    <div class="flex flex-col space-y-1">
                        <label for="selectedDistrict" class="text-sm font-medium">District</label>
                        <Select
                            filter="true"
                            id="selectedDistrict"
                            v-model="selectedLivingDistrict"
                            :options="filteredLivingDistricts"
                            optionLabel="properties.NAME2"
                            optionValue="properties.ADMIN_ID2"
                            placeholder="Select District"
                            showClear
                            class="w-full"
                        />
                    </div>
                    <div class="flex flex-col space-y-1">
                        <label for="selectedCommune" class="text-sm font-medium">Commune</label>
                        <Select
                            filter="true"
                            id="selectedCommune"
                            v-model="selectedLivingCommune"
                            :options="filteredLivingCommunes"
                            optionLabel="properties.NAME3"
                            optionValue="properties.ADMIN_ID3"
                            placeholder="Select Commune"
                            showClear
                            class="w-full"
                        />
                    </div>
                    <div class="flex flex-col space-y-1">
                        <label for="selectedVillage" class="text-sm font-medium">Village</label>
                        <Select filter="true" id="selectedVillage" v-model="selectedLivingVillage" :options="formattedLivingVillages" optionLabel="label" optionValue="value" placeholder="Select Village" showClear class="w-full" />
                    </div>
                </div>
            </div>
            <!-- Address Information -->
            <div>
                <h4 class="text-lg font-medium">Address</h4>
                <div class="border grid grid-cols-2 p-2 rounded gap-4">
                    <div class="flex flex-col space-y-1">
                        <label for="selectedProvince" class="text-sm font-medium">Province</label>
                        <Select filter="true" id="selectedProvince" v-model="selectedProvince" :options="provinces" optionLabel="properties.NAME1" optionValue="properties.ADMIN_ID1" placeholder="Select Province" showClear class="w-full" />
                    </div>
                    <div class="flex flex-col space-y-1">
                        <label for="selectedDistrict" class="text-sm font-medium">District</label>
                        <Select filter="true" id="selectedDistrict" v-model="selectedDistrict" :options="filteredDistricts" optionLabel="properties.NAME2" optionValue="properties.ADMIN_ID2" placeholder="Select District" showClear class="w-full" />
                    </div>
                    <div class="flex flex-col space-y-1">
                        <label for="selectedCommune" class="text-sm font-medium">Commune</label>
                        <Select filter="true" id="selectedCommune" v-model="selectedCommune" :options="filteredCommunes" optionLabel="properties.NAME3" optionValue="properties.ADMIN_ID3" placeholder="Select Commune" showClear class="w-full" />
                    </div>
                    <div class="flex flex-col space-y-1">
                        <label for="selectedVillage" class="text-sm font-medium">Village</label>
                        <Select filter="true" id="selectedVillage" v-model="selectedVillage" :options="formattedVillages" optionLabel="label" optionValue="value" placeholder="Select Village" showClear class="w-full" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Form Actions -->
        <div class="w-full flex items-center justify-end mt-8 space-x-2 p-4">
            <Button :label="loading ? 'Saving...' : 'Save'" :disabled="loading" type="submit" />
            <Button @click="$emit('close')" label="Cancel" severity="danger" />
        </div>
    </form>
</template>
<script>
import { ref, onMounted, computed } from 'vue';
import { useFetch } from '@/composible/useFetch';
import provinceJson from '@/json/province.json';
import districtJson from '@/json/district.json';
import communeJson from '@/json/commune.json';
import villageJson from '@/json/village.json';
export default {
    props: ['datatoedit'],
    setup(props, { emit }) {
        const { data: position, fetchData: fetchPositions } = useFetch('positions');
        const { data: department, fetchData: fetchDepartment } = useFetch('departments');
        const workDay = ref([{ name: 'Monday' }, { name: 'Tuesday' }, { name: 'Wednesday' }, { name: 'Thursday' }, { name: 'Friday' }, { name: 'Saturday' }, { name: 'Sunday' }]);
        const workdaySelected = ref(null);
        const filtersDepartment = ref({
            page: 1,
            limit: 50,
            search: '',
            searchColumn: ['', '']
        });

        const filtersPosistion = ref({
            page: 1,
            limit: 50,
            search: '',
            searchColumn: ['', '']
        });

        const gender = ref([{ name: 'Male' }, { name: 'Female' }, { name: 'Others' }]);
        // Filter logic

        const selectedProvince = ref(null);
        const selectedDistrict = ref(null);
        const selectedCommune = ref(null);
        const selectedVillage = ref(null);
        const provinces = ref(provinceJson);
        const districts = ref(districtJson);
        const communes = ref(communeJson);
        const villages = ref(villageJson);

        const filteredDistricts = computed(() => {
            if (!selectedProvince.value) return [];
            // Filter districts whose ADMIN_ID1 matches the selected province
            return districts.value.filter((d) => d.properties.ADMIN_ID1 === selectedProvince.value);
        });

        const filteredCommunes = computed(() => {
            if (!selectedDistrict.value) return [];
            // Filter communes whose ADMIN_ID2 matches the selected district
            return communes.value.filter((c) => c.properties.ADMIN_ID2 === selectedDistrict.value);
        });

        const filteredVillages = computed(() => {
            if (!selectedCommune.value) return [];
            // Filter villages whose ADMIN_ID3 matches the selected commune
            return villages.value.filter((v) => v.properties.ADMIN_ID3 === selectedCommune.value);
        });

        // Village options
        const formattedVillages = computed(() => {
            return filteredVillages.value.map((v) => ({
                label: `${v.properties.NAME} (${v.properties.NAME_ENG})`,
                value: v.properties.ADMIN_ID,
                raw: v
            }));
        });

        const living_provinces = ref(provinceJson);
        const living_districts = ref(districtJson);
        const living_communes = ref(communeJson);
        const living_villages = ref(villageJson);

        const selectedLivingProvince = ref(null);
        const selectedLivingDistrict = ref(null);
        const selectedLivingCommune = ref(null);
        const selectedLivingVillage = ref(null);

        const filteredLivingDistricts = computed(() => {
            if (!selectedLivingProvince.value) return [];
            // Filter districts whose ADMIN_ID1 matches the selected province
            return living_districts.value.filter((d) => d.properties.ADMIN_ID1 === selectedLivingProvince.value);
        });

        const filteredLivingCommunes = computed(() => {
            if (!selectedLivingDistrict.value) return [];
            // Filter communes whose ADMIN_ID2 matches the selected district
            return living_communes.value.filter((c) => c.properties.ADMIN_ID2 === selectedLivingDistrict.value);
        });

        const filteredLivingVillages = computed(() => {
            if (!selectedLivingCommune.value) return [];
            // Filter villages whose ADMIN_ID3 matches the selected commune
            return living_villages.value.filter((v) => v.properties.ADMIN_ID3 === selectedLivingCommune.value);
        });

        // Village options
        const formattedLivingVillages = computed(() => {
            return filteredLivingVillages.value.map((v) => ({
                label: `${v.properties.NAME} (${v.properties.NAME_ENG})`,
                value: v.properties.ADMIN_ID,
                raw: v
            }));
        });

        // Form fields
        const kh_name = ref(null);
        const eng_name = ref(null);
        const date_of_birth = ref(null);
        const selectedGender = ref(null); // Renamed from "genders" to match JSON
        const selectedPosition = ref(null); // Renamed from "posistions" and fixed typo

        const phoneNumber = ref(null); // Aligned with JSON
        const email = ref(null);
        const selectedDepartment = ref(null); // Renamed from "departments" for consistency
        const role = ref(null); // Added from JSON
        const status = ref(true); // Added from JSON, default to true
        const salary = ref(null); // Added from JSON
        const date_entered = ref(null); // Added from JSON, corrected "date_intered"

        const collection = ref('staffs');
        const { postData, data, loading, error, updateData } = useFetch(collection.value);
        const previewUrl = ref(null);
        const image = ref(null); // Your Vue component script
        const handleChange = (e) => {
            image.value = e.target.files[0]; // Store the File object
            previewUrl.value = URL.createObjectURL(image.value); // For local preview
        };

        const handleSubmit = async () => {
            try {
                loading.value = true;
                const formData = new FormData();
                formData.append('kh_name', kh_name.value || '');
                formData.append('en_name', eng_name.value || '');
                formData.append('date_of_birth', date_of_birth.value ? new Date(date_of_birth.value).toISOString() : '');
                formData.append('gender', selectedGender.value || '');
                formData.append('position', selectedPosition.value || ''); // Keep server field name
                formData.append('phoneNumber', phoneNumber.value || '');
                formData.append('email', email.value || '');
                formData.append('department', selectedDepartment.value || '');
                formData.append('role', role.value || 'user');
                formData.append('status', status.value);
                formData.append('salary', salary.value || '');
                formData.append('date_intered', date_entered.value ? new Date(date_entered.value).toISOString() : ''); // Keep server field name
                formData.append('province', selectedProvince.value || '');
                formData.append('district', selectedDistrict.value || '');
                formData.append('commune', selectedCommune.value || '');
                formData.append('village', selectedVillage.value || '');

                // place of birth

                formData.append('st_birth_province', selectedLivingProvince.value || '');
                formData.append('st_birth_district', selectedLivingDistrict.value || '');
                formData.append('st_birth_commune', selectedLivingCommune.value || '');
                formData.append('st_birth_village', selectedLivingVillage.value || '');
                (workdaySelected.value || []).forEach((day) => {
                    formData.append('workday', day);
                });

                if (image.value && image.value instanceof File) {
                    formData.append('image', image.value);
                    console.log('Appending image file:', image.value.name);
                } else {
                    console.log('No new image file selected');
                }

                if (props.datatoedit) {
                    const res = await updateData(formData, props.datatoedit._id);
                    console.log('Data updated:', res);
                    emit('toast', 'updated');
                } else {
                    const res = await postData(formData);
                    console.log('Data posted:', res);
                    emit('toast', 'created');
                }
                emit('close');
            } catch (error) {
                console.error('Submit error:', error);
                emit('toast', 'error', error.message);
            } finally {
                loading.value = false;
            }
        };

        onMounted(async () => {
            await fetchPositions(filtersPosistion.value);
            await fetchDepartment(filtersDepartment.value);
            if (props.datatoedit) {
                console.log('datatoedit', props.datatoedit);
                kh_name.value = props.datatoedit.kh_name;
                eng_name.value = props.datatoedit.en_name;
                date_of_birth.value = props.datatoedit.date_of_birth;
                selectedGender.value = props.datatoedit.gender;
                selectedPosition.value = props.datatoedit.position;
                phoneNumber.value = props.datatoedit.phoneNumber;
                email.value = props.datatoedit.email;
                selectedDepartment.value = props.datatoedit.department;
                role.value = props.datatoedit.role;
                status.value = props.datatoedit.status;
                salary.value = props.datatoedit.salary;
                date_entered.value = props.datatoedit.date_intered;
                selectedProvince.value = props.datatoedit.province;
                selectedDistrict.value = props.datatoedit.district;
                selectedCommune.value = props.datatoedit.commune;
                selectedVillage.value = props.datatoedit.village;
                // place of birth bind

                selectedLivingProvince.value = props.datatoedit.st_birth_province;
                selectedLivingDistrict.value = props.datatoedit.st_birth_district;
                selectedLivingCommune.value = props.datatoedit.st_birth_commune;
                selectedLivingVillage.value = props.datatoedit.st_birth_village;

                previewUrl.value = props.datatoedit.image;
                image.value = props.datatoedit.image;
                workdaySelected.value = props.datatoedit?.workday;
            }
        });
        return {
            position, // Updated from "posistion"
            gender,
            department,
            kh_name,
            eng_name,
            date_of_birth,
            selectedGender, // Updated from "genders"
            selectedPosition, // Updated from "posistions"

            selectedProvince,
            selectedDistrict, // Updated from "selectedDistrice"
            selectedCommune,
            selectedVillage,
            phoneNumber, // Updated from "phone"
            email,
            selectedDepartment, // Updated from "departments"
            role,
            status,
            salary,
            date_entered,
            handleSubmit,

            handleChange,
            previewUrl,
            workDay,
            workdaySelected,
            provinces,
            districts,
            communes,
            villages,
            filteredDistricts,
            filteredCommunes,
            formattedVillages,

            loading,
            living_communes,
            living_villages,
            living_provinces,
            living_districts,

            formattedLivingVillages,
            selectedLivingProvince,
            selectedLivingDistrict,
            selectedLivingCommune,
            selectedLivingVillage,
            filteredLivingDistricts,
            filteredLivingCommunes,
            filteredLivingVillages,
            loading
        };
    }
};
</script>

<style lang="scss" scoped></style>
