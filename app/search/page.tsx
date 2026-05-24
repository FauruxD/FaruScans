import type { Metadata } from "next";
import SearchPageClient from "@/components/SearchPageClient";

export const metadata: Metadata = {
  title: "Search",
};

export default function SearchPage() {
  return <SearchPageClient />;
}
