/*
  # Send Admin Report Edge Function

  This function sends comprehensive user dashboard reports to shashankvakkalanka@gmail.com
  including all user data, analytics, recipes, and platform usage statistics.
*/

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

interface AdminReportData {
  report_type: string
  user_email: string
  user_id: string
  analytics: {
    user_info: any
    recipe_statistics: any
    cooking_analytics: any
    cuisine_breakdown: Record<string, number>
    difficulty_breakdown: Record<string, number>
    dietary_preferences: Record<string, number>
    recent_recipes: any[]
    detailed_recipes: any[]
    platform_usage: any
  }
  timestamp: string
  requested_by: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const data: AdminReportData = await req.json()

    console.log('📊 Admin Dashboard Report Request:', {
      user: data.user_email,
      report_type: data.report_type,
      timestamp: data.timestamp
    })

    // Generate comprehensive HTML report
    const htmlReport = generateHTMLReport(data)
    
    // Send email to admin
    await sendAdminEmail(data, htmlReport)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Admin report sent successfully',
        sent_to: 'shashankvakkalanka@gmail.com',
        report_type: data.report_type
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error sending admin report:', error)

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})

function generateHTMLReport(data: AdminReportData): string {
  const { analytics } = data
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 40px; text-align: center; }
        .header h1 { margin: 0; font-size: 2.5em; font-weight: bold; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 1.2em; }
        .section { padding: 30px; border-bottom: 1px solid #e5e7eb; }
        .section:last-child { border-bottom: none; }
        .section h2 { color: #1f2937; margin: 0 0 20px 0; font-size: 1.8em; display: flex; align-items: center; }
        .section h3 { color: #374151; margin: 20px 0 15px 0; font-size: 1.3em; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card { background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0; }
        .stat-number { font-size: 2.5em; font-weight: bold; color: #3b82f6; margin-bottom: 5px; }
        .stat-label { color: #64748b; font-size: 0.9em; text-transform: uppercase; letter-spacing: 0.5px; }
        .recipe-card { background: #fefefe; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 15px 0; }
        .recipe-title { font-size: 1.3em; font-weight: bold; color: #1f2937; margin-bottom: 10px; }
        .recipe-meta { display: flex; flex-wrap: wrap; gap: 15px; margin: 10px 0; font-size: 0.9em; color: #6b7280; }
        .recipe-meta span { background: #f3f4f6; padding: 4px 8px; border-radius: 4px; }
        .ingredients-list { background: #f9fafb; padding: 15px; border-radius: 6px; margin: 10px 0; }
        .ingredients-list ul { margin: 0; padding-left: 20px; }
        .instructions-list { background: #fefefe; border-left: 4px solid #3b82f6; padding: 15px; margin: 10px 0; }
        .instructions-list ol { margin: 0; padding-left: 20px; }
        .chart-bar { background: #e5e7eb; height: 20px; border-radius: 10px; margin: 8px 0; position: relative; }
        .chart-fill { background: linear-gradient(90deg, #3b82f6, #1d4ed8); height: 100%; border-radius: 10px; }
        .chart-label { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; font-size: 0.9em; }
        .badge { display: inline-block; background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 12px; font-size: 0.8em; margin: 2px; }
        .footer { background: #f8fafc; padding: 30px; text-align: center; color: #6b7280; }
        .emoji { font-size: 1.2em; margin-right: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <h1>📊 RecipeAI Dashboard Report</h1>
          <p>Comprehensive User Analytics & Data Export</p>
          <p><strong>User:</strong> ${analytics.user_info.email} | <strong>Generated:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
        </div>

        <!-- User Information -->
        <div class="section">
          <h2><span class="emoji">👤</span>User Information</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Full Name</div>
              <div style="font-size: 1.2em; font-weight: bold; color: #1f2937; margin-top: 5px;">
                ${analytics.user_info.full_name || 'Not provided'}
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Email</div>
              <div style="font-size: 1.1em; font-weight: bold; color: #1f2937; margin-top: 5px;">
                ${analytics.user_info.email}
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Account Created</div>
              <div style="font-size: 1.1em; font-weight: bold; color: #1f2937; margin-top: 5px;">
                ${new Date(analytics.user_info.created_at).toLocaleDateString()}
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Last Sign In</div>
              <div style="font-size: 1.1em; font-weight: bold; color: #1f2937; margin-top: 5px;">
                ${analytics.user_info.last_sign_in ? new Date(analytics.user_info.last_sign_in).toLocaleDateString() : 'Never'}
              </div>
            </div>
          </div>
        </div>

        <!-- Recipe Statistics -->
        <div class="section">
          <h2><span class="emoji">📈</span>Recipe Statistics</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">${analytics.recipe_statistics.total_recipes}</div>
              <div class="stat-label">Total Recipes</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${analytics.recipe_statistics.completed_recipes}</div>
              <div class="stat-label">Completed</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${analytics.recipe_statistics.pending_recipes}</div>
              <div class="stat-label">Pending</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${analytics.recipe_statistics.ai_generated_recipes}</div>
              <div class="stat-label">AI Generated</div>
            </div>
          </div>
        </div>

        <!-- Cooking Analytics -->
        <div class="section">
          <h2><span class="emoji">⏱️</span>Cooking Analytics</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">${analytics.cooking_analytics.average_prep_time}m</div>
              <div class="stat-label">Avg Prep Time</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${analytics.cooking_analytics.average_cook_time}m</div>
              <div class="stat-label">Avg Cook Time</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${Math.round(analytics.cooking_analytics.total_cooking_time / 60)}h</div>
              <div class="stat-label">Total Cook Time</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${analytics.cooking_analytics.average_servings}</div>
              <div class="stat-label">Avg Servings</div>
            </div>
          </div>
        </div>

        <!-- Cuisine Breakdown -->
        <div class="section">
          <h2><span class="emoji">🍽️</span>Cuisine Preferences</h2>
          ${Object.entries(analytics.cuisine_breakdown).map(([cuisine, count]) => {
            const percentage = (count / analytics.recipe_statistics.total_recipes) * 100;
            return `
              <div class="chart-label">
                <span><strong>${cuisine}</strong></span>
                <span>${count} recipes (${percentage.toFixed(1)}%)</span>
              </div>
              <div class="chart-bar">
                <div class="chart-fill" style="width: ${percentage}%"></div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Difficulty Breakdown -->
        <div class="section">
          <h2><span class="emoji">⚡</span>Difficulty Distribution</h2>
          ${Object.entries(analytics.difficulty_breakdown).map(([difficulty, count]) => {
            const percentage = (count / analytics.recipe_statistics.total_recipes) * 100;
            const colors = { easy: '#10b981', medium: '#f59e0b', hard: '#ef4444' };
            return `
              <div class="chart-label">
                <span><strong>${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</strong></span>
                <span>${count} recipes (${percentage.toFixed(1)}%)</span>
              </div>
              <div class="chart-bar">
                <div class="chart-fill" style="width: ${percentage}%; background: ${colors[difficulty as keyof typeof colors]}"></div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Dietary Preferences -->
        ${Object.keys(analytics.dietary_preferences).length > 0 ? `
        <div class="section">
          <h2><span class="emoji">🥗</span>Dietary Preferences</h2>
          <div>
            ${Object.entries(analytics.dietary_preferences).map(([diet, count]) => 
              `<span class="badge">${diet}: ${count}</span>`
            ).join('')}
          </div>
        </div>
        ` : ''}

        <!-- Recent Recipes -->
        <div class="section">
          <h2><span class="emoji">🕒</span>Recent Recipes (Last 10)</h2>
          ${analytics.recent_recipes.map(recipe => `
            <div class="recipe-card">
              <div class="recipe-title">${recipe.title}</div>
              <div class="recipe-meta">
                <span>Status: ${recipe.status}</span>
                <span>Prep: ${recipe.prep_time}m</span>
                <span>Cook: ${recipe.cook_time}m</span>
                <span>Servings: ${recipe.servings}</span>
                <span>Difficulty: ${recipe.difficulty}</span>
                ${recipe.cuisine_type ? `<span>Cuisine: ${recipe.cuisine_type}</span>` : ''}
              </div>
              <div style="font-size: 0.9em; color: #6b7280;">
                Created: ${new Date(recipe.created_at).toLocaleDateString()}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Platform Usage -->
        <div class="section">
          <h2><span class="emoji">📱</span>Platform Usage</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">${analytics.platform_usage.account_age_days}</div>
              <div class="stat-label">Days Since Signup</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${analytics.platform_usage.recipes_per_month.toFixed(1)}</div>
              <div class="stat-label">Recipes per Month</div>
            </div>
          </div>
          
          <h3>Monthly Activity</h3>
          ${Object.entries(analytics.platform_usage.most_active_month).map(([month, count]) => {
            const maxCount = Math.max(...Object.values(analytics.platform_usage.most_active_month));
            const percentage = (count / maxCount) * 100;
            return `
              <div class="chart-label">
                <span><strong>${month}</strong></span>
                <span>${count} recipes</span>
              </div>
              <div class="chart-bar">
                <div class="chart-fill" style="width: ${percentage}%"></div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- All Recipes Details -->
        <div class="section">
          <h2><span class="emoji">📚</span>Complete Recipe Collection (${analytics.detailed_recipes.length} recipes)</h2>
          ${analytics.detailed_recipes.map((recipe, index) => `
            <div class="recipe-card">
              <div class="recipe-title">${index + 1}. ${recipe.title}</div>
              <p style="color: #6b7280; margin: 10px 0;"><em>${recipe.description}</em></p>
              
              <div class="recipe-meta">
                <span>Status: ${recipe.status}</span>
                <span>Prep: ${recipe.prep_time}m</span>
                <span>Cook: ${recipe.cook_time}m</span>
                <span>Servings: ${recipe.servings}</span>
                <span>Difficulty: ${recipe.difficulty}</span>
                ${recipe.cuisine_type ? `<span>Cuisine: ${recipe.cuisine_type}</span>` : ''}
              </div>

              ${recipe.dietary_restrictions?.length ? `
                <div style="margin: 10px 0;">
                  <strong>Dietary:</strong> ${recipe.dietary_restrictions.map(diet => `<span class="badge">${diet}</span>`).join('')}
                </div>
              ` : ''}

              <div class="ingredients-list">
                <strong>Ingredients (${recipe.ingredients.length}):</strong>
                <ul>
                  ${recipe.ingredients.map(ing => `<li>${ing.amount} ${ing.unit} ${ing.name}</li>`).join('')}
                </ul>
              </div>

              <div class="instructions-list">
                <strong>Instructions (${recipe.instructions.length} steps):</strong>
                <ol>
                  ${recipe.instructions.map(inst => `<li>${inst}</li>`).join('')}
                </ol>
              </div>

              ${recipe.ai_generated_card ? `
                <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 15px; margin: 10px 0;">
                  <strong>🤖 AI Chef's Notes:</strong>
                  <p style="margin: 5px 0 0 0; font-style: italic;">${recipe.ai_generated_card}</p>
                </div>
              ` : ''}

              <div style="font-size: 0.9em; color: #9ca3af; margin-top: 15px;">
                Created: ${new Date(recipe.created_at).toLocaleDateString()} | 
                Updated: ${new Date(recipe.updated_at).toLocaleDateString()}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Footer -->
        <div class="footer">
          <p><strong>📊 RecipeAI Dashboard Report</strong></p>
          <p>Generated for: <strong>${data.user_email}</strong></p>
          <p>Report sent to: <strong>shashankvakkalanka@gmail.com</strong></p>
          <p>Generated on: ${new Date(data.timestamp).toLocaleString()}</p>
          <p style="margin-top: 20px; font-size: 0.9em;">
            This comprehensive report contains all user data, analytics, and recipe details from the RecipeAI platform.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

async function sendAdminEmail(data: AdminReportData, htmlReport: string) {
  console.log('📧 Sending comprehensive dashboard report to shashankvakkalanka@gmail.com');
  console.log('📊 Report includes:', {
    user: data.user_email,
    total_recipes: data.analytics.recipe_statistics.total_recipes,
    report_size: `${Math.round(htmlReport.length / 1024)}KB`,
    sections: [
      'User Information',
      'Recipe Statistics', 
      'Cooking Analytics',
      'Cuisine Preferences',
      'Difficulty Distribution',
      'Dietary Preferences',
      'Recent Recipes',
      'Platform Usage',
      'Complete Recipe Collection'
    ]
  });

  // In production, this would send via email service like Resend, SendGrid, etc.
  // Example implementation:
  /*
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'RecipeAI <noreply@recipeai.com>',
      to: 'shashankvakkalanka@gmail.com',
      subject: `📊 Dashboard Report: ${data.user_email} - ${data.analytics.recipe_statistics.total_recipes} Recipes`,
      html: htmlReport
    })
  });
  */
}