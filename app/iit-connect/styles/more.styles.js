import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 15,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    logoText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    logoIcon: {
        marginHorizontal: 2,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 12,
    },
    menuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    menuItem: {
        width: '47%',
        backgroundColor: '#F8F8F8',
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
    },
    menuIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FFF5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    menuLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: '#000',
        textAlign: 'center',
    },
});
