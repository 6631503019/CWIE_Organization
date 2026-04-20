<template>
  <div class="login_page">
    <div class="login_container">
      <!-- MFU Logo -->
      <div class="logo_section">
        <img 
          src="https://archives.mfu.ac.th/wp-content/uploads/2019/06/Mae-Fah-Luang-University-2.png" 
          alt="Mae Fah Luang University Logo"
          class="logo_image"
        />
      </div>
      
      <!-- Form Section -->
      <div class="form_section">
        <div class="form_header">
          <!-- Title -->
          <h1 class="form_title">MFU CWIE Organization Database</h1>
          
          <!-- Input Fields Container -->
          <div class="input_fields_container">
            <!-- Email Input -->
            <div class="input_basic">
              <div class="input_label_frame">
                <span class="input_label">ID</span>
                <span class="input_required">*</span>
              </div>
              <div class="input_frame" :class="{ focused: emailFocused }">
                <div class="input_cursor" v-if="emailFocused"></div>
                <div class="input_content_frame">
                  <input 
                    v-model="email"
                    @focus="emailFocused = true"
                    @blur="emailFocused = false"
                    type="email"
                    class="input_value"
                    required
                  />
                </div>
              </div>
            </div>

            <!-- Password Input -->
            <div class="input_password">
              <div class="password_label_frame">
                <span class="password_label">Password</span>
                <div class="password_asterix">
                  <span class="password_required">*</span>
                </div>
              </div>
              <div class="password_frame" :class="{ focused: passwordFocused }">
                <div class="password_cursor" v-if="passwordFocused"></div>
                <div class="password_content_frame">
                  <input 
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    class="password_value"
                    @focus="passwordFocused = true"
                    @blur="passwordFocused = false"
                    @keydown.enter="handleLogin"
                    required
                  />
                </div>
                <i 
                  v-if="password.length > 0"
                  :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"
                  class="password_toggle_icon"
                  @click="showPassword = !showPassword"
                ></i>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Login Button -->
        <button 
          type="button" 
          @click="handleLogin"
          class="login_button"
          :disabled="isLoading"
        >
          <span class="button_text">
            {{ isLoading ? 'Logging in...' : 'Log In' }}
          </span>
        </button>
      </div>
    </div>
    
    <!-- Error Message -->
    <div v-if="error" class="error_toast">
      {{ error }}
    </div>
    
    <!-- User Icon Right -->
    <div class="user_icon_right">
      <i class="pi pi-user"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Router and auth store
const router = useRouter()
const authStore = useAuthStore()

// Form state
const email = ref('')
const password = ref('')
const emailFocused = ref(false)
const passwordFocused = ref(false)
const showPassword = ref(false)
const emailError = ref(false)

// Loading and error states - initialize with default values
const isLoading = ref(false)
const error = ref<string | null>(null)

