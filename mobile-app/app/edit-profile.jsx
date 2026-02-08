import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Image,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Alert,
    Modal,
    FlatList,
    TouchableWithoutFeedback
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// --- DATA FOR DROPDOWNS ---
const LEVELS = ["L4", "L5", "L6", "L7"];
// Generates ["G1", "G2", ... "G30"]
const GROUPS = Array.from({ length: 30 }, (_, i) => `G${i + 1}`);

export default function EditProfileScreen() {
    const router = useRouter();

    // --- STATE VARIABLES ---
    const [firstName, setFirstName] = useState("Yasindu");
    const [lastName, setLastName] = useState("Janapriya");

    // Read-only fields
    const [email] = useState("yasindu.20231866@iit.ac.lk");
    const [role] = useState("Student");

    // Dropdown States
    const [level, setLevel] = useState("L5");
    const [group, setGroup] = useState("G24");

    // Modal Control
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState(null); // 'level' or 'group'

    // Open Dropdown
    const openModal = (type) => {
        setModalType(type);
        setModalVisible(true);
    };

    // Handle Selection
    const handleSelect = (item) => {
        if (modalType === 'level') setLevel(item);
        if (modalType === 'group') setGroup(item);
        setModalVisible(false);
    };

    const handleSave = () => {
        console.log("Saving:", { firstName, lastName, email, level, group, role });
        Alert.alert("Success", "Profile updated successfully!");
        router.back();
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text style={styles.doneButton}>Done</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Cover & Avatar Area */}
                <View style={styles.mediaSection}>
                    <View style={styles.coverPlaceholder} />
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: "https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortFlat&accessoriesType=Prescription02&hairColor=Black&facialHairType=BeardLight&clotheType=BlazerShirt&eyeType=Happy&eyebrowType=Default&mouthType=Default&skinColor=Light" }}
                            style={styles.avatar}
                        />
                    </View>
                    <View style={styles.editButtonsRow}>
                        <TouchableOpacity style={styles.editMediaBtn}>
                            <Text style={styles.editMediaText}>Edit Profile Picture</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.editMediaBtn}>
                            <Text style={styles.editMediaText}>Edit cover</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Form Fields */}
                <View style={styles.formSection}>

                    {/* First Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>First Name</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                value={firstName}
                                onChangeText={setFirstName}
                            />
                            <Ionicons name="pencil-outline" size={18} color="#666" />
                        </View>
                    </View>

                    {/* Last Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Last Name</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                value={lastName}
                                onChangeText={setLastName}
                            />
                            <Ionicons name="pencil-outline" size={18} color="#666" />
                        </View>
                    </View>

                    {/* Email (LOCKED) */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <View style={[styles.inputContainer, styles.readOnlyContainer]}>
                            <TextInput
                                style={[styles.input, styles.readOnlyText]}
                                value={email}
                                editable={false} // Cannot edit
                            />
                            {/* Lock Icon */}
                            <Ionicons name="lock-closed-outline" size={18} color="#999" />
                        </View>
                    </View>

                    {/* Tutorial Group (DROPDOWN) */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Tutorial Group</Text>
                        <View style={styles.rowContainer}>

                            {/* Level Selector */}
                            <TouchableOpacity
                                style={styles.dropdownInput}
                                onPress={() => openModal('level')}
                            >
                                <Text style={styles.inputText}>{level}</Text>
                                <Ionicons name="chevron-down" size={16} color="#333" />
                            </TouchableOpacity>

                            {/* Group Selector */}
                            <TouchableOpacity
                                style={styles.dropdownInput}
                                onPress={() => openModal('group')}
                            >
                                <Text style={styles.inputText}>{group}</Text>
                                <Ionicons name="chevron-down" size={16} color="#333" />
                            </TouchableOpacity>

                            <View style={styles.checkSpacer}>
                                <Ionicons name="checkmark-sharp" size={20} color="#2196F3" />
                            </View>
                        </View>
                    </View>

                    {/* Role (LOCKED) */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Role</Text>
                        <View style={[styles.inputContainer, styles.readOnlyContainer]}>
                            <TextInput
                                style={[styles.input, styles.readOnlyText]}
                                value={role}
                                editable={false} // Cannot edit
                            />
                            {/* Lock Icon */}
                            <Ionicons name="lock-closed-outline" size={18} color="#999" />
                        </View>
                    </View>

                </View>

                {/* Action Button */}
                <TouchableOpacity style={styles.redButton} onPress={handleSave}>
                    <Text style={styles.redButtonText}>Save Changes</Text>
                </TouchableOpacity>

            </ScrollView>

            {/* --- CUSTOM DROPDOWN MODAL --- */}
            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>
                                Select {modalType === 'level' ? 'Level' : 'Group'}
                            </Text>
                            <FlatList
                                data={modalType === 'level' ? LEVELS : GROUPS}
                                keyExtractor={(item) => item}
                                style={{ maxHeight: 300 }}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.modalItem}
                                        onPress={() => handleSelect(item)}
                                    >
                                        <Text style={styles.modalItemText}>{item}</Text>
                                        {(modalType === 'level' ? level : group) === item && (
                                            <Ionicons name="checkmark" size={20} color="#D32F2F" />
                                        )}
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 100,
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 20,
    },
    backButton: {
        padding: 8,
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        marginTop: 20,
    },
    doneButton: {
        color: '#D32F2F',
        fontWeight: 'bold',
        fontSize: 16,
        marginTop: 20,
    },
    mediaSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    coverPlaceholder: {
        width: '100%',
        height: 120,
        backgroundColor: '#E0E0E0',
        marginBottom: -50,
    },
    avatarContainer: {
        padding: 4,
        backgroundColor: '#fff',
        borderRadius: 65,
        marginTop: 20,
        zIndex: 1,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FF0000',
    },
    editButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 20,
        marginTop: 15,
    },
    editMediaBtn: {
        backgroundColor: '#F5F5F5',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    editMediaText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
    },
    formSection: {
        paddingHorizontal: 20,
        marginTop: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F9F9F9',
        paddingHorizontal: 15,
        paddingVertical: 14,
        borderRadius: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#000',
    },
    // New Styles for Read-Only Fields
    readOnlyContainer: {
        backgroundColor: '#F0F0F0', // Slightly darker gray for disabled feel
        opacity: 0.8,
    },
    readOnlyText: {
        color: '#777', // Gray text
    },
    inputText: {
        fontSize: 16,
        color: '#000',
    },
    rowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    dropdownInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F9F9F9',
        paddingHorizontal: 15,
        paddingVertical: 14,
        borderRadius: 12,
        width: 90, // Fixed width
    },
    checkSpacer: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'center',
        backgroundColor: '#F9F9F9',
        paddingVertical: 14,
        paddingHorizontal: 15,
        borderRadius: 12,
    },
    redButton: {
        backgroundColor: '#D32F2F',
        marginHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    redButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    // --- MODAL STYLES ---
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        maxHeight: '60%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalItemText: {
        fontSize: 16,
        color: '#333',
    },
});