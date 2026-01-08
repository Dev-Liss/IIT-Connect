import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000',
    },
    logoIcon: {
        marginHorizontal: 2,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 15,
    },
    headerButton: {
        padding: 5,
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    tab: {
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginRight: 10,
        backgroundColor: '#F5F5F5',
    },
    activeTab: {
        backgroundColor: '#D32F2F',
    },
    tabText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#666',
    },
    activeTabText: {
        color: '#fff',
    },
    storiesContainer: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    storiesList: {
        paddingHorizontal: 15,
    },
    storyItem: {
        alignItems: 'center',
        marginHorizontal: 8,
        width: 65,
    },
    storyRing: {
        padding: 3,
        borderRadius: 35,
        borderWidth: 2,
        borderColor: '#D32F2F',
    },
    storyRingYou: {
        borderColor: '#ddd',
        borderStyle: 'dashed',
    },
    storyAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    storyAvatarYou: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    storyInitial: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    storyName: {
        fontSize: 11,
        color: '#000',
        marginTop: 5,
        textAlign: 'center',
    },
    feedContainer: {
        paddingBottom: 20,
    },
    postCard: {
        backgroundColor: '#fff',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    announcementCard: {
        backgroundColor: '#FFF9F9',
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 12,
    },
    authorAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    authorAvatarAnnouncement: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF5F5',
        marginRight: 12,
    },
    authorInitial: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    authorInfo: {
        flex: 1,
    },
    authorNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    authorName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
    },
    officialBadge: {
        marginLeft: 5,
    },
    authorSubtitle: {
        fontSize: 12,
        color: '#666',
        marginTop: 1,
    },
    postImage: {
        width: width,
        height: width * 0.8,
        resizeMode: 'cover',
    },
    postActions: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    actionText: {
        marginLeft: 5,
        fontSize: 14,
        color: '#000',
    },
    postDetails: {
        paddingHorizontal: 15,
        paddingBottom: 15,
    },
    likesText: {
        fontWeight: '600',
        fontSize: 14,
        color: '#000',
        marginBottom: 5,
    },
    postContent: {
        fontSize: 14,
        color: '#000',
        lineHeight: 20,
        marginBottom: 5,
    },
    viewComments: {
        fontSize: 13,
        color: '#666',
        marginBottom: 5,
    },
    postTime: {
        fontSize: 11,
        color: '#999',
    },
    eventContent: {
        paddingHorizontal: 15,
        paddingVertical: 12,
    },
    eventTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        marginBottom: 10,
    },
    eventDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    eventText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#666',
    },
    rsvpButton: {
        backgroundColor: '#D32F2F',
        borderRadius: 25,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 15,
    },
    rsvpButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        width: width - 40,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000',
    },
    modalOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    modalOption: {
        width: '48%',
        backgroundColor: '#F8F8F8',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        alignItems: 'center',
    },
    modalOptionIcon: {
        marginBottom: 10,
    },
    modalOptionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        textAlign: 'center',
    },
    modalOptionSubtitle: {
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
        marginTop: 3,
    },
});
