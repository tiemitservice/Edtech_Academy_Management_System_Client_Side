<template>
    <form @submit.prevent="handleSubmit" class="w-full">
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <label class="text-base font-semibold text-gray-800">{{ datatoedit ? 'Edit Student' : 'Add New Student' }}</label>
            <Button icon="pi pi-times" size="small" @click="$emit('close')" severity="danger" rounded aria-label="Close" />
        </div>

        <div class="p-4">
            <!-- Profile Image Section -->
            <div class="w-full flex items-center justify-center mb-8">
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
                        accept="image/*"
                        class="block w-full px-3 py-1.5 text-sm text-gray-600 dark:bg-gray-900 bg-white border border-gray-300 rounded-lg file:bg-gray-200 file:text-gray-900 file:text-sm file:px-4 file:py-1 file:border-none file:rounded-full dark:text-gray-300 placeholder-gray-400/70 dark:placeholder-gray-500 focus:lue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40 dark:focus:lue-300"
                    />
                </div>
            </div>

            <!-- Form Fields -->

            <div class="grid grid-cols-2 gap-6 p-5 items-stretch">
                <!-- Personal Information -->
                <div>
                    <h4 class="text-lg font-medium">Personal Information</h4>

                    <div class="rounded p-2 border grid grid-cols-3 gap-4">
                        <div class="flex flex-col space-y-1">
                            <label for="kh_name" class="text-sm font-medium"
                                >Khmer Name <span><span class="text-red-500">*</span></span></label
                            >
                            <InputText :required="true" id="kh_name" type="text" placeholder="Khmer name" v-model="kh_name" />
                        </div>
                        <div class="flex flex-col space-y-1">
                            <label for="eng_name" class="text-sm font-medium"
                                >English Name <span><span class="text-red-500">*</span></span>
                            </label>
                            <InputText :required="true" id="eng_name" type="text" placeholder="English name" v-model="eng_name" />
                        </div>
                        <div class="flex flex-col space-y-1">
                            <label for="selectedGender" class="text-sm font-medium"
                                >Gender <span><span class="text-red-500">*</span></span>
                            </label>
                            <Select show-clear :invalid="!selectedGender" id="selectedGender" v-model="selectedGender" :options="gender" optionLabel="name" optionValue="name" placeholder="Select a Gender" class="w-full" />
                        </div>
                        <div class="flex flex-col space-y-1">
                            <label for="date_of_birth" class="text-sm font-medium"
                                >Date of Birth <span><span class="text-red-500">*</span></span></label
                            >
                            <DatePicker :invalid="!date_of_birth" id="date_of_birth" v-model="date_of_birth" placeholder="Date of birth" showButtonBar />
                        </div>
                        <!-- student category -->
                        <div class="flex flex-col space-y-1">
                            <label for="categorySelected" class="text-sm font-medium"
                                >Student Category <span><span class="text-red-500">*</span></span></label
                            >
                            <Dropdown id="categorySelected" v-model="categorySelected" :options="category" optionLabel="name" optionValue="_id" placeholder="Select a category" showClear class="w-full" />
                        </div>
                        <div class="flex flex-col space-y-1">
                            <label for="email" class="text-sm font-medium"
                                >Email <span><span class="text-red-500">*</span></span></label
                            >
                            <InputText id="email" type="email" placeholder="Email" v-model="email" />
                        </div>
                        <div class="flex flex-col space-y-1">
                            <label for="phoneNumber" class="text-sm font-medium"
                                >Phone Number <span><span class="text-red-500">*</span></span></label
                            >
                            <InputText id="phoneNumber" type="text" placeholder="Phone number" v-model="phoneNumber" />
                        </div>
                        <div class="flex flex-col space-y-1">
                            <label for="date_entered" class="text-sm font-medium"
                                >Date Entered <span><span class="text-red-500">*</span></span></label
                            >
                            <DatePicker id="date_entered" v-model="date_entered" placeholder="Date entered" showButtonBar />
                        </div>
                    </div>
                </div>
                <div>
                    <h4 class="text-lg font-medium">Live Address</h4>

                    <div class="rounded p-2 border grid grid-cols-3 gap-4">
                        <!-- student category -->

                        <div class="flex flex-col space-y-1">
                            <label for="selectedProvince" class="text-sm font-medium"
                                >Province <span><span class="text-red-500">*</span></span></label
                            >
                            <Dropdown filter id="selectedProvince" v-model="selectedProvince" :options="provinces" optionLabel="properties.NAME1" optionValue="properties.ADMIN_ID1" placeholder="Select Province" showClear class="w-full" />
                        </div>
                        <div class="flex flex-col space-y-1">
                            <label for="selectedDistrict" class="text-sm font-medium"
                                >District <span><span class="text-red-500">*</span></span></label
                            >
                            <Dropdown id="selectedDistrict" v-model="selectedDistrict" :options="filteredDistricts" optionLabel="properties.NAME2" optionValue="properties.ADMIN_ID2" placeholder="Select District" showClear class="w-full" />
                        </div>

                        <div class="flex flex-col space-y-1">
                            <label for="selectedCommune" class="text-sm font-medium"
                                >Commune <span><span class="text-red-500">*</span></span></label
                            >
                            <Dropdown id="selectedCommune" v-model="selectedCommune" :options="filteredCommunes" optionLabel="properties.NAME3" optionValue="properties.ADMIN_ID3" placeholder="Select Commune" showClear class="w-full" />
                        </div>

                        <div class="flex flex-col space-y-1">
                            <label for="selectedVillage" class="text-sm font-medium"
                                >Village <span><span class="text-red-500">*</span></span></label
                            >
                            <Dropdown v-model="selectedVillage" :options="formattedVillages" optionLabel="label" optionValue="value" placeholder="Select Village" showClear class="w-full" />
                        </div>
                    </div>
                </div>
                <div>
                    <h4 class="text-lg font-medium">Place of Birth</h4>

                    <div class="rounded p-2 border grid grid-cols-3 gap-4">
                        <!-- student category -->

                        <div class="flex flex-col space-y-1">
                            <label for="selectedProvince" class="text-sm font-medium"
                                >Province <span><span class="text-red-500">*</span></span></label
                            >
                            <Dropdown filter id="selectedProvince" v-model="plb_province" :options="provinces" optionLabel="properties.NAME1" optionValue="properties.ADMIN_ID1" placeholder="Select Province" showClear class="w-full" />
                        </div>
                        <div class="flex flex-col space-y-1">
                            <label for="selectedDistrict" class="text-sm font-medium"
                                >District <span><span class="text-red-500">*</span></span></label
                            >
                            <Dropdown id="selectedDistrict" v-model="plb_district" :options="filteredDistrictsForBirth" optionLabel="properties.NAME2" optionValue="properties.ADMIN_ID2" placeholder="Select District" showClear class="w-full" />
                        </div>

                        <div class="flex flex-col space-y-1">
                            <label for="selectedCommune" class="text-sm font-medium"
                                >Commune <span><span class="text-red-500">*</span></span></label
                            >
                            <Dropdown id="selectedCommune" v-model="plb_commune" :options="filteredCommunesForBirth" optionLabel="properties.NAME3" optionValue="properties.ADMIN_ID3" placeholder="Select Commune" showClear class="w-full" />
                        </div>

                        <div class="flex flex-col space-y-1">
                            <label for="selectedVillage" class="text-sm font-medium"
                                >Village <span><span class="text-red-500">*</span></span></label
                            >
                            <Dropdown v-model="plb_village" :options="formattedVillagesForBirth" optionLabel="label" optionValue="value" placeholder="Select Village" showClear class="w-full" />
                        </div>
                    </div>
                </div>
                <!-- Family Information -->
                <div>
                    <h4 class="text-lg font-medium pb-2">Family Information</h4>
                    <div class="rounded p-2 border grid grid-cols-3 gap-4">
                        <div class="flex flex-col space-y-1">
                            <label for="father_name" class="text-sm font-medium">Father's Name</label>
                            <InputText id="father_name" type="text" placeholder="Father's name" v-model="father_name" />
                        </div>
                        <div class="flex flex-col space-y-1">
                            <label for="mother_name" class="text-sm font-medium">Mother's Name</label>
                            <InputText id="mother_name" type="text" placeholder="Mother's name" v-model="mother_name" />
                        </div>
                        <div class="flex flex-col space-y-1">
                            <label for="father_phone" class="text-sm font-medium">Father's Phone</label>
                            <InputText id="father_phone" type="text" placeholder="Father's phone" v-model="father_phone" />
                        </div>
                        <div class="flex flex-col space-y-1">
                            <label for="mother_phone" class="text-sm font-medium">Mother's Phone</label>
                            <InputText id="mother_phone" type="text" placeholder="Mother's phone" v-model="mother_phone" />
                        </div>

                        <div class="flex flex-col space-y-1">
                            <label for="selectedProvince" class="text-sm font-medium"
                                >Province <span><span class="text-red-500">*</span></span></label
                            >
                            <Dropdown filter id="selectedProvince" v-model="fm_province" :options="provinces" optionLabel="properties.NAME1" optionValue="properties.ADMIN_ID1" placeholder="Select Province" showClear class="w-full" />
                        </div>
                        <div class="flex flex-col space-y-1">
                            <label for="selectedDistrict" class="text-sm font-medium"
                                >District <span><span class="text-red-500">*</span></span></label
                            >
                            <Dropdown id="selectedDistrict" v-model="fm_district" :options="filteredDistrictsForFamily" optionLabel="properties.NAME2" optionValue="properties.ADMIN_ID2" placeholder="Select District" showClear class="w-full" />
                        </div>

                        <div class="flex flex-col space-y-1">
                            <label for="selectedCommune" class="text-sm font-medium"
                                >Commune <span><span class="text-red-500">*</span></span></label
                            >
                            <Dropdown id="selectedCommune" v-model="fm_commune" :options="filteredCommunesForFamily" optionLabel="properties.NAME3" optionValue="properties.ADMIN_ID3" placeholder="Select Commune" showClear class="w-full" />
                        </div>

                        <div class="flex flex-col space-y-1">
                            <label for="selectedVillage" class="text-sm font-medium"
                                >Village <span><span class="text-red-500">*</span></span></label
                            >
                            <Dropdown v-model="fm_village" :options="formattedVillagesForFamily" optionLabel="label" optionValue="value" placeholder="Select Village" showClear class="w-full" />
                        </div>
                    </div>
                </div>
                <div>
                    <h4 class="text-lg font-medium pb-2">Document Information</h4>
                    <div class="rounded p-2 border grid grid-cols-2 gap-4">
                        <div class="flex flex-col space-y-1">
                            <label for="" class="text-sm font-medium">Document Type </label>
                            <Dropdown id="" v-model="documentType" :options="documentTypeOptions" optionLabel="label" optionValue="value" placeholder="Select document type" showClear class="w-full" />
                        </div>
                        <div class="flex flex-col space-y-1">
                            <label for="documentNumber" class="text-sm font-medium">Document Number </label>
                            <InputText id="documentNumber" type="text" placeholder="Document number" v-model="documentNumber" />
                        </div>
                        <div>
                            <div class="flex flex-col items-center space-y-3">
                                <div v-if="document_image_preview" class="w-[400px] h-[200px] overflow-hidden mx-auto rounded-xl border-2 border-gray-300">
                                    <img :src="document_image_preview" alt="Profile Preview" class="object-cover w-full h-full" />
                                </div>
                                <div v-else class="w-[400px] h-[200px] overflow-hidden mx-auto rounded-xl border-2 border-gray-300">
                                    <img src="https://placehold.co/400" alt="Placeholder" class="object-cover w-full h-full" />
                                </div>
                                <input
                                    type="file"
                                    id="image"
                                    @change="handleDocumentChange"
                                    accept="image/*"
                                    class="block w-full px-3 py-1.5 text-sm text-gray-600 dark:bg-gray-900 bg-white border border-gray-300 rounded-lg file:bg-gray-200 file:text-gray-900 file:text-sm file:px-4 file:py-1 file:border-none file:rounded-full dark:text-gray-300 placeholder-gray-400/70 dark:placeholder-gray-500 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300"
                                />
                            </div>
                        </div>
                        <div class="flex items-start gap-4">
                            <label for=""> Status </label>
                            <!-- status -->
                            <ToggleSwitch v-model="status" />
                        </div>
                    </div>
                </div>
                <!-- document information -->
            </div>

            <!-- Form Actions -->
            <div class="w-full flex items-center justify-end mt-8 space-x-2">
                <Button @click="$emit('close')" label="Cancel" severity="danger" />
                <Button :label="isSubmitting ? 'Saving...' : 'Save'" :disabled="isSubmitting" type="submit" />
            </div>
        </div>
    </form>
