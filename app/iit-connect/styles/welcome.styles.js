import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 80,
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 20,
    },
    logoText: {
        fontSize: 42,
        fontWeight: '600',
        color: '#000',
        letterSpacing: 2,
    },
    button: {
        backgroundColor: '#D32F2F',
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#D32F2F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 1,
    },
    arrow: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});
