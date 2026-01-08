import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    placeholder: {
        width: 24,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        gap: 15,
    },
    halfWidth: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F8F8F8',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 15,
        color: '#000',
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    toggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        marginBottom: 20,
    },
    toggleInfo: {
        flex: 1,
        marginRight: 15,
    },
    toggleLabel: {
        fontSize: 15,
        fontWeight: '500',
        color: '#000',
    },
    toggleDescription: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    footer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        gap: 15,
    },
    backButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#666',
    },
    createButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 25,
        backgroundColor: '#D32F2F',
        alignItems: 'center',
    },
    createButtonDisabled: {
        backgroundColor: '#ccc',
    },
    createButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
});
