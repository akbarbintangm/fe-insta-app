<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useAuthStore } from '@/stores/auth';
  import { Form } from 'vee-validate';
  // import Google from '@/assets/images/auth/social-google.svg';
  const valid = ref(false);
  const checkbox = ref(false);
  const show1 = ref(false);
  const password = ref('');
  const email = ref('');
  const firstname = ref('');
  const lastname = ref('');
  const passwordRules = ref([
    (v: string) => !!v || 'Password is required',
    // (v: string) => (v && v.length <= 10) || 'Password must be less than 10 characters'
  ]);
  const emailRules = ref([(v: string) => !!v || 'E-mail is required', (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid']);

  const isFormInvalid = computed(() => {
    return (
      !firstname.value ||
      !lastname.value ||
      !email.value ||
      !password.value ||
      !checkbox.value
    );
  });

  const isLoading = ref(false);
  const errorMesage = ref('');

  import ModalDialogMessages from '@/components/shared/ModalDialog.vue';
  import { useModalStore } from '@/stores/components/modal';
  const modal = useModalStore();

  import ModalConfirmationMessages from '@/components/shared/ConfirmationDialog.vue';
  import { useConfirmStore } from '@/stores/components/confirmation';
  const confirm = useConfirmStore();

  const authStore = useAuthStore();

  async function validate(values: any, { setErrors }: any) {
    isLoading.value = false;
    try {
      await confirm.open("Yakin ingin register?", "Register");
      isLoading.value = true;
      await authStore.register(firstname.value, lastname.value, email.value, password.value)
        .catch((error) => {
          modal.messageDialogActive = true
          modal.messageDialogText = error
          errorMesage.value = error
        })
        .finally(() => {
        })
    } catch (error: any) {
      errorMesage.value = error;
    } finally {
      isLoading.value = false;
    }
  }
</script>

<template>
  <ModalConfirmationMessages v-model="confirm.confirmDialogActive" :message="confirm.confirmDialogText" />
  <ModalDialogMessages v-model="modal.messageDialogActive" :message="modal.messageDialogText" />

  <!-- <v-btn block color="primary" variant="outlined" class="text-lightText googleBtn">
    <img :src="Google" alt="google" />
    <span class="ml-2">Sign up with Google</span></v-btn> -->
  <!-- <v-row>
    <v-col class="d-flex align-center">
      <v-divider class="custom-devider" />
      <v-btn variant="outlined" class="orbtn" rounded="md" size="small">OR</v-btn>
      <v-divider class="custom-devider" />
    </v-col>
  </v-row> -->
  <!-- <h5 class="text-h5 text-center my-4 mb-8">Sign up with Email address</h5> -->
  <Form @submit="validate" class="mt-7 loginForm" v-slot="{ errors, isSubmitting }">
    <v-row>
      <v-col cols="12" sm="6">
        <v-text-field v-model="firstname" density="comfortable" hide-details="auto" variant="outlined" color="primary" label="Firstname"></v-text-field>
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field v-model="lastname" density="comfortable" hide-details="auto" variant="outlined" color="primary" label="Lastname"></v-text-field>
      </v-col>
    </v-row>
    <v-text-field v-model="email" :rules="emailRules" label="Email Address / Username" class="mt-4 mb-4" required density="comfortable" hide-details="auto" variant="outlined"
                  color="primary"></v-text-field>
    <v-text-field v-model="password" :rules="passwordRules" label="Password" required density="comfortable" variant="outlined" color="primary" hide-details="auto"
                  :append-icon="show1 ? '$eye' : '$eyeOff'" :type="show1 ? 'text' : 'password'" @click:append="show1 = !show1" class="pwdInput"></v-text-field>

    <div class="d-sm-inline-flex align-center mt-2 mb-7 mb-sm-0 font-weight-bold">
      <v-checkbox v-model="checkbox" :rules="[(v: any) => !!v || 'You must agree to continue!']" label="Agree with?" required color="primary" class="ms-n2" hide-details></v-checkbox>
      <a href="#" class="ml-1 text-lightText">Terms and Condition</a>
    </div>
    <v-btn :disabled="isFormInvalid" color="primary" :loading="isLoading" block class="mt-2" variant="flat" size="large" type="submit">Sign Up</v-btn>
    <div v-if="errorMesage" class="mt-2">
      <v-alert color="error">{{ errorMesage }}</v-alert>
    </div>
  </Form>
  <div class="mt-5 text-right">
    <v-divider />
    <v-btn variant="plain" to="/login" class="mt-2 text-capitalize mr-n2">Already have an account?</v-btn>
  </div>
</template>
<style lang="scss">
  .custom-devider {
    border-color: rgba(0, 0, 0, 0.08) !important;
  }

  .googleBtn {
    border-color: rgba(0, 0, 0, 0.08);
    margin: 30px 0 20px 0;
  }

  .outlinedInput .v-field {
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: none;
  }

  .orbtn {
    padding: 2px 40px;
    border-color: rgba(0, 0, 0, 0.08);
    margin: 20px 15px;
  }

  .pwdInput {
    position: relative;

    .v-input__append {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
    }
  }
</style>
