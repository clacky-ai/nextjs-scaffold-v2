import { Link } from 'react-router';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">欢迎来到首页</h1>

        <Link
          to="/admin"
          className="text-blue-500 hover:text-blue-600 underline"
        >
          进入管理后台
        </Link>
      </div>
    </div>
  );
}
