/**
 * ====================================
 * AUTH FLOW CONTEXT
 * ====================================
 * Provides shared state for the auth flow screens.
 * Replaces the prop-drilling pattern from the old index.jsx state machine.
 * 
 * Stores: selectedRole, userEmail, studentId, resetEmail, 
 *         userData
 */

import React, { createContext, useContext, useState } from "react";

const AuthFlowContext = createContext(null);

export function AuthFlowProvider({ children }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [userData, setUserData] = useState(null);

  const value = {
    selectedRole,
    setSelectedRole,
    userEmail,
    setUserEmail,
    studentId,
    setStudentId,
    resetEmail,
    setResetEmail,
    userData,
    setUserData,
  };

  return (
    <AuthFlowContext.Provider value={value}>
      {children}
    </AuthFlowContext.Provider>
  );
}

export function useAuthFlow() {
  const context = useContext(AuthFlowContext);
  if (!context) {
    throw new Error("useAuthFlow must be used within an AuthFlowProvider");
  }
  return context;
}
