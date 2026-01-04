
import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
})
export class AppComponent {
  private fb = inject(FormBuilder);

  // --- Signals for State Management ---
  isLoggedIn = signal(false);
  showKeyModal = signal(false);
  showSupportModal = signal(false);
  isLoading = signal(false);
  loginError = signal<string | null>(null);
  
  // Fake session ID for QR code generation
  sessionId = signal(Math.random().toString(36).substring(7).toUpperCase());
  
  // QR Code URL based on session ID
  qrCodeUrl = computed(() => 
    `https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=000000&bgcolor=ffffff&data=SECURE-LOGIN-${this.sessionId()}`
  );

  // --- Forms ---
  
  // PIN Form (6 digits)
  pinForm: FormGroup = this.fb.group({
    pin: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
  });

  // Membership Key Form (20 alphanumeric) + PIN (6 digits)
  // Mask format: XXXX-XXXX-XXXX-XXXX-XXXX (24 chars total)
  keyForm: FormGroup = this.fb.group({
    key: ['', [
      Validators.required, 
      Validators.minLength(24), 
      Validators.maxLength(24), 
      Validators.pattern(/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/)
    ]],
    pin: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
  });

  // Support Ticket Form
  supportForm: FormGroup = this.fb.group({
    message: ['', [Validators.required, Validators.minLength(10)]]
  });

  // --- Actions ---

  // Input Masking for Membership Key
  onKeyInput(event: Event) {
    const input = event.target as HTMLInputElement;
    // Strip non-alphanumeric chars and uppercase
    let rawValue = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');

    // Limit to 20 raw chars
    if (rawValue.length > 20) {
      rawValue = rawValue.substring(0, 20);
    }

    // Add hyphens every 4 chars
    const parts = rawValue.match(/.{1,4}/g) || [];
    const formatted = parts.join('-');

    // Update control value without emitting event to prevent loops (though here we are safe)
    this.keyForm.get('key')?.setValue(formatted, { emitEvent: false });
  }

  handlePinLogin() {
    if (this.pinForm.invalid) {
      this.loginError.set('Please enter a valid 6-digit PIN.');
      return;
    }

    this.isLoading.set(true);
    this.loginError.set(null);

    // Simulate API call
    setTimeout(() => {
      const enteredPin = this.pinForm.get('pin')?.value;
      
      // Demo logic: Accept '123456'
      if (enteredPin === '123456') {
        this.isLoggedIn.set(true);
      } else {
        this.loginError.set('Invalid PIN. Try "123456" for demo.');
        this.pinForm.reset();
      }
      this.isLoading.set(false);
    }, 1500);
  }

  handleKeyLogin() {
    if (this.keyForm.invalid) {
      return; 
    }

    this.isLoading.set(true);
    this.loginError.set(null);

    // Simulate API call
    setTimeout(() => {
      const enteredPin = this.keyForm.get('pin')?.value;
      
      // Check PIN validity in addition to Key format (which is handled by validators)
      if (enteredPin === '123456') {
        this.isLoggedIn.set(true);
        this.closeModals();
      } else {
        this.loginError.set('Invalid Security PIN. The key was accepted, but the PIN is incorrect. Try "123456".');
        // We do not reset the whole form, maybe just the PIN?
        this.keyForm.get('pin')?.reset();
      }
      this.isLoading.set(false);
    }, 2000);
  }

  submitSupportTicket() {
    if (this.supportForm.invalid) return;

    this.isLoading.set(true);
    // Simulate network request
    setTimeout(() => {
      alert('Your ticket has been sent to the system administrator.');
      this.supportForm.reset();
      this.closeModals();
      this.isLoading.set(false);
    }, 1000);
  }

  // --- Modal Controls ---

  openKeyModal() {
    this.showKeyModal.set(true);
    this.showSupportModal.set(false);
    this.loginError.set(null);
    this.keyForm.reset();
  }

  openSupportModal() {
    this.showSupportModal.set(true);
    this.showKeyModal.set(false);
    this.supportForm.reset();
  }

  closeModals() {
    this.showKeyModal.set(false);
    this.showSupportModal.set(false);
    this.loginError.set(null);
  }

  logout() {
    this.isLoggedIn.set(false);
    this.pinForm.reset();
    this.keyForm.reset();
    this.sessionId.set(Math.random().toString(36).substring(7).toUpperCase());
  }

  // Helper for input classes
  getInputClass(controlName: string, form: FormGroup): string {
    const control = form.get(controlName);
    const baseClass = "w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all text-center tracking-widest text-lg font-mono placeholder-gray-400";
    if (control?.invalid && (control?.dirty || control?.touched)) {
      return `${baseClass} border-red-500 bg-red-50 focus:ring-red-200`;
    }
    return baseClass;
  }
}
