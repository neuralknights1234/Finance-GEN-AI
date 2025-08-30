// Simple Analysis Service for Profile Analysis
// Provides varying predefined outputs for financial profile analysis

export interface ProfileAnalysisRequest {
  userProfile: any;
  financialData?: any;
  analysisType: 'comprehensive' | 'investment' | 'risk' | 'goals' | 'cashflow';
}

/**
 * Generate simple analysis with varying predefined outputs
 */
export function generateSimpleAnalysis(userProfile: any, financialData: any, analysisType: string): string {
  const templates = [
    `# Financial Profile Analysis

## Profile Summary
- **Persona**: ${userProfile.persona || 'Not specified'}
- **Age**: ${userProfile.age || 'Not specified'}
- **Income**: ${userProfile.income || 'Not specified'}
- **Risk Tolerance**: ${userProfile.riskTolerance || 'Not specified'}

## Financial Overview
${financialData ? `
- **Portfolio Value**: ₹${financialData.investments?.totalPortfolioValue?.toLocaleString() || '0'}
- **Monthly Income**: ₹${financialData.transactions?.totalIncome?.toLocaleString() || '0'}
- **Monthly Expenses**: ₹${financialData.transactions?.totalExpenses?.toLocaleString() || '0'}
- **Net Cash Flow**: ₹${financialData.transactions?.netCashFlow?.toLocaleString() || '0'}
- **Savings Rate**: ${financialData.financialHealth?.savingsRate?.toFixed(1) || '0'}%
` : 'No financial data available'}

## Key Recommendations
1. **Emergency Fund**: Build 6 months of expenses
2. **Budget Review**: Analyze monthly spending patterns
3. **Investment Strategy**: Consider diversified portfolio
4. **Goal Setting**: Define specific financial objectives

## Next Steps
- Review and optimize monthly budget
- Increase savings rate gradually
- Consider professional financial advice
- Monitor progress regularly`,

    `# Financial Health Assessment

## Current Status
**Profile**: ${userProfile.persona || 'Not specified'}
**Age Group**: ${userProfile.age || 'Not specified'}
**Income Level**: ${userProfile.income || 'Not specified'}

## Financial Metrics
${financialData ? `
💰 **Portfolio**: ₹${financialData.investments?.totalPortfolioValue?.toLocaleString() || '0'}
📈 **Monthly Surplus**: ₹${financialData.transactions?.netCashFlow?.toLocaleString() || '0'}
💾 **Savings Rate**: ${financialData.financialHealth?.savingsRate?.toFixed(1) || '0'}%
🛡️ **Emergency Fund**: ${financialData.financialHealth?.emergencyFundRatio || '0'} months
` : 'No financial data available'}

## Priority Actions
1. **Immediate**: Strengthen emergency fund
2. **Short-term**: Optimize budget allocation
3. **Long-term**: Build investment portfolio

## Success Tips
- Track all expenses for 30 days
- Set up automatic savings transfers
- Review financial goals quarterly
- Stay informed about investment options`,

    `# Financial Planning Report

## Personal Profile
- **Financial Persona**: ${userProfile.persona || 'Not specified'}
- **Age**: ${userProfile.age || 'Not specified'} years
- **Income Range**: ${userProfile.income || 'Not specified'}
- **Risk Profile**: ${userProfile.riskTolerance || 'Not specified'}

## Financial Snapshot
${financialData ? `
**Current Assets**: ₹${financialData.investments?.totalPortfolioValue?.toLocaleString() || '0'}
**Monthly Cash Flow**: ₹${financialData.transactions?.netCashFlow?.toLocaleString() || '0'}
**Savings Efficiency**: ${financialData.financialHealth?.savingsRate?.toFixed(1) || '0'}%
**Financial Buffer**: ${financialData.financialHealth?.emergencyFundRatio || '0'} months
` : 'No financial data available'}

## Strategic Recommendations
1. **Foundation**: Establish emergency fund
2. **Growth**: Increase savings rate
3. **Protection**: Review insurance needs
4. **Investment**: Start retirement planning

## Action Plan
- Week 1: Create detailed budget
- Month 1: Set up emergency fund
- Month 3: Begin investment strategy
- Month 6: Review and adjust plan`,

    `# Financial Wellness Analysis

## Profile Assessment
**Type**: ${userProfile.persona || 'Not specified'}
**Age**: ${userProfile.age || 'Not specified'}
**Income**: ${userProfile.income || 'Not specified'}
**Risk Level**: ${userProfile.riskTolerance || 'Not specified'}

## Current Financial Health
${financialData ? `
📊 **Total Portfolio**: ₹${financialData.investments?.totalPortfolioValue?.toLocaleString() || '0'}
💵 **Monthly Income**: ₹${financialData.transactions?.totalIncome?.toLocaleString() || '0'}
💸 **Monthly Expenses**: ₹${financialData.transactions?.totalExpenses?.toLocaleString() || '0'}
💰 **Net Monthly**: ₹${financialData.transactions?.netCashFlow?.toLocaleString() || '0'}
📈 **Savings Rate**: ${financialData.financialHealth?.savingsRate?.toFixed(1) || '0'}%
` : 'No financial data available'}

## Improvement Areas
1. **Emergency Fund**: Target 6 months of expenses
2. **Savings Rate**: Aim for 20% of income
3. **Investment Diversification**: Spread risk across assets
4. **Debt Management**: Prioritize high-interest debt

## Growth Strategy
- Start with small, consistent savings
- Automate financial processes
- Educate yourself on investment options
- Regular financial health checkups`,

    `# Financial Profile Review

## Personal Information
- **Financial Type**: ${userProfile.persona || 'Not specified'}
- **Age**: ${userProfile.age || 'Not specified'}
- **Income Category**: ${userProfile.income || 'Not specified'}
- **Risk Preference**: ${userProfile.riskTolerance || 'Not specified'}

## Financial Summary
${financialData ? `
🏦 **Investment Portfolio**: ₹${financialData.investments?.totalPortfolioValue?.toLocaleString() || '0'}
💳 **Monthly Income**: ₹${financialData.transactions?.totalIncome?.toLocaleString() || '0'}
💳 **Monthly Expenses**: ₹${financialData.transactions?.totalExpenses?.toLocaleString() || '0'}
💵 **Monthly Savings**: ₹${financialData.transactions?.netCashFlow?.toLocaleString() || '0'}
📊 **Savings Percentage**: ${financialData.financialHealth?.savingsRate?.toFixed(1) || '0'}%
` : 'No financial data available'}

## Key Insights
1. **Emergency Preparedness**: Build safety net
2. **Cash Flow Management**: Optimize income/expense ratio
3. **Investment Readiness**: Prepare for long-term growth
4. **Goal Achievement**: Set clear financial milestones

## Recommended Actions
- Create monthly budget template
- Set up automatic savings
- Research investment options
- Schedule regular financial reviews`,

    `# Financial Assessment Report

## Profile Overview
**Persona**: ${userProfile.persona || 'Not specified'}
**Age**: ${userProfile.age || 'Not specified'}
**Income Level**: ${userProfile.income || 'Not specified'}
**Risk Tolerance**: ${userProfile.riskTolerance || 'Not specified'}

## Financial Status
${financialData ? `
💼 **Total Assets**: ₹${financialData.investments?.totalPortfolioValue?.toLocaleString() || '0'}
📈 **Monthly Surplus**: ₹${financialData.transactions?.netCashFlow?.toLocaleString() || '0'}
💾 **Savings Rate**: ${financialData.financialHealth?.savingsRate?.toFixed(1) || '0'}%
🛡️ **Emergency Coverage**: ${financialData.financialHealth?.emergencyFundRatio || '0'} months
` : 'No financial data available'}

## Priority Focus Areas
1. **Emergency Fund**: Build 6-month safety net
2. **Budget Optimization**: Track and reduce expenses
3. **Savings Enhancement**: Increase monthly savings
4. **Investment Planning**: Start building portfolio

## Success Roadmap
- Month 1: Establish emergency fund
- Month 3: Optimize budget and expenses
- Month 6: Begin investment strategy
- Month 12: Review and adjust financial plan`,

    `# Financial Intelligence Report

## Personal Profile
- **Financial Archetype**: ${userProfile.persona || 'Not specified'}
- **Age**: ${userProfile.age || 'Not specified'}
- **Income Range**: ${userProfile.income || 'Not specified'}
- **Risk Profile**: ${userProfile.riskTolerance || 'Not specified'}

## Financial Intelligence
${financialData ? `
🧠 **Portfolio Value**: $${financialData.investments?.totalPortfolioValue?.toLocaleString() || '0'}
💡 **Monthly Cash Flow**: $${financialData.transactions?.netCashFlow?.toLocaleString() || '0'}
📊 **Savings Efficiency**: ${financialData.financialHealth?.savingsRate?.toFixed(1) || '0'}%
🛡️ **Financial Buffer**: ${financialData.financialHealth?.emergencyFundRatio || '0'} months
` : 'No financial data available'}

## Strategic Insights
1. **Foundation Building**: Establish financial safety net
2. **Growth Acceleration**: Increase savings and investments
3. **Risk Management**: Diversify and protect assets
4. **Goal Achievement**: Set and track financial milestones

## Implementation Strategy
- Week 1-2: Financial assessment and goal setting
- Month 1-3: Emergency fund and budget optimization
- Month 3-6: Investment strategy development
- Month 6-12: Portfolio growth and diversification`,

    `# Financial Wellness Check

## Profile Summary
**Type**: ${userProfile.persona || 'Not specified'}
**Age**: ${userProfile.age || 'Not specified'}
**Income**: ${userProfile.income || 'Not specified'}
**Risk Level**: ${userProfile.riskTolerance || 'Not specified'}

## Financial Health Metrics
${financialData ? `
🏥 **Portfolio Health**: $${financialData.investments?.totalPortfolioValue?.toLocaleString() || '0'}
💊 **Monthly Income**: $${financialData.transactions?.totalIncome?.toLocaleString() || '0'}
💊 **Monthly Expenses**: $${financialData.transactions?.totalExpenses?.toLocaleString() || '0'}
💊 **Net Cash Flow**: $${financialData.transactions?.netCashFlow?.toLocaleString() || '0'}
📊 **Savings Rate**: ${financialData.financialHealth?.savingsRate?.toFixed(1) || '0'}%
` : 'No financial data available'}

## Health Improvement Plan
1. **Emergency Fund**: Build 6-month safety buffer
2. **Savings Rate**: Target 20% of monthly income
3. **Investment Diversification**: Spread risk across assets
4. **Debt Management**: Focus on high-interest debt reduction

## Wellness Strategy
- Start with small, manageable changes
- Automate savings and bill payments
- Educate yourself on financial products
- Regular financial health monitoring`,

    `# Financial Strategy Report

## Personal Assessment
- **Financial Profile**: ${userProfile.persona || 'Not specified'}
- **Age**: ${userProfile.age || 'Not specified'}
- **Income Category**: ${userProfile.income || 'Not specified'}
- **Risk Preference**: ${userProfile.riskTolerance || 'Not specified'}

## Strategic Overview
${financialData ? `
🎯 **Current Portfolio**: $${financialData.investments?.totalPortfolioValue?.toLocaleString() || '0'}
📊 **Monthly Cash Flow**: $${financialData.transactions?.netCashFlow?.toLocaleString() || '0'}
💾 **Savings Rate**: ${financialData.financialHealth?.savingsRate?.toFixed(1) || '0'}%
🛡️ **Emergency Fund**: ${financialData.financialHealth?.emergencyFundRatio || '0'} months
` : 'No financial data available'}

## Strategic Priorities
1. **Foundation**: Build emergency fund
2. **Growth**: Increase savings rate
3. **Protection**: Review insurance coverage
4. **Investment**: Develop long-term strategy

## Execution Plan
- Phase 1 (Months 1-3): Emergency fund and budget
- Phase 2 (Months 3-6): Savings optimization
- Phase 3 (Months 6-12): Investment strategy
- Phase 4 (Months 12+): Portfolio growth`
  ];

  // Return a random template for variety
  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Analyze user profile with simple predefined analysis
 */
export async function analyzeProfile(request: ProfileAnalysisRequest): Promise<string> {
  // Simple analysis is always available (no external dependencies)
  console.log('Generating simple profile analysis');
  
  return generateSimpleAnalysis(request.userProfile, request.financialData, request.analysisType);
}
