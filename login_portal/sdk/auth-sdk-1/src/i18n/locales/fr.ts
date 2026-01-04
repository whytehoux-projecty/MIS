/**
 * French Translations
 */

import type { Translations } from '../types';

export const fr: Translations = {
    login: {
        title: 'Connexion',
        subtitle: 'Scannez le code QR avec votre application mobile pour vous connecter',
        manualEntryLink: 'Entrer la clé de membre manuellement',
        qrCodeLink: 'Utiliser le code QR à la place',
        membershipKeyLabel: 'Clé de Membre',
        membershipKeyPlaceholder: 'Entrez votre clé de membre',
        signInButton: 'Se Connecter',
        poweredBy: 'Propulsé par',
    },

    qrDisplay: {
        instructions: 'Ouvrez votre application mobile et scannez ce code QR pour vous connecter',
        expiredMessage: 'Le code QR a expiré. Veuillez en générer un nouveau.',
        generateNewButton: 'Générer un Nouveau Code QR',
    },

    pinEntry: {
        title: 'Entrer le PIN',
        subtitle: 'Entrez le code PIN à 6 chiffres affiché sur votre appareil mobile',
        verifyButton: 'Vérifier le PIN',
        digitLabel: 'Chiffre {current} sur {total}',
    },

    authStatus: {
        notSignedIn: 'Non connecté',
        sessionLabel: 'Session',
        signOutButton: 'Déconnexion',
    },

    qrScanner: {
        permissionTitle: 'Accès Caméra Requis',
        permissionMessage: "Veuillez activer l'accès à la caméra dans les paramètres de votre navigateur pour scanner les codes QR.",
        tryAgainButton: 'Réessayer',
        noCameraError: 'Aucune caméra trouvée sur cet appareil.',
        initializingCamera: 'Initialisation de la caméra...',
        scanInstructions: 'Positionnez le code QR dans le cadre pour le scanner',
    },

    loginButton: {
        defaultText: 'Se Connecter avec Code QR',
    },

    states: {
        loading: 'Chargement...',
        verifying: 'Vérification du PIN...',
        generatingQR: 'Génération du Code QR...',
        success: 'Succès !',
        error: 'Erreur',
        expired: 'Expiré',
    },

    success: {
        signedIn: 'Connexion Réussie !',
        welcomeBack: 'Bon retour, {name}',
        qrScanned: 'Code QR scanné ! Entrez le PIN affiché sur votre appareil mobile.',
    },

    errors: {
        generic: "Une erreur s'est produite. Veuillez réessayer.",
        invalidPin: 'PIN invalide. Veuillez vérifier et réessayer.',
        invalidKey: 'Clé de membre invalide. Veuillez vérifier et réessayer.',
        qrExpired: 'Le code QR a expiré. Veuillez en générer un nouveau.',
        networkError: 'Erreur réseau. Veuillez vérifier votre connexion.',
        sessionExpired: 'Votre session a expiré. Veuillez vous reconnecter.',
        cameraPermissionDenied: "Permission caméra refusée. Veuillez activer l'accès à la caméra.",
    },

    alerts: {
        qrScannedEnterPin: 'Code QR scanné ! Entrez le PIN affiché sur votre appareil mobile.',
        qrExpiredGenerateNew: 'Le code QR a expiré. Veuillez en générer un nouveau.',
    },
};
