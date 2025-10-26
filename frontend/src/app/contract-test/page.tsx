import ContractTest from '@/components/ContractTest';

export default function ContractTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ShieldFi 컨트랙트 테스트
          </h1>
          <p className="text-gray-600">
            Sepolia 테스트넷에 배포된 컨트랙트들과 상호작용을 테스트합니다.
          </p>
        </div>

        <ContractTest />
      </div>
    </div>
  );
}
