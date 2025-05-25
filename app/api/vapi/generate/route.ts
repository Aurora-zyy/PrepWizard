import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { getRandomInterviewCover } from '@/lib/utils';
import { db } from '@/firebase/admin';

// 定义请求数据接口
interface InterviewRequestData {
  type?: string;
  role?: string;
  level?: string;
  techstack?: string;
  amount?: string | number;
  userid?: string;
  [key: string]: unknown; // 使用unknown代替any
}

export async function GET() {
  return Response.json({ success: true, data: 'THANK YOU' }, { status: 200 });
}

export async function POST(request: Request) {
  // 记录请求开始
  console.log('API接收到请求');
  let requestData: InterviewRequestData = {};

  try {
    // 解析请求体
    const rawBody = await request.json();
    console.log('原始请求体:', rawBody);

    // 自动兼容 toolCalls 的封装结构
    if (
      'message' in rawBody &&
      rawBody.message?.toolCalls?.[0]?.function?.arguments
    ) {
      try {
        const args = JSON.parse(
          rawBody.message.toolCalls[0].function.arguments
        );
        requestData = args;
        console.log('从toolCall中解析的参数:', args);
      } catch (err) {
        console.error('Failed to parse toolCall arguments', err);
        requestData = rawBody;
      }
    } else {
      requestData = rawBody;
    }

    // 提取必要参数
    const { type, role, level, techstack, amount, userid } = requestData;
    console.log('请求参数:', { type, role, level, techstack, amount, userid });

    // 验证必要参数
    if (!type || !role || !level) {
      const missingParams = { type: !type, role: !role, level: !level };
      console.error('缺少必要参数:', missingParams);
      return Response.json(
        {
          success: false,
          error: '缺少必要参数',
          missingParams,
        },
        { status: 400 }
      );
    }

    // 生成面试问题
    console.log('开始生成面试问题');
    let questions;
    try {
      const result = await generateText({
        model: google('gemini-2.0-flash-001'),
        prompt: `Prepare questions for a job interview.
          The job role is ${role}.
          The job experience level is ${level}.
          The tech stack used in the job is: ${techstack}.
          The focus between behavioural and technical questions should lean towards: ${type}.
          The amount of questions required is: ${amount}.
          Please return only the questions, without any additional text.
          The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
          Return the questions formatted like this:
          ["Question 1", "Question 2", "Question 3"]
          
          Thank you! <3
          `,
      });
      questions = result.text;
      console.log('生成问题成功，原始输出:', questions);
    } catch (genError) {
      console.error('Gemini API调用失败:', genError);
      return Response.json(
        {
          success: false,
          error: 'AI生成失败',
          errorDetail:
            genError instanceof Error ? genError.message : String(genError),
          step: 'generateText',
        },
        { status: 500 }
      );
    }

    // 解析问题
    console.log('解析并准备面试数据');
    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(questions);
      console.log('问题解析成功:', parsedQuestions);
    } catch (parseError) {
      console.error('问题格式解析失败:', parseError, '原始内容:', questions);
      parsedQuestions = [];
    }

    // 构建面试数据
    const interview = {
      role,
      type,
      level,

      // 防止 techstack 为 undefined 或非 string
      techstack:
        typeof techstack === 'string'
          ? techstack
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [],

      questions: parsedQuestions,
      userId: userid || 'anonymous',
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    // 存储到Firestore
    console.log('准备存储到Firestore', interview);
    try {
      await db.collection('interviews').add(interview);
      console.log('面试数据保存成功');
    } catch (dbError) {
      console.error('Firestore保存失败:', dbError);
      return Response.json(
        {
          success: false,
          error: '数据库存储失败',
          errorDetail:
            dbError instanceof Error ? dbError.message : String(dbError),
          step: 'firestoreAdd',
        },
        { status: 500 }
      );
    }

    return Response.json({ success: true, data: interview }, { status: 200 });
  } catch (error) {
    console.error('API处理总错误:', error);
    // 返回详细错误信息
    return Response.json(
      {
        success: false,
        error: '请求处理失败',
        errorDetail: error instanceof Error ? error.message : String(error),
        errorObject:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : null,
        requestData: requestData || null,
      },
      { status: 500 }
    );
  }
}
