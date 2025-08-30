import React, { useState, useMemo, FormEvent, useEffect } from 'react';
import { Transaction } from '../../types';
import TrashIcon from '../icons/TrashIcon';
import { deleteTransaction as deleteTx, loadTransactions, upsertTransaction } from '../../services/supabaseData';

const initialTransactions: Transaction[] = [];

const TaxesScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'transactions' | 'calculator' | 'balanceSheet'>('transactions');
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Tax Calculator States
  const [monthlyIncome, setMonthlyIncome] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [hasHealthInsurance, setHasHealthInsurance] = useState(false);
  const [hasHomeLoan, setHasHomeLoan] = useState(false);
  const [hasEducationLoan, setHasEducationLoan] = useState(false);
  const [hasNPS, setHasNPS] = useState(false);
  const [hasELSS, setHasELSS] = useState(false);
  const [hasPPF, setHasPPF] = useState(false);
  const [hasEPF, setHasEPF] = useState(false);
  const [hasMedicalBills, setHasMedicalBills] = useState(false);
  const [medicalBillsAmount, setMedicalBillsAmount] = useState<string>('');
  const [hasDonations, setHasDonations] = useState(false);
  const [donationsAmount, setDonationsAmount] = useState<string>('');

  // Balance Sheet States
  const [isGeneratingBalanceSheet, setIsGeneratingBalanceSheet] = useState(false);

  const { totalIncome, totalExpenses, netAmount } = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);
    return {
      totalIncome: income,
      totalExpenses: expenses,
      netAmount: income + expenses,
    };
  }, [transactions]);

  // Generate Balance Sheet Data
  const generateBalanceSheetData = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // Group transactions by month
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const month = (currentMonth - 11 + i + 12) % 12;
      const year = currentYear - (month > currentMonth ? 1 : 0);
      const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long' });
      
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === month && tDate.getFullYear() === year;
      });
      
      const monthIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);
      
      const monthExpenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + Math.abs(t.amount), 0);
      
      return {
        month: monthName,
        year: year,
        income: monthIncome,
        expenses: monthExpenses,
        netFlow: monthIncome - monthExpenses,
        transactions: monthTransactions.length
      };
    });

    // Calculate running balance
    let runningBalance = 0;
    const balanceSheet = monthlyData.map(month => {
      runningBalance += month.netFlow;
      return {
        ...month,
        runningBalance: runningBalance
      };
    });

    return {
      generatedDate: currentDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      fiscalYear: `${currentYear}-${currentYear + 1}`,
      totalTransactions: transactions.length,
      totalIncome: totalIncome,
      totalExpenses: Math.abs(totalExpenses),
      netWorth: netAmount,
      monthlyBreakdown: balanceSheet,
      topIncomeSources: transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => {
          acc[t.description] = (acc[t.description] || 0) + t.amount;
          return acc;
        }, {} as Record<string, number>),
      topExpenseCategories: transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
          acc[t.description] = (acc[t.description] || 0) + Math.abs(t.amount);
          return acc;
        }, {} as Record<string, number>)
    };
  };

  // Download Balance Sheet as CSV
  const downloadBalanceSheet = async () => {
    setIsGeneratingBalanceSheet(true);
    
    try {
      const balanceSheetData = generateBalanceSheetData();
      
      // Create CSV content
      let csvContent = 'data:text/csv;charset=utf-8,';
      
      // Header
      csvContent += 'Personal Balance Sheet\n';
      csvContent += `Generated on: ${balanceSheetData.generatedDate}\n`;
      csvContent += `Fiscal Year: ${balanceSheetData.fiscalYear}\n`;
      csvContent += `Total Transactions: ${balanceSheetData.totalTransactions}\n`;
      csvContent += `Total Income: ₹${balanceSheetData.totalIncome.toFixed(2)}\n`;
csvContent += `Total Expenses: ₹${balanceSheetData.totalExpenses.toFixed(2)}\n`;
csvContent += `Net Worth: ₹${balanceSheetData.netWorth.toFixed(2)}\n\n`;
      
      // Monthly breakdown
      csvContent += 'Month,Year,Income,Expenses,Net Flow,Running Balance,Transactions\n';
      balanceSheetData.monthlyBreakdown.forEach(month => {
        csvContent += `${month.month},${month.year},₹${month.income.toFixed(2)},₹${month.expenses.toFixed(2)},₹${month.netFlow.toFixed(2)},₹${month.runningBalance.toFixed(2)},${month.transactions}\n`;
      });
      
      csvContent += '\n';
      
      // Top income sources
      csvContent += 'Top Income Sources\n';
      csvContent += 'Source,Amount\n';
      Object.entries(balanceSheetData.topIncomeSources)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 10)
        .forEach(([source, amount]) => {
          csvContent += `${source},₹${(amount as number).toFixed(2)}\n`;
        });
      
      csvContent += '\n';
      
      // Top expense categories
      csvContent += 'Top Expense Categories\n';
      csvContent += 'Category,Amount\n';
      Object.entries(balanceSheetData.topExpenseCategories)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 10)
        .forEach(([category, amount]) => {
          csvContent += `${category},₹${(amount as number).toFixed(2)}\n`;
        });
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `balance_sheet_${balanceSheetData.fiscalYear}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Balance sheet downloaded successfully');
    } catch (error) {
      console.error('Error generating balance sheet:', error);
      alert('Error generating balance sheet. Please try again.');
    } finally {
      setIsGeneratingBalanceSheet(false);
    }
  };

  // Download Balance Sheet as PDF (HTML-based)
  const downloadBalanceSheetPDF = async () => {
    setIsGeneratingBalanceSheet(true);
    
    try {
      const balanceSheetData = generateBalanceSheetData();
      
      // Create HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Personal Balance Sheet - ${balanceSheetData.fiscalYear}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .summary { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
            .summary-item { padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
            .summary-label { font-weight: bold; color: #666; font-size: 14px; }
            .summary-value { font-size: 24px; font-weight: bold; margin-top: 5px; }
            .monthly-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .monthly-table th, .monthly-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .monthly-table th { background-color: #f5f5f5; font-weight: bold; }
            .positive { color: #28a745; }
            .negative { color: #dc3545; }
            .section { margin-bottom: 30px; }
            .section h3 { border-bottom: 1px solid #ddd; padding-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Personal Balance Sheet</h1>
            <p>Generated on: ${balanceSheetData.generatedDate}</p>
            <p>Fiscal Year: ${balanceSheetData.fiscalYear}</p>
          </div>
          
          <div class="summary">
            <div class="summary-item">
              <div class="summary-label">Total Income</div>
              <div class="summary-value positive">₹${balanceSheetData.totalIncome.toFixed(2)}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Expenses</div>
              <div class="summary-value negative">₹${balanceSheetData.totalExpenses.toFixed(2)}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Net Worth</div>
              <div class="summary-value ${balanceSheetData.netWorth >= 0 ? 'positive' : 'negative'}">₹${balanceSheetData.netWorth.toFixed(2)}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Transactions</div>
              <div class="summary-value">${balanceSheetData.totalTransactions}</div>
            </div>
          </div>
          
          <div class="section">
            <h3>Monthly Breakdown</h3>
            <table class="monthly-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Income</th>
                  <th>Expenses</th>
                  <th>Net Flow</th>
                  <th>Running Balance</th>
                  <th>Transactions</th>
                </tr>
              </thead>
              <tbody>
                ${balanceSheetData.monthlyBreakdown.map(month => `
                  <tr>
                    <td>${month.month} ${month.year}</td>
                    <td class="positive">₹${month.income.toFixed(2)}</td>
