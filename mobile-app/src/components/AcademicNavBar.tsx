import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface AcademicNavBarProps {
    activeTab: string;
    onTabPress: (tab: string) => void;
}

const TABS = ["Timetable", "Kuppi", "Resources"];

export default function AcademicNavBar({ activeTab, onTabPress }: AcademicNavBarProps) {
    return (
        <View style={styles.container}>
            {TABS.map((tab) => {
                const isActive = activeTab === tab;
                return (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => onTabPress(tab)}
                        activeOpacity={0.8}
                        style={[
                            styles.button,
                            isActive ? styles.activeButton : styles.inactiveButton
                        ]}
                    >
                        <Text
                            style={[
                                styles.text,
                                isActive ? styles.activeText : styles.inactiveText
                            ]}
                        >
                            {tab}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: 16,
        marginTop: 10,
        marginBottom: 10,
        height: 50, // Fixed height for container consistency
        alignItems: 'center',
    },
    button: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 4, // Small margin between buttons
    },
    activeButton: {
        backgroundColor: '#f9252b',
    },
    inactiveButton: {
        backgroundColor: '#f7f7f7',
    },
    text: {
        fontWeight: '600',
        fontSize: 14,
    },
    activeText: {
        color: '#fff',
    },
    inactiveText: {
        color: '#777',
    },
});
