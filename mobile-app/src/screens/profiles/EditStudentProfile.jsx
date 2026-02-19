import React, { useState, useEffect } from "react";
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
    TouchableWithoutFeedback,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { API_BASE_URL as API_URL } from "../../config/api";

const LEVELS = ["L4", "L5", "L6", "L7"];
const GROUPS = Array.from({ length: 30 }, (_, i) => `G${i + 1}`);

export default function EditStudentProfile({ user }) {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");

    const [level, setLevel] = useState("L4");
    const [group, setGroup] = useState("G1");

    const [profilePicture, setProfilePicture] = useState("");
    const [coverPicture, setCoverPicture] = useState("");

    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState(null);

    const userId = user?.id || user?._id;

    useEffect(() => {
        const fetchUserData = async () => {
            if (!userId) {
                console.log("No User ID found.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_URL}/users/profile/${userId}`);
                const data = await response.json();

                if (response.ok) {
                    const nameParts = (data.username || "").split(" ");
                    setFirstName(nameParts[0] || "");
                    setLastName(nameParts.slice(1).join(" ") || "");

                    setEmail(data.email || "");
                    setRole(data.role || "student");
                    setProfilePicture(data.profilePicture);
                    setCoverPicture(data.coverPicture);

                    if (data.batch) {
                        const parts = data.batch.split(" ");
                        if (parts.length >= 2) {
                            setLevel(parts[0]);
                            setGroup(parts[1]);
                        }
                    }
                } else {
                    Alert.alert("Error", "Could not load profile data");
                }
            } catch (error) {
                console.error("Network Error:", error);
                Alert.alert("Network Error", "Check your server connection");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user, userId]);

    const handleSave = async () => {
        if (!userId) {
            Alert.alert("Error", "User not identified");
            return;
        }

        setSaving(true);
        try {
            const updatedData = {
                username: `${firstName} ${lastName}`.trim(),
                batch: `${level} ${group}`,
            };

            const response = await fetch(`${API_URL}/users/profile/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert("Success", "Profile updated successfully!");
                router.back();
            } else {
                Alert.alert("Update Failed", data.message || "Something went wrong");
            }
        } catch (error) {
            console.error("Save Error:", error);
            Alert.alert("Network Error", "Could not connect to server");
        } finally {
            setSaving(false);
        }
    };

    const openModal = (type) => {
        setModalType(type);
        setModalVisible(true);
    };

    const handleSelect = (item) => {
        if (modalType === 'level') setLevel(item);
        if (modalType === 'group') setGroup(item);
        setModalVisible(false);
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#D32F2F" />
                <Text style={{ marginTop: 10, color: '#666' }}>Loading Profile...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={handleSave} disabled={saving}>
                    <Text style={[styles.doneButton, saving && { opacity: 0.5 }]}>
                        {saving ? "Saving..." : "Done"}
                    </Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <View style={styles.mediaSection}>
                        <View style={styles.coverPlaceholder}>
                            {coverPicture ? (
                                <Image source={{ uri: coverPicture }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                            ) : null}
                        </View>

                        <View style={styles.avatarContainer}>
                            <Image
                                source={{ uri: profilePicture || "https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortFlat&accessoriesType=Prescription02&hairColor=Black&facialHairType=BeardLight&clotheType=BlazerShirt&eyeType=Happy&eyebrowType=Default&mouthType=Default&skinColor=Light" }}
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

                    <View style={styles.formSection}>
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

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <View style={[styles.inputContainer, styles.readOnlyContainer]}>
                                <TextInput
                                    style={[styles.input, styles.readOnlyText]}
                                    value={email}
                                    editable={false}
                                />
                                <Ionicons name="lock-closed-outline" size={18} color="#999" />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Tutorial Group</Text>
                            <View style={styles.rowContainer}>
                                <TouchableOpacity
                                    style={styles.dropdownInput}
                                    onPress={() => openModal('level')}
                                >
                                    <Text style={styles.inputText}>{level}</Text>
                                    <Ionicons name="chevron-down" size={16} color="#333" />
                                </TouchableOpacity>

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

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Role</Text>
                            <View style={[styles.inputContainer, styles.readOnlyContainer]}>
                                <TextInput
                                    style={[styles.input, styles.readOnlyText]}
                                    value={role}
                                    editable={false}
                                />
                                <Ionicons name="lock-closed-outline" size={18} color="#999" />
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.redButton} onPress={handleSave}>
                        <Text style={styles.redButtonText}>
                            {saving ? "Saving Changes..." : "Save Changes"}
                        </Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>

            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={() => { }}>
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
                        </TouchableWithoutFeedback>
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
        height: 60,
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        marginTop: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    backButton: {
        padding: 8,
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
    },
    doneButton: {
        color: '#D32F2F',
        fontWeight: 'bold',
        fontSize: 16,
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
        overflow: 'hidden',
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
        backgroundColor: '#f0f0f0',
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
    readOnlyContainer: {
        backgroundColor: '#F0F0F0',
        opacity: 0.8,
    },
    readOnlyText: {
        color: '#777',
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
        width: 90,
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