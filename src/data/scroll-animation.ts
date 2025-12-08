export const ScrollAnimationData = (() => {
  const generateRandomUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        // eslint-disable-next-line no-bitwise
        const r = (Math.random() * 16) | 0,
          // eslint-disable-next-line no-bitwise
          v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  };

  const getRandomElement = (array: string[]): string => {
    return array[Math.floor(Math.random() * array.length)];
  };

  const getRandomNumber = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const NAMES: string[] = [
    'John Doe',
    'Jane Smith',
    'Alice Johnson',
    'Robert Brown',
    'Emily Davis',
    'Michael Wilson',
    'Sophia Martinez',
    'James Lee',
    'Isabella Thompson',
    'David Anderson',
  ];

  const JOB_TITLES: string[] = [
    'Software Engineer',
    'Product Manager',
    'Graphic Designer',
    'Marketing Specialist',
    'Data Analyst',
    'UX Designer',
    'Sales Manager',
    'Content Writer',
    'HR Specialist',
    'Business Analyst',
  ];

  const EMAILS: string[] = [
    'john.doe@example.com',
    'jane.smith@example.com',
    'alice.johnson@example.com',
    'robert.brown@example.com',
    'emily.davis@example.com',
    'michael.wilson@example.com',
    'sophia.martinez@example.com',
    'james.lee@example.com',
    'isabella.thompson@example.com',
    'david.anderson@example.com',
  ];

  return [...Array(30).keys()].map(() => {
    return {
      id: generateRandomUUID(),
      image: `https://randomuser.me/api/portraits/${getRandomElement([
        'women',
        'men',
      ])}/${getRandomNumber(0, 60)}.jpg`,
      name: getRandomElement(NAMES),
      jobTitle: getRandomElement(JOB_TITLES),
      email: getRandomElement(EMAILS),
    };
  });
})();
