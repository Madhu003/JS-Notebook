import { useState } from 'react';
import { authService } from '../services/authService';

const AuthDebugPage = () => {
  const [email, setEmail] = useState('test-user@gmail.com');
  const [password, setPassword] = useState('123456');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult('');
    
    try {
      console.log('🧪 Testing login with:', { email, password });
      const user = await authService.login(email, password);
      setResult(`✅ Success! User: ${user.email}`);
    } catch (error) {
      console.error('🧪 Test error:', error);
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testRegister = async () => {
    setLoading(true);
    setResult('');
    
    try {
      console.log('🧪 Testing registration with:', { email, password });
      const user = await authService.register(email, password, 'Test User');
      setResult(`✅ Registration Success! User: ${user.email}`);
    } catch (error) {
      console.error('🧪 Registration error:', error);
      setResult(`❌ Registration Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Auth Debug Page
          </h2>
          <p className="text-lg text-gray-600">
            Test Firebase Authentication
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          
          <div className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={testLogin}
                disabled={loading || !email || !password}
                className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Testing...' : 'Test Login'}
              </button>
              
              <button
                onClick={testRegister}
                disabled={loading || !email || !password}
                className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Testing...' : 'Test Register'}
              </button>
            </div>

            {/* Result */}
            {result && (
              <div className={`p-4 rounded-md ${
                result.includes('✅') 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className={`text-xl ${
                      result.includes('✅') ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {result.includes('✅') ? '✅' : '❌'}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm ${
                      result.includes('✅') ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {result}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Debug Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-gray-800 mb-2">Debug Info:</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Email:</strong> {email || 'Not set'}</p>
                <p><strong>Password Length:</strong> {password.length}</p>
                <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
                <p><strong>Firebase Config:</strong> Check console for details</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthDebugPage;
