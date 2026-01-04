/**
 * Spanish Translations
 */

import type { Translations } from '../types';

export const es: Translations = {
    login: {
        title: 'Iniciar Sesión',
        subtitle: 'Escanea el código QR con tu aplicación móvil para iniciar sesión',
        manualEntryLink: 'Ingresar clave de membresía manualmente',
        qrCodeLink: 'Usar código QR en su lugar',
        membershipKeyLabel: 'Clave de Membresía',
        membershipKeyPlaceholder: 'Ingresa tu clave de membresía',
        signInButton: 'Iniciar Sesión',
        poweredBy: 'Desarrollado por',
    },

    qrDisplay: {
        instructions: 'Abre tu aplicación móvil y escanea este código QR para iniciar sesión',
        expiredMessage: 'El código QR ha expirado. Por favor genera uno nuevo.',
        generateNewButton: 'Generar Nuevo Código QR',
    },

    pinEntry: {
        title: 'Ingresar PIN',
        subtitle: 'Ingresa el PIN de 6 dígitos que aparece en tu dispositivo móvil',
        verifyButton: 'Verificar PIN',
        digitLabel: 'Dígito {current} de {total}',
    },

    authStatus: {
        notSignedIn: 'No has iniciado sesión',
        sessionLabel: 'Sesión',
        signOutButton: 'Cerrar Sesión',
    },

    qrScanner: {
        permissionTitle: 'Acceso a Cámara Requerido',
        permissionMessage: 'Por favor habilita el acceso a la cámara en la configuración de tu navegador para escanear códigos QR.',
        tryAgainButton: 'Intentar de Nuevo',
        noCameraError: 'No se encontró cámara en este dispositivo.',
        initializingCamera: 'Inicializando cámara...',
        scanInstructions: 'Posiciona el código QR dentro del marco para escanear',
    },

    loginButton: {
        defaultText: 'Iniciar Sesión con Código QR',
    },

    states: {
        loading: 'Cargando...',
        verifying: 'Verificando PIN...',
        generatingQR: 'Generando Código QR...',
        success: '¡Éxito!',
        error: 'Error',
        expired: 'Expirado',
    },

    success: {
        signedIn: '¡Sesión iniciada con éxito!',
        welcomeBack: 'Bienvenido de nuevo, {name}',
        qrScanned: '¡Código QR escaneado! Ingresa el PIN que aparece en tu dispositivo móvil.',
    },

    errors: {
        generic: 'Algo salió mal. Por favor intenta de nuevo.',
        invalidPin: 'PIN inválido. Por favor verifica e intenta de nuevo.',
        invalidKey: 'Clave de membresía inválida. Por favor verifica e intenta de nuevo.',
        qrExpired: 'El código QR ha expirado. Por favor genera uno nuevo.',
        networkError: 'Error de red. Por favor verifica tu conexión.',
        sessionExpired: 'Tu sesión ha expirado. Por favor inicia sesión de nuevo.',
        cameraPermissionDenied: 'Permiso de cámara denegado. Por favor habilita el acceso a la cámara.',
    },

    alerts: {
        qrScannedEnterPin: '¡Código QR escaneado! Ingresa el PIN que aparece en tu dispositivo móvil.',
        qrExpiredGenerateNew: 'El código QR ha expirado. Por favor genera uno nuevo.',
    },
};
