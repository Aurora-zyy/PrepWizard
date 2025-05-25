import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { getRandomInterviewCover } from '@/lib/utils';
import { db } from '@/firebase/admin';

export async function GET() {
  return Response.json({ success: true, data: 'THANK YOU' }, { status: 200 });
}

export async function POST(request: Request) {
  //line 11-44: 兼容Vapi Assistant toolCall 的请求结构。如果之后workflow mode回到可以删除
  const rawBody = await request.json();

  // 自动兼容 toolCalls 的封装结构
  let type, role, level, techstack, amount, userid;
  if (
    'message' in rawBody &&
    rawBody.message?.toolCalls?.[0]?.function?.arguments
  ) {
    try {
      const args = JSON.parse(rawBody.message.toolCalls[0].function.arguments);
      ({ type, role, level, techstack, amount, userid } = args);
    } catch (err) {
      console.error('Failed to parse toolCall arguments', err);
    }
  } else {
    ({ type, role, level, techstack, amount, userid } = rawBody);
  }

  if (!type || !role || !level) {
    return Response.json(
      {
        success: false,
        error: '缺少必要参数',
        missingParams: {
          type: !type,
          role: !role,
          level: !level,
        },
      },
      { status: 400 }
    );
  }

  console.log('API接收到请求');
  let requestData;

  try {
    requestData = await request.json();
    console.log('请求数据:', requestData);
    const { type, role, level, techstack, amount, userid } = requestData;

    // 验证必要参数
    if (!type || !role || !level) {
      console.error('缺少必要参数:', { type, role, level });
      return Response.json(
        {
          success: false,
          error: '缺少必要参数',
          missingParams: { type: !type, role: !role, level: !level },
        },
        { status: 400 }
      );
    }

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

    console.log('解析并准备面试数据');
    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(questions);
      console.log('问题解析成功:', parsedQuestions);
    } catch (parseError) {
      console.error('问题格式解析失败:', parseError, '原始内容:', questions);
      parsedQuestions = [];
    }

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
