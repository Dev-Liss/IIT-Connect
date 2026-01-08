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
        marginBottom: 25,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: 10,
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
        minHeight: 150,
        textAlignVertical: 'top',
    },
    priorityContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    priorityOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    prioritySelected: {
        backgroundColor: '#FFF5F5',
        borderColor: '#D32F2F',
    },
    priorityDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
    },
    priorityText: {
        fontSize: 14,
        color: '#666',
    },
    priorityTextSelected: {
        color: '#D32F2F',
        fontWeight: '500',
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#E3F2FD',
        borderRadius: 12,
        padding: 15,
        marginBottom: 100,
    },
    infoText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 13,
        color: '#1976D2',
        lineHeight: 18,
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
