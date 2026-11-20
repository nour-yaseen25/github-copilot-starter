'use client';

import dynamic from 'next/dynamic';

const App = dynamic(() => import('../src/components/App.jsx'), { ssr: false });

const Page = () => <App />;

export default Page;
