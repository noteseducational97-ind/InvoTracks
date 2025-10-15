'use server';
/**
 * @fileOverview Generates a personalized investment plan using AI.
 *
 * - generateInvestmentPlan - A function that creates a financial plan based on user data.
 */

import { ai } from '@/ai/genkit';
import { FinancialProfile, FinancialProfileSchema, InvestmentPlan, InvestmentPlanSchema } from '@/ai/schemas/investment-plan-schemas';

export async function generateInvestmentPlan(input: FinancialProfile): Promise<InvestmentPlan> {
  return generateInvestmentPlanFlow(input);
}


const investmentPrompt = ai.definePrompt({
    name: 'investmentPlanPrompt',
    input: { schema: FinancialProfileSchema },
    output: { schema: InvestmentPlanSchema },
    prompt: `You are an expert financial planner in India. Your task is to create a personalized investment plan based on the user's financial profile.

    Analyze the user's details:
    - Age (calculated from DOB)
    - Monthly Income
    - Monthly Expenses
    - Existing Loans (EMIs)
    - Existing Investments and Insurance premiums
    - Risk Tolerance (riskPercentage)

    First, calculate the user's net monthly disposable income (cashflow) available for investment.
    Net Monthly Cashflow = (monthlyIncome + (annualIncome / 12)) - (all monthly expenses) - (all monthly loan EMIs) - (all monthly insurance premiums).

    Based on the net monthly cashflow, risk tolerance, and age, provide a detailed investment plan.

    The plan must include:
    1.  **Asset Allocation**: A percentage breakdown for how the net monthly cashflow should be invested across Stocks, Bonds, Mutual Funds, Real Estate, and Other categories. The total allocation must sum up to 100%.
    2.  **Investment Suggestions**: Provide 3-5 specific, actionable investment suggestions. For each suggestion, specify the category, a brief description, and a suggested monthly investment amount in INR. The sum of suggested amounts should approximate the net monthly cashflow.
    3.  **Reasoning**: Provide a concise rationale for the overall plan, explaining how it aligns with the user's profile, goals, and risk appetite.

    User's Financial Profile:
    \`\`\`json
    {{{json input}}}
    \`\`\`
    `,
});


const generateInvestmentPlanFlow = ai.defineFlow(
  {
    name: 'generateInvestmentPlanFlow',
    inputSchema: FinancialProfileSchema,
    outputSchema: InvestmentPlanSchema,
  },
  async (input) => {
    const { output } = await investmentPrompt(input);
    return output!;
  }
);
