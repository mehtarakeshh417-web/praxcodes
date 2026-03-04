import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify the caller is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller }, error: callerError } = await callerClient.auth.getUser();
    if (callerError || !caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check caller has admin or school role
    const { data: callerRoles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id);
    const roles = (callerRoles || []).map((r: any) => r.role);
    const isAdmin = roles.includes("admin");
    const isSchool = roles.includes("school");

    if (!isAdmin && !isSchool) {
      return new Response(JSON.stringify({ error: "Insufficient permissions" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;

    if (action === "create_user") {
      const { email, password, role, metadata } = body;
      
      // Schools can only create teachers and students
      if (isSchool && !isAdmin && !["teacher", "student"].includes(role)) {
        return new Response(JSON.stringify({ error: "Schools can only create teachers and students" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: metadata || {},
      });

      if (createError) {
        return new Response(JSON.stringify({ error: createError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Assign role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: newUser.user.id, role });

      if (roleError) {
        // Cleanup: delete the user if role assignment fails
        await supabase.auth.admin.deleteUser(newUser.user.id);
        return new Response(JSON.stringify({ error: `Role assignment failed: ${roleError.message}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ user: newUser.user }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "create_users_bulk") {
      const { users } = body; // Array of { email, password, role, metadata }
      const results: any[] = [];
      const errors: string[] = [];

      for (const u of users) {
        // Schools can only create teachers and students
        if (isSchool && !isAdmin && !["teacher", "student"].includes(u.role)) {
          errors.push(`${u.email}: insufficient permissions for role ${u.role}`);
          continue;
        }

        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: u.email,
          password: u.password,
          email_confirm: true,
          user_metadata: u.metadata || {},
        });

        if (createError) {
          errors.push(`${u.email}: ${createError.message}`);
          continue;
        }

        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({ user_id: newUser.user.id, role: u.role });

        if (roleError) {
          await supabase.auth.admin.deleteUser(newUser.user.id);
          errors.push(`${u.email}: role assignment failed`);
          continue;
        }

        results.push(newUser.user);
      }

      return new Response(JSON.stringify({ users: results, errors }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete_user") {
      const { user_id } = body;

      // If school, verify the user belongs to their school
      if (isSchool && !isAdmin) {
        const { data: school } = await supabase
          .from("schools")
          .select("id")
          .eq("user_id", caller.id)
          .single();
        
        if (school) {
          const { data: teacher } = await supabase
            .from("teachers")
            .select("id")
            .eq("user_id", user_id)
            .eq("school_id", school.id);
          const { data: student } = await supabase
            .from("students")
            .select("id")
            .eq("user_id", user_id)
            .eq("school_id", school.id);
          
          if ((!teacher || teacher.length === 0) && (!student || student.length === 0)) {
            return new Response(JSON.stringify({ error: "User not in your school" }), {
              status: 403,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
      }

      const { error: deleteError } = await supabase.auth.admin.deleteUser(user_id);
      if (deleteError) {
        return new Response(JSON.stringify({ error: deleteError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete_users_bulk") {
      const { user_ids } = body;
      const results: string[] = [];
      const errors: string[] = [];

      for (const uid of user_ids) {
        const { error } = await supabase.auth.admin.deleteUser(uid);
        if (error) {
          errors.push(`${uid}: ${error.message}`);
        } else {
          results.push(uid);
        }
      }

      return new Response(JSON.stringify({ deleted: results, errors }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "change_password") {
      const { user_id, new_password } = body;
      
      if (caller.id !== user_id && !isAdmin) {
        return new Response(JSON.stringify({ error: "Can only change your own password" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabase.auth.admin.updateUser(user_id, { password: new_password });
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "cleanup_orphaned_student_users") {
      // Find auth users with student role but no matching student record
      const { data: studentRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "student");
      
      if (!studentRoles || studentRoles.length === 0) {
        return new Response(JSON.stringify({ deleted: 0 }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: existingStudents } = await supabase
        .from("students")
        .select("user_id");
      
      const existingUserIds = new Set((existingStudents || []).map((s: any) => s.user_id).filter(Boolean));
      const orphanIds = studentRoles
        .map((r: any) => r.user_id)
        .filter((uid: string) => !existingUserIds.has(uid));

      let deleted = 0;
      for (const uid of orphanIds) {
        const { error } = await supabase.auth.admin.deleteUser(uid);
        if (!error) {
          await supabase.from("user_roles").delete().eq("user_id", uid);
          deleted++;
        }
      }

      return new Response(JSON.stringify({ deleted, total_orphans: orphanIds.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
