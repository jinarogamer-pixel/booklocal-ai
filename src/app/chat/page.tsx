"use client";
import nextDynamic from 'next/dynamic';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

// Dynamic import to avoid SSR issues
const ChatPageClient = nextDynamic(() => import('./ChatPageClient'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading chat...</p>
      </div>
    </div>
  )
});

export default function ChatPage() {
  return <ChatPageClient />;
}
