import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { dummyInterviews } from '@/constants';
import InterviewCard from '@/components/InterviewCard';
const page = () => {
  return (
    <>
      <section className='card-cta'>
        <div className='flex flex-col gap-6 max-w-lg'>
          <h2>Get Interview-Ready with AI-Powered Drills & Feedback </h2>
          <p className='text-lg'>
            Practice on real interview questions, get instant feedback, and
            track progress.
          </p>

          <Button asChild className='btn-primary max-sm:w-full'>
            <Link href='/interview'>Start an Interview</Link>
          </Button>
        </div>

        <Image
          src='/robot.png'
          alt='robo-dude'
          width={400}
          height={400}
          className='max-sm:hidden'
          //No space to show this image on mobile.
        />
      </section>

      <section className='flex flex-col gap-6 mt-8'>
        <h2>Your Interviews</h2>

        <div className='interviews-section'>
          {/* <p>
            No interviews yet. Start an interview and see track records here.
          </p> */}
          {dummyInterviews.map((interview) => (
            <InterviewCard {...interview} key={interview.id} />
          ))}
        </div>
      </section>

      <section className='flex flex-col gap-6 mt-8'>
        <h2>Take an Interview</h2>

        <div className='interviews-section'>
          {/* <p>There are no interviews available</p> */}
          {dummyInterviews.map((interview) => (
            <InterviewCard {...interview} key={interview.id} />
          ))}
        </div>
      </section>
    </>
  );
};

export default page;
