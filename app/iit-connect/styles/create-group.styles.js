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
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000',
    },
    placeholder: {
        width: 34,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    groupIconContainer: {
        alignItems: 'center',
        paddingVertical: 25,
    },
    groupIconWrapper: {
        position: 'relative',
    },
    groupIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFF5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#D32F2F',
        justifyContent: 'center',
        alignItems: 'center',
    },
    membersCount: {
        marginTop: 10,
        fontSize: 14,
        color: '#666',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: '#000',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    membersSection: {
        marginBottom: 100,
    },
    memberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    memberAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    memberAvatarText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: 15,
        fontWeight: '500',
        color: '#000',
    },
    memberEmail: {
        fontSize: 13,
        color: '#666',
        marginTop: 1,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    createButton: {
        backgroundColor: '#D32F2F',
        borderRadius: 25,
        paddingVertical: 15,
        alignItems: 'center',
    },
    createButtonDisabled: {
        backgroundColor: '#ccc',
    },
    createButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
