import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        padding: 5,
        marginRight: 10,
    },
    headerInfo: {
        flex: 1,
    },
    headerName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    headerStatus: {
        fontSize: 12,
        color: '#4CAF50',
        marginTop: 2,
    },
    moreButton: {
        padding: 5,
    },
    messagesContainer: {
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    messageContainer: {
        flexDirection: 'row',
        marginVertical: 4,
        alignItems: 'flex-end',
    },
    myMessageContainer: {
        justifyContent: 'flex-end',
    },
    otherMessageContainer: {
        justifyContent: 'flex-start',
    },
    otherAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#D32F2F',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    otherAvatarText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    messageWrapper: {
        maxWidth: '75%',
    },
    messageBubble: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 18,
    },
    myMessage: {
        backgroundColor: '#D32F2F',
        borderBottomRightRadius: 4,
    },
    otherMessage: {
        backgroundColor: '#F5F5F5',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    myMessageText: {
        color: '#fff',
    },
    otherMessageText: {
        color: '#000',
    },
    messageTime: {
        fontSize: 11,
        marginTop: 4,
    },
    myMessageTime: {
        color: '#999',
        textAlign: 'right',
    },
    otherMessageTime: {
        color: '#999',
        textAlign: 'left',
    },
    fileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 10,
        padding: 8,
    },
    fileIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    fileInfo: {
        flex: 1,
    },
    fileName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000',
    },
    myFileName: {
        color: '#fff',
    },
    fileSize: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    myFileSize: {
        color: 'rgba(255, 255, 255, 0.8)',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        backgroundColor: '#fff',
    },
    attachButton: {
        padding: 5,
        marginRight: 10,
    },
    input: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        fontSize: 15,
        maxHeight: 100,
        color: '#000',
    },
    sendButton: {
        padding: 10,
        marginLeft: 5,
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
});
