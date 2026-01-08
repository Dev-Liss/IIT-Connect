import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 30,
        paddingTop: 60,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 15,
    },
    logoText: {
        fontSize: 36,
        fontWeight: '600',
        color: '#000',
        letterSpacing: 2,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000',
        textAlign: 'center',
        marginBottom: 40,
    },
    optionsContainer: {
        gap: 20,
    },
    optionButton: {
        backgroundColor: '#FFF',
        paddingVertical: 18,
        paddingHorizontal: 30,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: '#D32F2F',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    optionText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    arrow: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#D32F2F',
    },
});
