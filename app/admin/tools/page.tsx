'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

export default function ProductGeneratorPage() {
  const router = useRouter();
  const [count, setCount] = useState(5);
  const [minReturn, setMinReturn] = useState(1);
  const [maxReturn, setMaxReturn] = useState(15);
  const [minRisk, setMinRisk] = useState(1);
  const [maxRisk, setMaxRisk] = useState(10);
  const [minDuration, setMinDuration] = useState(30);
  const [maxDuration, setMaxDuration] = useState(365);
  const [minInvestment, setMinInvestment] = useState(50);
  const [maxInvestment, setMaxInvestment] = useState(1000);
  const [isFixedInvestment, setIsFixedInvestment] = useState(false);
  const [minPrice, setMinPrice] = useState(10);
  const [maxPrice, setMaxPrice] = useState(100);
  type ProductType = 'REKSADANA' | 'OBLIGASI' | 'SBN' | 'CRYPTO';
  
  const [selectedProductTypes, setSelectedProductTypes] = useState({
    REKSADANA: true,
    OBLIGASI: true,
    SBN: true,
    CRYPTO: true
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCount, setGeneratedCount] = useState(0);

  const handleProductTypeChange = (type: ProductType) => {
    setSelectedProductTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const getSelectedProductTypes = () => {
    return Object.keys(selectedProductTypes).filter(type => 
      selectedProductTypes[type as keyof typeof selectedProductTypes]
    );
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedCount(0);
    
    try {
      const response = await fetch('/api/admin/products/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          count,
          returnRange: { min: minReturn, max: maxReturn },
          riskRange: { min: minRisk, max: maxRisk },
          durationRange: { min: minDuration, max: maxDuration },
          investmentRange: { 
            min: minInvestment, 
            max: isFixedInvestment ? minInvestment : maxInvestment,
            isFixed: isFixedInvestment
          },
          priceRange: { min: minPrice, max: maxPrice },
          productTypes: getSelectedProductTypes()
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setGeneratedCount(data.generatedCount || count);
        setTimeout(() => {
          router.push('/admin/products');
          router.refresh();
        }, 2000);
      } else {
        throw new Error(data.error || 'Failed to generate products');
      }
    } catch (error) {
      console.error('Error generating products:', error);
      alert('Failed to generate products. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Investment Product Generator</h1>
      
      <Card className="p-6 mb-6">
        <div className="space-y-6">
          <div>
            <Label htmlFor="count">Number of Products to Generate</Label>
            <div className="flex items-center gap-4 mt-2">
              <Input
                id="count"
                type="number"
                min="1"
                max="50"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-24"
              />
              <Slider
                value={[count]}
                min={1}
                max={50}
                step={1}
                onValueChange={(value) => setCount(value[0])}
                className="flex-1"
              />
            </div>
          </div>
          
          <div>
            <Label>Product Types</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.keys(selectedProductTypes).map(type => (
                <Badge 
                  key={type}
                  variant={selectedProductTypes[type as keyof typeof selectedProductTypes] ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleProductTypeChange(type as ProductType)}
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Return Rate Range (%)</Label>
              <div className="flex items-center gap-4 mt-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={minReturn}
                  onChange={(e) => setMinReturn(Number(e.target.value))}
                  className="w-24"
                />
                <span>to</span>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={maxReturn}
                  onChange={(e) => setMaxReturn(Number(e.target.value))}
                  className="w-24"
                />
              </div>
            </div>
            
            <div>
              <Label>Risk Level Range (1-10)</Label>
              <div className="flex items-center gap-4 mt-2">
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={minRisk}
                  onChange={(e) => setMinRisk(Number(e.target.value))}
                  className="w-24"
                />
                <span>to</span>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={maxRisk}
                  onChange={(e) => setMaxRisk(Number(e.target.value))}
                  className="w-24"
                />
              </div>
            </div>
            
            <div>
              <Label>Duration Range (days)</Label>
              <div className="flex items-center gap-4 mt-2">
                <Input
                  type="number"
                  min="1"
                  max="3650"
                  value={minDuration}
                  onChange={(e) => setMinDuration(Number(e.target.value))}
                  className="w-24"
                />
                <span>to</span>
                <Input
                  type="number"
                  min="1"
                  max="3650"
                  value={maxDuration}
                  onChange={(e) => setMaxDuration(Number(e.target.value))}
                  className="w-24"
                />
              </div>
            </div>

            <div>
              <Label>Minimum Investment Range (Rp)</Label>
              <div className="flex items-center gap-4 mt-2">
                <Input
                  type="number"
                  min="10"
                  max="10000"
                  value={minInvestment}
                  onChange={(e) => setMinInvestment(Number(e.target.value))}
                  className="w-24"
                  disabled={isFixedInvestment}
                />
                <span>to</span>
                <Input
                  type="number"
                  min="10"
                  max="10000"
                  value={maxInvestment}
                  onChange={(e) => setMaxInvestment(Number(e.target.value))}
                  className="w-24"
                  disabled={isFixedInvestment}
                />
              </div>
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="fixedInvestment"
                  checked={isFixedInvestment}
                  onChange={() => setIsFixedInvestment(!isFixedInvestment)}
                  className="mr-2"
                />
                <Label htmlFor="fixedInvestment" className="text-sm">Fixed price for all products</Label>
              </div>
            </div>

            <div>
              <Label>Price Range (Rp)</Label>
              <div className="flex items-center gap-4 mt-2">
                <Input
                  type="number"
                  min="1"
                  max="1000"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                  className="w-24"
                />
                <span>to</span>
                <Input
                  type="number"
                  min="1"
                  max="1000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-24"
                />
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? 'Generating...' : 'Generate Products'}
            </Button>
            
            {isGenerating && (
              <div className="mt-4 text-center">
                <p>Generating products, please wait...</p>
              </div>
            )}
            
            {generatedCount > 0 && !isGenerating && (
              <div className="mt-4 text-center">
                <Badge variant="outline" className="px-4 py-2">
                  Successfully generated {generatedCount} products!
                </Badge>
                <p className="mt-2 text-sm text-gray-500">
                  Redirecting to products page...
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">About Product Generator</h2>
        <p className="text-gray-600 mb-4">
          This tool allows you to quickly generate multiple investment products with randomized properties within your specified ranges.
          Use it to populate your platform with test data or to create a diverse set of investment options.
        </p>
        <div className="bg-gray-100 p-4 rounded-md">
          <h3 className="font-medium mb-2">Tips:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Keep the count reasonable (under 50) to avoid performance issues</li>
            <li>Set realistic return rates based on your market simulation</li>
            <li>Vary risk levels to provide diverse investment options</li>
            <li>Consider different durations for short, medium, and long-term investments</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}