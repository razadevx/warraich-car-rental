import Link from "next/link";
import { Car, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
          <Car className="w-8 h-8" />
        </div>
        <div>
          <div className="text-4xl font-black text-blue-500">404</div>
          <h1 className="text-2xl font-bold mt-2">Vehicle or Page Not Found</h1>
          <p className="text-sm text-slate-400 mt-2">
            The page or vehicle you are looking for does not exist or has been moved.
          </p>
        </div>
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow transition"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
