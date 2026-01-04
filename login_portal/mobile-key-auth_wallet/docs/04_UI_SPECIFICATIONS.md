# Mobile Auth App - UI Specifications

## Design System

### Color Palette

```
┌─────────────────────────────────────────────────────────────┐
│  PRIMARY COLORS                                              │
├─────────────────────────────────────────────────────────────┤
│  Primary        #8b5cf6  ████████████  Main brand color     │
│  Primary Dark   #7c3aed  ████████████  Pressed states       │
│  Primary Light  #a78bfa  ████████████  Highlights           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  BACKGROUND COLORS (Dark Theme Default)                      │
├─────────────────────────────────────────────────────────────┤
│  Background     #0f172a  ████████████  Main background      │
│  Surface        #1e293b  ████████████  Cards, modals        │
│  Surface Light  #334155  ████████████  Elevated surfaces    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  TEXT COLORS                                                 │
├─────────────────────────────────────────────────────────────┤
│  Text           #f8fafc  ████████████  Primary text         │
│  Text Secondary #94a3b8  ████████████  Secondary text       │
│  Text Muted     #64748b  ████████████  Disabled/subtle      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  STATUS COLORS                                               │
├─────────────────────────────────────────────────────────────┤
│  Success        #22c55e  ████████████  Success states       │
│  Error          #ef4444  ████████████  Error states         │
│  Warning        #f59e0b  ████████████  Warning states       │
│  Info           #3b82f6  ████████████  Info states          │
└─────────────────────────────────────────────────────────────┘
```

### Typography

| Style | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| H1 | 32px | Bold | 40px | Screen titles |
| H2 | 24px | SemiBold | 32px | Section headers |
| H3 | 18px | SemiBold | 24px | Card titles |
| Body | 16px | Regular | 24px | Main content |
| Small | 14px | Regular | 20px | Secondary content |
| Caption | 12px | Regular | 16px | Labels, hints |
| PIN | 48px | Bold | 56px | PIN display |

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Tight spacing |
| sm | 8px | Small gaps |
| md | 16px | Default padding |
| lg | 24px | Section spacing |
| xl | 32px | Large gaps |
| xxl | 48px | Screen padding |

---

## Screen Designs

### 1. Welcome Screen (Onboarding)

```
┌──────────────────────────────────────┐
│           Status Bar                  │
├──────────────────────────────────────┤
│                                      │
│                                      │
│            ┌──────────┐              │
│            │   LOGO   │              │
│            │   📱🔐   │              │
│            └──────────┘              │
│                                      │
│         Central Auth                 │
│      ─────────────────               │
│                                      │
│     Secure authentication            │
│     for all your services            │
│                                      │
│                                      │
│                                      │
│    ┌─────────────────────────────┐   │
│    │                             │   │
│    │       Get Started           │   │
│    │                             │   │
│    └─────────────────────────────┘   │
│                                      │
│       Already have an account?       │
│           Link Account               │
│                                      │
└──────────────────────────────────────┘
```

**Component Implementation:**

```typescript
// src/app/(onboarding)/welcome.tsx
import { View, Text, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@components/common';
import { COLORS, SPACING } from '@constants/theme';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image 
          source={require('@assets/images/logo.png')} 
          style={styles.logo} 
        />
        
        <Text style={styles.title}>Central Auth</Text>
        <Text style={styles.subtitle}>
          Secure authentication for all your services
        </Text>
      </View>

      <View style={styles.footer}>
        <Button 
          title="Get Started" 
          onPress={() => router.push('/(onboarding)/permissions')}
          size="large"
        />
        
        <Button 
          title="Link Account" 
          variant="text"
          onPress={() => router.push('/(onboarding)/link-account')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  footer: {
    gap: SPACING.md,
  },
});
```

---

### 2. Link Account Screen

```
┌──────────────────────────────────────┐
│  ←        Link Account               │
├──────────────────────────────────────┤
│                                      │
│                                      │
│     Enter your Membership Key        │
│                                      │
│    You can find this in your         │
│    profile on the admin portal       │
│                                      │
│   ┌──────────────────────────────┐   │
│   │                              │   │
│   │  xxxx-xxxx-xxxx-xxxx         │   │
│   │                              │   │
│   └──────────────────────────────┘   │
│                                      │
│        Or scan your profile          │
│        QR code instead               │
│                                      │
│   ┌──────────────────────────────┐   │
│   │      📷 Scan QR Code         │   │
│   └──────────────────────────────┘   │
│                                      │
│                                      │
│   ┌──────────────────────────────┐   │
│   │                              │   │
│   │      Continue                 │   │
│   │                              │   │
│   └──────────────────────────────┘   │
│                                      │
└──────────────────────────────────────┘
```

