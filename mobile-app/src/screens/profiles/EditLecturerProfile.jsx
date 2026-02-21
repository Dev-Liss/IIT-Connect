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
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from 'expo-image-picker';

import { API_BASE_URL as API_URL } from "../../config/api";

const DEFAULT_AVATAR = "https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortFlat&accessoriesType=Prescription02&hairColor=Black&facialHairType=BeardLight&clotheType=BlazerShirt&eyeType=Happy&eyebrowType=Default&mouthType=Default&skinColor=Light";
const DEFAULT_COVER = "https://img.freepik.com/free-vector/hand-drawn-education-pattern_23-2148107567.jpg";

export default function EditLecturerProfile({ user }) {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [bio, setBio] = useState(""); // Replaced 'batch' with 'bio'

    const [profilePicture, setProfilePicture] = useState("");
    const [coverPicture, setCoverPicture] = useState("");

    const userId = user?.id || user?._id;

    useEffect(() => {
        const fetchUserData = async () => {
            if (!userId) {
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
                    setBio(data.bio || "");
                    setProfilePicture(data.profilePicture || "");
                    setCoverPicture(data.coverPicture || "");
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

    const pickImage = async (type) => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert("Permission Required", "Allow access to your photos to upload an image.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: type === 'profile' ? [1, 1] : [16, 9],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled) {
            const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;

            if (type === 'profile') {
                setProfilePicture(base64Image);
            } else if (type === 'cover') {
                setCoverPicture(base64Image);
            }
        }
    };

    const handleSave = async () => {
        if (!userId) return;

        setSaving(true);
        try {
            const updatedData = {
                username: `${firstName} ${lastName}`.trim(),
                bio: bio, // Sends the bio specifically for lecturers
                profilePicture: profilePicture,
                coverPicture: coverPicture,
            };

            const response = await fetch(`${API_URL}/users/profile/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData),
            });

            if (response.ok) {
                Alert.alert("Success", "Profile updated successfully!");
                router.back();
            } else {
                Alert.alert("Update Failed", "Something went wrong");
            }
        } catch (error) {
            console.error("Save Error:", error);
            Alert.alert("Network Error", "Could not connect to server");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#D32F2F" />
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

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <View style={styles.mediaSection}>
                        <View style={styles.coverPlaceholder}>
                            <Image
                                source={{ uri: coverPicture || DEFAULT_COVER }}
                                style={{ width: '100%', height: '100%' }}
                                resizeMode="cover"
                            />
                        </View>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={{ uri: profilePicture || DEFAULT_AVATAR }}
                                style={styles.avatar}
                            />
                        </View>
                        <View style={styles.editButtonsRow}>
                            <TouchableOpacity style={styles.editMediaBtn} onPress={() => pickImage('profile')}>
                                <Text style={styles.editMediaText}>Edit Profile Picture</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.editMediaBtn} onPress={() => pickImage('cover')}>
                                <Text style={styles.editMediaText}>Edit Cover</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.formSection}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>First Name</Text>
                            <View style={styles.inputContainer}>
                                <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />
                                <Ionicons name="pencil-outline" size={18} color="#666" />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Last Name</Text>
                            <View style={styles.inputContainer}>
                                <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />
                                <Ionicons name="pencil-outline" size={18} color="#666" />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <View style={[styles.inputContainer, styles.readOnlyContainer]}>
                                <TextInput style={[styles.input, styles.readOnlyText]} value={email} editable={false} />
                                <Ionicons name="lock-closed-outline" size={18} color="#999" />
                            </View>
                        </View>

                        {/* BIO Text Area for Lecturers */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Professional Bio</Text>
                            <View style={[styles.inputContainer, styles.textAreaContainer]}>
                                <TextInput
                                    style={styles.textArea}
                                    value={bio}
                                    onChangeText={setBio}
                                    multiline={true}
                                    numberOfLines={4}
                                    placeholder="Enter your background and research interests..."
                                    textAlignVertical="top"
                                />
                            </View>
                        </View>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    scrollContent: { paddingBottom: 40 },
    header: { flexDirection: 'row', alignItems: 'center', height: 60, justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginTop: 20 },
    headerTitle: { fontSize: 18, fontWeight: '600' },
    backButton: { padding: 8, backgroundColor: '#F5F5F5', borderRadius: 20 },
    doneButton: { color: '#D32F2F', fontWeight: 'bold', fontSize: 16 },
    mediaSection: { alignItems: 'center', marginBottom: 20 },
    coverPlaceholder: { width: '100%', height: 120, backgroundColor: '#E0E0E0', marginBottom: -50, overflow: 'hidden' },
    avatarContainer: { padding: 4, backgroundColor: '#fff', borderRadius: 65, marginTop: 20, zIndex: 1 },
    avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f0f0f0' },
    editButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 20, marginTop: 15 },
    editMediaBtn: { backgroundColor: '#F5F5F5', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8 },
    editMediaText: { fontSize: 12, fontWeight: '600', color: '#333' },
    formSection: { paddingHorizontal: 20, marginTop: 20 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, color: '#333', fontWeight: '500', marginBottom: 8 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F9F9F9', paddingHorizontal: 15, paddingVertical: 14, borderRadius: 12 },
    input: { flex: 1, fontSize: 16, color: '#000' },
    readOnlyContainer: { backgroundColor: '#F0F0F0', opacity: 0.8 },
    readOnlyText: { color: '#777' },
    textAreaContainer: { paddingVertical: 15, alignItems: 'flex-start' },
    textArea: { flex: 1, fontSize: 16, color: '#000', minHeight: 100, width: '100%' },
});