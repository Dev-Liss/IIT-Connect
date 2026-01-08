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
        marginBottom: 20,
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
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#000',
        textAlign: 'center',
        marginBottom: 30,
    },
    illustrationContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    illustration: {
        width: 150,
        height: 150,
        backgroundColor: '#FFE5E5',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
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
    continueButton: {
        backgroundColor: '#D32F2F',
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
        shadowColor: '#D32F2F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    continueButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    signInContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signInText: {
        fontSize: 14,
        color: '#666',
    },
    signInLink: {
        fontSize: 14,
        color: '#D32F2F',
        fontWeight: '700',
    },
});
