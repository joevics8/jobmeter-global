import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EntitySearchResult {
  id: string;
  entity_type: string;
  company_name: string;
  aliases: string[];
  website: string | null;
  report_count: number;
  verification_status: string;
  is_published: boolean;
  created_at: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse body for all requests
    let body: any = {};
    if (req.method === "POST") {
      try {
        body = await req.json();
      } catch (e) {
        body = {};
      }
    }

    const url = new URL(req.url);
    const query = body.q || body.search || url.searchParams.get("q");

    // Handle search action
    if (body.action === "search" || query) {
      const searchQuery = query;
      
      if (!searchQuery || searchQuery.length < 2) {
        return new Response(
          JSON.stringify({ success: false, error: "Search query must be at least 2 characters" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Search by company name (case insensitive)
      const { data: entities, error } = await supabase
        .from("reported_entities")
        .select("*")
        .ilike("company_name", `%${searchQuery}%`)
        .order("report_count", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Search error:", error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Filter results - only return published or confirmed/under_review entities
      const results: EntitySearchResult[] = [];
      for (const entity of entities || []) {
        if (entity.is_published || ["confirmed", "under_review"].includes(entity.verification_status)) {
          results.push({
            id: entity.id,
            entity_type: entity.entity_type,
            company_name: entity.company_name,
            aliases: entity.aliases || [],
            website: entity.website,
            report_count: entity.report_count,
            verification_status: entity.verification_status,
            is_published: entity.is_published,
            created_at: entity.created_at
          });
        }
      }

      return new Response(
        JSON.stringify({ success: true, data: results }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle submit report action
    if (body.action === "submit_report" || (body.company_name && body.report_type && body.description)) {
      const { 
        entity_type, 
        company_name, 
        aliases, 
        website, 
        emails, 
        phone_numbers,
        address,
        report_type, 
        description, 
        evidence_url, 
        user_email 
      } = body;

      // Validation
      if (!company_name || !report_type || !description) {
        return new Response(
          JSON.stringify({ success: false, error: "Company name, report type, and description are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if entity already exists
      const { data: existingEntity, error: checkError } = await supabase
        .from("reported_entities")
        .select("id, report_count")
        .ilike("company_name", company_name)
        .single();

      let entityId: string;

      if (existingEntity) {
        // Update existing entity
        const { data: updatedEntity, error: updateError } = await supabase
          .from("reported_entities")
          .update({ 
            report_count: existingEntity.report_count + 1,
            verification_status: "under_review"
          })
          .eq("id", existingEntity.id)
          .select("id")
          .single();

        if (updateError) {
          console.error("Update error:", updateError);
          throw updateError;
        }
        entityId = updatedEntity.id;
      } else {
        // Create new entity
        const { data: newEntity, error: insertError } = await supabase
          .from("reported_entities")
          .insert({
            entity_type: entity_type || "company",
            company_name,
            aliases: aliases || [],
            website: website || null,
            emails: emails || [],
            phone_numbers: phone_numbers || [],
            address: address || null,
            report_count: 1,
            verification_status: "under_review",
            is_published: false
          })
          .select("id")
          .single();

        if (insertError) {
          console.error("Insert error:", insertError);
          throw insertError;
        }
        entityId = newEntity.id;
      }

      // Create the report
      const { data: report, error: reportError } = await supabase
        .from("scam_reports")
        .insert({
          entity_id: entityId,
          report_type,
          description,
          evidence_url: evidence_url || null,
          user_email: user_email || null,
          status: "pending"
        })
        .select()
        .single();

      if (reportError) {
        console.error("Report insert error:", reportError);
        throw reportError;
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: { 
            message: "Report submitted successfully. Thank you for helping protect job seekers!",
            report_id: report.id
          } 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle get reports action
    if (body.action === "get_reports" && body.entity_id) {
      const { data: reports, error } = await supabase
        .from("scam_reports")
        .select("*")
        .eq("entity_id", body.entity_id)
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Get reports error:", error);
        throw error;
      }

      return new Response(
        JSON.stringify({ success: true, data: reports }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Default response for unknown actions
    return new Response(
      JSON.stringify({ success: true, data: [] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in scam-checker:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
