import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Comment creation function
export async function createComment({
  appKey,
  ownerIdentifier,
  body,
  user,
}: {
  appKey: string;
  ownerIdentifier: string;
  body: string;
  user: {
    authType: "external" | "social" | "guest";
    externalSystemIdentifier?: string;
    userId?: string;
    displayName: string;
    email?: string;
    avatar?: string;
  };
}) {
  // Get app by app_key
  const { data: app, error: appError } = await supabase
    .from("applications")
    .select("id")
    .eq("app_key", appKey)
    .single();

  if (appError || !app) {
    throw new Error("Invalid app key");
  }

  // Create or get user
  let userId = user.userId;
  if (!userId) {
    const { data: userData, error: userError } = await supabase
      .from("users")
      .upsert({
        display_name: user.displayName,
        email: user.email || null,
        avatar_path: user.avatar || null,
        application_id: app.id,
        is_banned: false,
      })
      .select()
      .single();

    if (userError || !userData) {
      throw new Error("Failed to create user");
    }
    userId = userData.id;
  }

  // Create comment
  const { data: comment, error: commentError } = await supabase
    .from("comments")
    .insert({
      owner_resource_identifier: ownerIdentifier,
      body,
      user_id: userId,
      app_id: app.id,
      created_at: Date.now(),
    })
    .select(
      `
      *,
      user:users(id, display_name, email, avatar_path)
    `
    )
    .single();

  if (commentError) {
    throw new Error("Failed to create comment");
  }

  return comment;
}

// Get comments function
export async function getComments({
  appKey,
  ownerIdentifier,
}: {
  appKey: string;
  ownerIdentifier: string;
}) {
  // Get app by app_key
  const { data: app, error: appError } = await supabase
    .from("applications")
    .select("id")
    .eq("app_key", appKey)
    .single();

  if (appError || !app) {
    throw new Error("Invalid app key");
  }

  // Get comments with user data
  const { data: comments, error: commentsError } = await supabase
    .from("comments")
    .select(
      `
      *,
      user:users(id, display_name, email, avatar_path),
      replies:comments!parent_id(
        *,
        user:users(id, display_name, email, avatar_path)
      )
    `
    )
    .eq("app_id", app.id)
    .eq("owner_resource_identifier", ownerIdentifier)
    .is("parent_id", null)
    .order("created_at", { ascending: false });

  if (commentsError) {
    throw new Error("Failed to fetch comments");
  }

  return comments;
}

// Real-time subscription for comments
export async function subscribeToComments({
  appKey,
  ownerIdentifier,
  onInsert,
  onUpdate,
  onDelete,
}: {
  appKey: string;
  ownerIdentifier: string;
  onInsert?: (comment: any) => void;
  onUpdate?: (comment: any) => void;
  onDelete?: (comment: any) => void;
}) {
  // First get the app ID
  const { data: app, error } = await supabase
    .from("applications")
    .select("id, app_name")
    .eq("app_key", appKey)
    .single();

  if (error || !app) return null;

  const filter = `owner_resource_identifier=eq.${ownerIdentifier}`;
  // filter: `app_id=eq.${app.id} AND owner_resource_identifier=eq.${ownerIdentifier}`,

  // Subscribe to changes
  const subscription = supabase
    .channel("schema-db-changes")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "comments",
        filter,
      },
      (payload) => onInsert?.(payload.new)
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "comments",
        filter,
      },
      (payload) => onUpdate?.(payload?.new)
    )
    .on(
      "postgres_changes",
      {
        event: "DELETE",
        schema: "public",
        table: "comments",
        filter,
      },
      (payload) => onDelete?.(payload.old)
    )
    .subscribe();

  return subscription;
}
