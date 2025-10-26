"use client";

import { useState } from 'react';
import { detectWallets, WalletInfo } from '@/lib/wallet-detection';

interface WalletSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWallet: (wallet: WalletInfo) => void;
}

export default function WalletSelectionModal({ 
  isOpen, 
  onClose, 
  onSelectWallet 
}: WalletSelectionModalProps) {
  const [wallets] = useState<WalletInfo[]>(() => detectWallets().wallets);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">지갑 선택</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          연결할 지갑을 선택하세요. 메타마스크가 우선적으로 표시됩니다.
        </p>

        <div className="space-y-3">
          {wallets.map((wallet, index) => (
            <button
              key={index}
              onClick={() => {
                onSelectWallet(wallet);
                onClose();
              }}
              className={`w-full p-4 border rounded-lg text-left hover:bg-gray-50 transition-colors ${
                wallet.name === 'MetaMask' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {wallet.name}
                    {wallet.name === 'MetaMask' && (
                      <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                        추천
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {wallet.isInstalled ? '설치됨' : '설치되지 않음'}
                  </div>
                </div>
                <div className="text-gray-400">
                  →
                </div>
              </div>
            </button>
          ))}
        </div>

        {wallets.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            설치된 지갑이 없습니다.
            <br />
            <a 
              href="https://metamask.io/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 underline"
            >
              메타마스크 설치하기
            </a>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
