"use client";
import { useSearchParams } from "next/navigation";
import PolicyDetailPage from "@/components/products/PolicyDetailPage";

export default function Success() {
  const searchParams = useSearchParams();

  // URL 파라미터에서 정책 정보 가져오기
  const policy = {
    id: searchParams.get("id") || "POL-UNKNOWN",
    type: searchParams.get("type") || "Unknown Policy",
    coverage: searchParams.get("coverage") || "Unknown Coverage",
    premium: searchParams.get("premium") || "Unknown Premium",
    duration: searchParams.get("duration") || "Unknown Duration",
  };

  return <PolicyDetailPage policy={policy} />;
}
