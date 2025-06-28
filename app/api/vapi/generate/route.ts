import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { getRandomInterviewCover } from '@/lib/utils';
import { db } from '@/firebase/admin';

export async function GET() {
  return Response.json({ success: true, data: 'THANK YOU' }, { status: 200 });
}

export async function POST(request: Request) {
  let type, role, level, techstack, amount, userid;
  let rawBody;
  try {
    rawBody = await request.json();
    console.log('原始请求体:', rawBody);
  } catch (err) {
    console.error('请求 JSON 解析失败:', err);
    return Response.json(
      { success: false, error: '无效的 JSON 请求体' },
      { status: 400 }
    );
  }

  try {
    // 👇 兼容 Assistant 的 ToolCall 格式
    const toolArgs = rawBody.message?.toolCalls?.[0]?.function?.arguments;
    if (toolArgs) {
      const args =
        typeof toolArgs === 'string' ? JSON.parse(toolArgs) : toolArgs;
      ({ type, role, level, techstack, amount, userid } = args);
    } else {
      // 👇 兼容 Workflow 的 JSON 请求格式
      ({ type, role, level, techstack, amount, userid } = rawBody);
    }

    // ✅ 参数校验
    if (!type || !role || !level) {
      console.warn('缺少必要参数:', { type, role, level });
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

    // 🧠 调用 Gemini API 生成面试问题
    let questionsText = '';
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
        Return the questions formatted like this: ["Question 1", "Question 2", "Question 3"]
        `,
      });
      questionsText = result.text;
      console.log('生成问题内容:', questionsText);
    } catch (genErr) {
      console.error('Gemini API 调用失败:', genErr);
      return Response.json(
        {
          success: false,
          error: 'AI 生成失败',
          detail: genErr instanceof Error ? genErr.message : String(genErr),
        },
        { status: 500 }
      );
    }

    // 📦 解析问题内容为 JSON 数组
    //当时遇到的bug似乎就是vapi的workflow失效，under development，所以
    //就尝试了很多别的方式...
    let parsedQuestions: string[] = [];
    try {
      parsedQuestions = JSON.parse(questionsText);
    } catch (parseErr) {
      console.error('问题格式解析失败:', parseErr);
      parsedQuestions = [];
    }

    const interview = {
      role,
      type,
      level,
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

    // 🔥 保存到 Firebase
    try {
      await db.collection('interviews').add(interview);
      console.log('成功写入 interview:', interview);
    } catch (dbErr) {
      console.error('写入 Firestore 失败:', dbErr);
      return Response.json(
        {
          success: false,
          error: '数据库写入失败',
          detail: dbErr instanceof Error ? dbErr.message : String(dbErr),
        },
        { status: 500 }
      );
    }

    return Response.json({ success: true, data: interview }, { status: 200 });
  } catch (outerError) {
    console.error('总处理异常:', outerError);
    return Response.json(
      {
        success: false,
        error: '未知错误',
        detail:
          outerError instanceof Error ? outerError.message : String(outerError),
      },
      { status: 500 }
    );
  }
}
