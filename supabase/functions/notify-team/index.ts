/*
  # Team Notification Edge Function

  This function handles all user activity notifications to shashankvakkalanka@gmail.com:
  1. Recipe creation, deletion, and updates
  2. User profile changes
  3. Password changes
  4. Login/logout activities
  5. AI recipe generations
  6. Detailed recipe information and user analytics
*/

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

interface NotificationData {
  activity_type: string
  user_email?: string
  user_id?: string
  recipe_title?: string
  recipe_id?: string
  recipe_details?: any
  action: string
  changes?: any
  timestamp: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const data: NotificationData = await req.json()

    // Initialize Supabase client for fetching additional data
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch additional user analytics and recipe details
    let userAnalytics = null;
    let recipeDetails = null;

    if (data.user_id) {
      // Get user analytics
      const { data: recipes } = await supabaseClient
        .from('recipes')
        .select('*')
        .eq('user_id', data.user_id);

      userAnalytics = {
        total_recipes: recipes?.length || 0,
        completed_recipes: recipes?.filter(r => r.status === 'completed').length || 0,
        pending_recipes: recipes?.filter(r => r.status === 'pending').length || 0,
        ai_generated_recipes: recipes?.filter(r => r.ai_generated_card).length || 0,
        recent_activity: recipes?.slice(0, 5).map(r => ({
          title: r.title,
          status: r.status,
          created_at: r.created_at
        })) || []
      };
    }

    if (data.recipe_id) {
      // Get full recipe details
      const { data: recipe } = await supabaseClient
        .from('recipes')
        .select('*')
        .eq('id', data.recipe_id)
        .single();

      recipeDetails = recipe;
    }

    // Log the activity for the S-Hatch team
    console.log('🔔 S-Hatch Team Notification to shashankvakkalanka@gmail.com:', {
      type: data.activity_type,
      user: data.user_email,
      action: data.action,
      details: data,
      analytics: userAnalytics,
      recipe: recipeDetails,
      timestamp: data.timestamp
    })

    // Example notification formats:
    const notifications = {
      recipe_created: `🍳 New Recipe Created: "${data.recipe_title}" by ${data.user_email}`,
      recipe_deleted: `🗑️ Recipe Deleted: "${data.recipe_title}" removed by ${data.user_email}`,
      recipe_updated: `✏️ Recipe Updated: "${data.recipe_title}" modified by ${data.user_email}`,
      profile_updated: `👤 Profile Updated: ${data.user_email} changed their profile information`,
      password_changed: `🔒 Password Changed: ${data.user_email} updated their password`,
      user_login: `🔑 User Login: ${data.user_email} signed in`,
      user_logout: `👋 User Logout: ${data.user_email} signed out`,
      ai_recipe_generated: `🤖 AI Recipe Generated: "${data.recipe_title}" by ${data.user_email}`,
    }

    const message = notifications[data.activity_type as keyof typeof notifications] || 
                   `📊 User Activity: ${data.action} by ${data.user_email}`

    // Simulate sending notifications
    await sendEmailToSHatch(message, data, userAnalytics, recipeDetails)
    await logToDatabase(data, userAnalytics)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Team notified successfully',
        notification: message,
        sent_to: 'shashankvakkalanka@gmail.com'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error sending team notification:', error)

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})