</template>

<script>
import { ref, onMounted, watch, computed, nextTick } from 'vue';
import { useFetch } from '@/composible/useFetch';
import provinceJson from '@/json/province.json';
import districtJson from '@/json/district.json';
import communeJson from '@/json/commune.json';
import villageJson from '@/json/village.json';
export default {
    props: ['datatoedit'],
    setup(props, { emit }) {
        const { data: staff, fetchData: fetchStaff } = useFetch('staffs');
        const { data: books, fetchData: fetchBooks } = useFetch('books');
        const { data: category, fetchData: fetchCategory } = useFetch('student_categories');
        const filtersCategory = ref({
            status: 'true'
        });
        const filtersStaff = ref({
            status: 'true',
            limit: 10,
            page: 1
        });
        const filtersBooks = ref({
            status: 'true',
            limit: 10,
            page: 1
        });

        // Options
        const gender = ref([{ name: 'Male' }, { name: 'Female' }, { name: 'Others' }]);
        const attendanceOptions = ref([
            { name: 'Present', value: 'present' },
            { name: 'Absent', value: 'absent' },
            { name: 'Late', value: 'late' }
        ]);
        const is_submitting = ref(false);

        // Form fields
        const provinces = ref(provinceJson);
        const districts = ref(districtJson);
        const communes = ref(communeJson);
        const villages = ref(villageJson);
        const selectedProvince = ref(null);
        const selectedDistrict = ref(null);
        const selectedCommune = ref(null);
        const selectedVillage = ref(null);
        const documentType = ref(null);
        const documentNumber = ref(null);
        const document_image = ref(null); // Fixed typo: document_Image -> document_image
        const document_image_preview = ref(null);
        const kh_name = ref(null);
        const eng_name = ref(null);
        const email = ref(null);
        const selectedGender = ref(null);
        const date_of_birth = ref(null);
        const phoneNumber = ref(null);
        const father_name = ref(null);
        const mother_name = ref(null);
        const address = ref(null);
        const score = ref(null);
        const attendance = ref(null);
        const attendance_date = ref(null);
        const attendance_enum = ref(null);
        const teacher = ref([]);
        const rental_book = ref([]);
        const status = ref(true);
        const date_entered = ref(null);
        const previewUrl = ref(null);
        const image = ref(null);
        const mother_phone = ref(null);
        const father_phone = ref(null);
        const documentTypeOptions = ref([
            { label: 'National ID', value: 'national_id' },
            { label: 'Passport', value: 'passport' },
            { label: 'Birth Certificate', value: 'birth_certificate' }
        ]);

        const categorySelected = ref(null);
        const collection = ref('students');
        const { postData, updateData } = useFetch(collection.value);

        const handleChange = (e) => {
            image.value = e.target.files[0];
            previewUrl.value = image.value ? URL.createObjectURL(image.value) : null;
        };

        const handleDocumentChange = (e) => {
            document_image.value = e.target.files[0]; // Fixed typo
            document_image_preview.value = document_image.value ? URL.createObjectURL(document_image.value) : null;
        };

        // Resetting children on parent change
        watch(selectedProvince, () => {
            selectedDistrict.value = null;
            selectedCommune.value = null;
            selectedVillage.value = null;
        });

        watch(selectedDistrict, () => {
            selectedCommune.value = null;
            selectedVillage.value = null;
        });

        watch(selectedCommune, () => {
            selectedVillage.value = null;
        });

        // Filter logic
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

        const plb_province = ref(null);
        const plb_district = ref(null);
        const plb_commune = ref(null);
        const plb_village = ref(null);

        // logic filter for place of birth
        const filteredDistrictsForBirth = computed(() => {
            if (!plb_province.value) return [];
            // Filter districts whose ADMIN_ID1 matches the selected province
            return districts.value.filter((d) => d.properties.ADMIN_ID1 === plb_province.value);
        });
        const filteredCommunesForBirth = computed(() => {
            if (!plb_district.value) return [];
            // Filter communes whose ADMIN_ID2 matches the selected district
            return communes.value.filter((c) => c.properties.ADMIN_ID2 === plb_district.value);
        });

        const filteredVillagesForBirth = computed(() => {
            if (!plb_commune.value) return [];
            // Filter villages whose ADMIN_ID3 matches the selected commune
            return villages.value.filter((v) => v.properties.ADMIN_ID3 === plb_commune.value);
        });
        const formattedVillagesForBirth = computed(() => {
            return filteredVillagesForBirth.value.map((v) => ({
                label: `${v.properties.NAME} (${v.properties.NAME_ENG})`,
                value: v.properties.ADMIN_ID,
                raw: v
            }));
        });
        // logic filter for family address

        const fm_province = ref(null);
        const fm_district = ref(null);
        const fm_commune = ref(null);
        const fm_village = ref(null);

        const filteredDistrictsForFamily = computed(() => {
            if (!fm_province.value) return [];
            // Filter districts whose ADMIN_ID1 matches the selected province
            return districts.value.filter((d) => d.properties.ADMIN_ID1 === fm_province.value);
        });
        const filteredCommunesForFamily = computed(() => {
            if (!fm_district.value) return [];
            // Filter communes whose ADMIN_ID2 matches the selected district
            return communes.value.filter((c) => c.properties.ADMIN_ID2 === fm_district.value);
        });
        const filteredVillagesForFamily = computed(() => {
            if (!fm_commune.value) return [];
            // Filter villages whose ADMIN_ID3 matches the selected commune
            return villages.value.filter((v) => v.properties.ADMIN_ID3 === fm_commune.value);
        });
        const formattedVillagesForFamily = computed(() => {
            return filteredVillagesForFamily.value.map((v) => ({
                label: `${v.properties.NAME} (${v.properties.NAME_ENG})`,
                value: v.properties.ADMIN_ID,
                raw: v
            }));
        });

        const handleSubmit = async () => {
            try {
                is_submitting.value = true;

                // Create FormData for multipart/form-data
                const formData = new FormData();

                // Append non-file fields
                formData.append('kh_name', kh_name.value || '');
                formData.append('eng_name', eng_name.value || '');
                formData.append('email', email.value || '');
                formData.append('gender', selectedGender.value || '');
                formData.append('date_of_birth', date_of_birth.value || '');
                formData.append('phoneNumber', phoneNumber.value || '');
                formData.append('father_name', father_name.value || '');
                formData.append('mother_name', mother_name.value || '');
                formData.append('address', address.value || '');
                formData.append('score', score.value?.toString() || '0');

                formData.append('attendance', attendance.value?.toString() || '0');
                formData.append('attendance_date', attendance_date.value || '');
                formData.append('attendance_enum', attendance_enum.value || '');

                if (Array.isArray(rental_book.value)) {
                    rental_book.value.forEach((id) => formData.append('rental_book[]', id));
                } else if (rental_book.value) {
                    formData.append('rental_book[]', rental_book.value);
                }
                formData.append('status', status.value);
                formData.append('date_entered', date_entered.value || '');
                formData.append('student_type', categorySelected.value || '');
                formData.append('province', selectedProvince.value || '');
                formData.append('district', selectedDistrict.value || '');
                formData.append('commune', selectedCommune.value || '');
                formData.append('village', selectedVillage.value || '');
                formData.append('document_type', documentType.value || '');
                formData.append('document_number', documentNumber.value || '');
                // place of birth
                formData.append('st_birth_province', plb_province.value || '');
                formData.append('st_birth_district', plb_district.value || '');
                formData.append('st_birth_commune', plb_commune.value || '');
                formData.append('st_birth_village', plb_village.value || '');

                // family address
                formData.append('family_province', fm_province.value || '');
                formData.append('family_district', fm_district.value || '');
                formData.append('family_commune', fm_commune.value || '');
                formData.append('family_village', fm_village.value || '');

                // Append phone numbers if they are provided
                if (father_phone.value) {
                    formData.append('father_phone', father_phone.value);
                }
                if (mother_phone.value) {
                    formData.append('mother_phone', mother_phone.value);
                }

                // Append file fields only if they are File objects
                if (image.value && image.value instanceof File) {
                    formData.append('image', image.value);
                    console.log('Appending image file:', image.value.name);
                } else {
                    console.log('No new image file selected');
                }

                if (document_image.value && document_image.value instanceof File) {
                    formData.append('document_image', document_image.value);
                    console.log('Appending document_image file:', document_image.value.name);
                } else {
                    console.log('No new document_image file selected');
                }

                // Log FormData contents for debugging
                console.log('FormData entries:');
                for (const [key, value] of formData.entries()) {
                    console.log(`${key}:`, value instanceof File ? value.name : value);
                }

                if (props.datatoedit) {
                    // Update existing student
                    await updateData(formData, props.datatoedit._id);
                    emit('close');
                    emit('toast', 'update');
                } else {
                    // Create new student
                    await postData(formData);
                    emit('close');
                    emit('toast', 'create');
                }
            } catch (error) {
                console.error('Error submitting form:', error);
            } finally {
                is_submitting.value = false;
            }
        };

        onMounted(async () => {
            await fetchStaff(filtersStaff.value);
            await fetchBooks(filtersBooks.value);
            await fetchCategory(filtersCategory.value);
            if (props.datatoedit) {
                kh_name.value = props.datatoedit.kh_name;
                eng_name.value = props.datatoedit.eng_name;
                email.value = props.datatoedit.email;
                selectedGender.value = props.datatoedit.gender;
                date_of_birth.value = props.datatoedit.date_of_birth;
                phoneNumber.value = props.datatoedit.phoneNumber;
                father_name.value = props.datatoedit.father_name;
                mother_name.value = props.datatoedit.mother_name;
                address.value = props.datatoedit.address;
                score.value = props.datatoedit.score;
                attendance.value = props.datatoedit.attendance;
                attendance_date.value = props.datatoedit.attendance_date;
                attendance_enum.value = props.datatoedit.attendance_enum;
                teacher.value = props.datatoedit.teacher;
                rental_book.value = props.datatoedit.rental_book?.map((item) => item._id) || [];
                status.value = props.datatoedit.status;
                date_entered.value = props.datatoedit.date_intered;
                previewUrl.value = props.datatoedit.image;
                // Don't set image.value to a URL; keep it null unless a new file is selected
                image.value = null;
                categorySelected.value = props.datatoedit?.student_type;
                selectedProvince.value = props.datatoedit.province;
                await nextTick(); // Wait for computed filteredDistricts to update

                selectedDistrict.value = props.datatoedit.district;
                await nextTick(); // Wait for filteredCommunes to update

                selectedCommune.value = props.datatoedit.commune;
                await nextTick(); // Wait for filteredVillages to update

                selectedVillage.value = props.datatoedit.village;
                documentType.value = props.datatoedit.document_type;
                documentNumber.value = props.datatoedit.document_number;
                // Don't set document_image.value to a URL
                document_image.value = null; // Fixed typo
                document_image_preview.value = props.datatoedit.document_image || null;
            }
            console.log('Mounted with data:', props.datatoedit);
        });

        return {
            gender,
            attendanceOptions,
            kh_name,
            eng_name,
            email,
            selectedGender,
            date_of_birth,
            phoneNumber,
            father_name,
            mother_name,
            address,
            score,
            attendance,
            attendance_date,
            attendance_enum,
            teacher,
            rental_book,
            status,
            date_entered,
            handleSubmit,
            handleChange,
            previewUrl,
            staff,
            books,
            category,
            categorySelected,
            provinces,
            districts,
            communes,
            villages,
            filteredDistricts,
            filteredCommunes,
            formattedVillages,
            documentType,
            documentNumber,
            document_image, // Fixed typo
            document_image_preview,
            handleDocumentChange,
            documentTypeOptions,
            selectedProvince,
            selectedDistrict,
            selectedCommune,
            selectedVillage,
            mother_phone,
            father_phone,
            filteredDistrictsForBirth,
            filteredCommunesForBirth,
            formattedVillagesForBirth,
            filteredVillagesForBirth,
            plb_province,
            plb_district,
            plb_commune,
            plb_village,
            filteredDistrictsForFamily,
            filteredCommunesForFamily,
            filteredVillagesForFamily,
            formattedVillagesForFamily,
            fm_province,
            fm_district,
            fm_commune,
            fm_village
        };
    }
};
</script>

<style lang="scss" scoped>
/* Add any scoped styles if needed */
</style>
