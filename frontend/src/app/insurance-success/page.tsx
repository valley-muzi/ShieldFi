'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/features/common/components/card';
import { Button } from '@/features/common/components/button';
import { CheckCircle, ArrowRight, Home, History } from 'lucide-react';

export default function InsuranceSuccessPage() {
  const router = useRouter();

  const handleGoToHistory = () => {
    router.push('/history');
  };

  const handleGoToHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Insurance Signup Complete!
          </h1>
          
          <p className="text-gray-600 mb-8">
            Congratulations! Your ShieldFi insurance signup has been completed successfully.
          </p>
        </div>

        <Card className="p-8 mb-8">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Signup Information
              </h2>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-green-700">Policy ID:</span>
                    <span className="font-medium font-mono text-sm">POL-1703123456-smart-contract</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Insurance Type:</span>
                    <span className="font-medium">Premium Shield</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Coverage:</span>
                    <span className="font-medium">5.0 ETH/year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Premium:</span>
                    <span className="font-medium text-sm">Premium protection insurance product that provides coverage for medium-scale losses.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Duration:</span>
                    <span className="font-medium">1 Year</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-medium text-blue-900 mb-3">
                Next Steps
              </h3>
              <ul className="text-sm text-blue-700 space-y-2">
                <li>• Insurance policy NFT will be issued to your wallet</li>
                <li>• You can check your insurance history on the History page</li>
                <li>• You can file claims anytime</li>
                <li>• You will be automatically protected during the coverage period</li>
              </ul>
            </div>

            {/* Key Features Section */}
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
              <h3 className="font-medium text-teal-900 mb-3">
                Key Features
              </h3>
              <ul className="text-sm text-teal-700 space-y-2">
                <li>• Medium Scale Loss Coverage</li>
                <li>• Advanced Protection Features</li>
                <li>• Priority Support</li>
                <li>• Real-time Alerts</li>
                <li>• Expert Consultation</li>
              </ul>
            </div>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleGoToHistory}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 text-white"
          >
            <History className="w-4 h-4" />
            View Insurance History
            <ArrowRight className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={handleGoToHome}
            variant="outline"
            className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Home className="w-4 h-4" />
            Back to Home
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
