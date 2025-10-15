/**
 * @fileOverview Schemas and types for AI investment plan generation.
 *
 * This file defines the Zod schemas and derived TypeScript types for:
 * - FinancialProfile: The input data representing a user's financial status.
 * - InvestmentPlan: The output data representing the AI-generated plan.
 */

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