const handleLogin = async () => {
  // Clear previous errors
  error.value = null
  
  // Basic validation
  if (!email.value || !password.value) {
    error.value = 'Please enter ID and password'
    return
  }

  try {
    isLoading.value = true
    
    // Use auth store to handle login
    const loginResult = await authStore.Login({
      email: email.value,
      password: password.value
    })

    if (loginResult.success) {
      // Clear form
      email.value = ''
      password.value = ''

      // Redirect based on user role
      if (authStore.bln_Is_Admin) {
        await router.push('/admin/dashboard')
      } else {
        await router.push('/user/organization')
      }
    } else {
      error.value = loginResult.message || 'Login failed'
    }
  } catch (err) {
    console.error('Login error:', err)
    error.value = err instanceof Error ? err.message : 'Login failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* Import Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Roboto:wght@400;500;600&display=swap');
@import url('https://cdn.jsdelivr.net/npm/primeicons@6.0.1/primeicons.css');

/* Login Page - Main Container */
.login_page {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #FFFFFF;
  overflow: hidden;
}

/* Frame 36 - Login Container */
.login_container {
  /* Auto layout */
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0px;
  gap: 24px;

  position: absolute;
  width: 373px;
  height: 524px;
  left: 151px;
  top: calc(50vh - 262px);
  z-index: 10;
}

/* Image 10 - Logo Section */
.logo_section {
  width: 141px;
  height: 199px;
  
  /* Inside auto layout */
  flex: none;
  order: 0;
  flex-grow: 0;
}

.logo_image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Frame 26 - Form Section */
.form_section {
  /* Auto layout */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 17px;

  width: 373px;
  height: 301px;

  /* Inside auto layout */
  flex: none;
  order: 1;
  align-self: stretch;
  flex-grow: 0;
}

/* Frame 1 - Form Header */
.form_header {
  /* Auto layout */
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0px;
  gap: 35px;

  width: 373px;
  height: 242px;

  /* Inside auto layout */
  flex: none;
  order: 0;
  align-self: stretch;
  flex-grow: 0;
}

/* MFU CWIE Organization Database - Title */
.form_title {
  width: 373px;
  height: 55px;

  font-family: 'Outfit';
  font-style: normal;
  font-weight: 700;
  font-size: 24px;
  line-height: 30px;
  text-align: center;

  color: #000000;

  /* Inside auto layout */
  flex: none;
  order: 0;
  align-self: stretch;
  flex-grow: 0;
  margin: 0;
}

/* Frame 23 - Input Fields Container */
.input_fields_container {
  /* Auto layout */
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  align-content: flex-start;
  padding: 0px;
  row-gap: 4px;

  width: 373px;
  height: 152px;

  /* Inside auto layout */
  flex: none;
  order: 1;
  flex-grow: 0;
}

/* Basic Input - Email Input */
.input_basic {
  /* Auto layout */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 4px;

  width: 373px;
  height: 62px;

  /* Inside auto layout */
  flex: none;
  order: 0;
  flex-grow: 0;
}

/* Frame 1763 - Input Label Frame */
.input_label_frame {
  /* Auto layout */
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 0px;
  gap: 4px;

  width: 24px;
  height: 20px;

  /* Inside auto layout */
  flex: none;
  order: 0;
  flex-grow: 0;
}

/* Label */
.input_label {
  width: 14px;
  height: 20px;

  /* Text/Body2-Medium */
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 140%;
  /* identical to box height, or 20px */
  display: flex;
  align-items: center;
  text-align: center;

  /* Light Mode/Text/Default */
  color: #202020;

  /* Inside auto layout */
  flex: none;
  order: 0;
  flex-grow: 0;
}

/* * - Required Asterisk */
.input_required {
  width: 6px;
  height: 17px;

  /* Text/Body3-Regular */
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 140%;
  /* identical to box height, or 17px */

  /* Text/Error */
  color: #F73B3B;

  /* Inside auto layout */
  flex: none;
  order: 1;
  flex-grow: 0;
}

/* Frame 1 - Input Frame */
.input_frame {
  box-sizing: border-box;

  /* Auto layout */
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px;
  gap: 10px;

  width: 373px;
  height: 38px;

  /* Light Mode/Background/Default */
  background: #FFFFFF;
  /* Light Mode/Border/Secondary */
  border: 1px solid #D8D8DA;
  border-radius: 6px;

  /* Inside auto layout */
  flex: none;
  order: 1;
  flex-grow: 0;
}

.input-frame.focused {
  /* Light Mode/Border/Primary */
  border: 1px solid #2C71F6;
}

.input_frame:not(.focused) {
  /* Light Mode/Border/Secondary */
  border: 1px solid #D8D8DA;
}

/* Frame 5 - Input Content Frame */
.input_content_frame {
  /* Auto layout */
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 4px;

  width: 100%;
  height: 20px;

  /* Inside auto layout */
  flex: 1;
  order: 0;
  flex-grow: 1;
}

/* Frame 4 - Input Cursor */
.input_cursor {
  width: 1px;
  height: 16px;

  /* Light Mode/Background/Primary */
  background: #2C71F6;

  /* Inside auto layout */
  flex: none;
  order: 0;
  align-self: center;
  flex-grow: 0;
  margin-right: 4px;
}

/* Input Value */
.input_value {
  width: 100%;
  height: 20px;
  border: none;
  outline: none;
  background: transparent;

  /* Text/Body2-Regular */
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 140%;
  /* identical to box height, or 20px */

  /* Light Mode/Text/Default */
  color: #202020;
}

/* Password Input */
.input_password {
  /* Auto layout */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 4px;

  width: 373px;
  height: 62px;

  /* Inside auto layout */
  flex: none;
  order: 1;
  flex-grow: 0;
}

/* Frame 1762 - Password Label Frame */
.password_label_frame {
  /* Auto layout */
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 0px;
  gap: 4px;

  width: 72px;
  height: 20px;

  /* Inside auto layout */
  flex: none;
  order: 0;
  flex-grow: 0;
}
.input_icon {
  color: #000000;
  font-size: 16px;
  margin-right: 8px;
}

/* Input Icon Right */
.input_icon_right {
  color: #000000;
  font-size: 16px;
  margin-left: 8px;
}

/* User Icon Right */
.user_icon_right {
  position: fixed;
  right: 350px;
  top: 50vh;
  transform: translateY(-50%);
  font-size: 300px;
  color: #000000;
  z-index: 0;
  pointer-events: none;
}

/* Password Label */
.password_label {
  width: 62px;
  height: 20px;

  /* Text/Body2-Medium */
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 140%;
  /* identical to box height, or 20px */
  display: flex;
  align-items: center;
  text-align: center;

  /* Light Mode/Text/Default */
  color: #202020;

  /* Inside auto layout */
  flex: none;
  order: 0;
  flex-grow: 0;
}

/* Password Asterix */
.password_asterix {
  /* Auto layout */
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
  padding: 0px 2px;
  gap: 10px;

  width: 6px;
  height: 17px;

  /* Inside auto layout */
  flex: none;
  order: 1;
  flex-grow: 0;
}

/* Password Required */
.password_required {
  width: 6px;
  height: 17px;

  /* Text/Body3-Regular */
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 140%;
  /* identical to box height, or 17px */

  /* Text/Error */
  color: #F73B3B;

  /* Inside auto layout */
  flex: none;
  order: 0;
  flex-grow: 0;
}

/* Password Frame */
.password_frame {
  box-sizing: border-box;

  /* Auto layout */
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px;
  gap: 10px;

  width: 373px;
  height: 38px;

  /* Light Mode/Background/Default */
  background: #FFFFFF;
  /* Light Mode/Border/Secondary */
  border: 1px solid #D8D8DA;
  border-radius: 6px;

  /* Inside auto layout */
  flex: none;
  order: 1;
  flex-grow: 0;
}

.password-frame.focused {
  /* Light Mode/Border/Primary */
  border: 1px solid #2C71F6;
}

.password_frame:not(.focused) {
  /* Light Mode/Border/Secondary */
  border: 1px solid #D8D8DA;
}

/* Password Cursor */
.password_cursor {
  width: 1px;
  height: 16px;

  /* Light Mode/Background/Primary */
  background: #2C71F6;

  /* Inside auto layout */
  flex: none;
  order: 0;
  align-self: center;
  flex-grow: 0;
  margin-right: 4px;
}

/* Password Content Frame */
.password_content_frame {
  /* Auto layout */
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 0px;
  gap: 8px;

  width: 100%;
  height: 20px;

  /* Inside auto layout */
  flex: 1;
  order: 1;
  flex-grow: 1;
}

/* Password Value */
.password_value {
  width: 100%;
  height: 20px;
  border: none;
  outline: none;
  background: transparent;

  /* Text/Body2-Regular */
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 140%;
  /* identical to box height, or 20px */

  /* Light Mode/Text/Default */
  color: #202020;
}

.password_value::placeholder {
  /* Light Mode/Text/Secondary */
  color: #89898A;
}

/* Password Toggle Icon */
.password_toggle_icon {
  color: #89898A;
  font-size: 16px;
  cursor: pointer;
  flex: none;
  order: 2;
}

.password_toggle_icon:hover {
  color: #2C71F6;
}

/* Button Contained - Login Button */
.login_button {
  /* Auto layout */
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 10px 20px;

  width: 373px;
  height: 42px;

  /* Light Mode/Background/Primary */
  background: #2C71F6;
  border-radius: 6px;
  border: none;
  cursor: pointer;

  /* Inside auto layout */
  flex: none;
  order: 1;
  align-self: stretch;
  flex-grow: 0;

  transition: background-color 0.2s ease;
}

.login_button:hover {
  background: #1e5ce6;
}

.login_button:disabled {
  background: #89898A;
  cursor: not-allowed;
}

/* Button Text */
.button_text {
  width: auto;
  height: 14px;

  /* Button/Button2-SemiBold */
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 100%;
  /* identical to box height, or 14px */

  /* Light Mode/Background/Default */
  color: #FFFFFF;

  /* Inside auto layout */
  flex: none;
  order: 0;
  flex-grow: 0;
}

/* Error Toast */
.error_toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #F73B3B;
  color: white;
  padding: 12px 16px;
  border-radius: 6px;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  z-index: 1000;
}

/* Responsive Design */
@media (max-width: 1440px) {
  .login_page {
    width: 100vw;
    height: 100vh;
    padding: 20px;
    box-sizing: border-box;
    overflow: hidden;
  }
  
  .login_container {
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
}

@media (max-width: 768px) {
  .login_page {
    padding: 10px;
    overflow: hidden;
    height: 100vh;
  }

  .login_container {
    width: 90%;
    max-width: 373px;
    position: relative;
    left: auto;
    top: auto;
    transform: none;
    margin: 20px auto;
    z-index: 10;
  }

  .user_icon_right {
    display: none;
  }

  .input-basic, 
  .input_password {
    width: 100%;
    margin: 0;
  }

  .input-frame,
  .password-frame,
  .login_button {
    width: 100%;
  }

  .input_fields_container {
    width: 100%;
  }

  .form_header {
    width: 100%;
  }

  .form_section {
    width: 100%;
  }

  .form_title {
    font-size: 20px;
    width: 100%;
  }
}

@media (max-height: 600px) {
  .login_page {
    padding: 10px;
    overflow: hidden;
    height: 100vh;
  }
  
  .login_container {
    top: 20px;
    transform: translate(-50%, 0);
  }
}

</style>

