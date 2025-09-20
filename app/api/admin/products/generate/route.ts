import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Helper function to generate random number within range
const randomInRange = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Helper function to generate random product name
const generateProductName = () => {
  const prefixes = ['Alpha', 'Beta', 'Delta', 'Gamma', 'Omega', 'Sigma', 'Prime', 'Ultra', 'Mega', 'Hyper'];
  const types = ['Fund', 'Bond', 'Stock', 'ETF', 'Index', 'Portfolio', 'Trust', 'Venture', 'Capital', 'Investment'];
  const suffixes = ['Plus', 'Pro', 'Elite', 'Select', 'Premium', 'Choice', 'Advantage', 'Growth', 'Income', 'Value'];
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const type = types[Math.floor(Math.random() * types.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  // 50% chance to include a suffix
  return Math.random() > 0.5 ? `${prefix} ${type} ${suffix}` : `${prefix} ${type}`;
};

// Helper function to generate random description
const generateDescription = (name: string, returnRate: number, riskLevel: number, duration: number) => {
  const riskDescriptions = [
    'very low risk', 'low risk', 'relatively safe', 'balanced risk', 
    'moderate risk', 'calculated risk', 'somewhat risky', 
    'high risk', 'aggressive', 'very high risk'
  ];
  
  const durationText = duration <= 90 ? 'short-term' : 
                       duration <= 365 ? 'medium-term' : 'long-term';
  
  const returnText = returnRate <= 3 ? 'conservative' : 
                     returnRate <= 8 ? 'moderate' : 'high';
  
  const riskDescription = riskDescriptions[Math.min(Math.floor(riskLevel) - 1, riskDescriptions.length - 1)];
  
  return `${name} is a ${durationText} ${riskDescription} investment product offering ${returnText} returns. ` +
         `With an expected annual return of approximately ${returnRate.toFixed(2)}%, this product is designed ` +
         `for investors seeking ${durationText} growth opportunities with a ${riskDescription} profile. ` +
         `The investment period is ${Math.floor(duration)} days.`;
};

export async function POST(request: Request) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      count = 5, 
      returnRange = { min: 1, max: 15 }, 
      riskRange = { min: 1, max: 10 },
      durationRange = { min: 30, max: 365 },
      investmentRange = { min: 50, max: 1000, isFixed: false },
      priceRange = { min: 10, max: 100 },
      productTypes = ['REKSADANA', 'OBLIGASI', 'SBN', 'CRYPTO']
    } = body;

    // Validate input
    if (count < 1 || count > 50) {
      return NextResponse.json({ error: 'Count must be between 1 and 50' }, { status: 400 });
    }

    if (productTypes.length === 0) {
      return NextResponse.json({ error: 'At least one product type must be selected' }, { status: 400 });
    }

    // Generate products
    const products = [];
    for (let i = 0; i < count; i++) {
      const returnRate = parseFloat((Math.random() * (returnRange.max - returnRange.min) + returnRange.min).toFixed(2));
      const riskLevel = randomInRange(riskRange.min, riskRange.max);
      const duration = randomInRange(durationRange.min, durationRange.max);
      const name = generateProductName();
      
      // Determine investment amount based on fixed setting
      const minInvestmentValue = investmentRange.isFixed 
        ? investmentRange.min 
        : randomInRange(investmentRange.min, investmentRange.max);
      
      // Generate random price within range
      const currentPrice = randomInRange(priceRange.min * 100, priceRange.max * 100) / 100;
      
      // Select random product type from available types
      const randomType = productTypes[Math.floor(Math.random() * productTypes.length)];
      
      products.push({
        name,
        description: generateDescription(name, returnRate, riskLevel, duration),
        type: randomType,
        riskLevel: riskLevel <= 3 ? 'KONSERVATIF' : riskLevel <= 7 ? 'MODERAT' : 'AGRESIF',
        expectedReturn: returnRate,
        minInvestment: minInvestmentValue,
        currentPrice: currentPrice,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Save to database
    const result = await prisma.investmentProduct.createMany({
      data: products,
    });

    return NextResponse.json({ 
      success: true, 
      generatedCount: result.count,
      message: `Successfully generated ${result.count} products`
    });
  } catch (error) {
    console.error('Error generating products:', error);
    return NextResponse.json({ error: 'Failed to generate products' }, { status: 500 });
  }
}