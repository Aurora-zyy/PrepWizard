import Agent from '@/components/Agent';

const page = () => {
  return (
    <>
      <h3>Interview Generation</h3>

      <Agent userName='You' userId='userId' type='generate' />
    </>
  );
};

export default page;
