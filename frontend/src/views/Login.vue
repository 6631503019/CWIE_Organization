<template>
  <div class="login-page">
    <div class="login-container">
      <!-- MFU Logo -->
      <div class="logo-section">
        <img 
          src="https://archives.mfu.ac.th/wp-content/uploads/2019/06/Mae-Fah-Luang-University-2.png" 
          alt="Mae Fah Luang University Logo"
          class="logo-image"
        />
      </div>
      
      <!-- Form Section -->
      <div class="form-section">
        <div class="form-header">
          <!-- Title -->
          <h1 class="form-title">MFU CWIE Organization Database</h1>
          
          <!-- Input Fields Container -->
          <div class="input-fields-container">
            <!-- Email Input -->
            <div class="input-basic">
              <div class="input-label-frame">
                <span class="input-label">ID</span>
                <span class="input-required">*</span>
              </div>
              <div class="input-frame" :class="{ focused: emailFocused }">
                <div class="input-cursor" v-if="emailFocused"></div>
                <div class="input-content-frame">
                  <input 
                    v-model="email"
                    @focus="emailFocused = true"
                    @blur="emailFocused = false"
                    type="email"
                    class="input-value"
                    required
                  />
                </div>
              </div>
            </div>

            <!-- Password Input -->
            <div class="input-password">
              <div class="password-label-frame">
                <span class="password-label">Password</span>
                <div class="password-asterix">
                  <span class="password-required">*</span>
                </div>
              </div>
              <div class="password-frame" :class="{ focused: passwordFocused }">
                <div class="password-cursor" v-if="passwordFocused"></div>
                <div class="password-content-frame">
                  <input 
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    class="password-value"
                    @focus="passwordFocused = true"
                    @blur="passwordFocused = false"
                    @keydown.enter="handleLogin"
                    required
                  />
                </div>
                <i 
                  v-if="password.length > 0"
                  :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"
                  class="password-toggle-icon"
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
          class="login-button"
          :disabled="isLoading"
        >
          <span class="button-text">
            {{ isLoading ? 'Logging in...' : 'Log In' }}
          </span>
        </button>
      </div>
    </div>
    
    <!-- Error Message -->
    <div v-if="error" class="error-toast">
      {{ error }}
    </div>
    
    <!-- User Icon Right -->
    <div class="user-icon-right">
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
    const loginResult = await authStore.login({
      email: email.value,
      password: password.value
    })

    if (loginResult.success) {
      // Clear form
      email.value = ''
      password.value = ''

      // Redirect based on user role
      if (authStore.isAdmin) {
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
.login-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #FFFFFF;
  overflow: hidden;
}

/* Frame 36 - Login Container */
.login-container {
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
.logo-section {
  width: 141px;
  height: 199px;
  
  /* Inside auto layout */
  flex: none;
  order: 0;
  flex-grow: 0;
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Frame 26 - Form Section */
.form-section {
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
.form-header {
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
.form-title {
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
.input-fields-container {
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
.input-basic {
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
.input-label-frame {
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
.input-label {
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
.input-required {
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
.input-frame {
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

.input-frame:not(.focused) {
  /* Light Mode/Border/Secondary */
  border: 1px solid #D8D8DA;
}

/* Frame 5 - Input Content Frame */
.input-content-frame {
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
.input-cursor {
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
.input-value {
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
.input-password {
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
.password-label-frame {
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
.input-icon {
  color: #000000;
  font-size: 16px;
  margin-right: 8px;
}

/* Input Icon Right */
.input-icon-right {
  color: #000000;
  font-size: 16px;
  margin-left: 8px;
}

/* User Icon Right */
.user-icon-right {
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
.password-label {
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
.password-asterix {
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
.password-required {
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
.password-frame {
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

.password-frame:not(.focused) {
  /* Light Mode/Border/Secondary */
  border: 1px solid #D8D8DA;
}

/* Password Cursor */
.password-cursor {
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
.password-content-frame {
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
.password-value {
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

.password-value::placeholder {
  /* Light Mode/Text/Secondary */
  color: #89898A;
}

/* Password Toggle Icon */
.password-toggle-icon {
  color: #89898A;
  font-size: 16px;
  cursor: pointer;
  flex: none;
  order: 2;
}

.password-toggle-icon:hover {
  color: #2C71F6;
}

/* Button Contained - Login Button */
.login-button {
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

.login-button:hover {
  background: #1e5ce6;
}

.login-button:disabled {
  background: #89898A;
  cursor: not-allowed;
}

/* Button Text */
.button-text {
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
.error-toast {
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
  .login-page {
    width: 100vw;
    height: 100vh;
    padding: 20px;
    box-sizing: border-box;
    overflow: hidden;
  }
  
  .login-container {
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
}

@media (max-width: 768px) {
  .login-page {
    padding: 10px;
    overflow: hidden;
    height: 100vh;
  }

  .login-container {
    width: 90%;
    max-width: 373px;
    position: relative;
    left: auto;
    top: auto;
    transform: none;
    margin: 20px auto;
    z-index: 10;
  }

  .user-icon-right {
    display: none;
  }

  .input-basic, 
  .input-password {
    width: 100%;
    margin: 0;
  }

  .input-frame,
  .password-frame,
  .login-button {
    width: 100%;
  }

  .input-fields-container {
    width: 100%;
  }

  .form-header {
    width: 100%;
  }

  .form-section {
    width: 100%;
  }

  .form-title {
    font-size: 20px;
    width: 100%;
  }
}

@media (max-height: 600px) {
  .login-page {
    padding: 10px;
    overflow: hidden;
    height: 100vh;
  }
  
  .login-container {
    top: 20px;
    transform: translate(-50%, 0);
  }
}

</style>