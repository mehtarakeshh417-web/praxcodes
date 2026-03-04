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

      console.log(`[BULK CREATE] Processing ${users?.length || 0} users`);

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
          console.log(`[BULK CREATE] Failed: ${u.email} - ${createError.message}`);
          errors.push(`${u.email}: ${createError.message}`);
          continue;
        }

        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({ user_id: newUser.user.id, role: u.role });

        if (roleError) {
          console.log(`[BULK CREATE] Role failed: ${u.email} - ${roleError.message}`);
          await supabase.auth.admin.deleteUser(newUser.user.id);
          errors.push(`${u.email}: role assignment failed`);
          continue;
        }

        results.push(newUser.user);
      }

      console.log(`[BULK CREATE] Done: ${results.length} created, ${errors.length} errors`);

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
      // THOROUGH cleanup: List ALL auth users and find any student-like accounts
      // that don't have a matching student DB record
      let deleted = 0;
      const deleteErrors: string[] = [];
      
      // Get ALL existing students' user_ids
      const { data: existingStudents } = await supabase
        .from("students")
        .select("user_id");
      const existingStudentUserIds = new Set(
        (existingStudents || []).map((s: any) => s.user_id).filter(Boolean)
      );

      // Get ALL existing teachers' user_ids  
      const { data: existingTeachers } = await supabase
        .from("teachers")
        .select("user_id");
      const existingTeacherUserIds = new Set(
        (existingTeachers || []).map((t: any) => t.user_id).filter(Boolean)
      );

      // Get ALL existing schools' user_ids
      const { data: existingSchools } = await supabase
        .from("schools")
        .select("user_id");
      const existingSchoolUserIds = new Set(
        (existingSchools || []).map((s: any) => s.user_id).filter(Boolean)
      );

      // List ALL auth users (paginated)
      let page = 1;
      const perPage = 100;
      let hasMore = true;
      
      while (hasMore) {
        const { data: listData, error: listError } = await supabase.auth.admin.listUsers({
          page,
          perPage,
        });
        
        if (listError || !listData?.users?.length) {
          hasMore = false;
          break;
        }

        for (const authUser of listData.users) {
          const email = authUser.email || "";
          // Only process @codechamps.local emails (our managed accounts)
          if (!email.endsWith("@codechamps.local")) continue;
          
          // Skip if user has a valid record in any entity table
          if (existingStudentUserIds.has(authUser.id)) continue;
          if (existingTeacherUserIds.has(authUser.id)) continue;
          if (existingSchoolUserIds.has(authUser.id)) continue;
          
          // Check if this is the admin account - skip it
          const { data: adminRole } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", authUser.id)
            .eq("role", "admin");
          if (adminRole && adminRole.length > 0) continue;

          // This is an orphaned account - delete it
          try {
            const { error: delErr } = await supabase.auth.admin.deleteUser(authUser.id);
            if (!delErr) {
              await supabase.from("user_roles").delete().eq("user_id", authUser.id);
              await supabase.from("user_security").delete().eq("user_id", authUser.id);
              deleted++;
            } else {
              deleteErrors.push(`${email}: ${delErr.message}`);
            }
          } catch (e) {
            deleteErrors.push(`${email}: ${e.message}`);
          }
        }

        hasMore = listData.users.length === perPage;
        page++;
      }

      return new Response(JSON.stringify({ deleted, errors: deleteErrors }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

      return new Response(JSON.stringify({ deleted, total_orphans: orphanIds.length, errors: deleteErrors }), {
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
