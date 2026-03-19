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
    Platform,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { API_BASE_URL as API_URL } from "../../config/api";

const DEFAULT_AVATAR =
    "https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortFlat&accessoriesType=Prescription02&hairColor=Black&facialHairType=BeardLight&clotheType=BlazerShirt&eyeType=Happy&eyebrowType=Default&mouthType=Default&skinColor=Light";
const DEFAULT_COVER =
    "https://img.freepik.com/free-vector/hand-drawn-education-pattern_23-2148107567.jpg";

export default function EditAlumniProfile({ user }) {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [graduationYear, setGraduationYear] = useState("");
    const [currentJob, setCurrentJob] = useState("");
    const [company, setCompany] = useState("");
    const [location, setLocation] = useState("");
    const [bio, setBio] = useState("");

    // Career journey entries: [{ title, company, startYear, endYear }]
    const [careerJourney, setCareerJourney] = useState([]);

    const [profilePicture, setProfilePicture] = useState("");
    const [coverPicture, setCoverPicture] = useState("");
    const [uploading, setUploading] = useState(false);

    const userId = user?.id || user?._id;

    useEffect(() => {
        const fetchUserData = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    `${API_URL}/users/profile/${userId}`
                );
                const data = await response.json();

                if (response.ok) {
                    const nameParts = (data.username || "").split(" ");
                    setFirstName(nameParts[0] || "");
                    setLastName(nameParts.slice(1).join(" ") || "");

                    setEmail(data.email || "");
                    setGraduationYear(
                        data.graduationYear ? String(data.graduationYear) : ""
                    );
                    setCurrentJob(data.currentJob || "");
                    setCompany(data.company || "");
                    setLocation(data.location || "");
                    setBio(data.bio || "");
                    setProfilePicture(data.profilePicture || "");
                    setCoverPicture(data.coverPicture || "");

                    // Parse career journey
                    if (data.careerJourney) {
                        if (Array.isArray(data.careerJourney)) {
                            setCareerJourney(data.careerJourney);
                        } else {
                            try {
                                setCareerJourney(
                                    JSON.parse(data.careerJourney)
                                );
                            } catch {
                                setCareerJourney([]);
                            }
                        }
                    }
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
        const permissionResult =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert(
                "Permission Required",
                "Allow access to your photos to upload an image."
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: type === "profile" ? [1, 1] : [16, 9],
            quality: 0.7,
            // No base64 — we send the file directly via FormData
        });

        if (!result.canceled) {
            const asset = result.assets[0];
            const formData = new FormData();
            formData.append("image", { uri: asset.uri, type: "image/jpeg", name: `${type}_${userId}.jpg` });
            formData.append("type", type);

            setUploading(true);
            try {
                const response = await fetch(
                    `${API_URL}/users/profile/${userId}/upload-image`,
                    { method: "POST", body: formData }
                );
                const text = await response.text();
                let data = {};
                try { data = JSON.parse(text); } catch { /* server returned non-JSON */ }

                if (response.ok && data.user) {
                    if (type === "profile") setProfilePicture(data.user.profilePicture);
                    else setCoverPicture(data.user.coverPicture);
                } else {
                    console.error("Upload response:", text);
                    Alert.alert("Upload Failed", data.message || `Server error (${response.status})`);
                }
            } catch (err) {
                console.error("Image Upload Error:", err);
                Alert.alert("Network Error", "Could not connect to server.");
            } finally {
                setUploading(false);
            }
        }
    };

    // Career Journey helpers
    const addCareerEntry = () => {
        setCareerJourney([
            ...careerJourney,
            { title: "", company: "", startYear: "", endYear: "" },
        ]);
    };

    const updateCareerEntry = (index, field, value) => {
        const updated = [...careerJourney];
        updated[index] = { ...updated[index], [field]: value };
        setCareerJourney(updated);
    };

    const removeCareerEntry = (index) => {
        setCareerJourney(careerJourney.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!userId) return;

        setSaving(true);
        try {
            const updatedData = {
                username: `${firstName} ${lastName}`.trim(),
                bio,
                graduationYear: graduationYear
                    ? parseInt(graduationYear, 10)
                    : undefined,
                currentJob,
                company,
                location,
                careerJourney: JSON.stringify(careerJourney),
                profilePicture,
                coverPicture,
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
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#D32F2F" />
                <Text style={{ marginTop: 10, color: '#666' }}>Loading Profile...</Text>
            </View>
        );
    }

    if (uploading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#D32F2F" />
                <Text style={{ marginTop: 12, color: '#555', fontSize: 15 }}>Uploading image...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
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
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Cover + Avatar */}
                    <View style={styles.mediaSection}>
                        <View style={styles.coverPlaceholder}>
                            <Image
                                source={{ uri: coverPicture || DEFAULT_COVER }}
                                style={{ width: "100%", height: "100%" }}
                                resizeMode="cover"
                            />
                        </View>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={{
                                    uri: profilePicture || DEFAULT_AVATAR,
                                }}
                                style={styles.avatar}
                            />
                        </View>
                        <View style={styles.editButtonsRow}>
                            <TouchableOpacity
                                style={styles.editMediaBtn}
                                onPress={() => pickImage("profile")}
                            >
                                <Text style={styles.editMediaText}>
                                    Edit Profile Picture
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.editMediaBtn}
                                onPress={() => pickImage("cover")}
                            >
                                <Text style={styles.editMediaText}>
                                    Edit Cover
                                </Text>
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
                                <Ionicons
                                    name="pencil-outline"
                                    size={18}
                                    color="#666"
                                />
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
                                <Ionicons
                                    name="pencil-outline"
                                    size={18}
                                    color="#666"
                                />
                            </View>
                        </View>

                        {/* Email (read-only) */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <View
                                style={[
                                    styles.inputContainer,
                                    styles.readOnlyContainer,
                                ]}
                            >
                                <TextInput
                                    style={[styles.input, styles.readOnlyText]}
                                    value={email}
                                    editable={false}
                                />
                                <Ionicons
                                    name="lock-closed-outline"
                                    size={18}
                                    color="#999"
                                />
                            </View>
                        </View>

                        {/* Class of (Graduation Year) */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Class of (Graduation Year)</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={graduationYear}
                                    onChangeText={setGraduationYear}
                                    keyboardType="numeric"
                                    maxLength={4}
                                    placeholder="e.g. 2020"
                                    placeholderTextColor="#aaa"
                                />
                                <Ionicons
                                    name="pencil-outline"
                                    size={18}
                                    color="#666"
                                />
                            </View>
                        </View>

                        {/* Current Job Title */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Current Job Title</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={currentJob}
                                    onChangeText={setCurrentJob}
                                    placeholder="e.g. Senior Software Engineer"
                                    placeholderTextColor="#aaa"
                                />
                                <Ionicons
                                    name="pencil-outline"
                                    size={18}
                                    color="#666"
                                />
                            </View>
                        </View>

                        {/* Company */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Company / Organisation</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={company}
                                    onChangeText={setCompany}
                                    placeholder="e.g. Tech Corp"
                                    placeholderTextColor="#aaa"
                                />
                                <Ionicons
                                    name="pencil-outline"
                                    size={18}
                                    color="#666"
                                />
                            </View>
                        </View>

                        {/* Location */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Location</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={location}
                                    onChangeText={setLocation}
                                    placeholder="e.g. San Francisco, CA"
                                    placeholderTextColor="#aaa"
                                />
                                <Ionicons
                                    name="pencil-outline"
                                    size={18}
                                    color="#666"
                                />
                            </View>
                        </View>

                        {/* Professional Bio */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Professional Bio</Text>
                            <View
                                style={[
                                    styles.inputContainer,
                                    styles.textAreaContainer,
                                ]}
                            >
                                <TextInput
                                    style={styles.textArea}
                                    value={bio}
                                    onChangeText={setBio}
                                    multiline={true}
                                    numberOfLines={4}
                                    placeholder="Tell others about your background and experience..."
                                    placeholderTextColor="#aaa"
                                    textAlignVertical="top"
                                />
                            </View>
                        </View>

                        {/* Career Journey */}
                        <View style={styles.inputGroup}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.label}>Career Journey</Text>
                                <TouchableOpacity
                                    style={styles.addButton}
                                    onPress={addCareerEntry}
                                >
                                    <Feather
                                        name="plus-circle"
                                        size={16}
                                        color="#D32F2F"
                                    />
                                    <Text style={styles.addButtonText}>
                                        Add Entry
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {careerJourney.length === 0 ? (
                                <Text style={styles.emptyHint}>
                                    No career entries yet. Tap "Add Entry" to get started.
                                </Text>
                            ) : (
                                careerJourney.map((entry, index) => (
                                    <View
                                        key={index}
                                        style={styles.careerCard}
                                    >
                                        <View style={styles.careerCardHeader}>
                                            <Text style={styles.careerCardLabel}>
                                                Entry {index + 1}
                                            </Text>
                                            <TouchableOpacity
                                                onPress={() =>
                                                    removeCareerEntry(index)
                                                }
                                            >
                                                <Feather
                                                    name="trash-2"
                                                    size={16}
                                                    color="#D32F2F"
                                                />
                                            </TouchableOpacity>
                                        </View>

                                        <TextInput
                                            style={styles.careerInput}
                                            value={entry.title}
                                            onChangeText={(v) =>
                                                updateCareerEntry(
                                                    index,
                                                    "title",
                                                    v
                                                )
                                            }
                                            placeholder="Job Title"
                                            placeholderTextColor="#aaa"
                                        />
                                        <TextInput
                                            style={styles.careerInput}
                                            value={entry.company}
                                            onChangeText={(v) =>
                                                updateCareerEntry(
                                                    index,
                                                    "company",
                                                    v
                                                )
                                            }
                                            placeholder="Company"
                                            placeholderTextColor="#aaa"
                                        />
                                        <View style={styles.careerYearRow}>
                                            <TextInput
                                                style={[
                                                    styles.careerInput,
                                                    styles.careerYearInput,
                                                ]}
                                                value={entry.startYear}
                                                onChangeText={(v) =>
                                                    updateCareerEntry(
                                                        index,
                                                        "startYear",
                                                        v
                                                    )
                                                }
                                                placeholder="Start Year"
                                                placeholderTextColor="#aaa"
                                                keyboardType="numeric"
                                                maxLength={4}
                                            />
                                            <TextInput
                                                style={[
                                                    styles.careerInput,
                                                    styles.careerYearInput,
                                                ]}
                                                value={entry.endYear}
                                                onChangeText={(v) =>
                                                    updateCareerEntry(
                                                        index,
                                                        "endYear",
                                                        v
                                                    )
                                                }
                                                placeholder="End Year / Present"
                                                placeholderTextColor="#aaa"
                                                keyboardType="numeric"
                                                maxLength={4}
                                            />
                                        </View>
                                    </View>
                                ))
                            )}
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, saving && { opacity: 0.6 }]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        <Text style={styles.saveButtonText}>
                            {saving ? "Saving Changes..." : "Save Changes"}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    scrollContent: { paddingBottom: 60 },

    // Header
    header: {
        flexDirection: "row",
        alignItems: "center",
        height: 60,
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
        marginTop: 20,
    },
    headerTitle: { fontSize: 18, fontWeight: "600" },
    backButton: {
        padding: 8,
        backgroundColor: "#F5F5F5",
        borderRadius: 20,
    },
    doneButton: { color: "#D32F2F", fontWeight: "bold", fontSize: 16 },

    // Media
    mediaSection: { alignItems: "center", marginBottom: 20 },
    coverPlaceholder: {
        width: "100%",
        height: 120,
        backgroundColor: "#E0E0E0",
        marginBottom: -50,
        overflow: "hidden",
    },
    avatarContainer: {
        padding: 4,
        backgroundColor: "#fff",
        borderRadius: 65,
        marginTop: 20,
        zIndex: 1,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#f0f0f0",
    },
    editButtonsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        paddingHorizontal: 20,
        marginTop: 15,
    },
    editMediaBtn: {
        backgroundColor: "#F5F5F5",
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    editMediaText: { fontSize: 12, fontWeight: "600", color: "#333" },

    // Form
    formSection: { paddingHorizontal: 20, marginTop: 20 },
    inputGroup: { marginBottom: 20 },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    label: { fontSize: 14, color: "#333", fontWeight: "500", marginBottom: 8 },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#F9F9F9",
        paddingHorizontal: 15,
        paddingVertical: 14,
        borderRadius: 12,
    },
    input: { flex: 1, fontSize: 16, color: "#000" },
    readOnlyContainer: { backgroundColor: "#F0F0F0", opacity: 0.8 },
    readOnlyText: { color: "#777" },
    textAreaContainer: { paddingVertical: 15, alignItems: "flex-start" },
    textArea: {
        flex: 1,
        fontSize: 16,
        color: "#000",
        minHeight: 100,
        width: "100%",
    },

    // Add Entry
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    addButtonText: {
        color: "#D32F2F",
        fontSize: 14,
        fontWeight: "600",
    },
    emptyHint: {
        fontSize: 13,
        color: "#bbb",
        fontStyle: "italic",
        marginTop: 4,
    },

    // Career Card
    careerCard: {
        backgroundColor: "#F9F9F9",
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#eee",
    },
    careerCardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    careerCardLabel: {
        fontSize: 13,
        fontWeight: "700",
        color: "#555",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    careerInput: {
        backgroundColor: "#fff",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
        color: "#000",
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#eee",
    },
    careerYearRow: { flexDirection: "row", gap: 8 },
    careerYearInput: { flex: 1 },
    saveButton: {
        backgroundColor: '#D32F2F',
        marginHorizontal: 20,
        marginVertical: 20,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