async function sendEmailToSHatch(
  message: string, 
  data: NotificationData, 
  analytics: any, 
  recipeDetails: any
) {
  console.log('📧 Email Notification to shashankvakkalanka@gmail.com:', message)
  
  const emailContent = {
    to: 'shashankvakkalanka@gmail.com',
    subject: `🍳 RecipeAI Activity Alert: ${data.action}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .analytics { background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .recipe-details { background: #f3e8ff; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .stat { display: inline-block; margin: 10px 15px 10px 0; padding: 8px 12px; background: white; border-radius: 4px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🍳 RecipeAI Activity Alert</h1>
          <p style="margin: 0; opacity: 0.9;">${message}</p>
        </div>
        
        <div class="content">
          <h2>📊 Activity Details</h2>
          <p><strong>👤 User:</strong> ${data.user_email}</p>
          <p><strong>🎯 Action:</strong> ${data.action}</p>
          <p><strong>📅 Time:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
          <p><strong>🔖 Activity Type:</strong> ${data.activity_type}</p>
          ${data.recipe_title ? `<p><strong>🍽️ Recipe:</strong> ${data.recipe_title}</p>` : ''}
        </div>

        ${analytics ? `
        <div class="analytics">
          <h2>📈 User Analytics</h2>
          <div class="stat">📝 Total Recipes: <strong>${analytics.total_recipes}</strong></div>
          <div class="stat">✅ Completed: <strong>${analytics.completed_recipes}</strong></div>
          <div class="stat">⏳ Pending: <strong>${analytics.pending_recipes}</strong></div>
          <div class="stat">🤖 AI Generated: <strong>${analytics.ai_generated_recipes}</strong></div>
          
          ${analytics.recent_activity.length > 0 ? `
          <h3>🕒 Recent Activity</h3>
          <ul>
            ${analytics.recent_activity.map((activity: any) => `
              <li><strong>${activity.title}</strong> - ${activity.status} (${new Date(activity.created_at).toLocaleDateString()})</li>
            `).join('')}
          </ul>
          ` : ''}
        </div>
        ` : ''}

        ${recipeDetails ? `
        <div class="recipe-details">
          <h2>🍽️ Recipe Details</h2>
          <p><strong>Title:</strong> ${recipeDetails.title}</p>
          <p><strong>Description:</strong> ${recipeDetails.description}</p>
          <p><strong>Servings:</strong> ${recipeDetails.servings} | <strong>Prep:</strong> ${recipeDetails.prep_time}m | <strong>Cook:</strong> ${recipeDetails.cook_time}m</p>
          <p><strong>Difficulty:</strong> ${recipeDetails.difficulty}</p>
          ${recipeDetails.cuisine_type ? `<p><strong>Cuisine:</strong> ${recipeDetails.cuisine_type}</p>` : ''}
          ${recipeDetails.dietary_restrictions?.length ? `<p><strong>Dietary:</strong> ${recipeDetails.dietary_restrictions.join(', ')}</p>` : ''}
          
          <h3>🥘 Ingredients (${recipeDetails.ingredients?.length || 0})</h3>
          <ul>
            ${recipeDetails.ingredients?.map((ing: any) => `
              <li>${ing.amount} ${ing.unit} ${ing.name}</li>
            `).join('') || '<li>No ingredients listed</li>'}
          </ul>
          
          <h3>👨‍🍳 Instructions (${recipeDetails.instructions?.length || 0} steps)</h3>
          <ol>
            ${recipeDetails.instructions?.map((inst: string) => `
              <li>${inst}</li>
            `).join('') || '<li>No instructions listed</li>'}
          </ol>
          
          ${recipeDetails.ai_generated_card ? `
          <h3>🤖 AI Chef's Notes</h3>
          <p style="font-style: italic; background: white; padding: 10px; border-radius: 4px;">${recipeDetails.ai_generated_card}</p>
          ` : ''}
        </div>
        ` : ''}

        ${data.changes ? `
        <div class="content">
          <h2>🔄 Changes Made</h2>
          <pre style="background: white; padding: 10px; border-radius: 4px; overflow-x: auto;">${JSON.stringify(data.changes, null, 2)}</pre>
        </div>
        ` : ''}
        
        <div class="footer">
          <p>This notification was sent from RecipeAI Platform</p>
          <p>Monitoring user activity for shashankvakkalanka@gmail.com</p>
          <p>Generated at ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `
  }
  
  // In production, send via email service (SendGrid, Resend, etc.)
  // Example with Resend:
  // await fetch('https://api.resend.com/emails', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify(emailContent)
  // });
}

async function logToDatabase(data: NotificationData, analytics: any) {
  console.log('💾 Database Log:', { data, analytics })
  
  // Example database insert:
  // await supabaseClient.from('team_notifications').insert({
  //   activity_type: data.activity_type,
  //   user_email: data.user_email,
  //   user_id: data.user_id,
  //   notification_data: data,
  //   user_analytics: analytics,
  //   sent_to: 'shashankvakkalanka@gmail.com',
  //   created_at: new Date().toISOString()
  // })
}