**Component Implementation:**

```typescript
// src/app/(onboarding)/link-account.tsx
import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { Button, SafeView } from '@components/common';
import { useAuthStore } from '@stores/authStore';
import { authApi } from '@services/api';
import { COLORS, SPACING } from '@constants/theme';

export default function LinkAccountScreen() {
  const [authKey, setAuthKey] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuthKey: saveAuthKey, setUser } = useAuthStore();

  const handleContinue = async () => {
    if (!authKey.trim()) {
      Alert.alert('Error', 'Please enter your membership key');
      return;
    }

    setLoading(true);
    try {
      const result = await authApi.validateKey(authKey.trim());
      
      if (result.valid && result.user) {
        await saveAuthKey(authKey.trim());
        setUser(result.user);
        router.replace('/(auth)/home');
      } else {
        Alert.alert('Invalid Key', result.error || 'Please check your key and try again');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to validate key. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeView style={styles.container}>
      <Text style={styles.title}>Enter your Membership Key</Text>
      <Text style={styles.subtitle}>
        You can find this in your profile on the admin portal
      </Text>

      <TextInput
        style={styles.input}
        value={authKey}
        onChangeText={setAuthKey}
        placeholder="xxxx-xxxx-xxxx-xxxx"
        placeholderTextColor={COLORS.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.orText}>or</Text>
        <View style={styles.line} />
      </View>

      <Button
        title="📷 Scan QR Code"
        variant="outline"
        onPress={() => router.push('/(onboarding)/scan-profile')}
      />

      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          loading={loading}
          disabled={!authKey.trim()}
          size="large"
        />
      </View>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: 18,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  orText: {
    marginHorizontal: SPACING.md,
    color: COLORS.textMuted,
  },
  footer: {
    marginTop: 'auto',
  },
});
```

---

### 3. Home Screen

```
┌──────────────────────────────────────┐
│           Central Auth               │
├──────────────────────────────────────┤
│                                      │
│    Welcome back, John!               │
│    Ready to authenticate             │
│                                      │
│                                      │
│       ┌─────────────────────┐        │
│       │                     │        │
│       │        📷           │        │
│       │                     │        │
│       │    Scan QR Code     │        │
│       │                     │        │
│       │  Tap to scan and    │        │
│       │  authenticate       │        │
│       │                     │        │
│       └─────────────────────┘        │
│                                      │
│                                      │
│    Recent Activity                   │
│    ────────────────────              │
│                                      │
│    ┌─────────────────────────────┐   │
│    │ 🟢 ServiceB     2 min ago   │   │
│    ├─────────────────────────────┤   │
│    │ 🟢 AppC         1 hour ago  │   │
│    ├─────────────────────────────┤   │
│    │ 🔴 ServiceB     Yesterday   │   │
│    └─────────────────────────────┘   │
│                                      │
├──────────────────────────────────────┤
│   🏠       📷        📋       ⚙️    │
│  Home     Scan    History  Settings  │
└──────────────────────────────────────┘
```

---

### 4. Scanner Screen

```
┌──────────────────────────────────────┐
│                                      │
│                                      │
│    ┌─────────────────────────────┐   │
│    │                             │   │
│    │                             │   │
│    │       ╔═══════════╗         │   │
│    │       ║           ║         │   │
│    │       ║    📷     ║         │   │
│    │       ║  CAMERA   ║         │   │
│    │       ║           ║         │   │
│    │       ╚═══════════╝         │   │
│    │                             │   │
│    │                             │   │
│    └─────────────────────────────┘   │
│                                      │
│        Point camera at QR code       │
│                                      │
│    ┌─────────────────────────────┐   │
│    │         💡 Flash            │   │
│    └─────────────────────────────┘   │
│                                      │
│    ┌─────────────────────────────┐   │
│    │         Cancel              │   │
│    └─────────────────────────────┘   │
│                                      │
└──────────────────────────────────────┘
```

**Scanner Component:**

