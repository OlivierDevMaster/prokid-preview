import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userType: string }> }
) {
  try {
    const { firstName, lastName, email, password } = await request.json();
    const { userType } = await params;

    // Validation du type d'utilisateur
    if (!userType || !["professional", "structure"].includes(userType)) {
      return NextResponse.json(
        { error: "Invalid user type. Must be 'professional' or 'structure'" },
        { status: 400 }
      );
    }

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const fullName = `${firstName} ${lastName}`;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          first_name: firstName,
          last_name: lastName,
          user_type: userType,
        },
      },
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    const userId = authData.user.id;

    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        email: email,
        first_name: firstName,
        last_name: lastName,
        user_type: userType,
        user: userId,
      });

    if (profileError) {
      console.error("Error creating profile:", profileError);

      if (profileError.code === "PGRST116") {
        return NextResponse.json(
          {
            error:
              "Profile table does not exist. Please create the profiles table in your Supabase database.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: "Failed to create profile" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: userId,
          email: email,
          name: fullName,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Sign up error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
