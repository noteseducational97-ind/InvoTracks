'use server';
/**
 * @fileOverview Generates a personalized investment plan using AI.
 *
 * - generateInvestmentPlan - A function that creates a financial plan based on user data.
 * - FinancialProfile - The input type for the plan generation.
 * - InvestmentPlan - The output type for the plan generation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const LoanSchema = z.object({
  id: z.number(),
  type: z.string(),
  amount: z.string(),
  emi: z.string(),
  rate: z.string(),
  tenure: z.string(),
});

const InvestmentCategorySchema = z.object({
  invested: z.enum(['yes', 'no']),
  amount: z.string(),
});

const InsuranceCategorySchema = z.object({
  invested: z.enum(['yes', 'no']),
  amount: z.string(),
  frequency: z.enum(['monthly', 'quarterly', 'half-yearly', 'yearly']),
});

export const FinancialProfileSchema = z.object({
  name: z.string().describe('User\'s full name'),
  dob: z.string().describe('User\'s date of birth'),
  riskPercentage: z.string().describe('User\'s risk tolerance percentage'),
  monthlyIncome: z.string().describe('User\'s monthly income'),
  annualIncome: z.string().describe('User\'s annual income'),
  expenses: z.object({
    rent: z.string(),
    utilities: z.string(),
    transport: z.string(),
    food: z.string(),
    entertainment: z.string(),
    healthcare: z.string(),
    other: z.string(),
  }),
  loans: z.array(LoanSchema),
  investments: z.object({
    stocks: InvestmentCategorySchema,
    mutualFunds: InvestmentCategorySchema,
    bonds: InvestmentCategorySchema,
    realEstate: InvestmentCategorySchema,
    commodities: InvestmentCategorySchema,
    other: InvestmentCategorySchema,
    termInsurance: InsuranceCategorySchema,
    healthInsurance: InsuranceCategorySchema,
  }),
}).describe('A comprehensive overview of the user\'s financial situation.');
export type FinancialProfile = z.infer<typeof FinancialProfileSchema>;


const AssetAllocationSchema = z.object({
    stocks: z.object({ percentage: z.number() }),
    bonds: z.object({ percentage: z.number() }),
    mutualFunds: z.object({ percentage: z.number() }),
    realEstate: z.object({ percentage: z.number() }),
    other: z.object({ percentage: z.number() }),
});

const SuggestionSchema = z.object({
    category: z.string().describe("The investment category, e.g., 'Equity Mutual Funds'"),
    description: z.string().describe("A brief description of why this investment is suggested."),
    suggestedAmount: z.string().describe("The suggested monthly investment amount in INR, e.g., '₹5,000'"),
});

export const InvestmentPlanSchema = z.object({
  assetAllocation: AssetAllocationSchema.describe("The suggested asset allocation breakdown in percentages. The sum of all percentages must be 100."),
  suggestions: z.array(SuggestionSchema).describe("A list of specific investment suggestions."),
  reasoning: z.string().describe("The overall reasoning behind the suggested plan, explaining how it aligns with the user's profile."),
});
export type InvestmentPlan = z.infer<typeof InvestmentPlanSchema>;


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
