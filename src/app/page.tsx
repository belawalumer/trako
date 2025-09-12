import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function Home() {
  // Redirect to dashboard for public access
  redirect('/dashboard');
}