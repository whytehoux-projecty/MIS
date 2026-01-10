import { Component, inject, computed, effect, OnDestroy, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from "@angular/forms";
import { AuthService } from "./services/auth.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./app.component.html",
})
export class AppComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  // --- State from AuthService ---
  isLoggedIn = this.authService.isLoggedIn;
  isLoading = this.authService.isLoading;
  loginError = this.authService.error;
  currentUser = this.authService.currentUser;

  // QR Code state
  qrCodeUrl = this.authService.qrImage;
  qrExpiresAt = this.authService.qrExpiresAt;

  // We need a computed signal for visibility
  isQrVisible = computed(() => !!this.qrCodeUrl());

  // Time signal for countdown
  private now = signal(Date.now());

  // QR expiration countdown
  qrTimeRemaining = computed(() => {
    const expires = this.qrExpiresAt();
    if (!expires) return 0;
    return Math.max(0, Math.floor((expires.getTime() - this.now()) / 1000));
  });

  // Modal state
  showKeyModal = signal(false);
  showSupportModal = signal(false);

  // Countdown interval
  private countdownInterval: any;

  // --- Forms ---
  pinForm: FormGroup = this.fb.group({
    pin: ["", [Validators.required, Validators.pattern("^[0-9]{6}$")]],
  });

  keyForm: FormGroup = this.fb.group({
    key: [
      "",
      [
        Validators.required,
        Validators.minLength(24),
        Validators.maxLength(24),
        Validators.pattern(
          /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/
        ),
      ],
    ],
    pin: ["", [Validators.required, Validators.pattern("^[0-9]{6}$")]],
  });

  supportForm: FormGroup = this.fb.group({
    message: ["", [Validators.required, Validators.minLength(10)]],
  });

  constructor() {
    // Start countdown timer for QR expiration
    this.countdownInterval = setInterval(() => {
      this.now.set(Date.now());
    }, 1000);
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  // --- Actions ---

  async generateQr() {
    await this.authService.generateQRCode();
  }

  async handlePinLogin() {
    if (this.pinForm.invalid) {
      return;
    }

    const pin = this.pinForm.get("pin")?.value;
    const success = await this.authService.verifyPIN(pin);

    if (success) {
      this.pinForm.reset();
    } else {
      this.pinForm.get("pin")?.reset();
    }
  }

  async logout() {
    await this.authService.logout();
    this.pinForm.reset();
    this.keyForm.reset();
  }

  // Input Masking for Membership Key
  onKeyInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let rawValue = input.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (rawValue.length > 20) rawValue = rawValue.substring(0, 20);
    const parts = rawValue.match(/.{1,4}/g) || [];
    const formatted = parts.join("-");
    this.keyForm.get("key")?.setValue(formatted, { emitEvent: false });
  }

  handleKeyLogin() {
    // TODO: Implement backend support for Manual Key Login
    alert("Manual Key Login is not yet connected to the backend.");
  }

  submitSupportTicket() {
    if (this.supportForm.invalid) return;
    // Mock
    alert("Your ticket has been sent to the system administrator.");
    this.supportForm.reset();
    this.closeModals();
  }

  // Modal methods
  openKeyModal() {
    this.showKeyModal.set(true);
    this.showSupportModal.set(false);
    this.authService.clearError();
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
    this.authService.clearError();
  }

  getInputClass(controlName: string, form: FormGroup): string {
    const control = form.get(controlName);
    const baseClass =
      "w-full p-3 bg-gray-50 border border-chaco/20 focus:ring-2 focus:ring-chaco focus:border-chaco outline-none transition-all text-center tracking-widest text-lg font-digital placeholder-gray-400";
    if (control?.invalid && (control?.dirty || control?.touched)) {
      return `${baseClass} border-red-500 bg-red-50 focus:ring-red-200`;
    }
    return baseClass;
  }
}
