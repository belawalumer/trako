import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/trako-logo.svg"
              alt="Trako"
              width={200}
              height={67}
              className="h-16 w-auto"
            />
          </div>
          <p className="text-lg text-gray-600 mb-8">
            Streamline your projects and manage developer allocations with Trako
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="space-y-4">
            <Link
              href="/auth/login"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Sign In
            </Link>
            
            <Link
              href="/auth/signup"
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
        
        <div className="text-center text-sm text-gray-500">
          <p>Features:</p>
          <ul className="mt-2 space-y-1">
            <li>• Project dashboard with status tracking</li>
            <li>• Drag-and-drop board management</li>
            <li>• Developer allocation and availability</li>
            <li>• Real-time project updates</li>
          </ul>
        </div>
      </div>
    </div>
  );
}