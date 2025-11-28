type SignUpParams = {
  userType: "professional" | "structure";
  body: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  };
};

export async function signUp({ userType, body }: SignUpParams) {
  try {
    const response = await fetch(`/api/auth/sign-up/${userType}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.error === "Email already exists") {
        return { error: "Email already exists" };
      } else {
        return { error: data.error };
      }
    }

    return { message: "User created successfully" };
  } catch (err) {
    console.error("Sign up error:", err);
    return { error: "Internal server error" };
  }
}

// Fonction helper pour maintenir la compatibilité
export async function signUpProfessional({ body }: Omit<SignUpParams, "userType">) {
  return signUp({ userType: "professional", body });
}

// Fonction helper pour les structures
export async function signUpStructure({ body }: Omit<SignUpParams, "userType">) {
  return signUp({ userType: "structure", body });
}