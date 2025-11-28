type SignUpProfessionalParams = {
  body: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  };
}
export async function signUpProfessional({ body }: SignUpProfessionalParams) {
  try {
    const response = await fetch("/api/auth/sign-up/professional", {
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
      return { error: data.error };
    }

    return { message: "User created successfully" };
  } catch (err) {
    console.error("Sign up error:", err);
    return { error: "Internal server error" };
  }
}