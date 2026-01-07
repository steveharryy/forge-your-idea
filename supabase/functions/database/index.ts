import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Pool } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize connection pool
const DATABASE_URL = Deno.env.get("DATABASE_URL");

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set");
}

const pool = new Pool(DATABASE_URL, 3, true);

// Helper to get connection
async function getConnection() {
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  return await pool.connect();
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();
    console.log(`Database action: ${action}`, data);

    const connection = await getConnection();
    let result;

    try {
      switch (action) {
        // ========== User Management ==========
        case "createUser": {
          const { clerk_id, email, full_name, role, avatar_url } = data;
          result = await connection.queryObject`
            INSERT INTO users (clerk_id, email, full_name, role, avatar_url, created_at, updated_at)
            VALUES (${clerk_id}, ${email}, ${full_name}, ${role}, ${avatar_url}, NOW(), NOW())
            ON CONFLICT (clerk_id) DO UPDATE SET
              email = EXCLUDED.email,
              full_name = EXCLUDED.full_name,
              role = EXCLUDED.role,
              avatar_url = EXCLUDED.avatar_url,
              updated_at = NOW()
            RETURNING *
          `;
          break;
        }

        case "getUser": {
          const { clerk_id } = data;
          result = await connection.queryObject`
            SELECT * FROM users WHERE clerk_id = ${clerk_id}
          `;
          break;
        }

        case "getUserRole": {
          const { clerk_id } = data;
          result = await connection.queryObject`
            SELECT role FROM users WHERE clerk_id = ${clerk_id}
          `;
          break;
        }

        case "updateUserProfile": {
          const { clerk_id, full_name, bio, university, linkedin_url, website, avatar_url } = data;
          result = await connection.queryObject`
            UPDATE users SET
              full_name = COALESCE(${full_name}, full_name),
              bio = COALESCE(${bio}, bio),
              university = COALESCE(${university}, university),
              linkedin_url = COALESCE(${linkedin_url}, linkedin_url),
              website = COALESCE(${website}, website),
              avatar_url = COALESCE(${avatar_url}, avatar_url),
              updated_at = NOW()
            WHERE clerk_id = ${clerk_id}
            RETURNING *
          `;
          break;
        }

        // ========== Projects (Student) ==========
        case "createProject": {
          const { 
            clerk_id, title, tagline, description, problem, solution, 
            tech_stack, category, demo_url, github_url, funding_goal, 
            founder_name, founder_avatar, founder_university, status 
          } = data;
          
          result = await connection.queryObject`
            INSERT INTO projects (
              owner_clerk_id, title, tagline, description, problem, solution,
              tech_stack, category, demo_url, github_url, funding_goal,
              founder_name, founder_avatar, founder_university, status, created_at, updated_at
            )
            VALUES (
              ${clerk_id}, ${title}, ${tagline}, ${description}, ${problem}, ${solution},
              ${tech_stack}, ${category}, ${demo_url}, ${github_url}, ${funding_goal},
              ${founder_name}, ${founder_avatar}, ${founder_university}, ${status || 'draft'}, NOW(), NOW()
            )
            RETURNING *
          `;
          break;
        }

        case "getProjectsByOwner": {
          const { clerk_id } = data;
          result = await connection.queryObject`
            SELECT * FROM projects WHERE owner_clerk_id = ${clerk_id} ORDER BY created_at DESC
          `;
          break;
        }

        case "getAllPublishedProjects": {
          result = await connection.queryObject`
            SELECT * FROM projects WHERE status = 'published' ORDER BY created_at DESC
          `;
          break;
        }

        case "getProjectById": {
          const { project_id } = data;
          result = await connection.queryObject`
            SELECT * FROM projects WHERE id = ${project_id}
          `;
          break;
        }

        case "updateProject": {
          const { 
            project_id, title, tagline, description, problem, solution,
            tech_stack, category, demo_url, github_url, funding_goal, status
          } = data;
          
          result = await connection.queryObject`
            UPDATE projects SET
              title = COALESCE(${title}, title),
              tagline = COALESCE(${tagline}, tagline),
              description = COALESCE(${description}, description),
              problem = COALESCE(${problem}, problem),
              solution = COALESCE(${solution}, solution),
              tech_stack = COALESCE(${tech_stack}, tech_stack),
              category = COALESCE(${category}, category),
              demo_url = COALESCE(${demo_url}, demo_url),
              github_url = COALESCE(${github_url}, github_url),
              funding_goal = COALESCE(${funding_goal}, funding_goal),
              status = COALESCE(${status}, status),
              updated_at = NOW()
            WHERE id = ${project_id}
            RETURNING *
          `;
          break;
        }

        case "deleteProject": {
          const { project_id, clerk_id } = data;
          result = await connection.queryObject`
            DELETE FROM projects WHERE id = ${project_id} AND owner_clerk_id = ${clerk_id}
            RETURNING id
          `;
          break;
        }

        // ========== Contact Requests (Investor -> Student) ==========
        case "sendContactRequest": {
          const { from_clerk_id, to_clerk_id, project_id, message } = data;
          result = await connection.queryObject`
            INSERT INTO contact_requests (from_clerk_id, to_clerk_id, project_id, message, status, created_at)
            VALUES (${from_clerk_id}, ${to_clerk_id}, ${project_id}, ${message}, 'pending', NOW())
            RETURNING *
          `;
          break;
        }

        case "getContactRequestsForUser": {
          const { clerk_id } = data;
          result = await connection.queryObject`
            SELECT cr.*, 
              u.full_name as from_user_name, 
              u.avatar_url as from_user_avatar,
              u.email as from_user_email,
              p.title as project_title
            FROM contact_requests cr
            LEFT JOIN users u ON cr.from_clerk_id = u.clerk_id
            LEFT JOIN projects p ON cr.project_id = p.id
            WHERE cr.to_clerk_id = ${clerk_id}
            ORDER BY cr.created_at DESC
          `;
          break;
        }

        case "getSentContactRequests": {
          const { clerk_id } = data;
          result = await connection.queryObject`
            SELECT cr.*, p.title as project_title
            FROM contact_requests cr
            LEFT JOIN projects p ON cr.project_id = p.id
            WHERE cr.from_clerk_id = ${clerk_id}
            ORDER BY cr.created_at DESC
          `;
          break;
        }

        case "updateContactRequestStatus": {
          const { request_id, status, clerk_id } = data;
          result = await connection.queryObject`
            UPDATE contact_requests SET status = ${status}
            WHERE id = ${request_id} AND to_clerk_id = ${clerk_id}
            RETURNING *
          `;
          break;
        }

        // ========== Initialize Database ==========
        case "initDatabase": {
          // Create tables if they don't exist
          await connection.queryObject`
            CREATE TABLE IF NOT EXISTS users (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              clerk_id TEXT UNIQUE NOT NULL,
              email TEXT NOT NULL,
              full_name TEXT,
              role TEXT CHECK (role IN ('student', 'investor')),
              avatar_url TEXT,
              bio TEXT,
              university TEXT,
              linkedin_url TEXT,
              website TEXT,
              created_at TIMESTAMPTZ DEFAULT NOW(),
              updated_at TIMESTAMPTZ DEFAULT NOW()
            )
          `;

          await connection.queryObject`
            CREATE TABLE IF NOT EXISTS projects (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              owner_clerk_id TEXT NOT NULL REFERENCES users(clerk_id) ON DELETE CASCADE,
              title TEXT NOT NULL,
              tagline TEXT,
              description TEXT,
              problem TEXT,
              solution TEXT,
              tech_stack TEXT[],
              category TEXT,
              demo_url TEXT,
              github_url TEXT,
              funding_goal NUMERIC,
              founder_name TEXT,
              founder_avatar TEXT,
              founder_university TEXT,
              logo_url TEXT,
              status TEXT DEFAULT 'draft',
              created_at TIMESTAMPTZ DEFAULT NOW(),
              updated_at TIMESTAMPTZ DEFAULT NOW()
            )
          `;

          await connection.queryObject`
            CREATE TABLE IF NOT EXISTS contact_requests (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              from_clerk_id TEXT NOT NULL REFERENCES users(clerk_id) ON DELETE CASCADE,
              to_clerk_id TEXT NOT NULL REFERENCES users(clerk_id) ON DELETE CASCADE,
              project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
              message TEXT NOT NULL,
              status TEXT DEFAULT 'pending',
              created_at TIMESTAMPTZ DEFAULT NOW()
            )
          `;

          result = { rows: [{ success: true, message: "Database initialized" }] };
          break;
        }

        default:
          throw new Error(`Unknown action: ${action}`);
      }

      return new Response(JSON.stringify({ success: true, data: result.rows }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Database error:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
