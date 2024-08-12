import { useState } from 'react';
import Quote from '../../components/Quote';

function Interest() {
    const data = [
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
    const [visible, setVisible] = useState(false);
    const [showAll, setShowAll] = useState(false);

    const handleTagPress = (title: string) => {
        if (interests.includes(title)) {
            setInterests(interests.filter(item => item !== title));
        } else {
            setInterests([...interests, title]);
        }
    };

    const handleMorePress = () => {
        setShowAll(prevShowAll => !prevShowAll);
    };

  

   

    const itemsToShow = showAll ? data : data.slice(0, 12);

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
                            
                            <div className="flex flex-wrap gap-4">
                                {itemsToShow.map((item, index) => (
                                    <button
                                        key={index}
                                        className={`px-4 py-2 rounded-full ${
                                            interests.includes(item) ? 'bg-red-700 text-white' : 'bg-gray-200'
                                        }`}
                                        onClick={() => handleTagPress(item)}
                                    >
                                        {item}
                                    </button>
                                ))}
                                <button
                                    className="px-4 py-2 bg-red-700 text-white rounded-full"
                                    onClick={handleMorePress}
                                >
                                    {showAll ? 'Less' : 'More'}
                                </button>
                            </div>
                            <div className='flex flex-row justify-between items-center px-4 py-2'>
  <div className='flex items-center text-gray-500'>
    Back
  </div>
  <button
    className={`w-90% sm:w-48 md:w-56 lg:w-64 px-4 py-2  rounded-full border-2 border-red-200 font-poppins `}
  >
    <h1 className='text-red'>Continue  &#8594;</h1>
  </button>
</div>
                            {visible && (
                                <div className="fixed bottom-0 left-0 right-0 p-4 bg-red-700 text-white">
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
