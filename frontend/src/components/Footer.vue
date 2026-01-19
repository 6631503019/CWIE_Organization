<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-content">
        <!-- About Section -->
        <div class="footer-section">
          <h4>CWIE Organization</h4>
          <p>Connecting students with industry through cooperative education and work-integrated experiences.</p>
          <div class="social-links">
            <a href="#" class="social-link" aria-label="Facebook">📘</a>
            <a href="#" class="social-link" aria-label="Twitter">🐦</a>
            <a href="#" class="social-link" aria-label="LinkedIn">💼</a>
            <a href="#" class="social-link" aria-label="Instagram">📷</a>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="footer-section">
          <h4>Quick Links</h4>
          <nav class="footer-nav">
            <a href="/home" class="footer-link">Home</a>
            <a href="/organizations" class="footer-link">Organizations</a>
            <a href="/roadshows" class="footer-link">Roadshows</a>
            <a href="/mou" class="footer-link">MOU</a>
          </nav>
        </div>

        <!-- Resources -->
        <div class="footer-section">
          <h4>Resources</h4>
          <nav class="footer-nav">
            <a href="/about" class="footer-link">About Us</a>
            <a href="/contact" class="footer-link">Contact</a>
            <a href="/privacy" class="footer-link">Privacy Policy</a>
            <a href="/terms" class="footer-link">Terms of Service</a>
          </nav>
        </div>

        <!-- Contact Info -->
        <div class="footer-section">
          <h4>Contact Us</h4>
          <div class="contact-info">
            <p>📧 info@cwie-org.com</p>
            <p>📞 +1 (555) 123-4567</p>
            <p>📍 123 University Ave, Education City</p>
          </div>
        </div>
      </div>

      <!-- Footer Bottom -->
      <div class="footer-bottom">
        <div class="footer-copyright">
          <p>&copy; {{ currentYear }} CWIE Organization. All rights reserved.</p>
        </div>
        <div class="footer-links">
          <a href="/privacy" class="footer-bottom-link">Privacy</a>
          <a href="/terms" class="footer-bottom-link">Terms</a>
          <a href="/sitemap" class="footer-bottom-link">Sitemap</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.footer {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: #ecf0f1;
  margin-top: auto;
}

.footer-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  padding: 60px 0 40px;
}

.footer-section h4 {
  color: #3498db;
  margin-bottom: 20px;
  font-size: 1.2rem;
  font-weight: 600;
}

.footer-section p {
  line-height: 1.6;
  margin-bottom: 20px;
  color: #bdc3c7;
}

.social-links {
  display: flex;
  gap: 12px;
}

.social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: #34495e;
  border-radius: 50%;
  text-decoration: none;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.social-link:hover {
  background-color: #3498db;
  transform: translateY(-2px);
}

.footer-nav {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-link {
  color: #bdc3c7;
  text-decoration: none;
  transition: color 0.3s ease;
  font-size: 14px;
}

.footer-link:hover {
  color: #3498db;
}

.contact-info p {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-top: 1px solid #34495e;
  flex-wrap: wrap;
  gap: 16px;
}

.footer-copyright p {
  margin: 0;
  font-size: 14px;
  color: #95a5a6;
}

.footer-links {
  display: flex;
  gap: 24px;
}

.footer-bottom-link {
  color: #95a5a6;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
}

.footer-bottom-link:hover {
  color: #3498db;
}

/* Responsive Design */
@media (max-width: 768px) {
  .footer-container {
    padding: 0 16px;
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 30px;
    padding: 40px 0 30px;
  }

  .footer-section {
    text-align: center;
  }

  .footer-nav {
    align-items: center;
  }

  .footer-bottom {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .footer-links {
    justify-content: center;
  }

  .social-links {
    justify-content: center;
  }

  .contact-info p {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .footer-content {
    padding: 30px 0 20px;
  }

  .footer-section h4 {
    font-size: 1.1rem;
  }

  .footer-links {
    flex-direction: column;
    gap: 12px;
  }
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
  .footer {
    background: linear-gradient(135deg, #1a252f 0%, #2c3e50 100%);
  }
  
  .social-link {
    background-color: #2c3e50;
  }
  
  .footer-bottom {
    border-top-color: #2c3e50;
  }
}
</style>