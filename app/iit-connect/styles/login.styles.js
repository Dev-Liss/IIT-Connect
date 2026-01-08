import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 30,
        paddingTop: 60,
        paddingBottom: 30,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logo: {
        width: 70,
        height: 70,
        marginBottom: 10,
    },
    logoText: {
        fontSize: 32,
        fontWeight: '600',
        color: '#000',
        letterSpacing: 1,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000',
        textAlign: 'center',
        marginBottom: 30,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        paddingHorizontal: 15,
        height: 50,
    },
    inputError: {
        borderColor: '#D32F2F',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: '#000',
    },
    errorText: {
        color: '#D32F2F',
        fontSize: 12,
        marginTop: 5,
        marginLeft: 15,
    },
    optionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 18,
        height: 18,
        borderWidth: 2,
        borderColor: '#999',
        borderRadius: 3,
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#D32F2F',
        borderColor: '#D32F2F',
    },
    checkboxLabel: {
        fontSize: 12,
        color: '#666',
    },
    forgotPassword: {
        fontSize: 12,
        color: '#D32F2F',
        fontWeight: '600',
    },
    signInButton: {
        backgroundColor: '#D32F2F',
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#D32F2F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    signInButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    dividerText: {
        textAlign: 'center',
        fontSize: 12,
        color: '#999',
        marginBottom: 15,
    },
    googleButton: {
        backgroundColor: '#FFF',
        padding: 12,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 20,
    },
    googleIcon: {
        width: 24,
        height: 24,
    },
    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signUpText: {
        fontSize: 14,
        color: '#666',
    },
    signUpLink: {
        fontSize: 14,
        color: '#D32F2F',
        fontWeight: '700',
    },
});
