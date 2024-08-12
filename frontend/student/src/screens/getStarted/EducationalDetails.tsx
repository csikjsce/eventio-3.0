import { Option, Select } from '@material-tailwind/react';
import Quote from '../../components/Quote';

function EducationalDetails() {
    const branches = [
        "Computer Engineering",
        "IT",
        "AIDS",
        "EXCP",
        "Mechanical Engineering",
        "CCE",
        "ETRX",
        "CS BS",
        "Electronics Engineering(VLSI Design and TEchnology)",
        "Robotics & Artificial Intelligence"

      ];
  return (
    <div className="flex flex-col min-h-screen font-fira box-border">
      <div className="flex-grow flex flex-col space-y-6 ">
        <div className="text-xl font-bold text-left">Educational Details</div>
        <div className="text-lg md:text-xl lg:text-2xl xl:text-3xl text-left">
          Fill out your educational details
        </div>
        <div className="flex flex-row items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div>
          <Select label="Branch" placeholder="Branch"  onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
      {branches.map(branch => (
        <Option key={branch} value={branch}>
          {branch}
        </Option>
      ))}
    </Select>
            </div>
            
            <div>
              <Select
                label="Year"
                placeholder="Year"
                onPointerEnterCapture={'undefined'}
                onPointerLeaveCapture={'undefined'}
              >
                <Option value="2025">2025</Option>
                <Option value="2026">2026</Option>
                <Option value="2027">2027</Option>
                <Option value="2028">2028</Option>
              </Select>
            </div>
            <div className='flex flex-row justify-between items-center px-4 py-2'>
  <div className='flex items-center text-gray-500'>
    Back
  </div>
  <button
    className={`w-90% sm:w-48 md:w-56 lg:w-64 px-4 py-2  rounded-full border-2 border-red-200 font-poppins`}
  >
    Continue  &#8594;
  </button>
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

export default EducationalDetails;
