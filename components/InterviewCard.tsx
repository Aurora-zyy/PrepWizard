import React from 'react';
import dayjs from 'dayjs';
import { cn, getRandomInterviewCover } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import DisplayTechicons from './DisplayTechicons';

const InterviewCard = ({
  interviewId,
  userId,
  role,
  type,
  techstack,
  createdAt,
}: InterviewCardProps) => {
  const feedback = null as Feedback | null;
  // technical
  // mix of techincal and behaviorial
  const normalizedType = /mix/gi.test(type) ? 'Mixed' : type;
  ///mix/gi 是一个正则表达式（Regular Expression）：
  // /mix/ 是匹配模式，查找字符串中的 "mix"

  // g 是全局标志（global flag），表示查找所 有匹配项
  // i 是忽略大小写标志（case-insensitive flag），表示不区分大小写
  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now()
  ).format('MMM D, YYYY');

  return (
    <div className='card-border w-[360px] max-sm:w-full min-h-96'>
      <div className='card-interview'>
        <div>
          {/*Type Badge*/}
          <div className='absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg bg-light-600'>
            <p className='badge-text'>{normalizedType}</p>
          </div>

          {/*Cover Image*/}
          <Image
            src={getRandomInterviewCover()}
            alt='cover-image'
            width={90}
            height={90}
            className='rounded-full object-fit size-[90px]'
          />

          {/*Interview Role*/}
          <h3 className='mt-5 capitalize'>{role} Interview</h3>

          {/*Date and Score*/}
          <div className='flex flex-row gap-5 mt-3'>
            <div className='flex flex-row gap-3'>
              <Image
                src='/calendar.svg'
                alt='calendar'
                width={22}
                height={22}
              />
              <p>{formattedDate}</p>
            </div>

            <div className='flex flex-row gap-3 items-center'>
              <Image src='/star.svg' alt='star' width={22} height={22} />
              <p>{feedback?.totalScore || '---'}/100</p>
            </div>
          </div>

          {/*Feedback or Placeholder Text*/}
          <p className='line-clamp-2 mt-5'>
            {feedback?.finalAssessment ||
              "You haven't taken the interview yet. Take it now to improve your skills."}
          </p>
        </div>

        <div className='flex flex-row justify-between'>
          <DisplayTechicons techStack={techstack} />

          <Button className='btn-primary'>
            <Link
              href={
                feedback
                  ? `/interview/${interviewId}/feedback`
                  : `/interview/${interviewId}`
              }
            >
              {feedback ? 'Check Feedback' : 'Take Interview'}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;