```typescript
// src/components/scanner/CameraView.tsx
import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ScannerOverlay } from './ScannerOverlay';
import { Button } from '@components/common';
import { COLORS } from '@constants/theme';

interface CameraViewProps {
  onScan: (data: string) => void;
  onCancel: () => void;
}

export function QRCameraView({ onScan, onCancel }: CameraViewProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Camera access is required to scan QR codes
        </Text>
        <Button title="Grant Permission" onPress={requestPermission} />
        <Button title="Cancel" variant="text" onPress={onCancel} />
      </View>
    );
  }

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    onScan(data);
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={flashOn}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />
      
      <ScannerOverlay />
      
      <View style={styles.controls}>
        <Button
          title={flashOn ? '💡 Flash On' : '💡 Flash Off'}
          variant="outline"
          onPress={() => setFlashOn(!flashOn)}
        />
        <Button title="Cancel" variant="text" onPress={onCancel} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  permissionText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
  },
  controls: {
    position: 'absolute',
    bottom: 48,
    left: 24,
    right: 24,
    gap: 12,
  },
});
```

---

### 5. PIN Display Screen (Success)

```
┌──────────────────────────────────────┐
│                                      │
│                                      │
│             ✅ Success!              │
│                                      │
│      Authenticated to ServiceB       │
│                                      │
│                                      │
│        Enter this code:              │
│                                      │
│   ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐     │
│   │ 1│ │ 2│ │ 3│ │ 4│ │ 5│ │ 6│     │
│   └──┘ └──┘ └──┘ └──┘ └──┘ └──┘     │
│                                      │
│         Expires in 4:32              │
│      ████████████░░░░░░              │
│                                      │
│                                      │
│   ┌──────────────────────────────┐   │
│   │      📋 Copy to Clipboard    │   │
│   └──────────────────────────────┘   │
│                                      │
│   ┌──────────────────────────────┐   │
│   │           Done               │   │
│   └──────────────────────────────┘   │
│                                      │
└──────────────────────────────────────┘
```

**PIN Display Component:**

```typescript
// src/components/pin/PinDisplay.tsx
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING } from '@constants/theme';

interface PinDisplayProps {
  pin: string;
  serviceName: string;
}

export function PinDisplay({ pin, serviceName }: PinDisplayProps) {
  const digits = pin.split('');

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(pin);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.successText}>Success!</Text>
        <Text style={styles.serviceText}>
          Authenticated to {serviceName}
        </Text>
      </View>

      <Text style={styles.enterText}>Enter this code:</Text>

      <Pressable onPress={copyToClipboard} style={styles.pinContainer}>
        {digits.map((digit, index) => (
          <View key={index} style={styles.digitBox}>
            <Text style={styles.digit}>{digit}</Text>
          </View>
        ))}
      </Pressable>

      <Text style={styles.hint}>Tap to copy</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  successIcon: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  serviceText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  enterText: {
    fontSize: 18,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  pinContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  digitBox: {
    width: 48,
    height: 64,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  digit: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  hint: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
});
```

---

### 6. Common Button Component

```typescript
// src/components/common/Button.tsx
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '@constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        styles[variant],
        pressed && styles[`${variant}Pressed`],
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : COLORS.primary} />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`]]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Sizes
  small: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md },
  medium: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg },
  large: { paddingVertical: SPACING.lg, paddingHorizontal: SPACING.xl },
  
  // Variants
  primary: { backgroundColor: COLORS.primary },
  primaryPressed: { backgroundColor: COLORS.primaryDark },
  outline: { borderWidth: 2, borderColor: COLORS.primary, backgroundColor: 'transparent' },
  outlinePressed: { backgroundColor: COLORS.primary + '20' },
  text: { backgroundColor: 'transparent' },
  textPressed: { opacity: 0.7 },
  
  // Text styles
  textStyle: { fontSize: 16, fontWeight: '600' },
  primaryText: { color: '#fff' },
  outlineText: { color: COLORS.primary },
  textText: { color: COLORS.primary },
  
  // States
  disabled: { opacity: 0.5 },
});
```

---

## Animation Specifications

### Loading States

- Use Lottie animations for scanning and processing states
- Skeleton loading for lists
- Haptic feedback on interactions

### Transitions

- Screen transitions: 250ms ease-in-out
- Button press: 100ms scale(0.98)
- Content fade: 200ms opacity

### Success/Error Feedback

- Success: Green checkmark animation + vibration
- Error: Shake animation + error haptic
