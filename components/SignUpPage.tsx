import React from 'react';

interface SignUpPageProps {
    onSignUp: () => void;
    onNavigateToLogin: () => void;
    onBack: () => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onSignUp, onNavigateToLogin, onBack }) => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-black">
            <div className="relative w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
                <button onClick={onBack} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" aria-label="Close">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div>
                    <h1 className="text-3xl font-extrabold text-center">Create your Xylax AI Account</h1>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        Get started with the most advanced AI
                    </p>
                </div>
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onSignUp(); }}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium">Email address</label>
                        <input id="email" name="email" type="email" required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm bg-transparent" />
                    </div>
                    <div>
                        <label htmlFor="password"className="block text-sm font-medium">Password</label>
                        <input id="password" name="password" type="password" required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm bg-transparent" />
                    </div>
                    <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
                       Create Account
                    </button>
                </form>
                 <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">Or create an account with</span>
                    </div>
                </div>
                 <div>
                    <button
                        type="button"
                        onClick={onSignUp}
                        className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                         <svg className="w-5 h-5 mr-2" aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 110.3 512 0 401.7 0 265.2 0 128.5 110.3 19.2 244 19.2c71.2 0 131.5 28.5 176.9 73.4l-66.3 64.2c-26-24.4-61.9-39.6-110.6-39.6-84.3 0-152.4 68.8-152.4 153.8s68.1 153.8 152.4 153.8c98.2 0 135-70.6 140.8-106.9H244V261.8h244z"></path></svg>
                        Sign up with Google
                    </button>
                </div>
                 <p className="mt-8 text-center text-sm">
                    Already have an account?{' '}
                    <button onClick={onNavigateToLogin} className="font-medium text-pink-500 hover:text-pink-400">
                        Log in
                    </button>
                </p>
            </div>
        </div>
    );
};

export default SignUpPage;