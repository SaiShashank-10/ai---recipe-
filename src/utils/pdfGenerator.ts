import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Recipe } from '../types';

export async function generateRecipePDF(recipe: Recipe): Promise<Blob> {
  // Create a temporary container for the recipe card
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = '800px';
  container.style.backgroundColor = 'white';
  container.style.padding = '0';
  container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  
  // Create the recipe card HTML
  container.innerHTML = `
    <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 32px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.20-1.10-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/>
          </svg>
          <span style="background: rgba(255,255,255,0.2); padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: 500;">
            ${recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
          </span>
        </div>
        <h1 style="font-size: 28px; font-weight: bold; margin: 0 0 12px 0; line-height: 1.2;">${recipe.title}</h1>
        <p style="color: rgba(255,255,255,0.9); font-size: 16px; line-height: 1.5; margin: 0;">${recipe.description}</p>
      </div>

      <!-- Content -->
      <div style="padding: 32px;">
        <!-- Recipe Info -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 32px;">
          <div style="text-align: center; padding: 16px; background: #f9fafb; border-radius: 8px;">
            <div style="color: #f97316; margin-bottom: 8px;">⏱️</div>
            <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">${recipe.prep_time}m</div>
            <div style="font-size: 12px; color: #6b7280;">Prep</div>
          </div>
          <div style="text-align: center; padding: 16px; background: #f9fafb; border-radius: 8px;">
            <div style="color: #10b981; margin-bottom: 8px;">🔥</div>
            <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">${recipe.cook_time}m</div>
            <div style="font-size: 12px; color: #6b7280;">Cook</div>
          </div>
          <div style="text-align: center; padding: 16px; background: #f9fafb; border-radius: 8px;">
            <div style="color: #3b82f6; margin-bottom: 8px;">👥</div>
            <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">${recipe.servings}</div>
            <div style="font-size: 12px; color: #6b7280;">Servings</div>
          </div>
        </div>

        ${recipe.cuisine_type || recipe.dietary_restrictions?.length ? `
        <!-- Cuisine and Dietary Info -->
        <div style="margin-bottom: 32px; padding: 16px; background: #f3f4f6; border-radius: 8px;">
          ${recipe.cuisine_type ? `
          <div style="margin-bottom: 8px;">
            <span style="font-weight: 600; color: #374151; margin-right: 8px;">Cuisine:</span>
            <span style="color: #6b7280;">${recipe.cuisine_type}</span>
          </div>
          ` : ''}
          ${recipe.dietary_restrictions?.length ? `
          <div>
            <span style="font-weight: 600; color: #374151; margin-right: 8px;">Dietary:</span>
            ${recipe.dietary_restrictions.map(restriction => 
              `<span style="background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 12px; font-size: 12px; margin-right: 4px;">${restriction}</span>`
            ).join('')}
          </div>
          ` : ''}
        </div>
        ` : ''}

        <!-- Ingredients -->
        <div style="margin-bottom: 32px;">
          <h2 style="font-size: 20px; font-weight: 600; color: #111827; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;">
            Ingredients
          </h2>
          <ul style="list-style: none; padding: 0; margin: 0;">
            ${recipe.ingredients.map(ingredient => `
            <li style="display: flex; align-items: center; margin-bottom: 12px; font-size: 14px;">
              <span style="width: 8px; height: 8px; background: #f97316; border-radius: 50%; margin-right: 12px; flex-shrink: 0;"></span>
              <span style="font-weight: 600; color: #111827; margin-right: 8px;">
                ${ingredient.amount} ${ingredient.unit}
              </span>
              <span style="color: #374151;">${ingredient.name}</span>
            </li>
            `).join('')}
          </ul>
        </div>

        <!-- Instructions -->
        <div style="margin-bottom: 32px;">
          <h2 style="font-size: 20px; font-weight: 600; color: #111827; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;">
            Instructions
          </h2>
          <ol style="list-style: none; padding: 0; margin: 0;">
            ${recipe.instructions.map((instruction, index) => `
            <li style="display: flex; align-items: flex-start; margin-bottom: 16px; font-size: 14px;">
              <span style="display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; background: #f97316; color: white; border-radius: 50%; font-size: 12px; font-weight: bold; margin-right: 12px; flex-shrink: 0; margin-top: 2px;">
                ${index + 1}
              </span>
              <span style="color: #374151; line-height: 1.6;">${instruction}</span>
            </li>
            `).join('')}
          </ol>
        </div>

        ${recipe.ai_generated_card ? `
        <!-- AI Generated Description -->
        <div style="padding: 20px; background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%); border-radius: 8px; border: 1px solid #bfdbfe; margin-bottom: 24px;">
          <h3 style="font-size: 14px; font-weight: 600; color: #1e3a8a; margin: 0 0 8px 0;">✨ AI Chef's Notes</h3>
          <p style="font-size: 14px; color: #1e40af; line-height: 1.6; margin: 0;">${recipe.ai_generated_card}</p>
        </div>
        ` : ''}

        <!-- Footer -->
        <div style="text-align: center; padding-top: 16px; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">
            Created with RecipeAI • Total Time: ${recipe.prep_time + recipe.cook_time} minutes
          </p>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    // Convert HTML to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 800,
      height: container.scrollHeight
    });

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    return pdf.output('blob');
  } finally {
    document.body.removeChild(container);
  }
}

export async function downloadRecipePDF(recipe: Recipe) {
  try {
    const pdfBlob = await generateRecipePDF(recipe);
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${recipe.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_recipe.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}