<td class="negative">₹${month.expenses.toFixed(2)}</td>
<td class="${month.netFlow >= 0 ? 'positive' : 'negative'}">₹${month.netFlow.toFixed(2)}</td>
<td class="${month.runningBalance >= 0 ? 'positive' : 'negative'}">₹${month.runningBalance.toFixed(2)}</td>
                    <td>${month.transactions}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <h3>Top Income Sources</h3>
            <table class="monthly-table">
              <thead>
                <tr><th>Source</th><th>Amount</th></tr>
              </thead>
              <tbody>
                                 ${Object.entries(balanceSheetData.topIncomeSources)
                   .sort(([,a], [,b]) => (b as number) - (a as number))
                   .slice(0, 10)
                   .map(([source, amount]) => `
                     <tr>
                       <td>${source}</td>
                       <td class="positive">₹${(amount as number).toFixed(2)}</td>
                     </tr>
                   `).join('')}
               </tbody>
             </table>
           </div>
           
           <div class="section">
             <h3>Top Expense Categories</h3>
             <table class="monthly-table">
               <thead>
                 <tr><th>Category</th><th>Amount</th></tr>
               </thead>
               <tbody>
                 ${Object.entries(balanceSheetData.topExpenseCategories)
                   .sort(([,a], [,b]) => (b as number) - (a as number))
                   .slice(0, 10)
                   .map(([category, amount]) => `
                     <tr>
                       <td>${category}</td>
                       <td class="negative">₹${(amount as number).toFixed(2)}</td>
                     </tr>
                   `).join('')}
              </tbody>
            </table>
          </div>
        </body>
        </html>
      `;
      
      // Create blob and download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `balance_sheet_${balanceSheetData.fiscalYear}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('Balance sheet HTML downloaded successfully');
    } catch (error) {
      console.error('Error generating balance sheet HTML:', error);
      alert('Error generating balance sheet HTML. Please try again.');
    } finally {
      setIsGeneratingBalanceSheet(false);
    }
  };

  // Persist a concise summary for cross-screen sharing
  useEffect(() => {
    try {
      const top3Expenses = transactions
        .filter(t => t.type === 'expense')
        .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
        .slice(0, 3)
        .map(t => ({ description: t.description, amount: t.amount, date: t.date }));
      const summary = {
        totalIncome,
        totalExpenses,
        netAmount,
        top3Expenses,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem('taxesSummary', JSON.stringify(summary));
    } catch (_) {
      // ignore
    }
  }, [transactions, totalIncome, totalExpenses, netAmount]);

  // Load from Supabase if logged in
  useEffect(() => {
    (async () => {
      try {
        const remote = await loadTransactions();
        if (remote.length > 0) {
          setTransactions(remote.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
      } catch (_) {
        // ignore
      }
    })();
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date || parseFloat(amount) <= 0) return;

    const newTransaction: Transaction = {
      id: Date.now(),
      description,
      amount: type === 'expense' ? -Math.abs(parseFloat(amount)) : Math.abs(parseFloat(amount)),
      type,
      date,
    };

    setTransactions(prev => [newTransaction, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    // Persist
    upsertTransaction(newTransaction).catch(() => {});

    // Reset form
    setDescription('');
    setAmount('');
    setType('expense');
  };

  const handleDeleteTransaction = (id: number) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
      deleteTx(id).catch(() => {});
    }
  };

  // Tax Calculation Functions
  const calculateTax = () => {
    const annualIncome = parseFloat(monthlyIncome) * 12;
    if (!annualIncome || annualIncome <= 0) return null;

    let totalDeductions = 0;
    const deductions = [];

    // Standard Deduction (Section 16)
    const standardDeduction = 50000;
    totalDeductions += standardDeduction;
    deductions.push({ name: 'Standard Deduction (Section 16)', amount: standardDeduction });

    // Health Insurance Premium (Section 80D)
    if (hasHealthInsurance) {
      const healthDeduction = Math.min(25000, annualIncome * 0.1);
      totalDeductions += healthDeduction;
      deductions.push({ name: 'Health Insurance Premium (Section 80D)', amount: healthDeduction });
    }

    // Home Loan Interest (Section 24)
    if (hasHomeLoan) {
      const homeLoanDeduction = Math.min(200000, annualIncome * 0.2);
      totalDeductions += homeLoanDeduction;
      deductions.push({ name: 'Home Loan Interest (Section 24)', amount: homeLoanDeduction });
    }

    // Education Loan Interest (Section 80E)
    if (hasEducationLoan) {
      const educationDeduction = Math.min(50000, annualIncome * 0.1);
      totalDeductions += educationDeduction;
      deductions.push({ name: 'Education Loan Interest (Section 80E)', amount: educationDeduction });
    }

    // NPS Contribution (Section 80CCD)
    if (hasNPS) {
      const npsDeduction = Math.min(50000, annualIncome * 0.1);
      totalDeductions += npsDeduction;
      deductions.push({ name: 'NPS Contribution (Section 80CCD)', amount: npsDeduction });
    }

    // ELSS Investment (Section 80C)
    if (hasELSS) {
      const elssDeduction = Math.min(150000, annualIncome * 0.15);
      totalDeductions += elssDeduction;
      deductions.push({ name: 'ELSS Investment (Section 80C)', amount: elssDeduction });
    }

    // PPF Contribution (Section 80C)
    if (hasPPF) {
      const ppfDeduction = Math.min(150000, annualIncome * 0.15);
      totalDeductions += ppfDeduction;
      deductions.push({ name: 'PPF Contribution (Section 80C)', amount: ppfDeduction });
    }

    // EPF Contribution (Section 80C)
    if (hasEPF) {
      const epfDeduction = Math.min(150000, annualIncome * 0.12);
      totalDeductions += epfDeduction;
      deductions.push({ name: 'EPF Contribution (Section 80C)', amount: epfDeduction });
    }

    // Medical Bills (Section 80DDB)
    if (hasMedicalBills && medicalBillsAmount) {
      const medicalDeduction = Math.min(40000, parseFloat(medicalBillsAmount));
      totalDeductions += medicalDeduction;
      deductions.push({ name: 'Medical Bills (Section 80DDB)', amount: medicalDeduction });
    }

    // Donations (Section 80G)
    if (hasDonations && donationsAmount) {
      const donationDeduction = Math.min(100000, parseFloat(donationsAmount));
      totalDeductions += donationDeduction;
      deductions.push({ name: 'Donations (Section 80G)', amount: donationDeduction });
    }

    // Calculate taxable income
    const taxableIncome = Math.max(0, annualIncome - totalDeductions);

    // Calculate tax based on Indian tax slabs (FY 2024-25)
    let tax = 0;
    const taxBreakdown = [];

    if (taxableIncome <= 300000) {
      tax = 0;
      taxBreakdown.push({ slab: 'Up to ₹3,00,000', rate: '0%', amount: 0 });
    } else if (taxableIncome <= 600000) {
      tax = (taxableIncome - 300000) * 0.05;
      taxBreakdown.push({ slab: '₹3,00,001 - ₹6,00,000', rate: '5%', amount: tax });
    } else if (taxableIncome <= 900000) {
      tax = 15000 + (taxableIncome - 600000) * 0.10;
      taxBreakdown.push({ slab: '₹3,00,001 - ₹6,00,000', rate: '5%', amount: 15000 });
      taxBreakdown.push({ slab: '₹6,00,001 - ₹9,00,000', rate: '10%', amount: (taxableIncome - 600000) * 0.10 });
    } else if (taxableIncome <= 1200000) {
      tax = 45000 + (taxableIncome - 900000) * 0.15;
      taxBreakdown.push({ slab: '₹3,00,001 - ₹6,00,000', rate: '5%', amount: 15000 });
      taxBreakdown.push({ slab: '₹6,00,001 - ₹9,00,000', rate: '10%', amount: 30000 });
      taxBreakdown.push({ slab: '₹9,00,001 - ₹12,00,000', rate: '15%', amount: (taxableIncome - 900000) * 0.15 });
    } else if (taxableIncome <= 1500000) {
      tax = 90000 + (taxableIncome - 1200000) * 0.20;
      taxBreakdown.push({ slab: '₹3,00,001 - ₹6,00,000', rate: '5%', amount: 15000 });
      taxBreakdown.push({ slab: '₹6,00,001 - ₹9,00,000', rate: '10%', amount: 30000 });
      taxBreakdown.push({ slab: '₹9,00,001 - ₹12,00,000', rate: '15%', amount: 45000 });
      taxBreakdown.push({ slab: '₹12,00,001 - ₹15,00,000', rate: '20%', amount: (taxableIncome - 1200000) * 0.20 });
    } else {
      tax = 150000 + (taxableIncome - 1500000) * 0.30;
      taxBreakdown.push({ slab: '₹3,00,001 - ₹6,00,000', rate: '5%', amount: 15000 });
      taxBreakdown.push({ slab: '₹6,00,001 - ₹9,00,000', rate: '10%', amount: 30000 });
      taxBreakdown.push({ slab: '₹9,00,001 - ₹12,00,000', rate: '15%', amount: 45000 });
      taxBreakdown.push({ slab: '₹12,00,001 - ₹15,00,000', rate: '20%', amount: 60000 });
      taxBreakdown.push({ slab: 'Above ₹15,00,000', rate: '30%', amount: (taxableIncome - 1500000) * 0.30 });
    }

    // Add 4% Health and Education Cess
    const cess = tax * 0.04;
    const totalTax = tax + cess;

    return {
      annualIncome,
      totalDeductions,
      deductions,
      taxableIncome,
      taxBreakdown,
      tax,
      cess,
      totalTax,
      effectiveTaxRate: (totalTax / annualIncome) * 100
    };
  };

  const getTaxSavingsTips = () => {
    const tips = [];
    
    if (!hasHealthInsurance) {
      tips.push('💊 Get health insurance to claim up to ₹25,000 under Section 80D');
    }
    
    if (!hasNPS) {
      tips.push('🏦 Consider NPS contribution for additional ₹50,000 deduction under Section 80CCD');
    }
    
    if (!hasELSS && !hasPPF) {
      tips.push('📈 Invest in ELSS or PPF to claim up to ₹1.5 lakh under Section 80C');
    }
    
    if (!hasHomeLoan) {
      tips.push('🏠 Home loan interest can save up to ₹2 lakh under Section 24');
    }
    
    if (!hasMedicalBills) {
      tips.push('🏥 Keep medical bills for deduction up to ₹40,000 under Section 80DDB');
    }
    
    if (!hasDonations) {
      tips.push('🤝 Donate to eligible organizations for deduction under Section 80G');
    }
    
    return tips;
  };


  return (
    <div className="p-4 md:p-6 text-brand-text max-w-4xl mx-auto">
      <header className="mb-6 border-b-4 border-brand-text pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onBack && (
              <button onClick={onBack} className="px-3 py-2 text-sm font-bold bg-white text-brand-text border-2 border-brand-text shadow-hard hover:bg-brand-accent" aria-label="Back to landing">Back</button>
            )}
        <h1 className="text-2xl md:text-3xl font-bold">Taxes & Finance Tracker</h1>
          </div>
        </div>
        <p className="text-brand-text/80 mt-1">Monitor your income and expenses to stay prepared for tax season.</p>
      </header>

      {/* Tab Navigation */}
      <div className="flex border-b-2 border-brand-text mb-6">
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-6 py-3 font-bold text-sm ${
            activeTab === 'transactions'
              ? 'bg-brand-accent text-brand-text border-b-2 border-brand-text'
              : 'text-brand-text/70 hover:text-brand-text'
          }`}
        >
          📊 Transactions
        </button>
        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-6 py-3 font-bold text-sm ${
            activeTab === 'calculator'
              ? 'bg-brand-accent text-brand-text border-b-2 border-brand-text'
              : 'text-brand-text/70 hover:text-brand-text'
          }`}
        >
          🧮 Tax Calculator
        </button>
        <button
          onClick={() => setActiveTab('balanceSheet')}
          className={`px-6 py-3 font-bold text-sm ${
            activeTab === 'balanceSheet'
              ? 'bg-brand-accent text-brand-text border-b-2 border-brand-text'
              : 'text-brand-text/70 hover:text-brand-text'
          }`}
        >
          📈 Balance Sheet
        </button>
      </div>

      {activeTab === 'transactions' && (
        <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-brand-bg p-5 border-2 border-brand-text shadow-hard">
          <h3 className="text-brand-text/80 text-sm font-semibold uppercase">Total Income</h3>
          <p className="text-2xl font-bold text-green-600">₹{totalIncome.toFixed(2)}</p>
        </div>
        <div className="bg-brand-bg p-5 border-2 border-brand-text shadow-hard">
          <h3 className="text-brand-text/80 text-sm font-semibold uppercase">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-600">₹{Math.abs(totalExpenses).toFixed(2)}</p>
        </div>
        <div className="bg-brand-bg p-5 border-2 border-brand-text shadow-hard">
          <h3 className="text-brand-text/80 text-sm font-semibold uppercase">Net Flow</h3>
          <p className={`text-2xl font-bold ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>₹{netAmount.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="bg-white p-5 border-2 border-brand-text shadow-hard mb-8">
        <h2 className="text-xl font-bold mb-4">Add New Transaction</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-brand-bg border-2 border-brand-text p-3 text-brand-text focus:ring-2 focus:ring-brand-accent focus:border-brand-accent focus:outline-none"
              required
            />
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-brand-bg border-2 border-brand-text p-3 text-brand-text focus:ring-2 focus:ring-brand-accent focus:border-brand-accent focus:outline-none"
              required
              min="0.01"
              step="0.01"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-brand-bg border-2 border-brand-text p-3 text-brand-text focus:ring-2 focus:ring-brand-accent focus:border-brand-accent focus:outline-none"
              required
            />
            <div className="flex border-2 border-brand-text">
              <button type="button" onClick={() => setType('income')} className={`w-full px-4 py-2 text-sm font-bold ${type === 'income' ? 'bg-green-500 text-white' : 'text-brand-text'}`}>Income</button>
              <button type="button" onClick={() => setType('expense')} className={`w-full px-4 py-2 text-sm font-bold ${type === 'expense' ? 'bg-red-500 text-white' : 'text-brand-text'}`}>Expense</button>
            </div>
          </div>
          <button type="submit" className="w-full bg-brand-accent hover:bg-amber-500 text-brand-text font-bold py-3 px-4 border-2 border-brand-text shadow-hard transition-all active:translate-x-1 active:translate-y-1 active:shadow-none">
            Add Transaction
          </button>
        </form>
      </div>

      <div className="bg-white p-5 border-2 border-brand-text shadow-hard">
        <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
            {transactions.length === 0 ? (
              <div className="p-4 text-center text-sm text-brand-text/70 border-2 border-dashed border-brand-text">
                No transactions yet. Add your first one above.
              </div>
            ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 border-2 border-brand-text">
              <div>
                <p className="font-bold">{transaction.description}</p>
                <p className="text-xs text-brand-text/70">{transaction.date}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.amount > 0 ? '+' : ''}₹{transaction.amount.toFixed(2)}
                </p>
                <button
                  onClick={() => handleDeleteTransaction(transaction.id)}
                  className="text-brand-text/60 hover:text-red-600 transition-colors p-1"
                  aria-label={`Delete transaction: ${transaction.description}`}
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'calculator' && (
        <div className="space-y-6">
          {/* Tax Calculator Form */}
          <div className="bg-white p-6 border-2 border-brand-text shadow-hard">
            <h2 className="text-xl font-bold mb-4">🧮 Indian Income Tax Calculator</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-bold text-brand-text">Basic Information</h3>
                <div>
                  <label className="block text-sm font-bold mb-2">Monthly Income (₹)</label>
                  <input
                    type="number"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    placeholder="Enter monthly income"
                    className="w-full bg-brand-bg border-2 border-brand-text p-3 text-brand-text focus:ring-2 focus:ring-brand-accent focus:border-brand-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Enter your age"
                    className="w-full bg-brand-bg border-2 border-brand-text p-3 text-brand-text focus:ring-2 focus:ring-brand-accent focus:border-brand-accent focus:outline-none"
                  />
                </div>
              </div>

              {/* Deductions */}
              <div className="space-y-4">
                <h3 className="font-bold text-brand-text">Deductions & Investments</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={hasHealthInsurance}
                      onChange={(e) => setHasHealthInsurance(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">Health Insurance Premium</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={hasHomeLoan}
                      onChange={(e) => setHasHomeLoan(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">Home Loan Interest</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={hasEducationLoan}
                      onChange={(e) => setHasEducationLoan(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">Education Loan Interest</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={hasNPS}
                      onChange={(e) => setHasNPS(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">NPS Contribution</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={hasELSS}
                      onChange={(e) => setHasELSS(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">ELSS Investment</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={hasPPF}
                      onChange={(e) => setHasPPF(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">PPF Contribution</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={hasEPF}
                      onChange={(e) => setHasEPF(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">EPF Contribution</span>
                  </label>
                </div>
              </div>
            </div>

                         {/* Additional Deductions */}
             <div className="mt-6 space-y-4">
               <h3 className="font-bold text-brand-text">Additional Deductions</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="flex items-center mb-2">
                     <input
                       type="checkbox"
                       checked={hasMedicalBills}
                       onChange={(e) => setHasMedicalBills(e.target.checked)}
                       className="mr-2"
                     />
                     <span className="text-sm font-bold">Medical Bills</span>
                   </label>
                   {hasMedicalBills && (
                     <input
                       type="number"
                       value={medicalBillsAmount}
                       onChange={(e) => setMedicalBillsAmount(e.target.value)}
                       placeholder="Amount (₹)"
                       className="w-full bg-brand-bg border-2 border-brand-text p-3 text-brand-text focus:ring-2 focus:ring-brand-accent focus:border-brand-accent focus:outline-none"
                     />
                   )}
                 </div>
                 <div>
                   <label className="flex items-center mb-2">
                     <input
                       type="checkbox"
                       checked={hasDonations}
                       onChange={(e) => setHasDonations(e.target.checked)}
                       className="mr-2"
                     />
                     <span className="text-sm font-bold">Donations</span>
                   </label>
                   {hasDonations && (
                     <input
                       type="number"
                       value={donationsAmount}
                       onChange={(e) => setDonationsAmount(e.target.value)}
                       placeholder="Amount (₹)"
                       className="w-full bg-brand-bg border-2 border-brand-text p-3 text-brand-text focus:ring-2 focus:ring-brand-accent focus:border-brand-accent focus:outline-none"
                     />
                   )}
                 </div>
               </div>
             </div>

             {/* Calculate Button */}
             <div className="mt-6">
               <button
                 onClick={() => {}} // The calculation happens automatically when monthlyIncome changes
                 disabled={!monthlyIncome}
                 className="w-full bg-brand-accent hover:bg-amber-500 text-brand-text font-bold py-3 px-4 border-2 border-brand-text shadow-hard transition-all disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 🧮 Calculate Tax
               </button>
             </div>
          </div>

          {/* Tax Calculation Results */}
          {monthlyIncome && calculateTax() && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-brand-bg p-4 border-2 border-brand-text shadow-hard">
                  <h3 className="text-brand-text/80 text-sm font-semibold uppercase">Annual Income</h3>
                  <p className="text-xl font-bold text-green-600">₹{calculateTax()?.annualIncome.toLocaleString()}</p>
                </div>
                <div className="bg-brand-bg p-4 border-2 border-brand-text shadow-hard">
                  <h3 className="text-brand-text/80 text-sm font-semibold uppercase">Total Deductions</h3>
                  <p className="text-xl font-bold text-blue-600">₹{calculateTax()?.totalDeductions.toLocaleString()}</p>
                </div>
                <div className="bg-brand-bg p-4 border-2 border-brand-text shadow-hard">
                  <h3 className="text-brand-text/80 text-sm font-semibold uppercase">Taxable Income</h3>
                  <p className="text-xl font-bold text-orange-600">₹{calculateTax()?.taxableIncome.toLocaleString()}</p>
                </div>
                <div className="bg-brand-bg p-4 border-2 border-brand-text shadow-hard">
                  <h3 className="text-brand-text/80 text-sm font-semibold uppercase">Total Tax</h3>
                  <p className="text-xl font-bold text-red-600">₹{calculateTax()?.totalTax.toLocaleString()}</p>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Deductions Breakdown */}
                <div className="bg-white p-6 border-2 border-brand-text shadow-hard">
                  <h3 className="text-lg font-bold mb-4">📋 Deductions Breakdown</h3>
                  <div className="space-y-2">
                    {calculateTax()?.deductions.map((deduction, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50">
                        <span className="text-sm">{deduction.name}</span>
                        <span className="font-bold text-green-600">₹{deduction.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tax Slab Breakdown */}
                <div className="bg-white p-6 border-2 border-brand-text shadow-hard">
                  <h3 className="text-lg font-bold mb-4">📊 Tax Slab Breakdown</h3>
                  <div className="space-y-2">
                    {calculateTax()?.taxBreakdown.map((slab, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50">
                        <div>
                          <span className="text-sm font-bold">{slab.slab}</span>
                          <br />
                          <span className="text-xs text-gray-600">Rate: {slab.rate}</span>
                        </div>
                        <span className="font-bold text-red-600">₹{slab.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">Health & Education Cess (4%)</span>
                      <span className="font-bold text-red-600">₹{calculateTax()?.cess.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tax Savings Tips */}
              <div className="bg-white p-6 border-2 border-brand-text shadow-hard">
                <h3 className="text-lg font-bold mb-4">💡 Tax Savings Tips</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getTaxSavingsTips().map((tip, index) => (
                    <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
      </div>
      )}

      {activeTab === 'balanceSheet' && (
        <div className="space-y-6">
          <div className="bg-white p-6 border-2 border-brand-text shadow-hard">
            <h2 className="text-xl font-bold mb-4">🧾 Personal Balance Sheet</h2>
            <p className="text-brand-text/80 mb-4">
              This balance sheet provides a comprehensive overview of your financial position.
              It includes monthly breakdowns, top income sources, and top expense categories.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-brand-bg p-4 border-2 border-brand-text shadow-hard">
                <h3 className="text-brand-text/80 text-sm font-semibold uppercase">Total Income</h3>
                <p className="text-2xl font-bold text-green-600">₹{totalIncome.toFixed(2)}</p>
              </div>
              <div className="bg-brand-bg p-4 border-2 border-brand-text shadow-hard">
                <h3 className="text-brand-text/80 text-sm font-semibold uppercase">Total Expenses</h3>
                <p className="text-2xl font-bold text-red-600">₹{Math.abs(totalExpenses).toFixed(2)}</p>
              </div>
              <div className="bg-brand-bg p-4 border-2 border-brand-text shadow-hard">
                <h3 className="text-brand-text/80 text-sm font-semibold uppercase">Net Worth</h3>
                <p className={`text-2xl font-bold ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>₹{netAmount.toFixed(2)}</p>
              </div>
              <div className="bg-brand-bg p-4 border-2 border-brand-text shadow-hard">
                <h3 className="text-brand-text/80 text-sm font-semibold uppercase">Total Transactions</h3>
                <p className="text-2xl font-bold text-blue-600">{transactions.length}</p>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={downloadBalanceSheet}
                disabled={isGeneratingBalanceSheet}
                className="w-full bg-brand-accent hover:bg-amber-500 text-brand-text font-bold py-3 px-4 border-2 border-brand-text shadow-hard transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingBalanceSheet ? 'Generating...' : '📄 Download Balance Sheet (CSV)'}
              </button>
            </div>
            <div className="mt-4">
              <button
                onClick={downloadBalanceSheetPDF}
                disabled={isGeneratingBalanceSheet}
                className="w-full bg-brand-accent hover:bg-amber-500 text-brand-text font-bold py-3 px-4 border-2 border-brand-text shadow-hard transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingBalanceSheet ? 'Generating...' : '📄 Download Balance Sheet (PDF)'}
              </button>
            </div>
          </div>

          <div className="bg-white p-6 border-2 border-brand-text shadow-hard">
            <h3 className="text-lg font-bold mb-4">📊 Monthly Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 border border-brand-text">Month</th>
                    <th className="p-2 border border-brand-text">Year</th>
                    <th className="p-2 border border-brand-text">Income</th>
                    <th className="p-2 border border-brand-text">Expenses</th>
                    <th className="p-2 border border-brand-text">Net Flow</th>
                    <th className="p-2 border border-brand-text">Running Balance</th>
                    <th className="p-2 border border-brand-text">Transactions</th>
                  </tr>
                </thead>
                <tbody>
                  {generateBalanceSheetData().monthlyBreakdown.map((month, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="p-2 border border-brand-text">{month.month}</td>
                      <td className="p-2 border border-brand-text">{month.year}</td>
                      <td className="p-2 border border-brand-text text-green-600 font-bold">₹{month.income.toFixed(2)}</td>
                      <td className="p-2 border border-brand-text text-red-600 font-bold">₹{month.expenses.toFixed(2)}</td>
                      <td className={`p-2 border border-brand-text ${month.netFlow >= 0 ? 'text-green-600' : 'text-red-600'} font-bold`}>₹{month.netFlow.toFixed(2)}</td>
                      <td className={`p-2 border border-brand-text ${month.runningBalance >= 0 ? 'text-green-600' : 'text-red-600'} font-bold`}>₹{month.runningBalance.toFixed(2)}</td>
                      <td className="p-2 border border-brand-text">{month.transactions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-6 border-2 border-brand-text shadow-hard">
            <h3 className="text-lg font-bold mb-4">💰 Top Income Sources</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 border border-brand-text">Source</th>
                    <th className="p-2 border border-brand-text">Amount</th>
                  </tr>
                </thead>
                <tbody>
                                     {Object.entries(generateBalanceSheetData().topIncomeSources)
                     .sort(([,a], [,b]) => (b as number) - (a as number))
                     .slice(0, 10)
                     .map(([source, amount]) => (
                       <tr key={source} className="hover:bg-gray-50">
                         <td className="p-2 border border-brand-text">{source}</td>
                         <td className="p-2 border border-brand-text text-green-600 font-bold">₹{(amount as number).toFixed(2)}</td>
                       </tr>
                     ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-6 border-2 border-brand-text shadow-hard">
            <h3 className="text-lg font-bold mb-4">💸 Top Expense Categories</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 border border-brand-text">Category</th>
                    <th className="p-2 border border-brand-text">Amount</th>
                  </tr>
                </thead>
                <tbody>
                                     {Object.entries(generateBalanceSheetData().topExpenseCategories)
                     .sort(([,a], [,b]) => (b as number) - (a as number))
                     .slice(0, 10)
                     .map(([category, amount]) => (
                       <tr key={category} className="hover:bg-gray-50">
                         <td className="p-2 border border-brand-text">{category}</td>
                         <td className="p-2 border border-brand-text text-red-600 font-bold">₹{(amount as number).toFixed(2)}</td>
                       </tr>
                     ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxesScreen;