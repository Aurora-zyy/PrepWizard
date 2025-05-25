// app/vapi-test/page.tsx
'use client';

import { useState } from 'react';
import { vapi } from '@/lib/vapi.sdk';

export default function VapiTest() {
  const [status, setStatus] = useState('未开始');
  const [error, setError] = useState<string | null>(null);

  const startCall = async () => {
    try {
      setStatus('连接中...');
      console.log('WORKFLOW_ID:', process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID);

      // 设置基本事件监听
      vapi.on('error', (err) => {
        console.error('Vapi错误:', err);
        setError(`错误: ${JSON.stringify(err)}`);
        setStatus('错误');
      });

      vapi.on('call-start', () => {
        console.log('通话已开始');
        setStatus('通话中');
      });

      // 尝试启动
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
        variableValues: {
          username: '测试用户',
          userid: 'test123',
        },
      });
    } catch (e) {
      console.error('启动错误:', e);
      setError(`启动错误: ${e instanceof Error ? e.message : String(e)}`);
      setStatus('启动失败');
    }
  };

  const stopCall = () => {
    vapi.stop();
    setStatus('已结束');
  };

  return (
    <div className='p-8 max-w-md mx-auto'>
      <h1 className='text-xl font-bold mb-4'>Vapi 基础测试</h1>

      <div className='mb-4 p-4 border rounded'>
        <p>
          状态: <span className='font-medium'>{status}</span>
        </p>
        {error && <p className='text-red-500 mt-2'>错误信息: {error}</p>}
      </div>

      <div className='flex gap-4'>
        <button
          onClick={startCall}
          className='px-4 py-2 bg-blue-500 text-white rounded'
        >
          开始通话
        </button>

        <button
          onClick={stopCall}
          className='px-4 py-2 bg-red-500 text-white rounded'
        >
          结束通话
        </button>
      </div>
    </div>
  );
}
