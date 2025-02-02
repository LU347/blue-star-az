import Link from "next/link";

export default function Navbar() {
    return (
        <div className="flex justify-between p-4 h-16 rounded-xl border-b-2 border-slate-500">
            <div className="flex items-center">
                <Link href="/" className="text-xl font-bold">
                    Blue Star AZ
                </Link>
            </div>
            <div className="flex items-center space-x-4">
                <Link href="/login" className="px-4 py-2 rounded">
                    Login
                </Link>
                <Link href="/signup" className="px-4 py-2 rounded">
                    Signup
                </Link>
                <Link href="/profile" className="px-4 py-2 rounded">
                    Profile
                </Link>
            </div>
        </div>
    );
}