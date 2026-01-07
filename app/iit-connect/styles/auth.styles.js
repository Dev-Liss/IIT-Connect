import { StyleSheet } from 'react-native';

// Color palette for the app
export const colors = {
    primary: '#4f9deb',
    background: '#1a1a2e',
    cardBackground: '#16213e',
    text: '#fff',
    textSecondary: '#999',
    border: '#333',
    error: '#e74c3c',
};

// Shared styles for auth screens
export const authStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    scrollContentSignup: {
        flexGrow: 1,
        padding: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    headerContainerSignup: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 24,
    },
    logoContainerSignup: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 20,
    },
    logoText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: colors.primary,
    },
    logoTextSignup: {
        fontSize: 42,
        fontWeight: 'bold',
        color: colors.primary,
    },
    logoSubText: {
        fontSize: 32,
        fontWeight: '300',
        color: colors.text,
        marginLeft: 4,
    },
    logoSubTextSignup: {
        fontSize: 28,
        fontWeight: '300',
        color: colors.text,
        marginLeft: 4,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
    },
    welcomeTextSignup: {
        fontSize: 26,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
    },
    subtitleText: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    subtitleTextSignup: {
        fontSize: 15,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    formContainer: {
        backgroundColor: colors.cardBackground,
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputContainerSignup: {
        marginBottom: 18,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },
    input: {
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
    },
    inputError: {
        borderColor: colors.error,
    },
    errorText: {
        color: colors.error,
        fontSize: 12,
        marginTop: 4,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: colors.primary,
        fontSize: 14,
    },
    primaryButton: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: colors.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    linkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    linkText: {
        color: colors.textSecondary,
        fontSize: 16,
    },
    link: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    termsContainer: {
        marginBottom: 20,
    },
    termsText: {
        color: colors.textSecondary,
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 20,
    },
    termsLink: {
        color: colors.primary,
    },
});
