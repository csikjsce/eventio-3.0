import { useState } from 'react';
import Quote from '../../components/Quote';

function Interest() {
  const data: string[] = [
    'Computer Science',
    'Cybersecurity',
    'AI/ML',
    'Competitive Programming',
    'Web Development',
    'Data Analytics',
    'Data Science',
    'WEB3',
    'Mobile App Development',
    'Blockchain',
    'Cloud Computing',
    'Internet of Things (IoT)',
    'Game Development',
    'Quantum Computing',
    'AR/VR',
    'Robotics',
    'Embedded Systems',
    'NLP',
    'Computer Vision',
    'Augmented Intelligence',
    'Cryptography',
    'Software Engineering',
    'DevOps',
    'Quantum Information Science',
    'Computer Graphics',
    'FinTech',
    'EdTech',
  ];

  const [interests, setInterests] = useState<string[]>([]);
  const [visible, setVisible] = useState<boolean>(false);
  const [showAll, setShowAll] = useState<boolean>(false);
  const [year, setYear] = useState<string>('');
  const [branch, setBranch] = useState<string>('');

  const handleTagPress = (title: string): void => {
    if (interests.includes(title)) {
      setInterests(interests.filter((item) => item !== title));
    } else {
      setInterests([...interests, title]);
    }
  };

  const handleMorePress = (): void => {
    setShowAll((prevShowAll) => !prevShowAll);
  };

  const handleBack = (): void => {
    // Implement your back navigation logic here
  };

  const handlePress = (): void => {
    if (interests.length === 0 || !year || !branch) {
      setVisible(true);
    } else {
      // Implement your continue logic here
    }
  };

  const itemsToShow: string[] = showAll ? data : data.slice(0, 12);

  return (
    <div className="flex flex-col min-h-screen font-fira box-border">
      <div className="flex-grow flex flex-col space-y-6">
        <div className="text-4xl font-bold text-left">Career Interests</div>
        <div className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-left">
          Choose your points of interest
        </div>
        <div className="flex flex-row items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="container mx-auto p-4">
              <h4 className="text-2xl font-bold mb-4">Career Interests</h4>
              <p className="text-lg mb-4">Choose 5 points of interest</p>
              <div className="grid grid-cols-2 gap-4">
                {itemsToShow.map((item, index) => (
                  <div key={index} className="col-span-1">
                    <button
                      className={`px-4 py-2 rounded-full ${
                        interests.includes(item)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200'
                      }`}
                      onClick={() => handleTagPress(item)}
                    >
                      {item}
                    </button>
                  </div>
                ))}
                <div className="col-span-2">
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-full"
                    onClick={handleMorePress}
                  >
                    {showAll ? 'Less' : 'More'}
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-lg mb-2">Year</label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-4 py-2 border rounded-full"
                  placeholder="Enter your year"
                />
              </div>
              <div className="mt-4">
                <label className="block text-lg mb-2">Branch</label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-4 py-2 border rounded-full"
                  placeholder="Enter your branch"
                />
              </div>
              <div className="mt-4 flex justify-between">
                <button
                  className="px-4 py-2 border border-gray-500 rounded-full"
                  onClick={handleBack}
                >
                  Back
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-full"
                  onClick={handlePress}
                >
                  Continue
                </button>
              </div>
              {visible && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-red-500 text-white">
                  <span>Please enter all the details</span>
                  <button className="ml-4" onClick={() => setVisible(false)}>
                    Undo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <footer>
        <Quote />
      </footer>
    </div>
  );
}

export default Interest;
